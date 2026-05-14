"use client";

import { useState } from "react";
import Link from "next/link";
import { NameGate } from "@/components/NameGate";
import { Card, ProgressBar, Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  BallIcon,
  TrophyIcon,
  BookIcon,
  ShieldIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@/components/icons";
import { useParticipant } from "@/lib/hooks";
import { signOut, lockPorra, emptyPredictions } from "@/lib/storage";
import { sectionProgress, overallProgress } from "@/lib/progress";
import { TOURNAMENT_START } from "@/lib/data";

const sections = [
  {
    href: "/jugar/grupos",
    title: "Partidos de grupos",
    text: "Marcador exacto de los 72 partidos. De aquí salen la clasificación y el cuadro.",
    icon: BallIcon,
    key: "groupMatches" as const,
  },
  {
    href: "/jugar/eliminatorias",
    title: "Cuadro final",
    text: "Quién gana cada cruce, hasta el campeón del Mundial.",
    icon: TrophyIcon,
    key: "bracket" as const,
  },
  {
    href: "/jugar/preguntas",
    title: "Preguntas especiales",
    text: "Preguntas variadas con puntuación extra.",
    icon: BookIcon,
    key: "questions" as const,
  },
];

function Hub() {
  const participant = useParticipant();
  const predictions = participant?.predictions ?? emptyPredictions();
  const progress = sectionProgress(predictions);
  const overall = overallProgress(predictions);
  const complete = overall.done === overall.total;
  const locked = Boolean(participant?.locked);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const startDate = TOURNAMENT_START.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">Tu porra</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Hola, {participant?.name}
          </h1>
        </div>
        {!locked && (
          <button
            onClick={() => signOut()}
            className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50"
          >
            Cambiar de jugador
          </button>
        )}
      </div>

      {locked ? (
        <Card className="mt-5 flex items-start gap-3 bg-pitch-800 p-5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-400 text-ink-900">
            <CheckIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold">Porra guardada</p>
            <p className="mt-1 text-sm text-pitch-100">
              Tu porra está cerrada en firme. Ya no se puede modificar; solo
              consultarla. ¡Mucha suerte!
            </p>
          </div>
        </Card>
      ) : (
        <Card className="mt-5 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold">Progreso de tu porra</p>
            {complete && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pitch-100 px-2.5 py-0.5 text-xs font-semibold text-pitch-700">
                <CheckIcon className="h-3.5 w-3.5" />
                Completa
              </span>
            )}
          </div>
          <ProgressBar
            done={overall.done}
            total={overall.total}
            className="mt-3"
          />
          <p className="mt-3 text-sm text-ink-600">
            Puedes editar tus predicciones hasta que la guardes en firme o hasta
            el inicio del Mundial ({startDate}).
          </p>
        </Card>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const p = progress[section.key];
          return (
            <Link key={section.href} href={section.href} className="group">
              <Card className="h-full p-5 transition-colors group-hover:border-pitch-300">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-pitch-100 text-pitch-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-3 font-bold">{section.title}</h2>
                <p className="mt-1 text-sm text-ink-600">{section.text}</p>
                <ProgressBar done={p.done} total={p.total} className="mt-3" />
              </Card>
            </Link>
          );
        })}
      </div>

      <Link href="/jugar/orden" className="group mt-4 block">
        <Card className="flex items-center gap-3 p-4 transition-colors group-hover:border-pitch-300">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-600">
            <ShieldIcon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-bold">Clasificación de grupos</p>
            <p className="text-sm text-ink-600">
              Mira cómo quedan los grupos según tus marcadores.
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-pitch-600" />
        </Card>
      </Link>

      {!locked && (
        <Card className="mt-5 p-5">
          <p className="font-bold">¿Has terminado tu porra?</p>
          <p className="mt-1 text-sm text-ink-600">
            Al guardarla en firme quedará cerrada para siempre: no podrás
            cambiar ningún pronóstico. No hace falta guardar para que se
            registre — solo hazlo cuando lo tengas todo definitivo.
          </p>
          <Button
            variant="gold"
            size="lg"
            className="mt-4 w-full"
            onClick={() => setConfirmOpen(true)}
          >
            <CheckIcon className="h-5 w-5" />
            Guardar porra definitivamente
          </Button>
        </Card>
      )}

      <div className="mt-6">
        <Link href="/clasificacion">
          <Button variant="secondary" size="lg" className="w-full">
            <TrophyIcon className="h-5 w-5 text-pitch-600" />
            Ver la clasificación
          </Button>
        </Link>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Guardar porra en firme"
        message={
          <>
            Una vez guardada, <strong>no podrás cambiar ningún pronóstico</strong>
            . Esta acción no se puede deshacer. ¿Seguro que quieres cerrar tu
            porra?
          </>
        }
        confirmLabel="Sí, guardar"
        cancelLabel="Todavía no"
        tone="gold"
        onConfirm={() => {
          lockPorra();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default function JugarPage() {
  return (
    <NameGate>
      <Hub />
    </NameGate>
  );
}
