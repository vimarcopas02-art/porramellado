"use client";

import type { Predictions, ScorePrediction } from "./types";

/**
 * Capa de persistencia. En esta versión usa localStorage del navegador.
 * Está aislada a propósito: cuando conectemos Supabase solo cambia este archivo.
 *
 * Mantiene una copia en memoria (cache) para que los snapshots sean estables
 * y se puedan usar con useSyncExternalStore sin provocar renders en bucle.
 */

const KEY = "porra-mundial-2026";
export const STORE_EVENT = "porra-updated";

export type Participant = {
  id: string;
  name: string;
  predictions: Predictions;
  updatedAt: number;
  /** Si la porra se ha guardado en firme: ya no se puede editar. */
  locked: boolean;
  lockedAt?: number;
};

/** Resultados reales que introduce el administrador. */
export type Results = {
  /** Marcador real de cada partido de grupos. Mueve la clasificación. */
  groupMatches: Record<string, ScorePrediction>;
  /** Ganador real de cada cruce del cuadro final. Clave = `win:<idCruce>`. */
  bracket: Record<string, string>;
  /** Marcador real de los cruces de eliminatorias. */
  bracketScores: Record<string, ScorePrediction>;
  /**
   * Corrección manual de las preguntas: para cada pregunta, qué participantes
   * la han acertado. Clave externa = id de pregunta, interna = id de participante.
   */
  questionGrades: Record<string, Record<string, boolean>>;
};

type Store = {
  currentId: string | null;
  participants: Participant[];
  results: Results;
};

export function emptyPredictions(): Predictions {
  return {
    groupMatches: {},
    bracket: {},
    bracketScores: {},
    questions: {},
  };
}

export function emptyResults(): Results {
  return {
    groupMatches: {},
    bracket: {},
    bracketScores: {},
    questionGrades: {},
  };
}

function emptyStore(): Store {
  return { currentId: null, participants: [], results: emptyResults() };
}

let cache: Store | null = null;

function load(): Store {
  if (cache) return cache;
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      cache = emptyStore();
    } else {
      const parsed = JSON.parse(raw) as Store;
      cache = {
        currentId: parsed.currentId ?? null,
        participants: parsed.participants ?? [],
        results: { ...emptyResults(), ...parsed.results },
      };
    }
  } catch {
    cache = emptyStore();
  }
  return cache;
}

function commit(store: Store) {
  cache = store;
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(STORE_EVENT));
}

/** Invalida la cache (p. ej. al recibir cambios de otra pestaña). */
export function invalidateCache() {
  cache = null;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// --- Snapshots estables para useSyncExternalStore ---

export function snapshotCurrent(): Participant | null {
  const store = load();
  if (!store.currentId) return null;
  return store.participants.find((p) => p.id === store.currentId) ?? null;
}

export function snapshotParticipants(): Participant[] {
  return load().participants;
}

export function snapshotResults(): Results {
  return load().results;
}

// --- Mutaciones ---

/** Crea (o reusa) un participante con ese nombre y lo marca como actual. */
export function signIn(name: string): Participant {
  const store = { ...load() };
  const clean = name.trim();
  let participant = store.participants.find(
    (p) => p.name.toLowerCase() === clean.toLowerCase(),
  );
  if (!participant) {
    participant = {
      id: makeId(),
      name: clean,
      predictions: emptyPredictions(),
      updatedAt: Date.now(),
      locked: false,
    };
    store.participants = [...store.participants, participant];
  }
  store.currentId = participant.id;
  commit(store);
  return participant;
}

export function signOut() {
  const store = { ...load(), currentId: null };
  commit(store);
}

export function savePredictions(predictions: Predictions) {
  const store = load();
  if (!store.currentId) return;
  const participants = store.participants.map((p) =>
    p.id === store.currentId && !p.locked
      ? { ...p, predictions, updatedAt: Date.now() }
      : p,
  );
  commit({ ...store, participants });
}

/** Guarda la porra en firme: queda bloqueada y ya no se puede editar. */
export function lockPorra() {
  const store = load();
  if (!store.currentId) return;
  const participants = store.participants.map((p) =>
    p.id === store.currentId
      ? { ...p, locked: true, lockedAt: Date.now() }
      : p,
  );
  commit({ ...store, participants });
}

export function saveResults(results: Results) {
  commit({ ...load(), results });
}

/** Elimina un participante (acción de administrador). */
export function removeParticipant(id: string) {
  const store = load();
  commit({
    ...store,
    participants: store.participants.filter((p) => p.id !== id),
    currentId: store.currentId === id ? null : store.currentId,
  });
}
