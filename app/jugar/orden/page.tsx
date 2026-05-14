"use client";

import Link from "next/link";
import { NameGate } from "@/components/NameGate";
import { StandingsTable } from "@/components/StandingsTable";
import { Card } from "@/components/ui";
import { BallIcon } from "@/components/icons";
import { groups } from "@/lib/data";
import { useParticipant } from "@/lib/hooks";
import { emptyPredictions } from "@/lib/storage";

function Standings() {
  const participant = useParticipant();
  const scores = (participant?.predictions ?? emptyPredictions()).groupMatches;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/jugar"
        className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-ink-800"
      >
        ← Volver a mi porra
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        Clasificación de grupos
      </h1>
      <p className="mt-1 text-sm text-ink-600">
        Se calcula sola con los marcadores que pones en{" "}
        <Link href="/jugar/grupos" className="font-semibold text-pitch-600">
          Partidos de grupos
        </Link>
        . Los 1.º y 2.º (verde) y los mejores 3.º (dorado) pasan al cuadro final.
      </p>

      <Card className="my-4 flex items-center gap-3 bg-pitch-50 p-3 text-sm text-ink-700">
        <BallIcon className="h-5 w-5 shrink-0 text-pitch-600" />
        <p>
          Esta tabla es tu pronóstico. No se edita aquí: cambia los marcadores
          en «Partidos de grupos» y se actualiza al instante.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <StandingsTable key={g.id} groupId={g.id} scores={scores} />
        ))}
      </div>
    </div>
  );
}

export default function OrdenPage() {
  return (
    <NameGate>
      <Standings />
    </NameGate>
  );
}
