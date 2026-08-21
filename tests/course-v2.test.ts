import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import type { CourseModuleV2 } from "../types/course-v2.ts";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const moduleLoader = await createServer({
  root: projectRoot,
  configFile: false,
  appType: "custom",
  server: { middlewareMode: true },
});
const { courseModulesV2 } = await moduleLoader.ssrLoadModule("/data/course-v2/index.ts") as {
  courseModulesV2: CourseModuleV2[];
};
const { COURSE_PROGRESS_KEY } = await moduleLoader.ssrLoadModule("/lib/course-progress.ts") as {
  COURSE_PROGRESS_KEY: string;
};
const { COURSE_V2_PROGRESS_KEY, createCourseV2OptionOrders, createInitialCourseV2Progress, hasStoredCourseV2Progress, loadCourseV2EntryProgress } = await moduleLoader.ssrLoadModule("/lib/course-v2-progress.ts") as {
  COURSE_V2_PROGRESS_KEY: string;
  createCourseV2OptionOrders: () => Record<string, number[]>;
  createInitialCourseV2Progress: (track: "math" | "reading") => import("../lib/course-v2-progress.ts").CourseV2Progress;
  hasStoredCourseV2Progress: (storage: Storage) => boolean;
  loadCourseV2EntryProgress: (storage: Storage, track: "math" | "reading", mode: "start" | "resume") => import("../lib/course-v2-progress.ts").CourseV2Progress;
};
await moduleLoader.close();

test("el catálogo v2 integra 17 módulos y 85 ejercicios", () => {
  assert.equal(courseModulesV2.length, 17);
  assert.equal(courseModulesV2.filter((module) => module.track === "math").length, 8);
  assert.equal(courseModulesV2.filter((module) => module.track === "reading").length, 9);
  assert.equal(courseModulesV2.reduce((total, module) => total + module.exercises.length, 0), 85);
});

test("cada módulo v2 conserva el contrato pedagógico acordado", () => {
  courseModulesV2.forEach((module) => {
    assert.equal(module.sections.length, 2, `${module.id}: debe tener 2 secciones`);
    assert.equal(module.examples.length, 2, `${module.id}: debe tener 2 ejemplos`);
    assert.equal(module.exercises.length, 5, `${module.id}: debe tener 5 ejercicios`);
    assert.deepEqual(
      module.exercises.map((exercise) => exercise.kind),
      ["guided", "guided", "independent", "independent", "checkpoint"],
      `${module.id}: la práctica debe avanzar de guía a autonomía`,
    );
    assert.ok(
      module.sections.flatMap((section) => section.paragraphs).join(" ").split(/\s+/u).length >= 120,
      `${module.id}: la explicación central debe tener profundidad suficiente`,
    );
    module.examples.forEach((example) => assert.ok(example.steps.length >= 3, `${module.id}: cada ejemplo debe explicar al menos 3 pasos`));

    module.exercises.forEach((exercise) => {
      assert.equal(exercise.options.length, 4, `${exercise.id}: debe tener 4 opciones`);
      assert.ok(Number.isInteger(exercise.correctOption), `${exercise.id}: la respuesta debe ser un índice entero`);
      assert.ok(
        exercise.correctOption >= 0 && exercise.correctOption < exercise.options.length,
        `${exercise.id}: la respuesta debe apuntar a una opción existente`,
      );
    });
  });
});

test("los textos de lectura sostienen una práctica de varios párrafos", () => {
  courseModulesV2.filter((module) => module.track === "reading").forEach((module) => {
    const context = module.exercises[0].context;
    assert.ok(context && context.length >= 2, `${module.id}: falta un texto base de varios párrafos`);
    assert.ok(context.join(" ").split(/\s+/u).length >= 90, `${module.id}: el texto base es demasiado breve`);
    assert.ok(module.exercises.every((exercise) => exercise.context === context), `${module.id}: los cinco ejercicios deben compartir el estímulo`);
  });
});

