import { bracket, matches, groups, questions } from "./data";
import { roundTeams, tieParticipants, fullBracket, ALL_TIE_IDS } from "./bracket";
import { computeGroupStanding, groupComplete } from "./standings";
import type { ScorePrediction } from "./types";
import type { Results, Participant } from "./storage";

/**
 * Sistema de puntuación replicado del Excel "PorraMundial2026".
 *
 * Fase de grupos (por partido):
 *   +2  signo 1X2 correcto
 *   +1  goles exactos del equipo local
 *   +1  goles exactos del equipo visitante
 * Orden de grupo:
 *   +10 acertar el orden completo (1º-4º) de un grupo
 * Eliminatorias — equipos clasificados a cada ronda:
 *   +5  dieciseisavos, +10 octavos, +15 cuartos, +20 semifinales,
 *   +25 partido por el 3er puesto, +30 final
 *   +25 acertar el tercer clasificado, +50 acertar el campeón
 * Eliminatorias — marcador exacto de un cruce: +5 (solo si se acertaron los 2 equipos)
 * Preguntas: la puntuación propia de cada pregunta, corregida a mano por el admin.
 */

export const POINTS = {
  signo: 2,
  golesEquipo: 1,
  ordenGrupo: 10,
  r32: 5,
  r16: 10,
  qf: 15,
  sf: 20,
  third4: 25,
  final: 30,
  thirdPlace: 25,
  champion: 50,
  knockoutExact: 5,
} as const;

export type ScoreBreakdown = {
  groupMatches: number;
  groupOrder: number;
  r32: number;
  r16: number;
  qf: number;
  sf: number;
  third4: number;
  final: number;
  thirdPlace: number;
  champion: number;
  knockoutExact: number;
  questions: number;
  total: number;
  /** Métricas de detalle para la clasificación. */
  exactResults: number;
  correctSigns: number;
};

function sign(s: ScorePrediction): "1" | "X" | "2" | null {
  if (s.home == null || s.away == null) return null;
  if (s.home > s.away) return "1";
  if (s.home < s.away) return "2";
  return "X";
}

function scoreGroupMatch(
  pred: ScorePrediction | undefined,
  real: ScorePrediction | undefined,
): { points: number; exact: boolean; correctSign: boolean } {
  if (!pred || !real || real.home == null || real.away == null) {
    return { points: 0, exact: false, correctSign: false };
  }
  let points = 0;
  const ps = sign(pred);
  const rs = sign(real);
  const correctSign = ps != null && ps === rs;
  if (correctSign) points += POINTS.signo;
  if (pred.home != null && pred.home === real.home) points += POINTS.golesEquipo;
  if (pred.away != null && pred.away === real.away) points += POINTS.golesEquipo;
  const exact =
    pred.home != null &&
    pred.away != null &&
    pred.home === real.home &&
    pred.away === real.away;
  return { points, exact, correctSign };
}

/** Compara dos parejas de equipos sin importar el orden. */
function sameTeams(a: string[], b: string[]): boolean {
  const fa = a.filter(Boolean);
  const fb = b.filter(Boolean);
  if (fa.length !== 2 || fb.length !== 2) return false;
  const sa = [...fa].sort();
  const sb = [...fb].sort();
  return sa[0] === sb[0] && sa[1] === sb[1];
}

export function computeScore(
  participant: Participant,
  results: Results,
): ScoreBreakdown {
  const predictions = participant.predictions;
  const b: ScoreBreakdown = {
    groupMatches: 0,
    groupOrder: 0,
    r32: 0,
    r16: 0,
    qf: 0,
    sf: 0,
    third4: 0,
    final: 0,
    thirdPlace: 0,
    champion: 0,
    knockoutExact: 0,
    questions: 0,
    total: 0,
    exactResults: 0,
    correctSigns: 0,
  };

  // --- Fase de grupos: marcador de cada partido ---
  for (const match of matches) {
    const r = scoreGroupMatch(
      predictions.groupMatches[match.id],
      results.groupMatches[match.id],
    );
    b.groupMatches += r.points;
    if (r.exact) b.exactResults += 1;
    if (r.correctSign) b.correctSigns += 1;
  }

  // --- Orden de los grupos (calculado de los marcadores) ---
  for (const group of groups) {
    if (
      !groupComplete(results.groupMatches, group.id) ||
      !groupComplete(predictions.groupMatches, group.id)
    ) {
      continue;
    }
    const predOrder = computeGroupStanding(
      group.id,
      predictions.groupMatches,
    ).map((row) => row.teamId);
    const realOrder = computeGroupStanding(group.id, results.groupMatches).map(
      (row) => row.teamId,
    );
    if (predOrder.every((id, i) => id === realOrder[i])) {
      b.groupOrder += POINTS.ordenGrupo;
    }
  }

  // --- Cuadro final: equipos por ronda ---
  const predBracket = fullBracket(
    predictions.groupMatches,
    predictions.bracket,
  );
  const realBracket = fullBracket(results.groupMatches, results.bracket);
  const predRounds = roundTeams(predBracket);
  const realRounds = roundTeams(realBracket);
  const countHits = (pred: Set<string>, real: Set<string>) => {
    let n = 0;
    for (const t of pred) if (real.has(t)) n += 1;
    return n;
  };
  b.r32 = countHits(predRounds.r32, realRounds.r32) * POINTS.r32;
  b.r16 = countHits(predRounds.r16, realRounds.r16) * POINTS.r16;
  b.qf = countHits(predRounds.qf, realRounds.qf) * POINTS.qf;
  b.sf = countHits(predRounds.sf, realRounds.sf) * POINTS.sf;
  b.third4 = countHits(predRounds.third4, realRounds.third4) * POINTS.third4;
  b.final = countHits(predRounds.final, realRounds.final) * POINTS.final;

  // --- Campeón y tercer clasificado ---
  const predChampion = predBracket[`win:${bracket.final.id}`];
  const realChampion = realBracket[`win:${bracket.final.id}`];
  if (predChampion && predChampion === realChampion) {
    b.champion = POINTS.champion;
  }
  const predThird = predBracket[`win:${bracket.third.id}`];
  const realThird = realBracket[`win:${bracket.third.id}`];
  if (predThird && predThird === realThird) {
    b.thirdPlace = POINTS.thirdPlace;
  }

  // --- Cuadro final: marcador exacto de cada cruce ---
  for (const tieId of ALL_TIE_IDS) {
    const ps = predictions.bracketScores[tieId];
    const rs = results.bracketScores[tieId];
    if (!ps || !rs || rs.home == null || rs.away == null) continue;
    const exact =
      ps.home != null &&
      ps.away != null &&
      ps.home === rs.home &&
      ps.away === rs.away;
    if (!exact) continue;
    const predPair = tieParticipants(predBracket, tieId);
    const realPair = tieParticipants(realBracket, tieId);
    if (sameTeams(predPair, realPair)) b.knockoutExact += POINTS.knockoutExact;
  }

  // --- Preguntas (corregidas a mano por el administrador) ---
  for (const q of questions) {
    if (results.questionGrades[q.id]?.[participant.id]) {
      b.questions += q.points;
    }
  }

  b.total =
    b.groupMatches +
    b.groupOrder +
    b.r32 +
    b.r16 +
    b.qf +
    b.sf +
    b.third4 +
    b.final +
    b.thirdPlace +
    b.champion +
    b.knockoutExact +
    b.questions;

  return b;
}
