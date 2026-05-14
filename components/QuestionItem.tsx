"use client";

import { Badge } from "./ui";
import { teams } from "@/lib/data";
import type { Question } from "@/lib/types";
import { cn } from "@/lib/cn";

/** Una pregunta con su control de respuesta según el tipo. */
export function QuestionItem({
  question,
  value,
  locked,
  onChange,
}: {
  question: Question;
  value: string;
  locked: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-800">{question.text}</p>
        <Badge tone="gold" className="shrink-0">
          {question.points} pt{question.points === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="mt-2.5">
        {question.type === "boolean" && (
          <div className="flex gap-2">
            {["Sí", "No"].map((option) => (
              <button
                key={option}
                type="button"
                disabled={locked}
                onClick={() => onChange(value === option ? "" : option)}
                className={cn(
                  "h-10 flex-1 rounded-xl text-sm font-bold transition-colors disabled:opacity-50",
                  value === option
                    ? "bg-pitch-600 text-white"
                    : "bg-ink-50 text-ink-600 ring-1 ring-ink-200 hover:bg-ink-100",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === "team" && (
          <select
            value={value}
            disabled={locked}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold outline-none focus:border-pitch-500 focus:ring-2 focus:ring-pitch-100 disabled:bg-ink-50",
              !value && "text-ink-400",
            )}
          >
            <option value="">Elegir selección…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        {question.type === "text" && (
          <input
            type="text"
            value={value}
            disabled={locked}
            maxLength={80}
            placeholder="Escribe la respuesta"
            onChange={(e) => onChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-pitch-500 focus:ring-2 focus:ring-pitch-100 placeholder:text-ink-400 disabled:bg-ink-50"
          />
        )}
      </div>
    </div>
  );
}
