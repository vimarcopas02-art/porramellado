"use client";

import { Card } from "./ui";
import { teamName } from "@/lib/data";
import { computeGroupStanding } from "@/lib/standings";
import type { ScorePrediction } from "@/lib/types";
import { cn } from "@/lib/cn";

/** Tabla de clasificación de un grupo, calculada de los marcadores. */
export function StandingsTable({
  groupId,
  scores,
}: {
  groupId: string;
  scores: Record<string, ScorePrediction>;
}) {
  const rows = computeGroupStanding(groupId, scores);

  return (
    <Card className="overflow-hidden">
      <h2 className="border-b border-ink-100 bg-ink-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-pitch-600">
        Grupo {groupId}
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400">
            <th className="py-2 pl-3 pr-1 font-bold">#</th>
            <th className="px-1 py-2 font-bold">Equipo</th>
            <th className="px-1 py-2 text-center font-bold">PJ</th>
            <th className="hidden px-1 py-2 text-center font-bold sm:table-cell">
              G
            </th>
            <th className="hidden px-1 py-2 text-center font-bold sm:table-cell">
              E
            </th>
            <th className="hidden px-1 py-2 text-center font-bold sm:table-cell">
              P
            </th>
            <th className="px-1 py-2 text-center font-bold">DG</th>
            <th className="py-2 pl-1 pr-3 text-center font-bold">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((row, i) => (
            <tr key={row.teamId}>
              <td className="py-2 pl-3 pr-1">
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-md text-xs font-bold",
                    i < 2
                      ? "bg-pitch-600 text-white"
                      : i === 2
                        ? "bg-gold-300 text-gold-600"
                        : "bg-ink-100 text-ink-400",
                  )}
                >
                  {i + 1}
                </span>
              </td>
              <td className="px-1 py-2 font-semibold">
                <span className="block max-w-[8rem] truncate sm:max-w-none">
                  {teamName(row.teamId)}
                </span>
              </td>
              <td className="px-1 py-2 text-center tabular-nums text-ink-500">
                {row.pj}
              </td>
              <td className="hidden px-1 py-2 text-center tabular-nums text-ink-500 sm:table-cell">
                {row.g}
              </td>
              <td className="hidden px-1 py-2 text-center tabular-nums text-ink-500 sm:table-cell">
                {row.e}
              </td>
              <td className="hidden px-1 py-2 text-center tabular-nums text-ink-500 sm:table-cell">
                {row.p}
              </td>
              <td className="px-1 py-2 text-center tabular-nums text-ink-500">
                {row.dg > 0 ? `+${row.dg}` : row.dg}
              </td>
              <td className="py-2 pl-1 pr-3 text-center">
                <span className="font-bold tabular-nums text-pitch-700">
                  {row.pts}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
