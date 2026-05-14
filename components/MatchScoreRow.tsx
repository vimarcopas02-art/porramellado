"use client";

import type { ScorePrediction } from "@/lib/types";
import { cn } from "@/lib/cn";

function ScoreCell({
  value,
  onChange,
  readOnly,
  label,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  readOnly?: boolean;
  label: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={99}
      readOnly={readOnly}
      aria-label={label}
      value={value ?? ""}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") return onChange(null);
        const n = Math.max(0, Math.min(99, Math.floor(Number(raw))));
        onChange(Number.isNaN(n) ? null : n);
      }}
      className={cn(
        "h-12 w-12 rounded-xl border text-center text-lg font-bold outline-none transition-colors",
        readOnly
          ? "border-ink-200 bg-ink-50 text-ink-500"
          : "border-ink-200 bg-white focus:border-pitch-500 focus:ring-2 focus:ring-pitch-100",
        value != null && !readOnly && "border-pitch-300 bg-pitch-50",
      )}
    />
  );
}

export function MatchScoreRow({
  homeName,
  awayName,
  value,
  onChange,
  readOnly,
  meta,
}: {
  homeName: string;
  awayName: string;
  value: ScorePrediction;
  onChange: (v: ScorePrediction) => void;
  readOnly?: boolean;
  meta?: string;
}) {
  return (
    <div className="py-3">
      {meta && (
        <p className="mb-1.5 text-center text-xs font-medium text-ink-400">
          {meta}
        </p>
      )}
      <div className="flex items-center gap-2">
        <span className="flex-1 truncate text-right text-sm font-semibold sm:text-base">
          {homeName}
        </span>
        <div className="flex items-center gap-1.5">
          <ScoreCell
            value={value.home}
            onChange={(v) => onChange({ ...value, home: v })}
            readOnly={readOnly}
            label={`Goles de ${homeName}`}
          />
          <span className="text-ink-300">-</span>
          <ScoreCell
            value={value.away}
            onChange={(v) => onChange({ ...value, away: v })}
            readOnly={readOnly}
            label={`Goles de ${awayName}`}
          />
        </div>
        <span className="flex-1 truncate text-left text-sm font-semibold sm:text-base">
          {awayName}
        </span>
      </div>
    </div>
  );
}
