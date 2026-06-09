"use client";

import { supabase } from "./supabase";
import type { Predictions, ScorePrediction } from "./types";

/**
 * Capa de persistencia con Supabase.
 *
 * Mantiene una copia en memoria (cache) que se rellena al cargar y se mantiene
 * al día con realtime, para poder ofrecer snapshots síncronos a
 * useSyncExternalStore. Las mutaciones son optimistas: actualizan la cache al
 * instante y escriben en Supabase en segundo plano.
 *
 * Identidad "solo con nombre": cada dispositivo guarda en localStorage el id y
 * un secreto de su participante; el secreto se exige para editar, así desde la
 * app cada uno solo puede modificar su propia porra.
 */

export const STORE_EVENT = "porra-updated";
const DEVICE_KEY = "porra-mundial-2026:device";

export type Participant = {
  id: string;
  name: string;
  predictions: Predictions;
  updatedAt: number;
  locked: boolean;
  lockedAt?: number;
};

export type Results = {
  groupMatches: Record<string, ScorePrediction>;
  bracket: Record<string, string>;
  bracketScores: Record<string, ScorePrediction>;
  questionGrades: Record<string, Record<string, boolean>>;
};

type Device = { id: string };

export function emptyPredictions(): Predictions {
  return { groupMatches: {}, bracket: {}, bracketScores: {}, questions: {} };
}

export function emptyResults(): Results {
  return {
    groupMatches: {},
    bracket: {},
    bracketScores: {},
    questionGrades: {},
  };
}

// --- Cache en memoria ---

let participants: Participant[] = [];
let results: Results = emptyResults();
let loaded = false;
let storeError: string | null = null;
let initStarted = false;

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
}

// --- Conversión fila de Supabase <-> tipos de la app ---

type ParticipantRow = {
  id: string;
  name: string;
  predictions: Predictions;
  locked: boolean;
  locked_at: string | null;
  updated_at: string;
};

function rowToParticipant(row: ParticipantRow): Participant {
  return {
    id: row.id,
    name: row.name,
    predictions: { ...emptyPredictions(), ...row.predictions },
    locked: Boolean(row.locked),
    lockedAt: row.locked_at ? new Date(row.locked_at).getTime() : undefined,
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

type ResultsRow = {
  group_matches: Results["groupMatches"];
  bracket: Results["bracket"];
  bracket_scores: Results["bracketScores"];
  question_grades: Results["questionGrades"];
};

function rowToResults(row: ResultsRow): Results {
  return {
    groupMatches: row.group_matches ?? {},
    bracket: row.bracket ?? {},
    bracketScores: row.bracket_scores ?? {},
    questionGrades: row.question_grades ?? {},
  };
}

// --- Identidad del dispositivo ---

function getDevice(): Device | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEVICE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string };
    return parsed?.id ? { id: parsed.id } : null;
  } catch {
    return null;
  }
}

function setDevice(device: Device | null) {
  if (typeof window === "undefined") return;
  if (device) {
    window.localStorage.setItem(DEVICE_KEY, JSON.stringify(device));
  } else {
    window.localStorage.removeItem(DEVICE_KEY);
  }
}

function randomSecret(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// --- Carga inicial + realtime ---

async function refetchParticipants() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("participants")
    .select("id, name, predictions, locked, locked_at, updated_at");
  if (error) {
    storeError = error.message;
    return;
  }
  participants = (data as ParticipantRow[]).map(rowToParticipant);
}

async function refetchResults() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("results")
    .select("group_matches, bracket, bracket_scores, question_grades")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    storeError = error.message;
    return;
  }
  if (data) results = rowToResults(data as ResultsRow);
}

/** Carga los datos y se suscribe a cambios en vivo. Idempotente. */
export function ensureInit() {
  if (initStarted) return;
  initStarted = true;

  if (!supabase) {
    storeError =
      "Falta configurar Supabase (variables NEXT_PUBLIC_SUPABASE_*).";
    loaded = true;
    notify();
    return;
  }

  void (async () => {
    await Promise.all([refetchParticipants(), refetchResults()]);
    loaded = true;
    notify();
  })();

  supabase
    .channel("porra-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "participants" },
      () => {
        void refetchParticipants().then(notify);
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "results" },
      () => {
        void refetchResults().then(notify);
      },
    )
    .subscribe();
}

// --- Snapshots síncronos para useSyncExternalStore ---

export function snapshotParticipants(): Participant[] {
  return participants;
}

export function snapshotResults(): Results {
  return results;
}

export function snapshotCurrent(): Participant | null {
  const device = getDevice();
  if (!device) return null;
  return participants.find((p) => p.id === device.id) ?? null;
}

export function snapshotLoaded(): boolean {
  return loaded;
}

export function snapshotError(): string | null {
  return storeError;
}

// --- Mutaciones (optimistas) ---

