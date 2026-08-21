"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { courseModulesV2, courseTracksV2 } from "@/data/course-v2";
import {
  createInitialCourseV2Progress,
  loadCourseV2EntryProgress,
  saveCourseV2Progress,
  type CourseV2Progress,
} from "@/lib/course-v2-progress";
import type { CourseExerciseV2, CourseModuleV2, CourseStageId } from "@/types/course-v2";
import type { CourseTrack } from "@/types/course";
import { QuestionVisual } from "@/components/QuestionVisual";

const stages: Array<{ id: CourseStageId; label: string }> = [
  { id: "overview", label: "Tu punto de partida" },
  { id: "learn", label: "Aprende" },
  { id: "examples", label: "Mira cómo se hace" },
  { id: "practice", label: "Practica" },
  { id: "recap", label: "Cierre" },
];

function scrollToCourseTop() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
}

export function CourseV2Experience({ initialTrack = "math", entryMode = "resume" }: { initialTrack?: CourseTrack; entryMode?: "start" | "resume" }) {
  const [progress, setProgress] = useState<CourseV2Progress>(() => createInitialCourseV2Progress(initialTrack));
  const [loaded, setLoaded] = useState(false);
  const contentTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const entryProgress = loadCourseV2EntryProgress(window.localStorage, initialTrack, entryMode);
    const frame = window.requestAnimationFrame(() => {
      setProgress(entryProgress);
      setLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [entryMode, initialTrack]);

  useEffect(() => {
    if (!loaded) return;
    saveCourseV2Progress(window.localStorage, progress);
  }, [loaded, progress]);

  const trackModules = useMemo(
    () => courseModulesV2.filter((module) => module.track === progress.track).sort((a, b) => a.order - b.order),
    [progress.track],
  );
  const activeModule = courseModulesV2.find((module) => module.id === progress.activeModuleId) ?? trackModules[0] ?? courseModulesV2[0];
  if (!activeModule) return <main className="course-v2-loading">Preparando Curso v2…</main>;

  const stageIndex = stages.findIndex((stage) => stage.id === progress.activeStage);
  const answered = activeModule.exercises.filter((exercise) => progress.answers[exercise.id] !== undefined);
  const correct = activeModule.exercises.filter((exercise) => progress.answers[exercise.id] === exercise.correctOption).length;
  const checkpointPassed = progress.answers[activeModule.mastery.checkpointId]
    === activeModule.exercises.find((exercise) => exercise.id === activeModule.mastery.checkpointId)?.correctOption;
  const masteryReached = correct >= activeModule.mastery.minCorrect && checkpointPassed;

  const moveToStage = (stage: CourseStageId) => {
    setProgress((current) => ({ ...current, activeStage: stage }));
    scrollToCourseTop();
    window.requestAnimationFrame(() => contentTitleRef.current?.focus());
  };

  const chooseTrack = (track: CourseTrack) => {
    const firstModule = courseModulesV2.find((module) => module.track === track);
    if (!firstModule) return;
    setProgress((current) => ({ ...current, track, activeModuleId: firstModule.id, activeStage: "overview" }));
    scrollToCourseTop();
  };

  const chooseModule = (module: CourseModuleV2) => {
    setProgress((current) => ({ ...current, track: module.track, activeModuleId: module.id, activeStage: "overview" }));
    scrollToCourseTop();
  };

  const answerExercise = (exercise: CourseExerciseV2, option: number) => {
    setProgress((current) => ({
      ...current,
      answers: { ...current.answers, [exercise.id]: option },
      firstAnswers: current.firstAnswers[exercise.id] === undefined
        ? { ...current.firstAnswers, [exercise.id]: option }
        : current.firstAnswers,
      attempts: { ...current.attempts, [exercise.id]: (current.attempts[exercise.id] ?? 0) + 1 },
    }));
  };

  const resetModuleAttempt = () => {
    const ids = new Set(activeModule.exercises.map((exercise) => exercise.id));
    setProgress((current) => ({
      ...current,
      answers: Object.fromEntries(Object.entries(current.answers).filter(([id]) => !ids.has(id))),
      activeStage: "learn",
    }));
    scrollToCourseTop();
  };

  const completeModule = () => {
    if (!masteryReached) return;
    setProgress((current) => ({
      ...current,
      completedModules: current.completedModules.includes(activeModule.id)
        ? current.completedModules
        : [...current.completedModules, activeModule.id],
    }));
  };

  const activeModuleIndex = trackModules.findIndex((module) => module.id === activeModule.id);
  const nextModule = trackModules[activeModuleIndex + 1];
  const openNextModule = () => {
    if (nextModule) chooseModule(nextModule);
  };

  const nextStage = stages[stageIndex + 1];
  const previousStage = stages[stageIndex - 1];

  return (
    <main className="course-v2-shell">
      <header className="course-v2-header">
        <Link className="course-brand" href="/" aria-label="Volver al inicio de Entrena UdeA">
          <span className="brand-mark">U</span><span>Entrena UdeA<small>Curso v2 · Ruta profunda</small></span>
        </Link>
        <div className="edition-switch"><span>Versión actual: 2</span><Link href="/curso?mode=resume">Abrir versión 1</Link></div>
      </header>

      <section className="course-v2-hero">
        <div><span className="eyebrow">Aprendizaje para empezar desde cero</span><h1>Entiende, practica y luego comprueba.</h1><p>Avanza con la secuencia “yo explico → resolvemos juntos → tú lo intentas”. Tu progreso de v1 permanece intacto.</p></div>
        <div className="v2-overall-progress"><span>Progreso Curso v2</span><strong>{progress.completedModules.length}/{courseModulesV2.length} módulos</strong><div><i style={{ width: `${(progress.completedModules.length / courseModulesV2.length) * 100}%` }} /></div></div>
      </section>

      <div className="course-v2-track-switch" aria-label="Competencias">
        {(Object.keys(courseTracksV2) as CourseTrack[]).map((track) => {
          const available = courseModulesV2.some((module) => module.track === track);
          return <button key={track} type="button" disabled={!available} className={progress.track === track ? "active" : ""} onClick={() => chooseTrack(track)}><span>{track === "math" ? "∑" : "Aa"}</span><div><strong>{courseTracksV2[track].label}</strong><small>{available ? courseTracksV2[track].description : "Contenido en preparación"}</small></div></button>;
        })}
      </div>

      <div className="course-v2-layout">
        <aside className="v2-module-list" aria-label="Módulos de la competencia">
          <span className="step-label">Tu recorrido</span>
          {trackModules.map((module) => (
            <button key={module.id} type="button" onClick={() => chooseModule(module)} aria-current={module.id === activeModule.id ? "step" : undefined} className={`${module.id === activeModule.id ? "active" : ""} ${progress.completedModules.includes(module.id) ? "completed" : ""}`}>
              <span>{progress.completedModules.includes(module.id) ? "✓" : module.order}</span><div><strong>{module.shortTitle}</strong><small>{module.estimatedMinutes} min · {module.exercises.length} actividades</small></div>
            </button>
          ))}
        </aside>

        <article className="course-v2-content">
          <div className="v2-module-heading">
            <div><span className="content-kicker">Módulo {activeModule.order} · {courseTracksV2[activeModule.track].label}</span><h2>{activeModule.title}</h2><p>{activeModule.summary}</p></div>
            <div className="v2-module-score"><span>Práctica</span><strong>{correct}/{activeModule.exercises.length}</strong><small>{answered.length} respondidas</small></div>
          </div>

          <nav className="v2-stage-nav" aria-label="Etapas del módulo">
            {stages.map((stage, index) => <button key={stage.id} type="button" aria-current={progress.activeStage === stage.id ? "step" : undefined} className={progress.activeStage === stage.id ? "active" : ""} onClick={() => moveToStage(stage.id)}><span>{index + 1}</span>{stage.label}</button>)}
          </nav>

          <section className="v2-stage" aria-labelledby="v2-stage-title">
            <h2 id="v2-stage-title" tabIndex={-1} ref={contentTitleRef}>{stages[stageIndex]?.label}</h2>
            {progress.activeStage === "overview" && <OverviewStage module={activeModule} />}
            {progress.activeStage === "learn" && <LearnStage module={activeModule} />}
            {progress.activeStage === "examples" && <ExamplesStage module={activeModule} />}
            {progress.activeStage === "practice" && <PracticeStage module={activeModule} progress={progress} onAnswer={answerExercise} />}
            {progress.activeStage === "recap" && <RecapStage module={activeModule} answered={answered.length} correct={correct} masteryReached={masteryReached} onComplete={completeModule} onRetry={resetModuleAttempt} completed={progress.completedModules.includes(activeModule.id)} nextModuleTitle={nextModule?.title} onNextModule={openNextModule} />}
          </section>

          <footer className="v2-stage-actions">
            <button className="secondary-button" type="button" disabled={!previousStage} onClick={() => previousStage && moveToStage(previousStage.id)}>← Etapa anterior</button>
            {nextStage && <button className="primary-button" type="button" onClick={() => moveToStage(nextStage.id)}>Siguiente: {nextStage.label} →</button>}
          </footer>
        </article>
      </div>
    </main>
  );
}

function OverviewStage({ module }: { module: CourseModuleV2 }) {
  return <div className="v2-overview-grid"><section><span className="step-label">Antes de comenzar</span><h3>¿Qué necesitas?</h3><ul>{module.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></section><section><span className="step-label">Al finalizar</span><h3>Lo que podrás hacer</h3><ul>{module.outcomes.map((item) => <li key={item}>{item}</li>)}</ul></section><aside><strong>Activa lo que sabes</strong><p>{module.warmup.question}</p><details key={module.id}><summary>Ver una orientación</summary><small>{module.warmup.guidance}</small></details></aside></div>;
}

function LearnStage({ module }: { module: CourseModuleV2 }) {
  return <div className="v2-learning-sections">{module.sections.map((section, index) => <section key={section.title}><span className="v2-section-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{section.title}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<ul>{section.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul></div></section>)}<section className="v2-strategy"><span className="step-label">Estrategia reusable</span><h3>{module.strategy.title}</h3><ol>{module.strategy.steps.map((step) => <li key={step}>{step}</li>)}</ol></section><div className="v2-mistakes"><span className="step-label">Errores que vamos a evitar</span>{module.commonMistakes.map((item) => <article key={item.mistake}><strong>{item.mistake}</strong><p>{item.correction}</p></article>)}</div></div>;
}

function ExamplesStage({ module }: { module: CourseModuleV2 }) {
  return <div className="v2-examples">{module.examples.map((example, index) => <article key={example.title}><span className="step-label">Ejemplo {index + 1}</span><h3>{example.title}</h3><p className="example-prompt">{example.prompt}</p><ol>{example.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="example-answer"><span>Respuesta</span><strong>{example.answer}</strong></div><p className="v2-reflection"><strong>Por qué importa:</strong> {example.reflection}</p></article>)}</div>;
}

function PracticeStage({ module, progress, onAnswer }: { module: CourseModuleV2; progress: CourseV2Progress; onAnswer: (exercise: CourseExerciseV2, option: number) => void }) {
  const sharedContext = module.exercises[0].context
    && module.exercises.every((exercise) => exercise.context === module.exercises[0].context)
    ? module.exercises[0].context
    : undefined;
  return <div className="v2-practice"><p className="v2-stage-intro">Los dos primeros ejercicios incluyen una pista. Los dos siguientes son independientes y el último reproduce una decisión tipo prueba.</p>{sharedContext && <section className="v2-shared-stimulus" aria-label="Texto para las actividades"><span className="step-label">Texto base</span>{sharedContext.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>}{module.exercises.map((exercise, index) => {
    const selected = progress.answers[exercise.id];
    const answered = selected !== undefined;
    const locked = answered && exercise.kind !== "guided";
    const order = progress.optionOrders[exercise.id] ?? [0, 1, 2, 3];
    return <article className={`v2-exercise ${answered ? selected === exercise.correctOption ? "correct" : "incorrect" : ""}`} key={exercise.id}><header><span>Actividad {index + 1}</span><div><b>{exercise.kind === "checkpoint" ? "Checkpoint" : exercise.kind === "guided" ? "Práctica guiada" : "Práctica independiente"}</b><small>{exercise.difficulty}</small></div></header>{exercise.context && !sharedContext && <div className="v2-reading-context">{exercise.context.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}{exercise.visual && <QuestionVisual visual={exercise.visual} />}<h3>{exercise.prompt}</h3>{exercise.hint && !answered && <details><summary>Necesito una pista</summary><p>{exercise.hint}</p></details>}<div className="v2-options">{order.map((originalIndex, displayIndex) => <button type="button" key={originalIndex} disabled={locked} onClick={() => onAnswer(exercise, originalIndex)} className={`${selected === originalIndex ? "selected" : ""} ${answered && originalIndex === exercise.correctOption ? "correct-option" : ""}`}><span>{String.fromCharCode(65 + displayIndex)}</span>{exercise.options[originalIndex]}</button>)}</div>{answered && <div className="v2-feedback" role="status"><strong>{selected === exercise.correctOption ? "Respuesta correcta" : `Revisa: ${exercise.errorTag}`}</strong><p>{exercise.explanation}</p><ol>{exercise.solutionSteps.map((step) => <li key={step}>{step}</li>)}</ol>{locked && selected !== exercise.correctOption && <small>Esta actividad queda registrada. Podrás iniciar un nuevo intento desde el cierre del módulo.</small>}</div>}</article>;
  })}</div>;
}

function RecapStage({ module, answered, correct, masteryReached, onComplete, onRetry, completed, nextModuleTitle, onNextModule }: { module: CourseModuleV2; answered: number; correct: number; masteryReached: boolean; onComplete: () => void; onRetry: () => void; completed: boolean; nextModuleTitle?: string; onNextModule: () => void }) {
  return <div className="v2-recap"><section><span className="step-label">Ideas que te llevas</span><ul>{module.recap.map((item) => <li key={item}>{item}</li>)}</ul></section><aside className={masteryReached ? "passed" : "needs-review"}><span>{masteryReached ? "✓" : "↻"}</span><div><strong>{completed ? "Módulo completado" : masteryReached ? "Listo para completar" : "Conviene repasar"}</strong><p>Resultado actual: {correct}/{module.exercises.length} correctas y {answered}/{module.exercises.length} respondidas. Para completar necesitas {module.mastery.minCorrect} aciertos y superar el checkpoint.</p><div className="v2-recap-actions">{masteryReached && !completed && <button type="button" className="primary-button" onClick={onComplete}>Completar módulo</button>}{completed && nextModuleTitle && <button type="button" className="primary-button" onClick={onNextModule}>Siguiente: {nextModuleTitle} →</button>}{!masteryReached && <button type="button" className="secondary-button" onClick={onRetry}>Repasar e intentar de nuevo</button>}</div></div></aside></div>;
}
