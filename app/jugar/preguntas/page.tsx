"use client";

import { useState } from "react";
import { NameGate } from "@/components/NameGate";
import { PredictionHeader } from "@/components/PredictionHeader";
import { Card } from "@/components/ui";
import { QuestionItem } from "@/components/QuestionItem";
import { questions, questionCategories, TOURNAMENT_START } from "@/lib/data";
import { useAutosaveDraft } from "@/lib/hooks";
import { cn } from "@/lib/cn";

function Preguntas() {
  const { draft, patch, dirty, participant } = useAutosaveDraft();
  const [category, setCategory] = useState(questionCategories[0]);
  const locked =
    Boolean(participant?.locked) || Date.now() >= TOURNAMENT_START.getTime();

  const setAnswer = (questionId: string, value: string) => {
    patch((prev) => ({
      ...prev,
      questions: { ...prev.questions, [questionId]: value },
    }));
  };

  const visible = questions.filter((q) => q.category === category);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PredictionHeader
        title="Preguntas especiales"
        description="Preguntas variadas con puntuación extra. Cada una vale los puntos que indica su etiqueta."
        dirty={dirty}
      />

      {locked && (
        <Card className="mb-4 bg-gold-300/30 p-3 text-sm font-semibold text-gold-600">
          Tus predicciones están bloqueadas: solo puedes consultarlas.
        </Card>
      )}

      {/* Tabs de categoría */}
      <div className="-mx-4 mb-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {questionCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition-colors",
                c === category
                  ? "bg-pitch-600 text-white"
                  : "bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Card className="px-4">
        <div className="divide-y divide-ink-100">
          {visible.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              value={draft.questions[q.id] ?? ""}
              locked={locked}
              onChange={(value) => setAnswer(q.id, value)}
            />
          ))}
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-ink-400">
        Tus respuestas se guardan automáticamente.
      </p>
    </div>
  );
}

export default function PreguntasPage() {
  return (
    <NameGate>
      <Preguntas />
    </NameGate>
  );
}
