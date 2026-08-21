export type RecommendationTrack = "math" | "reading";

export interface CompetencyEvidence {
  correct: number;
  answered: number;
  total: number;
}

export interface CourseRecommendation {
  kind: "recommended" | "tie" | "insufficient";
  track: RecommendationTrack | null;
  logicalRate: number | null;
  readingRate: number | null;
}

export const MIN_ANSWERS_FOR_RECOMMENDATION = 10;
export const MIN_RATE_DIFFERENCE = 0.05;

export function getCourseRecommendation(
  logical: CompetencyEvidence,
  reading: CompetencyEvidence,
): CourseRecommendation {
  const enoughEvidence = logical.answered >= MIN_ANSWERS_FOR_RECOMMENDATION
    && reading.answered >= MIN_ANSWERS_FOR_RECOMMENDATION;
  const logicalRate = logical.answered > 0 ? logical.correct / logical.answered : null;
  const readingRate = reading.answered > 0 ? reading.correct / reading.answered : null;

  if (!enoughEvidence || logicalRate === null || readingRate === null) {
    return { kind: "insufficient", track: null, logicalRate, readingRate };
  }

  if (Math.abs(logicalRate - readingRate) < MIN_RATE_DIFFERENCE) {
    return { kind: "tie", track: null, logicalRate, readingRate };
  }

  return {
    kind: "recommended",
    track: logicalRate < readingRate ? "math" : "reading",
    logicalRate,
    readingRate,
  };
}
