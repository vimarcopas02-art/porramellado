import { matches, bracket, questions } from "./data";
import type { Predictions } from "./types";

export type SectionProgress = { done: number; total: number };

const BRACKET_TIE_KEYS = [
  ...bracket.r32.map((t) => `win:${t.id}`),
  ...bracket.r16.map((t) => `win:${t.id}`),
  ...bracket.qf.map((t) => `win:${t.id}`),
  ...bracket.sf.map((t) => `win:${t.id}`),
  `win:${bracket.third.id}`,
  `win:${bracket.final.id}`,
];

export function sectionProgress(predictions: Predictions) {
  const groupMatches: SectionProgress = {
    done: matches.filter((m) => {
      const p = predictions.groupMatches[m.id];
      return p && p.home != null && p.away != null;
    }).length,
    total: matches.length,
  };

  const bracketProgress: SectionProgress = {
    done: BRACKET_TIE_KEYS.filter((k) => Boolean(predictions.bracket[k]))
      .length,
    total: BRACKET_TIE_KEYS.length,
  };

  const questionsProgress: SectionProgress = {
    done: questions.filter((q) =>
      Boolean((predictions.questions[q.id] ?? "").trim()),
    ).length,
    total: questions.length,
  };

  return {
    groupMatches,
    bracket: bracketProgress,
    questions: questionsProgress,
  };
}

export function overallProgress(predictions: Predictions): SectionProgress {
  const s = sectionProgress(predictions);
  return {
    done: s.groupMatches.done + s.bracket.done + s.questions.done,
    total: s.groupMatches.total + s.bracket.total + s.questions.total,
  };
}
