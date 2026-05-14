"use client";

import Link from "next/link";
import { NameGate } from "@/components/NameGate";
import { Card, ProgressBar, Button } from "@/components/ui";
import {
  BallIcon,
  TrophyIcon,
  ShieldIcon,
  BookIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@/components/icons";
import { useParticipant } from "@/lib/hooks";
import { signOut, emptyPredictions } from "@/lib/storage";
import { sectionProgress, overallProgress } from "@/lib/progress";
import { TOURNAMENT_START } from "@/lib/data";

const sections = [
  {
    href: "/jugar/grupos",
    title: "Partidos de grupos",
    text: "Marcador exacto de los 72 partidos de la fase de grupos.",
    icon: BallIcon,
    key: "groupMatches" as const,
  },
  {
    href: "/jugar/orden",
    title: "Orden de los grupos",
    text: "Posición final 1º-4º de cada uno de los 12 grupos.",
    icon: ShieldIcon,
    key: "groupOrder" as const,
  },
  {
    href: "/jugar/eliminatorias",
    title: "Cuadro final",
    text: "Quién pasa cada ronda, hasta el campeón del Mundial.",
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
        <button
          onClick={() => signOut()}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50"
        >
          Cambiar de jugador
        </button>
      </div>

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
          Puedes editar tus predicciones hasta el inicio del Mundial (
          {startDate}). Después se bloquean.
        </p>
      </Card>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const p = progress[section.key];
          return (
            <Link key={section.href} href={section.href} className="group">
              <Card className="h-full p-5 transition-colors group-hover:border-pitch-300">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-pitch-100 text-pitch-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRightIcon className="ml-auto h-5 w-5 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-pitch-600" />
                </div>
                <h2 className="mt-3 font-bold">{section.title}</h2>
                <p className="mt-1 text-sm text-ink-600">{section.text}</p>
                <ProgressBar done={p.done} total={p.total} className="mt-3" />
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-6">
        <Link href="/clasificacion">
          <Button variant="secondary" size="lg" className="w-full">
            <TrophyIcon className="h-5 w-5 text-pitch-600" />
            Ver la clasificación
          </Button>
        </Link>
      </div>
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
