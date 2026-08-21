import assert from "node:assert/strict";
import test from "node:test";
import { createBalancedOptionOrders, displayedOptionIndex, isValidOptionOrder } from "../lib/option-orders.ts";
import { getCourseRecommendation } from "../lib/recommendation.ts";
import {
  COURSE_PROGRESS_KEY,
  COURSE_PROGRESS_VERSION,
  LEGACY_COURSE_PROGRESS_KEY,
  createCourseOptionOrders,
  loadCourseProgress,
  saveCourseProgress,
} from "../lib/course-progress.ts";
import { courseLessons } from "../data/course-content.ts";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

test("1.000 generaciones mantienen 20 claves por posición en un examen de 80 preguntas", () => {
  const items = Array.from({ length: 80 }, (_, index) => ({
    id: `q-${index}`,
    optionCount: 4,
    correctOption: index % 4,
  }));

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const orders = createBalancedOptionOrders(items, seededRandom(attempt + 1));
    const distribution = [0, 0, 0, 0];
    items.forEach((item) => {
      const order = orders[item.id];
      assert.equal(isValidOptionOrder(order, 4), true);
      distribution[displayedOptionIndex(order, item.correctOption)] += 1;
    });
    assert.deepEqual(distribution, [20, 20, 20, 20]);
  }
});

test("la recomendación no inventa un área débil sin evidencia suficiente", () => {
  assert.deepEqual(
    getCourseRecommendation(
      { correct: 0, answered: 0, total: 40 },
      { correct: 0, answered: 0, total: 40 },
    ).kind,
    "insufficient",
  );
});

test("la recomendación informa empate cuando las tasas son equivalentes", () => {
  const result = getCourseRecommendation(
    { correct: 8, answered: 16, total: 40 },
    { correct: 10, answered: 20, total: 40 },
  );
  assert.equal(result.kind, "tie");
  assert.equal(result.track, null);
});

test("la recomendación selecciona únicamente la competencia con menor tasa válida", () => {
  assert.equal(getCourseRecommendation(
    { correct: 8, answered: 20, total: 40 },
    { correct: 15, answered: 20, total: 40 },
  ).track, "math");
  assert.equal(getCourseRecommendation(
    { correct: 18, answered: 20, total: 40 },
    { correct: 10, answered: 20, total: 40 },
  ).track, "reading");
});

test("el progreso del curso siempre se guarda y recupera con el esquema versionado completo", () => {
  const storage = new MemoryStorage() as unknown as Storage;
  const progress = {
    version: COURSE_PROGRESS_VERSION,
    track: "math" as const,
    activeLessonId: "math-arithmetic",
    completed: [],
    answers: { "math-arithmetic-0": 1 },
    optionOrders: createCourseOptionOrders(),
  };
  assert.equal(saveCourseProgress(storage, progress), true);
  assert.deepEqual(loadCourseProgress(storage), progress);
});

test("los 34 retos reparten sus claves de forma equilibrada entre A, B y C", () => {
  const orders = createCourseOptionOrders();
  const distribution = [0, 0, 0];
  courseLessons.forEach((lesson) => lesson.exercises.forEach((exercise, index) => {
    const order = orders[`${lesson.id}-${index}`];
    assert.equal(isValidOptionOrder(order, 3), true);
    distribution[displayedOptionIndex(order, exercise.correctOption)] += 1;
  }));
  assert.equal(Object.keys(orders).length, 34);
  assert.ok(Math.max(...distribution) - Math.min(...distribution) <= 1);
});

test("un progreso corrupto se limpia sin romper la aplicación", () => {
  const storage = new MemoryStorage() as unknown as Storage;
  storage.setItem(COURSE_PROGRESS_KEY, "{valor-invalido");
  assert.equal(loadCourseProgress(storage), null);
  assert.equal(storage.getItem(COURSE_PROGRESS_KEY), null);
});

test("el progreso v2 válido migra a v3 sin perder la ruta", () => {
  const storage = new MemoryStorage() as unknown as Storage;
  storage.setItem(LEGACY_COURSE_PROGRESS_KEY, JSON.stringify({
    version: 2,
    track: "reading",
    activeLessonId: "reading-inference",
    completed: [],
    answers: {},
  }));
  const migrated = loadCourseProgress(storage);
  assert.equal(migrated?.version, COURSE_PROGRESS_VERSION);
  assert.equal(migrated?.track, "reading");
  assert.equal(migrated?.activeLessonId, "reading-inference");
});
