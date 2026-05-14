import { groups, teamsOfGroup, matchesOfGroup, bracket } from "./data";
import type { ScorePrediction } from "./types";

/**
 * Motor de clasificación de la fase de grupos.
 * Calcula la tabla de cada grupo a partir de los marcadores (3 pts victoria,
 * 1 empate) y, de ahí, rellena automáticamente los huecos del cuadro final:
 * los 1.º y 2.º de cada grupo y los 8 mejores terceros.
 */

export type StandingRow = {
  teamId: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
};

type Scores = Record<string, ScorePrediction>;

function emptyRow(teamId: string): StandingRow {
  return { teamId, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
}

/** Tabla de un grupo, ordenada (Pts → DG → GF → orden de bombo). */
export function computeGroupStanding(
  groupId: string,
  scores: Scores,
): StandingRow[] {
  const groupTeams = teamsOfGroup(groupId);
  const order = groupTeams.map((t) => t.id);
  const rows = new Map<string, StandingRow>();
  for (const t of groupTeams) rows.set(t.id, emptyRow(t.id));

  for (const match of matchesOfGroup(groupId)) {
    const s = scores[match.id];
    if (!s || s.home == null || s.away == null) continue;
    const home = rows.get(match.home);
    const away = rows.get(match.away);
    if (!home || !away) continue;
    home.pj += 1;
    away.pj += 1;
    home.gf += s.home;
    home.gc += s.away;
    away.gf += s.away;
    away.gc += s.home;
    if (s.home > s.away) {
      home.g += 1;
      away.p += 1;
      home.pts += 3;
    } else if (s.home < s.away) {
      away.g += 1;
      home.p += 1;
      away.pts += 3;
    } else {
      home.e += 1;
      away.e += 1;
      home.pts += 1;
      away.pts += 1;
    }
  }

  for (const row of rows.values()) row.dg = row.gf - row.gc;

  return [...rows.values()].sort(
    (a, b) =>
      b.pts - a.pts ||
      b.dg - a.dg ||
      b.gf - a.gf ||
      order.indexOf(a.teamId) - order.indexOf(b.teamId),
  );
}

export function computeAllStandings(
  scores: Scores,
): Record<string, StandingRow[]> {
  const out: Record<string, StandingRow[]> = {};
  for (const g of groups) out[g.id] = computeGroupStanding(g.id, scores);
  return out;
}

/** Un grupo está "cerrado" cuando tiene los 6 marcadores rellenos. */
export function groupComplete(scores: Scores, groupId: string): boolean {
  return matchesOfGroup(groupId).every((m) => {
    const s = scores[m.id];
    return Boolean(s) && s.home != null && s.away != null;
  });
}

/** Los 12 terceros, ordenados de mejor a peor. */
export function rankThirds(
  standings: Record<string, StandingRow[]>,
): { groupId: string; row: StandingRow }[] {
  return groups
    .map((g) => ({ groupId: g.id, row: standings[g.id]?.[2] }))
    .filter((t): t is { groupId: string; row: StandingRow } => Boolean(t.row))
    .sort(
      (a, b) =>
        b.row.pts - a.row.pts ||
        b.row.dg - a.row.dg ||
        b.row.gf - a.row.gf ||
        a.groupId.localeCompare(b.groupId),
    );
}

type ThirdSlot = { key: string; allowed: string[] };

/** Empareja cada tercero clasificado con un hueco compatible del cuadro. */
function matchThirds(
  thirds: { groupId: string; teamId: string }[],
  slots: ThirdSlot[],
): Map<string, string> {
  const result = new Map<string, string>();
  const used = new Array(slots.length).fill(false);

  const backtrack = (i: number): boolean => {
    if (i >= thirds.length) return true;
    for (let s = 0; s < slots.length; s++) {
      if (used[s] || !slots[s].allowed.includes(thirds[i].groupId)) continue;
      used[s] = true;
      result.set(slots[s].key, thirds[i].teamId);
      if (backtrack(i + 1)) return true;
      used[s] = false;
      result.delete(slots[s].key);
    }
    return false;
  };

  if (backtrack(0)) return result;

  // Datos incompletos: asignación voraz best-effort.
  result.clear();
  used.fill(false);
  for (const third of thirds) {
    const s = slots.findIndex(
      (slot, idx) => !used[idx] && slot.allowed.includes(third.groupId),
    );
    if (s >= 0) {
      used[s] = true;
      result.set(slots[s].key, third.teamId);
    }
  }
  return result;
}

/**
 * Rellena los huecos de dieciseisavos (clave `slot:D*:N`) a partir de la
 * clasificación: 1.º y 2.º directos, y los 8 mejores terceros emparejados.
 * Solo se rellenan huecos de grupos ya cerrados (con sus 6 partidos), para no
 * mostrar emparejamientos basados en el orden de bombo.
 */
export function autoBracketSlots(scores: Scores): Record<string, string> {
  const standings = computeAllStandings(scores);
  const completeGroups = new Set(
    groups.filter((g) => groupComplete(scores, g.id)).map((g) => g.id),
  );
  const slots: Record<string, string> = {};
  const thirdSlots: ThirdSlot[] = [];

  for (const tie of bracket.r32) {
    tie.slots?.forEach((label, index) => {
      const key = `slot:${tie.id}:${index}`;
      const match = label.match(/^(\d+)º(.+)$/);
      if (!match) return;
      const position = Number(match[1]);
      const groupLabel = match[2];
      if (position === 1 || position === 2) {
        if (!completeGroups.has(groupLabel)) return;
        const row = standings[groupLabel]?.[position - 1];
        if (row) slots[key] = row.teamId;
      } else if (position === 3) {
        thirdSlots.push({ key, allowed: groupLabel.split("") });
      }
    });
  }

  const qualified = rankThirds(standings)
    .filter((t) => completeGroups.has(t.groupId))
    .slice(0, thirdSlots.length)
    .map((t) => ({ groupId: t.groupId, teamId: t.row.teamId }));

  for (const [key, teamId] of matchThirds(qualified, thirdSlots)) {
    slots[key] = teamId;
  }

  return slots;
}
