export type Team = {
  id: string;
  name: string;
  group: string;
  confederation: string;
};

export type Group = {
  id: string;
  name: string;
  teams: string[];
};

export type Venue = {
  id: string;
  stadium: string;
  officialName: string;
  city: string;
  country: string;
  capacity: number;
};

export type Match = {
  id: string;
  group: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  home: string;
  away: string;
  homeName: string;
  awayName: string;
};

export type QuestionType = "team" | "boolean" | "text";

export type Question = {
  id: string;
  category: string;
  text: string;
  points: number;
  type: QuestionType;
};

export type BracketTie = {
  id: string;
  slots?: string[];
  from?: string[];
  date: string;
  city: string;
};

export type Bracket = {
  r32: BracketTie[];
  r16: BracketTie[];
  qf: BracketTie[];
  sf: BracketTie[];
  third: BracketTie;
  final: BracketTie;
};

/** Predicción de un marcador (puede estar incompleta mientras el usuario rellena). */
export type ScorePrediction = {
  home: number | null;
  away: number | null;
};

/** Conjunto completo de predicciones de un participante, tal y como se guarda. */
export type Predictions = {
  /** Marcador previsto de cada partido de grupos. Clave = id de partido. */
  groupMatches: Record<string, ScorePrediction>;
  /** Orden previsto de cada grupo. Clave = id de grupo, valor = ids de equipo 1º→4º. */
  groupOrder: Record<string, string[]>;
  /** Equipo asignado a cada hueco del cuadro final. Clave = id de hueco/cruce. */
  bracket: Record<string, string>;
  /** Marcador previsto de los cruces de eliminatorias. Clave = id de cruce. */
  bracketScores: Record<string, ScorePrediction>;
  /** Respuesta a cada pregunta. Clave = id de pregunta. */
  questions: Record<string, string>;
};

/** Resultado real de un partido o cruce, introducido por el administrador. */
export type RealResult = ScorePrediction;
