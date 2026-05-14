"use client";

import { NameGate } from "@/components/NameGate";
import { PredictionHeader } from "@/components/PredictionHeader";
import { Card } from "@/components/ui";
import { GroupOrderEditor } from "@/components/GroupOrderEditor";
import { groups, TOURNAMENT_START } from "@/lib/data";
import { useAutosaveDraft } from "@/lib/hooks";
import type { Predictions } from "@/lib/types";

function orderOf(draft: Predictions, groupId: string): string[] {
  const group = groups.find((g) => g.id === groupId)!;
  const saved = draft.groupOrder[groupId];
  if (
    saved &&
    saved.length === 4 &&
    saved.every((id) => group.teams.includes(id))
  ) {
    return saved;
  }
  return group.teams;
}

function Orden() {
  const { draft, patch, dirty } = useAutosaveDraft();
  const locked = Date.now() >= TOURNAMENT_START.getTime();

  const setOrder = (groupId: string, order: string[]) => {
    patch((prev) => ({
      ...prev,
      groupOrder: { ...prev.groupOrder, [groupId]: order },
    }));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PredictionHeader
        title="Orden de los grupos"
        description="Ordena cada grupo del 1º al 4º. Si aciertas el orden completo de un grupo, ganas 10 puntos."
        dirty={dirty}
      />

      {locked && (
        <Card className="mb-4 bg-gold-300/30 p-3 text-sm font-semibold text-gold-600">
          El Mundial ya ha empezado: las predicciones están bloqueadas.
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <GroupOrderEditor
            key={g.id}
            groupId={g.id}
            order={orderOf(draft, g.id)}
            locked={locked}
            onReorder={(next) => setOrder(g.id, next)}
          />
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-ink-400">
        Usa las flechas para colocar cada selección en su posición final.
      </p>
    </div>
  );
}

export default function OrdenPage() {
  return (
    <NameGate>
      <Orden />
    </NameGate>
  );
}
