"use client";

import { useState } from "react";
import { NameGate } from "@/components/NameGate";
import { PredictionHeader } from "@/components/PredictionHeader";
import { MatchScoreRow } from "@/components/MatchScoreRow";
import { Card } from "@/components/ui";
import {
  groups,
  matchesOfGroup,
  matchMeta,
  TOURNAMENT_START,
} from "@/lib/data";
import { useAutosaveDraft } from "@/lib/hooks";
import type { ScorePrediction } from "@/lib/types";
import { cn } from "@/lib/cn";

function Grupos() {
  const { draft, patch, dirty } = useAutosaveDraft();
  const [groupId, setGroupId] = useState(groups[0].id);
  const locked = Date.now() >= TOURNAMENT_START.getTime();
  const groupMatches = matchesOfGroup(groupId);

  const setScore = (matchId: string, value: ScorePrediction) => {
    patch((prev) => ({
      ...prev,
      groupMatches: { ...prev.groupMatches, [matchId]: value },
    }));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PredictionHeader
        title="Partidos de grupos"
        description="Pronostica el marcador exacto de los 72 partidos. +2 puntos por el signo, +1 por los goles exactos de cada equipo."
        dirty={dirty}
      />

      {locked && (
        <Card className="mb-4 bg-gold-300/30 p-3 text-sm font-semibold text-gold-600">
          El Mundial ya ha empezado: las predicciones están bloqueadas.
        </Card>
      )}

      {/* Selector de grupo */}
      <div className="-mx-4 mb-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroupId(g.id)}
              className={cn(
                "h-10 w-10 shrink-0 rounded-xl text-sm font-bold transition-colors",
                g.id === groupId
                  ? "bg-pitch-600 text-white"
                  : "bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50",
              )}
            >
              {g.id}
            </button>
          ))}
        </div>
      </div>

      <Card className="px-4 py-2">
        <h2 className="py-2 text-center text-sm font-bold uppercase tracking-wide text-pitch-600">
          Grupo {groupId}
        </h2>
        <div className="divide-y divide-ink-100">
          {groupMatches.map((m) => (
            <MatchScoreRow
              key={m.id}
              homeName={m.homeName}
              awayName={m.awayName}
              meta={matchMeta(m)}
              readOnly={locked}
              value={draft.groupMatches[m.id] ?? { home: null, away: null }}
              onChange={(v) => setScore(m.id, v)}
            />
          ))}
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-ink-400">
        Tus cambios se guardan automáticamente en este dispositivo.
      </p>
    </div>
  );
}

export default function GruposPage() {
  return (
    <NameGate>
      <Grupos />
    </NameGate>
  );
}
