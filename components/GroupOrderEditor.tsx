"use client";

import { Card } from "./ui";
import { ChevronUpIcon, ChevronDownIcon } from "./icons";
import { teamName } from "@/lib/data";
import { cn } from "@/lib/cn";

const POSITIONS = ["1º", "2º", "3º", "4º"];

export function moveItem(arr: string[], from: number, to: number): string[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/** Tarjeta para ordenar los 4 equipos de un grupo del 1º al 4º. */
export function GroupOrderEditor({
  groupId,
  order,
  locked,
  onReorder,
}: {
  groupId: string;
  order: string[];
  locked: boolean;
  onReorder: (next: string[]) => void;
}) {
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-pitch-600">
        Grupo {groupId}
      </h2>
      <ul className="space-y-1.5">
        {order.map((teamId, i) => (
          <li
            key={teamId}
            className="flex items-center gap-2 rounded-xl bg-ink-50 p-1.5"
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold",
                i < 2 ? "bg-pitch-600 text-white" : "bg-ink-200 text-ink-600",
              )}
            >
              {POSITIONS[i]}
            </span>
            <span className="flex-1 truncate text-sm font-semibold">
              {teamName(teamId)}
            </span>
            {!locked && (
              <div className="flex shrink-0 gap-1">
                <button
                  aria-label={`Subir ${teamName(teamId)}`}
                  disabled={i === 0}
                  onClick={() => onReorder(moveItem(order, i, i - 1))}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-white text-ink-500 ring-1 ring-ink-200 hover:text-pitch-600 disabled:opacity-30"
                >
                  <ChevronUpIcon className="h-5 w-5" />
                </button>
                <button
                  aria-label={`Bajar ${teamName(teamId)}`}
                  disabled={i === order.length - 1}
                  onClick={() => onReorder(moveItem(order, i, i + 1))}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-white text-ink-500 ring-1 ring-ink-200 hover:text-pitch-600 disabled:opacity-30"
                >
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
