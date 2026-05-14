"use client";

import { useState } from "react";
import { NameGate } from "@/components/NameGate";
import { PredictionHeader } from "@/components/PredictionHeader";
import { BracketTieCard, type RoundKey } from "@/components/BracketTieCard";
import { Card } from "@/components/ui";
import { TrophyIcon } from "@/components/icons";
import { bracket, teamName, TOURNAMENT_START } from "@/lib/data";
import { normalizeBracket } from "@/lib/bracket";
import { useAutosaveDraft } from "@/lib/hooks";
import type { ScorePrediction } from "@/lib/types";
import { cn } from "@/lib/cn";

const TABS = [
  { id: "r32", label: "16avos" },
  { id: "r16", label: "Octavos" },
  { id: "qf", label: "Cuartos" },
  { id: "sf", label: "Semis" },
  { id: "final", label: "Final" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Eliminatorias() {
  const { draft, patch, dirty } = useAutosaveDraft();
  const [tab, setTab] = useState<TabId>("r32");
  const locked = Date.now() >= TOURNAMENT_START.getTime();

  const updateBracket = (mutate: (rec: Record<string, string>) => void) => {
    patch((prev) => {
      const rec = { ...prev.bracket };
      mutate(rec);
      return { ...prev, bracket: normalizeBracket(rec) };
    });
  };

  const onSlot = (tieId: string, index: 0 | 1, teamId: string) => {
    updateBracket((rec) => {
      if (teamId) rec[`slot:${tieId}:${index}`] = teamId;
      else delete rec[`slot:${tieId}:${index}`];
    });
  };

  const onWinner = (tieId: string, teamId: string) => {
    if (!teamId) return;
    updateBracket((rec) => {
      rec[`win:${tieId}`] = teamId;
    });
  };

  const onScore = (tieId: string, score: ScorePrediction) => {
    patch((prev) => ({
      ...prev,
      bracketScores: { ...prev.bracketScores, [tieId]: score },
    }));
  };

  const cardProps = {
    bracketRecord: draft.bracket,
    bracketScores: draft.bracketScores,
    locked,
    onSlot,
    onWinner,
    onScore,
  };

  const champion = draft.bracket[`win:${bracket.final.id}`];
  const third = draft.bracket[`win:${bracket.third.id}`];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PredictionHeader
        title="Cuadro final"
        description="Elige los equipos de dieciseisavos y ve marcando quién pasa cada ronda. Cuanto más lejos aciertes, más puntos."
        dirty={dirty}
      />

      {locked && (
        <Card className="mb-4 bg-gold-300/30 p-3 text-sm font-semibold text-gold-600">
          El Mundial ya ha empezado: las predicciones están bloqueadas.
        </Card>
      )}

      {/* Tabs de ronda */}
      <div className="-mx-4 mb-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition-colors",
                t.id === tab
                  ? "bg-pitch-600 text-white"
                  : "bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "r32" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {bracket.r32.map((tie) => (
            <BracketTieCard
              key={tie.id}
              tie={tie}
              round={"r32" as RoundKey}
              {...cardProps}
            />
          ))}
        </div>
      )}

      {tab === "r16" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {bracket.r16.map((tie) => (
            <BracketTieCard
              key={tie.id}
              tie={tie}
              round={"r16" as RoundKey}
              {...cardProps}
            />
          ))}
        </div>
      )}

      {tab === "qf" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {bracket.qf.map((tie) => (
            <BracketTieCard
              key={tie.id}
              tie={tie}
              round={"qf" as RoundKey}
              {...cardProps}
            />
          ))}
        </div>
      )}

      {tab === "sf" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {bracket.sf.map((tie) => (
            <BracketTieCard
              key={tie.id}
              tie={tie}
              round={"sf" as RoundKey}
              {...cardProps}
            />
          ))}
        </div>
      )}

      {tab === "final" && (
        <div className="space-y-3">
          <BracketTieCard
            tie={bracket.final}
            round={"final" as RoundKey}
            {...cardProps}
          />
          <BracketTieCard
            tie={bracket.third}
            round={"third" as RoundKey}
            {...cardProps}
          />
          <Card className="flex items-center gap-3 bg-pitch-800 p-4 text-white">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-400 text-ink-900">
              <TrophyIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-pitch-200">
                Tu campeón del Mundial
              </p>
              <p className="text-lg font-bold">
                {champion ? teamName(champion) : "Sin elegir todavía"}
              </p>
              {third && (
                <p className="text-sm text-pitch-200">
                  Tercer puesto: {teamName(third)}
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-ink-400">
        Marca el círculo de un equipo para hacerlo pasar de ronda. El marcador
        de cada cruce es opcional.
      </p>
    </div>
  );
}

export default function EliminatoriasPage() {
  return (
    <NameGate>
      <Eliminatorias />
    </NameGate>
  );
}
