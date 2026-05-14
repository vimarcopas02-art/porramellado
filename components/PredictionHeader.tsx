"use client";

import Link from "next/link";
import { CheckIcon } from "./icons";
import { cn } from "@/lib/cn";

function SavedBadge({ dirty }: { dirty: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        dirty ? "bg-gold-300/60 text-gold-600" : "bg-pitch-100 text-pitch-700",
      )}
      aria-live="polite"
    >
      {dirty ? (
        <>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500" />
          Guardando…
        </>
      ) : (
        <>
          <CheckIcon className="h-3.5 w-3.5" />
          Guardado
        </>
      )}
    </span>
  );
}

export function PredictionHeader({
  title,
  description,
  dirty,
}: {
  title: string;
  description?: string;
  dirty: boolean;
}) {
  return (
    <div className="mb-6">
      <Link
        href="/jugar"
        className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-ink-800"
      >
        ← Volver a mi porra
      </Link>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-ink-600">{description}</p>
          )}
        </div>
        <SavedBadge dirty={dirty} />
      </div>
    </div>
  );
}
