"use client";

import { useEffect } from "react";
import { Button } from "./ui";

/** Diálogo de confirmación para acciones importantes (p. ej. guardar en firme). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "primary",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "gold";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-ink-900/50"
        onClick={onCancel}
        aria-hidden
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <div className="mt-2 text-sm text-ink-600">{message}</div>
        <div className="mt-5 flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            autoFocus
          >
            {cancelLabel}
          </Button>
          <Button variant={tone} className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
