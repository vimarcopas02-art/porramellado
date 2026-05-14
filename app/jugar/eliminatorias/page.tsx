"use client";

import { useState } from "react";
import Link from "next/link";
import { NameGate } from "@/components/NameGate";
import { PredictionHeader } from "@/components/PredictionHeader";
import { BracketTieCard, type RoundKey } from "@/components/BracketTieCard";
import { Card } from "@/components/ui";
import { TrophyIcon } from "@/components/icons";
import { bracket, teamName, TOURNAMENT_START } from "@/lib/data";
import { fullBracket, winnersOnly } from "@/lib/bracket";
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
  const { draft, patch, dirty, participant } = useAutosaveDraft();
  const [tab, setTab] = useState<TabId>("r32");
  const locked =
    Boolean(participant?.locked) || Date.now() >= TOURNAMENT_START.getTime();

  // Cuadro completo: huecos automáticos (de los marcadores de grupos) + ganadores.
  const record = fullBracket(draft.groupMatches, draft.bracket);

  const onWinner = (tieId: string, teamId: string) => {
    if (!teamId) return;
    patch((prev) => {
      const winners = { ...prev.bracket, [`win:${tieId}`]: teamId };
      const normalized = fullBracket(prev.groupMatches, winners);
      return { ...prev, bracket: winnersOnly(normalized) };
    });
  };

  const onScore = (tieId: string, score: ScorePrediction) => {
    patch((prev) => ({
      ...prev,
      bracketScores: { ...prev.bracketScores, [tieId]: score },
    }));
  };

  const cardProps = {
    bracketRecord: record,
    bracketScores: draft.bracketScores,
    locked,
    onWinner,
    onScore,
  };

  const champion = record[`win:${bracket.final.id}`];
  const third = record[`win:${bracket.third.id}`];
  const hasSlots = Object.keys(record).some((k) => k.startsWith("slot:"));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PredictionHeader
        title="Cuadro final"
        description="Los equipos de dieciseisavos se calculan solos con tu clasificación de grupos. Tú eliges quién gana cada cruce."
        dirty={dirty}
      />

      {locked && (
        <Card className="mb-4 bg-gold-300/30 p-3 text-sm font-semibold text-gold-600">
          Tus predicciones están bloqueadas: solo puedes consultarlas.
        </Card>
      )}

      {!hasSlots && (
        <Card className="mb-4 bg-pitch-50 p-4 text-sm text-ink-700">
          Todavía no hay equipos en el cuadro. Rellena primero los{" "}
          <Link
            href="/jugar/grupos"
            className="font-semibold text-pitch-600"
          >
            partidos de grupos
          </Link>{" "}
          y aquí se colocarán solos.
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
        Marca el círculo de un equipo para hacerlo pasar de ronda.
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
