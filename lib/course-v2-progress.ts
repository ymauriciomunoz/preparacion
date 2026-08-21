import { courseModulesV2 } from "../data/course-v2/index.ts";
import type { CourseStageId } from "../types/course-v2.ts";
import type { CourseTrack } from "../types/course.ts";
import { createBalancedOptionOrders, isValidOptionOrder, type OptionOrders } from "./option-orders.ts";

export const COURSE_V2_PROGRESS_KEY = "entrena-udea-course-v2-progress-v1";
export const COURSE_V2_SCHEMA_VERSION = 1;
export const COURSE_V2_CATALOG_VERSION = "2.0.0";
export type CourseV2EntryMode = "start" | "resume";

export interface CourseV2Progress {
  courseEdition: 2;
  schemaVersion: typeof COURSE_V2_SCHEMA_VERSION;
  catalogVersion: string;
  track: CourseTrack;
  activeModuleId: string;
  activeStage: CourseStageId;
  answers: Record<string, number>;
  firstAnswers: Record<string, number>;
  attempts: Record<string, number>;
  completedModules: string[];
  optionOrders: OptionOrders;
  lastActivityAt: number;
}

const validStages = new Set<CourseStageId>(["overview", "learn", "examples", "practice", "recap"]);

function exercises() {
  return courseModulesV2.flatMap((module) => module.exercises.map((exercise) => ({
    id: exercise.id,
    optionCount: exercise.options.length,
    correctOption: exercise.correctOption,
  })));
}

export function createCourseV2OptionOrders(): OptionOrders {
  return createBalancedOptionOrders(exercises());
}

export function createInitialCourseV2Progress(track: CourseTrack = "math"): CourseV2Progress {
  const firstModule = courseModulesV2.find((module) => module.track === track) ?? courseModulesV2[0];
  if (!firstModule) throw new Error("Curso v2 no tiene módulos configurados");
  return {
    courseEdition: 2,
    schemaVersion: COURSE_V2_SCHEMA_VERSION,
    catalogVersion: COURSE_V2_CATALOG_VERSION,
    track: firstModule.track,
    activeModuleId: firstModule.id,
    activeStage: "overview",
    answers: {},
    firstAnswers: {},
    attempts: {},
    completedModules: [],
    optionOrders: createCourseV2OptionOrders(),
    lastActivityAt: Date.now(),
  };
}

function sanitizeAnswerRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const exerciseMap = new Map(exercises().map((exercise) => [exercise.id, exercise]));
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([id, answer]) => {
    const exercise = exerciseMap.get(id);
    return Boolean(exercise)
      && typeof answer === "number"
      && Number.isInteger(answer)
      && answer >= 0
      && answer < (exercise?.optionCount ?? 0);
  })) as Record<string, number>;
}

function sanitizeAttempts(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const validIds = new Set(exercises().map((exercise) => exercise.id));
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([id, attempt]) =>
    validIds.has(id) && typeof attempt === "number" && Number.isInteger(attempt) && attempt >= 0,
  )) as Record<string, number>;
}

function mergeOptionOrders(value: unknown): OptionOrders {
  const generated = createCourseV2OptionOrders();
  if (!value || typeof value !== "object" || Array.isArray(value)) return generated;
  const stored = value as OptionOrders;
  exercises().forEach((exercise) => {
    if (isValidOptionOrder(stored[exercise.id], exercise.optionCount)) {
      generated[exercise.id] = stored[exercise.id];
    }
  });
  return generated;
}

export function loadCourseV2Progress(storage: Storage, requestedTrack: CourseTrack = "math"): CourseV2Progress {
  const fallback = createInitialCourseV2Progress(requestedTrack);
  try {
    const raw = storage.getItem(COURSE_V2_PROGRESS_KEY);
    if (!raw) return fallback;
    const stored = JSON.parse(raw) as Record<string, unknown>;
    if (stored.courseEdition !== 2 || stored.schemaVersion !== COURSE_V2_SCHEMA_VERSION) return fallback;

    const moduleIds = new Set(courseModulesV2.map((module) => module.id));
    const activeModule = typeof stored.activeModuleId === "string"
      ? courseModulesV2.find((module) => module.id === stored.activeModuleId)
      : undefined;
    const track: CourseTrack = activeModule?.track ?? requestedTrack;
    const activeModuleId = activeModule?.id
      ?? courseModulesV2.find((module) => module.track === track)?.id
      ?? fallback.activeModuleId;

    return {
      ...fallback,
      catalogVersion: COURSE_V2_CATALOG_VERSION,
      track,
      activeModuleId,
      activeStage: typeof stored.activeStage === "string" && validStages.has(stored.activeStage as CourseStageId)
        ? stored.activeStage as CourseStageId
        : "overview",
      answers: sanitizeAnswerRecord(stored.answers),
      firstAnswers: sanitizeAnswerRecord(stored.firstAnswers),
      attempts: sanitizeAttempts(stored.attempts),
      completedModules: Array.isArray(stored.completedModules)
        ? [...new Set(stored.completedModules.filter((id): id is string => typeof id === "string" && moduleIds.has(id)))]
        : [],
      optionOrders: mergeOptionOrders(stored.optionOrders),
      lastActivityAt: typeof stored.lastActivityAt === "number" ? stored.lastActivityAt : Date.now(),
    };
  } catch {
    return fallback;
  }
}

export function loadCourseV2EntryProgress(
  storage: Storage,
  requestedTrack: CourseTrack,
  mode: CourseV2EntryMode,
): CourseV2Progress {
  const restored = loadCourseV2Progress(storage, requestedTrack);
  if (mode === "resume") return restored;

  const firstModule = courseModulesV2.find((module) => module.track === requestedTrack);
  return firstModule
    ? { ...restored, track: requestedTrack, activeModuleId: firstModule.id, activeStage: "overview" }
    : restored;
}

export function hasStoredCourseV2Progress(storage: Storage): boolean {
  try {
    const raw = storage.getItem(COURSE_V2_PROGRESS_KEY);
    if (!raw) return false;
    const stored = JSON.parse(raw) as Record<string, unknown>;
    return stored.courseEdition === 2 && stored.schemaVersion === COURSE_V2_SCHEMA_VERSION;
  } catch {
    return false;
  }
}

export function saveCourseV2Progress(storage: Storage, progress: CourseV2Progress) {
  try {
    storage.setItem(COURSE_V2_PROGRESS_KEY, JSON.stringify({ ...progress, lastActivityAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}
