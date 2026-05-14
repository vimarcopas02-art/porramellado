import { matches, groups, bracket, questions } from "./data";
import type { Predictions } from "./types";

export type SectionProgress = { done: number; total: number };

function bracketSlotKeys(): string[] {
  const keys: string[] = [];
  for (const tie of bracket.r32) {
    keys.push(`slot:${tie.id}:0`, `slot:${tie.id}:1`);
  }
  return keys;
}

function bracketWinnerKeys(): string[] {
  return [
    ...bracket.r32.map((t) => `win:${t.id}`),
    ...bracket.r16.map((t) => `win:${t.id}`),
    ...bracket.qf.map((t) => `win:${t.id}`),
    ...bracket.sf.map((t) => `win:${t.id}`),
    `win:${bracket.third.id}`,
    `win:${bracket.final.id}`,
  ];
}

const BRACKET_KEYS = [...bracketSlotKeys(), ...bracketWinnerKeys()];

export function sectionProgress(predictions: Predictions) {
  const groupMatches: SectionProgress = {
    done: matches.filter((m) => {
      const p = predictions.groupMatches[m.id];
      return p && p.home != null && p.away != null;
    }).length,
    total: matches.length,
  };

  const groupOrder: SectionProgress = {
    done: groups.filter((g) => {
      const o = predictions.groupOrder[g.id];
      return o && o.length === 4 && o.every(Boolean);
    }).length,
    total: groups.length,
  };

  const bracketProgress: SectionProgress = {
    done: BRACKET_KEYS.filter((k) => Boolean(predictions.bracket[k])).length,
    total: BRACKET_KEYS.length,
  };

  const questionsProgress: SectionProgress = {
    done: questions.filter((q) =>
      Boolean((predictions.questions[q.id] ?? "").trim()),
    ).length,
    total: questions.length,
  };

  return {
    groupMatches,
    groupOrder,
    bracket: bracketProgress,
    questions: questionsProgress,
  };
}

export function overallProgress(predictions: Predictions): SectionProgress {
  const s = sectionProgress(predictions);
  return {
    done:
      s.groupMatches.done +
      s.groupOrder.done +
      s.bracket.done +
      s.questions.done,
    total:
      s.groupMatches.total +
      s.groupOrder.total +
      s.bracket.total +
      s.questions.total,
  };
}
