import type { CourseTrack, CourseVisual } from "./course";
import type { QuestionVisual } from "./exam";

export type CourseStageId = "overview" | "learn" | "examples" | "practice" | "recap";
export type ExerciseKind = "guided" | "independent" | "checkpoint";
export type ExerciseDifficulty = "fundamento" | "aplicación" | "tipo UdeA";

export interface LessonSectionV2 {
  title: string;
  paragraphs: string[];
  keyPoints: string[];
}

export interface WorkedExampleV2 {
  title: string;
  prompt: string;
  steps: string[];
  answer: string;
  reflection: string;
}

export interface CourseExerciseV2 {
  id: string;
  kind: ExerciseKind;
  difficulty: ExerciseDifficulty;
  prompt: string;
  context?: string[];
  visual?: QuestionVisual;
  options: [string, string, string, string];
  correctOption: number;
  hint?: string;
  solutionSteps: string[];
  explanation: string;
  errorTag: string;
}

export interface CourseModuleV2 {
  id: string;
  track: CourseTrack;
  order: number;
  title: string;
  shortTitle: string;
  summary: string;
  estimatedMinutes: number;
  visual: CourseVisual;
  prerequisites: string[];
  outcomes: string[];
  warmup: {
    question: string;
    guidance: string;
  };
  sections: [LessonSectionV2, LessonSectionV2];
  strategy: {
    title: string;
    steps: string[];
  };
  examples: [WorkedExampleV2, WorkedExampleV2];
  commonMistakes: Array<{ mistake: string; correction: string }>;
  exercises: [CourseExerciseV2, CourseExerciseV2, CourseExerciseV2, CourseExerciseV2, CourseExerciseV2];
  recap: string[];
  mastery: {
    minCorrect: number;
    checkpointId: string;
  };
}

export interface CourseTrackV2 {
  label: string;
  description: string;
}
