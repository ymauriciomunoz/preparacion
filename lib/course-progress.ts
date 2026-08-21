import { courseLessons } from "../data/course-content.ts";
import type { CourseTrack } from "../types/course.ts";
import { createBalancedOptionOrders, isValidOptionOrder, type OptionOrders } from "./option-orders.ts";

export const COURSE_PROGRESS_KEY = "entrena-udea-course-progress-v3";
export const LEGACY_COURSE_PROGRESS_KEY = "entrena-udea-course-progress-v2";
export const COURSE_PROGRESS_VERSION = 3;

export interface CourseProgress {
  version: typeof COURSE_PROGRESS_VERSION;
  track: CourseTrack;
  activeLessonId: string;
  completed: string[];
  answers: Record<string, number>;
  optionOrders: OptionOrders;
}

const validLessonIds = new Set(courseLessons.map((lesson) => lesson.id));
const exercises = courseLessons.flatMap((lesson) => lesson.exercises.map((exercise, index) => ({
  id: `${lesson.id}-${index}`,
  lessonId: lesson.id,
  optionCount: exercise.options.length,
  correctOption: exercise.correctOption,
})));
const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

export function createCourseOptionOrders(): OptionOrders {
  return createBalancedOptionOrders(exercises);
}

function validSharedProgress(stored: Record<string, unknown>) {
  return (stored.track === "math" || stored.track === "reading")
    && typeof stored.activeLessonId === "string"
    && validLessonIds.has(stored.activeLessonId)
    && courseLessons.some((lesson) => lesson.id === stored.activeLessonId && lesson.track === stored.track)
    && Array.isArray(stored.completed)
    && new Set(stored.completed).size === stored.completed.length
    && stored.completed.every((id) => typeof id === "string" && validLessonIds.has(id))
    && Boolean(stored.answers)
    && typeof stored.answers === "object"
    && !Array.isArray(stored.answers)
    && Object.entries(stored.answers as Record<string, unknown>).every(([id, option]) => {
      const exercise = exerciseById.get(id);
      return Boolean(exercise)
        && typeof option === "number"
        && Number.isInteger(option)
        && option >= 0
        && option < (exercise?.optionCount ?? 0);
    });
}

export function isValidCourseProgress(value: unknown): value is CourseProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const stored = value as Record<string, unknown>;
  if (stored.version !== COURSE_PROGRESS_VERSION || !validSharedProgress(stored)) return false;
  if (!stored.optionOrders || typeof stored.optionOrders !== "object" || Array.isArray(stored.optionOrders)) return false;

  const orders = stored.optionOrders as OptionOrders;
  return exercises.every((exercise) => isValidOptionOrder(orders[exercise.id], exercise.optionCount));
}

function migrateLegacyProgress(value: unknown): CourseProgress | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const stored = value as Record<string, unknown>;
  if (stored.version !== 2 || !validSharedProgress(stored)) return null;
  return {
    version: COURSE_PROGRESS_VERSION,
    track: stored.track as CourseTrack,
    activeLessonId: stored.activeLessonId as string,
    completed: [...(stored.completed as string[])],
    answers: { ...(stored.answers as Record<string, number>) },
    optionOrders: createCourseOptionOrders(),
  };
}

export function loadCourseProgress(storage: Storage): CourseProgress | null {
  try {
    const currentRaw = storage.getItem(COURSE_PROGRESS_KEY);
    if (currentRaw) {
      const current = JSON.parse(currentRaw) as unknown;
      if (isValidCourseProgress(current)) return current;
      storage.removeItem(COURSE_PROGRESS_KEY);
    }

    const legacyRaw = storage.getItem(LEGACY_COURSE_PROGRESS_KEY);
    if (!legacyRaw) return null;
    const migrated = migrateLegacyProgress(JSON.parse(legacyRaw) as unknown);
    storage.removeItem(LEGACY_COURSE_PROGRESS_KEY);
    if (migrated) saveCourseProgress(storage, migrated);
    return migrated;
  } catch {
    try {
      storage.removeItem(COURSE_PROGRESS_KEY);
      storage.removeItem(LEGACY_COURSE_PROGRESS_KEY);
    } catch {
      // El almacenamiento puede estar bloqueado; la experiencia sigue en memoria.
    }
    return null;
  }
}

export function saveCourseProgress(storage: Storage, progress: CourseProgress): boolean {
  try {
    storage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
