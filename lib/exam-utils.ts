import type { Competency, Question } from "@/types/exam";

export const EXAM_DURATION_SECONDS = 180 * 60;

export function formatClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function getScore(questions: Question[], answers: Record<string, number>) {
  const correct = questions.filter((question) => answers[question.id] === question.correctOption).length;
  const byCompetency = questions.reduce<Record<Competency, { correct: number; total: number }>>(
    (result, question) => {
      result[question.competency].total += 1;
      if (answers[question.id] === question.correctOption) {
        result[question.competency].correct += 1;
      }
      return result;
    },
    {
      "Razonamiento lógico": { correct: 0, total: 0 },
      "Comprensión lectora": { correct: 0, total: 0 },
    },
  );

  return {
    correct,
    total: questions.length,
    answered: Object.keys(answers).length,
    percentage: Math.round((correct / questions.length) * 100),
    byCompetency,
  };
}
