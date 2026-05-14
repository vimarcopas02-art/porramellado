"use client";

import type { BracketTie, ScorePrediction } from "@/lib/types";
import { tieParticipants, slotCandidates } from "@/lib/bracket";
import { teamName, teams } from "@/lib/data";
import { Card } from "./ui";
import { cn } from "@/lib/cn";

export type RoundKey = "r32" | "r16" | "qf" | "sf" | "third" | "final";

const ROUND_NAME: Record<RoundKey, string> = {
  r32: "Dieciseisavos",
  r16: "Octavos",
  qf: "Cuartos",
  sf: "Semifinal",
  third: "3.er puesto",
  final: "Final",
};

function tieDate(tie: BracketTie): string {
  return new Date(`${tie.date}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

/** Selector de equipo para un hueco de dieciseisavos. */
function SlotSelect({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (teamId: string) => void;
  disabled?: boolean;
}) {
  const candidates = slotCandidates(label);
  const options = candidates.length ? candidates : teams.map((t) => t.id);
  return (
    <div className="flex flex-1 items-center gap-2">
      <span className="shrink-0 rounded-md bg-ink-100 px-1.5 py-0.5 text-xs font-bold text-ink-500">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 flex-1 rounded-lg border border-ink-200 bg-white px-2 text-sm font-semibold outline-none focus:border-pitch-500 focus:ring-2 focus:ring-pitch-100 disabled:bg-ink-50 disabled:text-ink-400",
          !value && "text-ink-400",
        )}
      >
        <option value="">Elegir…</option>
        {options.map((id) => (
          <option key={id} value={id}>
            {teamName(id)}
          </option>
        ))}
      </select>
    </div>
  );
}

function TeamRow({
  team,
  isWinner,
  canPick,
  onPickWinner,
  children,
}: {
  team: string;
  isWinner: boolean;
  canPick: boolean;
  onPickWinner: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border p-2 transition-colors",
        isWinner
          ? "border-pitch-400 bg-pitch-50"
          : "border-ink-200 bg-white",
      )}
    >
      <button
        type="button"
        aria-label={isWinner ? "Ganador" : "Marcar como ganador"}
        aria-pressed={isWinner}
        disabled={!canPick}
        onClick={onPickWinner}
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors",
          isWinner
            ? "border-pitch-600 bg-pitch-600 text-white"
            : "border-ink-300 bg-white text-transparent hover:border-pitch-400",
          !canPick && "cursor-not-allowed opacity-40",
        )}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="m5 12 5 5L20 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {children}
    </div>
  );
}

export function BracketTieCard({
  tie,
  round,
  bracketRecord,
  bracketScores,
  locked,
  onSlot,
  onWinner,
  onScore,
}: {
  tie: BracketTie;
  round: RoundKey;
  bracketRecord: Record<string, string>;
  bracketScores: Record<string, ScorePrediction>;
  locked: boolean;
  onSlot: (tieId: string, index: 0 | 1, teamId: string) => void;
  onWinner: (tieId: string, teamId: string) => void;
  onScore: (tieId: string, score: ScorePrediction) => void;
}) {
  const [teamA, teamB] = tieParticipants(bracketRecord, tie.id);
  const winner = bracketRecord[`win:${tie.id}`] || "";
  const score = bracketScores[tie.id] ?? { home: null, away: null };
  const isR32 = round === "r32";

  return (
    <Card className="p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-pitch-600">
        {ROUND_NAME[round]} · {tieDate(tie)} · {tie.city}
      </p>

      <div className="space-y-1.5">
        {[teamA, teamB].map((team, index) => {
          const slotLabel = tie.slots?.[index] ?? "";
          const canPick = !locked && Boolean(team);
          return (
            <TeamRow
              key={index}
              team={team}
              isWinner={Boolean(team) && winner === team}
              canPick={canPick}
              onPickWinner={() => onWinner(tie.id, team)}
            >
              {isR32 ? (
                <SlotSelect
                  label={slotLabel}
                  value={team}
                  disabled={locked}
                  onChange={(teamId) =>
                    onSlot(tie.id, index as 0 | 1, teamId)
                  }
                />
              ) : (
                <span
                  className={cn(
                    "flex-1 truncate text-sm font-semibold",
                    !team && "text-ink-400",
                  )}
                >
                  {team ? teamName(team) : "Pendiente"}
                </span>
              )}
            </TeamRow>
          );
        })}
      </div>

      {/* Marcador del cruce (90 min) — opcional, +5 puntos si es exacto */}
      <div className="mt-2 flex items-center justify-center gap-2 text-sm text-ink-500">
        <span className="text-xs font-medium">Marcador 90&apos;</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={99}
          aria-label="Goles equipo de arriba"
          readOnly={locked}
          value={score.home ?? ""}
          onChange={(e) =>
            onScore(tie.id, {
              ...score,
              home: e.target.value === "" ? null : Number(e.target.value),
            })
          }
          className="h-9 w-9 rounded-lg border border-ink-200 text-center font-bold outline-none focus:border-pitch-500 read-only:bg-ink-50"
        />
        <span className="text-ink-300">-</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={99}
          aria-label="Goles equipo de abajo"
          readOnly={locked}
          value={score.away ?? ""}
          onChange={(e) =>
            onScore(tie.id, {
              ...score,
              away: e.target.value === "" ? null : Number(e.target.value),
            })
          }
          className="h-9 w-9 rounded-lg border border-ink-200 text-center font-bold outline-none focus:border-pitch-500 read-only:bg-ink-50"
        />
      </div>
    </Card>
  );
}
