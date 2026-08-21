"use client";

import { useEffect, useMemo, useState } from "react";
import { courseLessons, courseTracks } from "@/data/course-content";
import {
  COURSE_PROGRESS_VERSION,
  createCourseOptionOrders,
  loadCourseProgress,
  saveCourseProgress,
} from "@/lib/course-progress";
import type { OptionOrders } from "@/lib/option-orders";
import type { CourseExercise, CourseLesson, CourseTrack, CourseVisual as VisualType } from "@/types/course";

type CourseEntryMode = "resume" | "start";

export function CourseExperience({
  initialTrack,
  entryMode = "resume",
  onExit,
}: {
  initialTrack: CourseTrack;
  entryMode?: CourseEntryMode;
  onExit: () => void;
}) {
  const [track, setTrack] = useState<CourseTrack>(initialTrack);
  const [activeLessonId, setActiveLessonId] = useState(() => firstLesson(initialTrack).id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [optionOrders, setOptionOrders] = useState<OptionOrders>({});
  const [progressLoaded, setProgressLoaded] = useState(false);

  useEffect(() => {
    const restored = loadCourseProgress(window.localStorage);
    const frame = window.requestAnimationFrame(() => {
      if (restored) {
        if (entryMode === "resume") {
          setTrack(restored.track);
          setActiveLessonId(restored.activeLessonId);
        } else {
          setTrack(initialTrack);
          setActiveLessonId(firstLesson(initialTrack).id);
        }
        setCompleted(restored.completed.filter((lessonId) => lessonIsMastered(lessonId, restored.answers)));
        setAnswers(restored.answers);
        setOptionOrders(restored.optionOrders);
      } else {
        setOptionOrders(createCourseOptionOrders());
      }
      setProgressLoaded(true);
      if (entryMode === "start") {
        window.history.replaceState({}, "", "/curso?mode=resume");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [entryMode, initialTrack]);

  useEffect(() => {
    if (!progressLoaded) return;
    saveCourseProgress(window.localStorage, {
      version: COURSE_PROGRESS_VERSION,
      track,
      activeLessonId,
      completed,
      answers,
      optionOrders,
    });
  }, [activeLessonId, answers, completed, optionOrders, progressLoaded, track]);

  const lessons = useMemo(() => courseLessons.filter((lesson) => lesson.track === track), [track]);
  const activeLesson = courseLessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const completedInTrack = lessons.filter((lesson) => completed.includes(lesson.id)).length;
  const currentIndex = lessons.findIndex((lesson) => lesson.id === activeLesson.id);
  const answeredInLesson = activeLesson.exercises.filter((_, index) => answers[`${activeLesson.id}-${index}`] !== undefined).length;
  const masteredLesson = activeLesson.exercises.every((exercise, index) =>
    answers[`${activeLesson.id}-${index}`] === exercise.correctOption,
  );

  const chooseTrack = (nextTrack: CourseTrack) => {
    setTrack(nextTrack);
    setActiveLessonId(firstLesson(nextTrack).id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseLesson = (lesson: CourseLesson) => {
    setActiveLessonId(lesson.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleComplete = () => {
    if (!masteredLesson && !completed.includes(activeLesson.id)) return;
    setCompleted((current) => current.includes(activeLesson.id)
      ? current.filter((id) => id !== activeLesson.id)
      : [...current, activeLesson.id]);
  };

  const goNext = () => {
    const nextLesson = lessons[currentIndex + 1];
    if (nextLesson) chooseLesson(nextLesson);
  };

  return (
    <main className="course-shell">
      <header className="course-header">
        <button className="course-brand" type="button" onClick={onExit} aria-label="Salir del curso">
          <span className="brand-mark">U</span>
          <span>Entrena UdeA<small>Curso de habilidades</small></span>
        </button>
        <div className="course-header-progress">
          <span>Avance de contenido</span>
          <strong>{completed.length}/{courseLessons.length}</strong>
          <div><i style={{ width: `${(completed.length / courseLessons.length) * 100}%` }} /></div>
        </div>
        <button className="secondary-button" type="button" onClick={onExit}>Salir del curso</button>
      </header>

      <div className="course-track-tabs" aria-label="Áreas del curso">
        {(Object.keys(courseTracks) as CourseTrack[]).map((trackId) => (
          <button
            key={trackId}
            type="button"
            aria-pressed={track === trackId}
            className={track === trackId ? "active" : ""}
            onClick={() => chooseTrack(trackId)}
          >
            <span>{trackId === "math" ? "∑" : "Aa"}</span>
            <div><strong>{courseTracks[trackId].label}</strong><small>{courseLessons.filter((lesson) => lesson.track === trackId).length} módulos</small></div>
          </button>
        ))}
      </div>

      <div className="course-layout">
        <aside className="lesson-sidebar" aria-label={`Módulos de ${courseTracks[track].label}`}>
          <div className="lesson-sidebar-heading">
            <span>Tu ruta</span>
            <strong>{completedInTrack} de {lessons.length} módulos acreditados</strong>
            <div><i style={{ width: `${(completedInTrack / lessons.length) * 100}%` }} /></div>
          </div>
          <nav>
            {lessons.map((lesson, index) => (
              <button
                className={`${lesson.id === activeLesson.id ? "active" : ""} ${completed.includes(lesson.id) ? "completed" : ""}`}
                type="button"
                key={lesson.id}
                onClick={() => chooseLesson(lesson)}
                aria-current={lesson.id === activeLesson.id ? "step" : undefined}
              >
                <span>{completed.includes(lesson.id) ? "✓" : index + 1}</span>
                <div><strong>{lesson.shortTitle}</strong><small>{lesson.minutes} min · 2 retos</small></div>
              </button>
            ))}
          </nav>
        </aside>

        <article className="lesson-content">
          <section className="lesson-hero">
            <div>
              <span className="content-kicker">Módulo {currentIndex + 1} de {lessons.length} · {courseTracks[track].label}</span>
              <h1>{activeLesson.title}</h1>
              <p>{activeLesson.summary}</p>
              <div className="lesson-meta"><span>◷ {activeLesson.minutes} minutos</span><span>◇ Contenido original</span><span>◎ 2 retos</span></div>
            </div>
            <CourseVisual type={activeLesson.visual} />
          </section>

          <section className="lesson-section lesson-objectives">
            <span className="lesson-section-number">01</span>
            <div><span className="step-label">Tu meta</span><h2>Al terminar podrás</h2><ul>{activeLesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></div>
          </section>

          <section className="lesson-section lesson-explanation">
            <span className="lesson-section-number">02</span>
            <div>
              <span className="step-label">Concepto central</span>
              <h2>Comprende la estrategia</h2>
              <div className="concept-chips">{activeLesson.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div>
              {activeLesson.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>

          <section className="lesson-section">
            <span className="lesson-section-number">03</span>
            <div className="worked-example">
              <span className="step-label">Ejemplo guiado</span>
              <h2>{activeLesson.example.title}</h2>
              <p className="example-prompt">{activeLesson.example.prompt}</p>
              <ol>{activeLesson.example.steps.map((step) => <li key={step}>{step}</li>)}</ol>
              <div className="example-answer"><span>Respuesta</span><strong>{activeLesson.example.answer}</strong></div>
            </div>
          </section>

          <aside className="mistake-card"><span aria-hidden="true">!</span><div><strong>Error frecuente</strong><p>{activeLesson.commonMistake}</p></div></aside>

          <section className="practice-lab">
            <div className="practice-heading"><div><span className="step-label">Laboratorio</span><h2>Comprueba lo aprendido</h2></div><span>{answeredInLesson}/2 respondidos</span></div>
            <p className="practice-rule">Para acreditar este módulo en la vista previa, responde correctamente sus 2 retos. El avance no equivale a una certificación de dominio.</p>
            <div className="course-exercises">
              {activeLesson.exercises.map((exercise, index) => (
                <ExerciseCard
                  key={`${activeLesson.id}-${index}`}
                  index={index}
                  exercise={exercise}
                  selected={answers[`${activeLesson.id}-${index}`]}
                  order={optionOrders[`${activeLesson.id}-${index}`] ?? [0, 1, 2]}
                  onSelect={(option) => setAnswers((current) => ({ ...current, [`${activeLesson.id}-${index}`]: option }))}
                />
              ))}
            </div>
          </section>

          {completedInTrack === lessons.length && (
            <section className="route-summary" role="status">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>{completed.length === courseLessons.length ? "Completaste la vista previa del curso" : `Finalizaste la ruta de ${courseTracks[track].label}`}</strong>
                <p>Repasa las explicaciones que más trabajo te costaron y vuelve a los retos para comprobar que puedes resolverlos sin apoyo.</p>
              </div>
            </section>
          )}

          <footer className="lesson-footer">
            <button
              className={`complete-button ${completed.includes(activeLesson.id) ? "done" : ""}`}
              type="button"
              onClick={toggleComplete}
              disabled={!masteredLesson && !completed.includes(activeLesson.id)}
            >
              {completed.includes(activeLesson.id) ? "✓ Módulo acreditado" : masteredLesson ? "Acreditar módulo" : "Resuelve correctamente los 2 retos"}
            </button>
            {currentIndex < lessons.length - 1
              ? <button className="primary-button" type="button" onClick={goNext}>Siguiente módulo →</button>
              : <button className="primary-button" type="button" onClick={() => chooseTrack(track === "math" ? "reading" : "math")}>Continuar con {track === "math" ? "Comprensión lectora" : "Razonamiento lógico"} →</button>}
          </footer>
        </article>
      </div>
    </main>
  );
}

function firstLesson(track: CourseTrack) {
  const lesson = courseLessons.find((item) => item.track === track);
  if (!lesson) throw new Error(`No hay módulos para ${track}`);
  return lesson;
}

function lessonIsMastered(lessonId: string, answers: Record<string, number>) {
  const lesson = courseLessons.find((item) => item.id === lessonId);
  return Boolean(lesson) && lesson!.exercises.every((exercise, index) =>
    answers[`${lessonId}-${index}`] === exercise.correctOption,
  );
}

function ExerciseCard({
  exercise,
  index,
  selected,
  order,
  onSelect,
}: {
  exercise: CourseExercise;
  index: number;
  selected: number | undefined;
  order: number[];
  onSelect: (option: number) => void;
}) {
  const answered = selected !== undefined;
  const isCorrect = selected === exercise.correctOption;

  return (
    <article className={`course-exercise ${answered ? (isCorrect ? "correct" : "incorrect") : ""}`}>
      <span className="exercise-count">Reto {index + 1}</span>
      <h3>{exercise.prompt}</h3>
      <div className="exercise-options">
        {order.map((originalOptionIndex, displayIndex) => (
          <button
            type="button"
            key={originalOptionIndex}
            className={`${selected === originalOptionIndex ? "selected" : ""} ${answered && originalOptionIndex === exercise.correctOption ? "correct-option" : ""}`}
            onClick={() => onSelect(originalOptionIndex)}
          >
            <span>{String.fromCharCode(65 + displayIndex)}</span>{exercise.options[originalOptionIndex]}
          </button>
        ))}
      </div>
      {answered && <div className="exercise-feedback" role="status"><strong>{isCorrect ? "¡Correcto!" : "Revisa la estrategia"}</strong><p>{exercise.explanation}</p></div>}
    </article>
  );
}

function CourseVisual({ type }: { type: VisualType }) {
  const visuals: Record<VisualType, { symbol: string; label: string; detail: string }> = {
    fractions: { symbol: "¾", label: "Parte / total", detail: "75 %" },
    equation: { symbol: "x", label: "3x − 7", detail: "= 20" },
    geometry: { symbol: "△", label: "base × altura", detail: "÷ 2" },
    data: { symbol: "▥", label: "20 → 30", detail: "+50 %" },
    probability: { symbol: "⚄", label: "favorables", detail: "posibles" },
    venn: { symbol: "◉", label: "A ∪ B", detail: "A ∩ B" },
    sequence: { symbol: "…", label: "14 · 19 · 24", detail: "+5" },
    logic: { symbol: "→", label: "Si P, entonces Q", detail: "¬Q → ¬P" },
    literal: { symbol: "⌕", label: "Localiza", detail: "evidencia" },
    inference: { symbol: "∴", label: "Pistas", detail: "conclusión" },
    "main-idea": { symbol: "◎", label: "Tema + afirmación", detail: "idea central" },
    paragraphs: { symbol: "¶", label: "Idea 1 ↔ Idea 2", detail: "relación" },
    context: { symbol: "Aa", label: "Palabra", detail: "en su frase" },
    argument: { symbol: "◆", label: "Evidencia → tesis", detail: "supuesto" },
    comparison: { symbol: "⇄", label: "Texto A / Texto B", detail: "criterio común" },
    multimodal: { symbol: "▤", label: "Texto + imagen", detail: "sentido" },
    analogy: { symbol: "≈", label: "Caso 1 / Caso 2", detail: "misma relación" },
  };
  const visual = visuals[type];
  return <div className={`course-visual ${type}`} aria-label={`${visual.label}: ${visual.detail}`}><span>{visual.symbol}</span><strong>{visual.label}</strong><small>{visual.detail}</small></div>;
}
