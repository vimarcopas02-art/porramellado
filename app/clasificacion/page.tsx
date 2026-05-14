"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, PageHeader, ButtonLink } from "@/components/ui";
import { TrophyIcon, BallIcon } from "@/components/icons";
import { useParticipants, useResults, useParticipant, useMounted } from "@/lib/hooks";
import { computeScore } from "@/lib/scoring";
import { cn } from "@/lib/cn";

const MEDAL = ["bg-gold-400 text-ink-900", "bg-ink-300 text-ink-900", "bg-gold-600 text-white"];

export default function ClasificacionPage() {
  const mounted = useMounted();
  const participants = useParticipants();
  const results = useResults();
  const current = useParticipant();

  const rows = useMemo(() => {
    return participants
      .map((p) => ({
        id: p.id,
        name: p.name,
        score: computeScore(p, results),
      }))
      .sort(
        (a, b) =>
          b.score.total - a.score.total ||
          b.score.exactResults - a.score.exactResults ||
          b.score.correctSigns - a.score.correctSigns,
      );
  }, [participants, results]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        eyebrow="Porra Mundial 2026"
        title="Clasificación"
        description="El ranking se actualiza automáticamente a medida que se introducen los resultados de los partidos."
      />

      {!mounted ? (
        <p className="py-10 text-center text-ink-400">Cargando…</p>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-pitch-100 text-pitch-700">
            <BallIcon className="h-6 w-6" />
          </span>
          <p className="mt-3 font-bold">Todavía no hay participantes</p>
          <p className="mt-1 text-sm text-ink-600">
            Sé el primero en rellenar tu porra y aparecerás aquí.
          </p>
          <ButtonLink href="/jugar" className="mt-4">
            Rellenar mi porra
          </ButtonLink>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-left text-[11px] uppercase tracking-wide text-ink-500">
                  <th className="py-2.5 pl-3 pr-1 font-bold">#</th>
                  <th className="px-1 py-2.5 font-bold">Participante</th>
                  <th className="px-1 py-2.5 text-right font-bold">Exact.</th>
                  <th className="px-1 py-2.5 text-right font-bold">Signo</th>
                  <th className="py-2.5 pl-1 pr-3 text-right font-bold">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((row, i) => {
                  const isCurrent = current?.id === row.id;
                  return (
                    <tr
                      key={row.id}
                      className={cn(isCurrent && "bg-pitch-50")}
                    >
                      <td className="py-3 pl-3 pr-1">
                        <span
                          className={cn(
                            "grid h-7 w-7 place-items-center rounded-lg text-xs font-bold",
                            i < 3 ? MEDAL[i] : "bg-ink-100 text-ink-500",
                          )}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-1 py-3 font-semibold">
                        {row.name}
                        {isCurrent && (
                          <span className="ml-1 text-xs font-bold text-pitch-600">
                            (tú)
                          </span>
                        )}
                      </td>
                      <td className="px-1 py-3 text-right tabular-nums text-ink-500">
                        {row.score.exactResults}
                      </td>
                      <td className="px-1 py-3 text-right tabular-nums text-ink-500">
                        {row.score.correctSigns}
                      </td>
                      <td className="py-3 pl-1 pr-3 text-right">
                        <span className="text-base font-bold tabular-nums text-pitch-700">
                          {row.score.total}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-pitch-50 p-3 text-sm text-ink-600">
            <TrophyIcon className="h-5 w-5 shrink-0 text-pitch-600" />
            <p>
              Desempate: a igualdad de puntos, primero el que tenga más
              resultados exactos y luego más signos acertados.
            </p>
          </div>

          <p className="mt-3 text-center text-xs text-ink-400">
            Los participantes y resultados se guardan en este dispositivo. Para
            una clasificación compartida entre varios móviles conectaremos una
            base de datos (Supabase).
          </p>
        </>
      )}

      <div className="mt-6">
        <Link href="/jugar">
          <span className="text-sm font-semibold text-pitch-600 hover:underline">
            ← Volver a mi porra
          </span>
        </Link>
      </div>
    </div>
  );
}
