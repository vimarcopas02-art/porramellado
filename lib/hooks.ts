"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  STORE_EVENT,
  ensureInit,
  snapshotCurrent,
  snapshotParticipants,
  snapshotResults,
  snapshotLoaded,
  snapshotError,
  emptyPredictions,
  emptyResults,
  savePredictions,
  saveResults,
  type Participant,
  type Results,
} from "./storage";
import type { Predictions } from "./types";

function subscribe(callback: () => void) {
  ensureInit();
  window.addEventListener(STORE_EVENT, callback);
  return () => window.removeEventListener(STORE_EVENT, callback);
}

const NO_PARTICIPANTS: Participant[] = [];
const NO_RESULTS = emptyResults();

/** Participante activo en este dispositivo (null si nadie ha entrado). */
export function useParticipant(): Participant | null {
  return useSyncExternalStore(subscribe, snapshotCurrent, () => null);
}

/** Todos los participantes de la porra. */
export function useParticipants(): Participant[] {
  return useSyncExternalStore(
    subscribe,
    snapshotParticipants,
    () => NO_PARTICIPANTS,
  );
}

/** Resultados reales introducidos por el administrador. */
export function useResults(): Results {
  return useSyncExternalStore(subscribe, snapshotResults, () => NO_RESULTS);
}

/** true cuando la carga inicial de datos ha terminado. */
export function useStoreLoaded(): boolean {
  return useSyncExternalStore(subscribe, snapshotLoaded, () => false);
}

/** Mensaje de error de la capa de datos, si lo hay. */
export function useStoreError(): string | null {
  return useSyncExternalStore(subscribe, snapshotError, () => null);
}

/** Evita el desajuste de hidratación: false en servidor, true tras montar. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Borrador de predicciones con autoguardado.
 * Mantiene estado local para que los inputs respondan al instante y
 * persiste con un pequeño retardo (debounce).
 */
export function useAutosaveDraft() {
  const participant = useParticipant();
  const pid = participant?.id ?? null;

  const [draft, setDraft] = useState<Predictions>(
    () => participant?.predictions ?? emptyPredictions(),
  );
  const [dirty, setDirty] = useState(false);

  // Resincroniza si cambia el participante activo.
  useEffect(() => {
    setDraft(participant?.predictions ?? emptyPredictions());
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  // Guardado con retardo.
  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      savePredictions(draft);
      setDirty(false);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draft, dirty]);

  const patch = useCallback(
    (updater: (prev: Predictions) => Predictions) => {
      setDraft((prev) => updater(prev));
      setDirty(true);
    },
    [],
  );

  return { participant, draft, patch, dirty };
}

/** Borrador de los resultados reales (panel de administración), con autoguardado. */
export function useResultsDraft() {
  const results = useResults();
  const [draft, setDraft] = useState<Results>(() => results);
  const [dirty, setDirty] = useState(false);

  // Resincroniza con el almacenamiento si no hay cambios pendientes.
  useEffect(() => {
    if (!dirty) setDraft(results);
  }, [results, dirty]);

  // Guardado con retardo.
  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      saveResults(draft);
      setDirty(false);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draft, dirty]);

  const patch = useCallback(
    (updater: (prev: Results) => Results) => {
      setDraft((prev) => updater(prev));
      setDirty(true);
    },
    [],
  );

  return { draft, patch, dirty };
}
