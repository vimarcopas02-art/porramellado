"use client";

import { useState, type ReactNode } from "react";
import { signIn } from "@/lib/storage";
import { useParticipant, useMounted, useStoreLoaded } from "@/lib/hooks";
import { Button, Card } from "./ui";
import { UserIcon, BallIcon } from "./icons";

/**
 * Protege las páginas de la porra: si nadie ha entrado en este dispositivo,
 * pide un nombre visible antes de mostrar el contenido.
 */
export function NameGate({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const loaded = useStoreLoaded();
  const participant = useParticipant();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!mounted || !loaded) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-ink-400">
        Cargando…
      </div>
    );
  }

  if (participant) {
    return <>{children}</>;
  }

  const trimmed = name.trim();

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <Card className="p-6">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pitch-600 text-white">
          <BallIcon className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight">
          Entra en la porra
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Escribe el nombre con el que quieres aparecer en la clasificación.
          Si ya existe alguien con ese nombre, te llevará a su porra.
        </p>
        <form
          className="mt-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!trimmed || submitting) return;
            setSubmitting(true);
            await signIn(trimmed);
            setSubmitting(false);
          }}
        >
          <label
            htmlFor="player-name"
            className="text-sm font-semibold text-ink-700"
          >
            Tu nombre
          </label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 focus-within:border-pitch-500 focus-within:ring-2 focus-within:ring-pitch-100">
            <UserIcon className="h-5 w-5 text-ink-400" />
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Vicente"
              autoComplete="name"
              maxLength={32}
              className="h-12 flex-1 bg-transparent text-base outline-none placeholder:text-ink-400"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={!trimmed || submitting}
            className="mt-4 w-full"
          >
            {submitting ? "Entrando…" : "Entrar a mi porra"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
