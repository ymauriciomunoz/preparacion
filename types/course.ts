export type CourseTrack = "math" | "reading";

export type CourseVisual =
  | "fractions"
  | "equation"
  | "geometry"
  | "data"
  | "probability"
  | "venn"
  | "sequence"
  | "logic"
  | "literal"
  | "inference"
  | "main-idea"
  | "paragraphs"
  | "context"
  | "argument"
  | "comparison"
  | "multimodal"
  | "analogy";

export interface CourseExercise {
  prompt: string;
  options: [string, string, string];
  correctOption: number;
  explanation: string;
}

export interface CourseLesson {
  id: string;
  track: CourseTrack;
  title: string;
  shortTitle: string;
  summary: string;
  minutes: number;
  visual: CourseVisual;
  objectives: string[];
  concepts: string[];
  explanation: string[];
  example: {
    title: string;
    prompt: string;
    steps: string[];
    answer: string;
  };
  commonMistake: string;
  exercises: [CourseExercise, CourseExercise];
}