test("el curso v2 incluye representaciones gráficas y equilibra las respuestas mostradas", () => {
  const visualCount = courseModulesV2.flatMap((module) => module.exercises).filter((exercise) => exercise.visual).length;
  assert.ok(visualCount >= 10, "el catálogo necesita al menos diez actividades con apoyo gráfico");

  const orders = createCourseV2OptionOrders();
  const displayedCorrectCounts = [0, 0, 0, 0];
  courseModulesV2.forEach((module) => module.exercises.forEach((exercise) => {
    const displayedIndex = orders[exercise.id].indexOf(exercise.correctOption);
    displayedCorrectCounts[displayedIndex] += 1;
  }));
  assert.ok(Math.max(...displayedCorrectCounts) - Math.min(...displayedCorrectCounts) <= 1);
});

test("los identificadores de módulos y ejercicios v2 son únicos", () => {
  const moduleIds = courseModulesV2.map((module) => module.id);
  const exerciseIds = courseModulesV2.flatMap((module) => module.exercises.map((exercise) => exercise.id));

  assert.equal(new Set(moduleIds).size, moduleIds.length, "hay IDs de módulo repetidos");
  assert.equal(new Set(exerciseIds).size, exerciseIds.length, "hay IDs de ejercicio repetidos");
  assert.equal(
    new Set([...moduleIds, ...exerciseIds]).size,
    moduleIds.length + exerciseIds.length,
    "un módulo y un ejercicio comparten el mismo ID",
  );
});

test("cada módulo v2 declara un checkpoint válido", () => {
  courseModulesV2.forEach((module) => {
    const checkpoints = module.exercises.filter((exercise) => exercise.kind === "checkpoint");
    const declaredCheckpoint = module.exercises.find((exercise) => exercise.id === module.mastery.checkpointId);

    assert.equal(checkpoints.length, 1, `${module.id}: debe existir exactamente un checkpoint`);
    assert.ok(declaredCheckpoint, `${module.id}: mastery.checkpointId no referencia un ejercicio del módulo`);
    assert.equal(declaredCheckpoint.kind, "checkpoint", `${module.id}: el ejercicio declarado no es checkpoint`);
    assert.ok(Number.isInteger(module.mastery.minCorrect), `${module.id}: minCorrect debe ser entero`);
    assert.ok(
      module.mastery.minCorrect > 0 && module.mastery.minCorrect <= module.exercises.length,
      `${module.id}: minCorrect debe estar entre 1 y ${module.exercises.length}`,
    );
  });
});

test("v1 y v2 guardan su progreso en claves distintas", () => {
  assert.notEqual(COURSE_V2_PROGRESS_KEY, COURSE_PROGRESS_KEY);
});

test("mode=start respeta la competencia elegida sin borrar el progreso existente", () => {
  const saved = createInitialCourseV2Progress("math");
  saved.answers[courseModulesV2[0].exercises[0].id] = courseModulesV2[0].exercises[0].correctOption;
  const values = new Map([[COURSE_V2_PROGRESS_KEY, JSON.stringify(saved)]]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  } as Storage;

  const started = loadCourseV2EntryProgress(storage, "reading", "start");
  assert.equal(started.track, "reading");
  assert.equal(started.activeModuleId, courseModulesV2.find((module) => module.track === "reading")?.id);
  assert.equal(started.activeStage, "overview");
  assert.equal(started.answers[courseModulesV2[0].exercises[0].id], courseModulesV2[0].exercises[0].correctOption);

  const resumed = loadCourseV2EntryProgress(storage, "reading", "resume");
  assert.equal(resumed.track, "math");
  assert.equal(resumed.activeModuleId, saved.activeModuleId);
  assert.equal(hasStoredCourseV2Progress(storage), true);

  values.set(COURSE_V2_PROGRESS_KEY, "{contenido inválido");
  assert.equal(hasStoredCourseV2Progress(storage), false);
});
