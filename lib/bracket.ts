import { bracket, teams } from "./data";
import type { BracketTie } from "./types";

/** Todos los cruces del cuadro final, en orden de disputa. */
export const ALL_TIES: BracketTie[] = [
  ...bracket.r32,
  ...bracket.r16,
  ...bracket.qf,
  ...bracket.sf,
  bracket.third,
  bracket.final,
];

export const ALL_TIE_IDS = ALL_TIES.map((t) => t.id);

export function findTie(tieId: string): BracketTie | undefined {
  return ALL_TIES.find((t) => t.id === tieId);
}

/**
 * Equipos candidatos para un hueco de dieciseisavos.
 * "1ºE" → equipos del grupo E. "3ºABCDF" → terceros de los grupos A,B,C,D,F.
 */
export function slotCandidates(label: string): string[] {
  const match = label.match(/^\d+º(.+)$/);
  if (!match) return teams.map((t) => t.id);
  const groupLetters = match[1].split("");
  return teams
    .filter((t) => groupLetters.includes(t.group))
    .map((t) => t.id);
}

/**
 * Los dos equipos que disputan un cruce, según un cuadro dado (predicción o
 * resultados). Para dieciseisavos son los huecos; para rondas posteriores son
 * los ganadores de los cruces que alimentan ese cruce. El partido por el tercer
 * puesto lo disputan los perdedores de las semifinales.
 */
export function tieParticipants(
  bracketRecord: Record<string, string>,
  tieId: string,
): [string, string] {
  if (tieId.startsWith("D")) {
    return [
      bracketRecord[`slot:${tieId}:0`] || "",
      bracketRecord[`slot:${tieId}:1`] || "",
    ];
  }
  if (tieId === bracket.third.id) {
    const losers = bracket.sf.map((sf) => {
      const [pa, pb] = tieParticipants(bracketRecord, sf.id);
      const winner = bracketRecord[`win:${sf.id}`] || "";
      if (!winner) return "";
      return winner === pa ? pb : pa;
    });
    return [losers[0] || "", losers[1] || ""];
  }
  const tie = findTie(tieId);
  if (!tie?.from) return ["", ""];
  return [
    bracketRecord[`win:${tie.from[0]}`] || "",
    bracketRecord[`win:${tie.from[1]}`] || "",
  ];
}

/**
 * Limpia ganadores que han quedado obsoletos tras un cambio aguas arriba.
 * Se procesa en orden de rondas para que las correcciones se propaguen.
 */
export function normalizeBracket(
  bracketRecord: Record<string, string>,
): Record<string, string> {
  const next = { ...bracketRecord };
  for (const tie of ALL_TIES) {
    const [a, b] = tieParticipants(next, tie.id);
    const key = `win:${tie.id}`;
    const winner = next[key];
    if (winner && winner !== a && winner !== b) delete next[key];
  }
  return next;
}

/** Equipos que el cuadro sitúa en cada ronda. */
export function roundTeams(bracketRecord: Record<string, string>) {
  const get = (k: string) => bracketRecord[k] || "";

  const r32 = new Set<string>();
  for (const tie of bracket.r32) {
    for (let i = 0; i < 2; i++) {
      const v = get(`slot:${tie.id}:${i}`);
      if (v) r32.add(v);
    }
  }
  const r16 = new Set(
    bracket.r32.map((t) => get(`win:${t.id}`)).filter(Boolean),
  );
  const qf = new Set(bracket.r16.map((t) => get(`win:${t.id}`)).filter(Boolean));
  const sf = new Set(bracket.qf.map((t) => get(`win:${t.id}`)).filter(Boolean));
  const final = new Set(
    bracket.sf.map((t) => get(`win:${t.id}`)).filter(Boolean),
  );

  // Perdedores de semifinales = participantes del partido por el 3er puesto.
  const third4 = new Set<string>();
  for (const sfTie of bracket.sf) {
    const [fa, fb] = sfTie.from ?? [];
    const winner = get(`win:${sfTie.id}`);
    for (const feeder of [fa, fb]) {
      const team = get(`win:${feeder}`);
      if (team && team !== winner) third4.add(team);
    }
  }

  return { r32, r16, qf, sf, third4, final };
}
