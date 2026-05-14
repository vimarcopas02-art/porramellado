import teamsJson from "@/data/teams.json";
import groupsJson from "@/data/groups.json";
import venuesJson from "@/data/venues.json";
import matchesJson from "@/data/matches.json";
import bracketJson from "@/data/bracket.json";
import questionsJson from "@/data/questions.json";
import type {
  Team,
  Group,
  Venue,
  Match,
  Bracket,
  Question,
} from "./types";

export const teams = teamsJson as Team[];
export const groups = groupsJson as Group[];
export const venues = venuesJson as Venue[];
export const matches = matchesJson as Match[];
export const bracket = bracketJson as Bracket;
export const questions = questionsJson as Question[];

/** Fecha de inicio del Mundial 2026: primer partido (México - Sudáfrica). */
export const TOURNAMENT_START = new Date("2026-06-11T21:00:00+02:00");

const teamById = new Map(teams.map((t) => [t.id, t]));
const matchById = new Map(matches.map((m) => [m.id, m]));

export function getTeam(id: string): Team | undefined {
  return teamById.get(id);
}

export function teamName(id: string | null | undefined): string {
  if (!id) return "";
  return teamById.get(id)?.name ?? id;
}

export function getMatch(id: string): Match | undefined {
  return matchById.get(id);
}

export function teamsOfGroup(groupId: string): Team[] {
  return teams.filter((t) => t.group === groupId);
}

export function matchesOfGroup(groupId: string): Match[] {
  return matches.filter((m) => m.group === groupId);
}

/** Texto corto con fecha, hora y ciudad de un partido. */
export function matchMeta(m: Match): string {
  const date = new Date(`${m.date}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
  return `${date} · ${m.time} · ${m.city}`;
}

export const questionCategories = [
  ...new Set(questions.map((q) => q.category)),
];

/** Total de puntos repartibles por las preguntas. */
export const totalQuestionPoints = questions.reduce(
  (sum, q) => sum + q.points,
  0,
);