/**
 * Entra a la porra con ese nombre.
 * Si ya existe alguien con ese nombre (mismo, ignorando mayúsculas/espacios),
 * se reclama esa porra; así un mismo nombre te devuelve siempre a tu porra,
 * aunque cambies de móvil o se pierda el almacenamiento del navegador.
 * Si no existe, se crea un participante nuevo.
 */
export async function signIn(name: string): Promise<void> {
  if (!supabase) return;
  const clean = name.trim();
  if (!clean) return;

  // 1) Buscamos primero en la cache (rápido).
  let existing = participants.find(
    (p) => p.name.trim().toLowerCase() === clean.toLowerCase(),
  );

  // 2) Si no aparece, preguntamos a Supabase EN VIVO. Esto cubre el caso de
  //    que la cache aún no estuviera hidratada (red lenta, primer arranque,
  //    otro móvil) y evita crear duplicados con el mismo nombre.
  if (!existing) {
    const { data: rows, error } = await supabase
      .from("participants")
      .select("id, name, predictions, locked, locked_at, updated_at")
      .ilike("name", clean);
    if (error) {
      storeError = error.message;
      notify();
      return;
    }
    const match = (rows as ParticipantRow[] | null)?.find(
      (r) => r.name.trim().toLowerCase() === clean.toLowerCase(),
    );
    if (match) {
      existing = rowToParticipant(match);
      // Sincronizamos la cache para que el resto de la app lo vea ya.
      if (!participants.some((p) => p.id === existing!.id)) {
        participants = [...participants, existing];
      }
    }
  }

  if (existing) {
    setDevice({ id: existing.id });
    notify();
    return;
  }

  // 3) Realmente no existe → creamos un participante nuevo.
  const { data, error } = await supabase
    .from("participants")
    .insert({
      name: clean,
      secret: randomSecret(),
      predictions: emptyPredictions(),
      locked: false,
    })
    .select("id, name, predictions, locked, locked_at, updated_at")
    .single();
  if (error || !data) {
    // Si chocó con el índice único (23505 = unique_violation), significa que
    // entre nuestra comprobación y el insert otro hilo creó la fila (o la
    // tenía cacheada con otra capitalización). Recuperamos y reclamamos esa
    // fila en vez de fallar.
    if (error?.code === "23505") {
      const { data: rows } = await supabase
        .from("participants")
        .select("id, name, predictions, locked, locked_at, updated_at")
        .ilike("name", clean);
      const match = (rows as ParticipantRow[] | null)?.find(
        (r) => r.name.trim().toLowerCase() === clean.toLowerCase(),
      );
      if (match) {
        const claimed = rowToParticipant(match);
        if (!participants.some((p) => p.id === claimed.id)) {
          participants = [...participants, claimed];
        }
        setDevice({ id: claimed.id });
        notify();
        return;
      }
    }
    storeError = error?.message ?? "No se pudo crear el participante.";
    notify();
    return;
  }
  const participant = rowToParticipant(data as ParticipantRow);
  participants = [...participants, participant];
  setDevice({ id: participant.id });
  notify();
}

export function signOut() {
  setDevice(null);
  notify();
}

export function savePredictions(predictions: Predictions) {
  const device = getDevice();
  if (!device) return;
  participants = participants.map((p) =>
    p.id === device.id && !p.locked
      ? { ...p, predictions, updatedAt: Date.now() }
      : p,
  );
  notify();
  void supabase
    ?.from("participants")
    .update({ predictions, updated_at: new Date().toISOString() })
    .eq("id", device.id)
    .then(({ error }) => {
      if (error) {
        storeError = error.message;
        notify();
      }
    });
}

/** Guarda la porra en firme: queda bloqueada y ya no se puede editar. */
export function lockPorra() {
  const device = getDevice();
  if (!device) return;
  const now = Date.now();
  participants = participants.map((p) =>
    p.id === device.id ? { ...p, locked: true, lockedAt: now } : p,
  );
  notify();
  void supabase
    ?.from("participants")
    .update({ locked: true, locked_at: new Date(now).toISOString() })
    .eq("id", device.id)
    .then(({ error }) => {
      if (error) {
        storeError = error.message;
        notify();
      }
    });
}

export function saveResults(next: Results) {
  results = next;
  notify();
  void supabase
    ?.from("results")
    .update({
      group_matches: next.groupMatches,
      bracket: next.bracket,
      bracket_scores: next.bracketScores,
      question_grades: next.questionGrades,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .then(({ error }) => {
      if (error) {
        storeError = error.message;
        notify();
      }
    });
}

/** Elimina un participante (acción de administrador). */
export function removeParticipant(id: string) {
  participants = participants.filter((p) => p.id !== id);
  notify();
  void supabase
    ?.from("participants")
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (error) {
        storeError = error.message;
        notify();
      }
    });
}
