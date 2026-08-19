export type ExamMode = "flexible" | "strict";
export type Competency = "Razonamiento lógico" | "Comprensión lectora";
export type Difficulty = "Básica" | "Media" | "Alta";

export type QuestionVisual =
  | { type: "bars"; title: string; labels: string[]; values: number[]; unit?: string }
  | { type: "table"; title?: string; headers: string[]; rows: string[][] }
  | { type: "sequence"; items: string[]; missingAt: number }
  | { type: "rectangle"; width: string; height: string }
  | { type: "triangle"; base: string; height: string; hypotenuse?: string }
  | { type: "venn"; left: string; right: string; intersection: string }
  | { type: "balance"; left: string[]; right: string[] }
  | { type: "coordinate"; points: Array<{ label: string; x: number; y: number }> };

export interface ReadingStimulus {
  id: string;
  kicker: string;
  title: string;
  body: string[];
  source: string;
  visual?: QuestionVisual;
}

export interface Question {
  id: string;
  competency: Competency;
  category: string;
  skill: string;
  difficulty: Difficulty;
  stem: string;
  options: [string, string, string, string];
  correctOption: number;
  explanation: string;
  stimulusId?: string;
  visual?: QuestionVisual;
}

export interface PersistedExam {
  version: number;
  mode: ExamMode;
  startedAt: number;
  currentIndex: number;
  answers: Record<string, number>;
  marked: string[];
}
