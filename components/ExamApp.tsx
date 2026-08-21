"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createExamQuestionSet, questionsById, stimuliById } from "@/data/question-bank";
import { loadCourseProgress } from "@/lib/course-progress";
import { hasStoredCourseV2Progress } from "@/lib/course-v2-progress";
import { EXAM_DURATION_SECONDS, formatClock, getScore } from "@/lib/exam-utils";
import { createBalancedOptionOrders, displayedOptionIndex, isValidOptionOrder } from "@/lib/option-orders";
import { getCourseRecommendation } from "@/lib/recommendation";
import type { CourseTrack } from "@/types/course";
import type { ExamMode, PersistedExam } from "@/types/exam";
import { CourseCheckout } from "./CourseCheckout";
import { ExamTimer } from "./ExamTimer";
import { QuestionVisual } from "./QuestionVisual";

const STORAGE_KEY = "entrena-udea-exam-v1";
const SESSION_VERSION = 3;
const optionLetters = ["A", "B", "C", "D"];

type Screen = "home" | "exam" | "results" | "checkout";

interface FinishedExam {
  mode: ExamMode;
  questionIds: string[];
  optionOrders: Record<string, number[]>;
  answers: Record<string, number>;
  elapsedSeconds: number;
}

export function ExamApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedMode, setSelectedMode] = useState<ExamMode>("flexible");
  const [session, setSession] = useState<PersistedExam | null>(null);
  const [savedSession, setSavedSession] = useState<PersistedExam | null>(null);
  const [finished, setFinished] = useState<FinishedExam | null>(null);
  const [courseTrack, setCourseTrack] = useState<CourseTrack | null>(null);
  const [savedCourseEdition, setSavedCourseEdition] = useState<1 | 2 | null>(null);
  const [navigatorTrack, setNavigatorTrack] = useState<CourseTrack>("math");
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const finishTriggerRef = useRef<HTMLElement | null>(null);

  const openFinishDialog = () => {
    finishTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setShowFinishDialog(true);
  };

  const closeFinishDialog = useCallback(() => {
    setShowFinishDialog(false);
    window.requestAnimationFrame(() => finishTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    const v1ProgressExists = Boolean(loadCourseProgress(window.localStorage));
    let v2ProgressExists = false;
    let storedSession: PersistedExam | null = null;
    try {
      v2ProgressExists = hasStoredCourseV2Progress(window.localStorage);
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as unknown;
        const normalized = normalizePersistedExam(stored);
        if (normalized) {
          storedSession = normalized;
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // El simulador puede iniciar aunque el almacenamiento local esté bloqueado.
      }
    }
    const frame = window.requestAnimationFrame(() => {
      setSavedCourseEdition(v2ProgressExists ? 2 : v1ProgressExists ? 1 : null);
      setSavedSession(storedSession);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (screen === "exam" && session) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } catch {
        // El simulacro puede continuar aunque el almacenamiento esté bloqueado.
      }
    }
  }, [screen, session]);

  useEffect(() => {
    if (!showFinishDialog) return;
    continueButtonRef.current?.focus();
    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFinishDialog();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex='-1'])") ?? []);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", keepFocusInside);
    return () => window.removeEventListener("keydown", keepFocusInside);
  }, [closeFinishDialog, showFinishDialog]);

  const beginExam = () => {
    const examQuestions = createExamQuestionSet();
    const optionOrders = Object.assign({}, ...[examQuestions.slice(0, 40), examQuestions.slice(40)].map((questions) =>
      createBalancedOptionOrders(questions.map((question) => ({
        id: question.id,
        optionCount: question.options.length,
        correctOption: question.correctOption,
      }))),
    ));
    const nextSession: PersistedExam = {
      version: SESSION_VERSION,
      mode: selectedMode,
      startedAt: Date.now(),
      currentIndex: 0,
      questionIds: examQuestions.map((question) => question.id),
      optionOrders,
      answers: {},
      marked: [],
    };
    setSession(nextSession);
    setSavedSession(null);
    setFinished(null);
    setNavigatorTrack("math");
    setScreen("exam");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resumeExam = () => {
    if (!savedSession) return;
    setSession(savedSession);
    setSelectedMode(savedSession.mode);
    setNavigatorTrack(savedSession.currentIndex < 40 ? "math" : "reading");
    setScreen("exam");
    window.scrollTo({ top: 0 });
  };

  const discardSaved = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSavedSession(null);
  };

  const finishExam = useCallback(() => {
    if (!session) return;

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000));
    setFinished({ mode: session.mode, questionIds: session.questionIds, optionOrders: session.optionOrders, answers: session.answers, elapsedSeconds });
    window.localStorage.removeItem(STORAGE_KEY);
    setSavedSession(null);
    setShowFinishDialog(false);
    setScreen("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [session]);

  const restart = () => {
    setSession(null);
    setFinished(null);
    setScreen("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (screen === "exam" && session) {
    const examQuestions = session.questionIds.map((id) => questionsById[id]);
    const currentQuestion = examQuestions[session.currentIndex];
    const stimulus = currentQuestion.stimulusId ? stimuliById[currentQuestion.stimulusId] : undefined;
    const answeredCount = Object.keys(session.answers).length;
    const isMarked = session.marked.includes(currentQuestion.id);
    const currentOptionOrder = session.optionOrders[currentQuestion.id];

    const goTo = (index: number) => {
      const boundedIndex = Math.min(Math.max(index, 0), examQuestions.length - 1);
      setSession((current) => current ? { ...current, currentIndex: boundedIndex } : current);
      setNavigatorTrack(boundedIndex < 40 ? "math" : "reading");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const chooseAnswer = (optionIndex: number) => {
      setSession((current) => current ? {
        ...current,
        answers: { ...current.answers, [currentQuestion.id]: optionIndex },
      } : current);
    };

    const toggleMarked = () => {
      setSession((current) => {
        if (!current) return current;
        const exists = current.marked.includes(currentQuestion.id);
        return {
          ...current,
          marked: exists
            ? current.marked.filter((id) => id !== currentQuestion.id)
            : [...current.marked, currentQuestion.id],
        };
      });
    };

    return (
      <main className="exam-shell">
        <div className="exam-background" inert={showFinishDialog} aria-hidden={showFinishDialog || undefined}>
        <header className="exam-header">
          <div className="exam-brand"><span className="brand-mark">U</span><span>Entrena UdeA<small>Simulacro de admisión</small></span></div>
          <div className="exam-header-actions">
            <span className={`mode-badge ${session.mode}`}>{session.mode === "flexible" ? "Entrenamiento flexible" : "Tiempo estricto"}</span>
            <ExamTimer mode={session.mode} startedAt={session.startedAt} onStrictExpired={finishExam} />
            <button className="finish-button" type="button" onClick={openFinishDialog}>Finalizar</button>
          </div>
        </header>

        <div className="progress-line" aria-label={`${answeredCount} de ${examQuestions.length} preguntas respondidas`}>
          <span style={{ width: `${(answeredCount / examQuestions.length) * 100}%` }} />
        </div>

        <div className="exam-layout">
          <aside className="question-navigator" aria-label="Navegador de preguntas">
            <div className="navigator-heading">
              <div><span>Tu avance</span><strong>{answeredCount}/{examQuestions.length}</strong></div>
              <small>{session.marked.length} marcadas para revisar</small>
            </div>
            <div className="navigator-tabs" aria-label="Competencia visible">
              <button type="button" className={navigatorTrack === "math" ? "active" : ""} aria-pressed={navigatorTrack === "math"} onClick={() => setNavigatorTrack("math")}>Razonamiento lógico</button>
              <button type="button" className={navigatorTrack === "reading" ? "active" : ""} aria-pressed={navigatorTrack === "reading"} onClick={() => setNavigatorTrack("reading")}>Comprensión lectora</button>
            </div>
            <div className="navigator-section-label">Razonamiento lógico</div>
            <div className={`question-grid navigator-logical ${navigatorTrack === "math" ? "mobile-active" : ""}`}>
              {examQuestions.slice(0, 40).map((question, index) => (
                <QuestionNumber key={question.id} questionId={question.id} index={index} session={session} onClick={goTo} />
              ))}
            </div>
            <div className="navigator-section-label">Comprensión lectora</div>
            <div className={`question-grid navigator-reading ${navigatorTrack === "reading" ? "mobile-active" : ""}`}>
              {examQuestions.slice(40).map((question, offset) => {
                const index = offset + 40;
                return <QuestionNumber key={question.id} questionId={question.id} index={index} session={session} onClick={goTo} />;
              })}
            </div>
            <div className="navigator-legend"><span><i className="answered" />Respondida</span><span><i className="marked" />Marcada</span></div>
          </aside>

          <section className={`question-workspace ${stimulus ? "with-stimulus" : ""}`}>
            {stimulus && (
              <article className="stimulus-panel">
                <span className="content-kicker">{stimulus.kicker}</span>
                <h2>{stimulus.title}</h2>
                {stimulus.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {stimulus.visual && <QuestionVisual visual={stimulus.visual} />}
                <small className="source-note">{stimulus.source}</small>
              </article>
            )}

            <article className="question-panel">
              <div className="question-meta">
                <span>{currentQuestion.competency}</span>
                <span>{currentQuestion.skill}</span>
                <span>{currentQuestion.difficulty}</span>
              </div>
              <div className="question-number-row">
                <span>Pregunta {session.currentIndex + 1} de {examQuestions.length}</span>
                <button className={`mark-button ${isMarked ? "active" : ""}`} type="button" onClick={toggleMarked} aria-pressed={isMarked}>
                  <span aria-hidden="true">{isMarked ? "★" : "☆"}</span> {isMarked ? "Marcada" : "Marcar para revisar"}
                </button>
              </div>
              <h1>{currentQuestion.stem}</h1>
              {currentQuestion.visual && <QuestionVisual visual={currentQuestion.visual} />}

              <fieldset className="answer-list">
                <legend className="sr-only">Selecciona una respuesta</legend>
                {currentOptionOrder.map((originalOptionIndex, displayIndex) => {
                  const option = currentQuestion.options[originalOptionIndex];
                  const selected = session.answers[currentQuestion.id] === originalOptionIndex;
                  return (
                    <label className={`answer-option ${selected ? "selected" : ""}`} key={originalOptionIndex}>
                      <input type="radio" name={currentQuestion.id} checked={selected} onChange={() => chooseAnswer(originalOptionIndex)} />
                      <span className="answer-letter">{optionLetters[displayIndex]}</span>
                      <span>{option}</span>
                      <i aria-hidden="true">✓</i>
                    </label>
                  );
                })}
              </fieldset>

              <footer className="question-actions">
                <button type="button" className="secondary-button" onClick={() => goTo(session.currentIndex - 1)} disabled={session.currentIndex === 0}>← Anterior</button>
                {session.currentIndex < examQuestions.length - 1
                  ? <button type="button" className="primary-button" onClick={() => goTo(session.currentIndex + 1)}>Siguiente →</button>
                  : <button type="button" className="primary-button" onClick={openFinishDialog}>Ver resultados →</button>}
              </footer>
            </article>
          </section>
        </div>
        </div>

        {showFinishDialog && (
          <div className="dialog-backdrop" role="presentation">
            <section
              ref={dialogRef}
              className="finish-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="finish-dialog-title"
              aria-describedby="finish-dialog-description"
            >
              <span className="dialog-icon" aria-hidden="true">✓</span>
              <h2 id="finish-dialog-title">¿Finalizar el simulacro?</h2>
              <p id="finish-dialog-description">
                Has respondido {answeredCount} de {examQuestions.length} preguntas. Al finalizar podrás revisar tus resultados y explicaciones.
              </p>
              <div className="dialog-actions">
                <button ref={continueButtonRef} className="secondary-button" type="button" onClick={closeFinishDialog}>
                  Continuar examen
                </button>
                <button className="primary-button" type="button" onClick={finishExam}>
                  Finalizar y ver resultados
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    );
  }

  if (screen === "results" && finished) {
    return (
      <Results
        finished={finished}
        onRestart={restart}
        onExploreCourse={(track) => {
          setCourseTrack(track);
          setScreen("checkout");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  if (screen === "checkout" && finished) {
    return (
      <CourseCheckout
        recommendedTrack={courseTrack}
        onBack={() => setScreen("results")}
        onContinue={(mode, track) => {
          window.location.assign(`/curso/v2?mode=${mode}&track=${track}`);
        }}
      />
    );
  }

  return (
    <main className="landing-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Entrena UdeA, inicio">
          <span className="brand-mark" aria-hidden="true">U</span><span>Entrena UdeA</span>
        </a>
        <div className="topbar-actions">
          <span className="topbar-note">Simulador de práctica · Medellín</span>
          <a className="topbar-course-link" href="/pago">Ver acceso al curso</a>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow">Preparación enfocada</span>
          <h1>Entrena como si fuera el día del examen.</h1>
          <p className="hero-text">Un simulacro completo de razonamiento lógico y comprensión lectora, con el ritmo y la estructura de la prueba de admisión UdeA.</p>
          <div className="exam-facts" aria-label="Características del simulacro">
            <div><strong>80</strong><span>preguntas</span></div>
            <div><strong>180</strong><span>minutos</span></div>
            <div><strong>2</strong><span>competencias</span></div>
          </div>
          <div className="practice-notes">
            <span>✓ Banco de 160 preguntas originales</span>
            <span>✓ Gráficas y ejercicios visuales</span>
            <span>✓ Explicaciones al finalizar</span>
          </div>
        </div>

        <aside className="mode-card" aria-labelledby="mode-title">
          {savedCourseEdition && (
            <div className="continue-course-card">
              <div><strong>Tu Curso v{savedCourseEdition} está listo para continuar</strong><span>Retoma la competencia y el módulo que dejaste abiertos.</span></div>
              <a href={savedCourseEdition === 2 ? "/curso/v2?mode=resume" : "/curso?mode=resume"}>Continuar Curso v{savedCourseEdition}</a>
            </div>
          )}
          {savedSession && (
            <div className="resume-card">
              <div><strong>Tienes un simulacro en curso</strong><span>{Object.keys(savedSession.answers).length} de {savedSession.questionIds.length} respondidas</span></div>
              <button type="button" onClick={resumeExam}>Continuar</button>
              <button type="button" className="discard-button" onClick={discardSaved} aria-label="Descartar simulacro guardado">×</button>
            </div>
          )}
          <span className="step-label">Antes de comenzar</span>
          <h2 id="mode-title">Elige cómo entrenar</h2>
          <p>Podrás escoger una modalidad diferente en cada intento.</p>

          <label className={`mode-option ${selectedMode === "flexible" ? "selected" : ""}`}>
            <input type="radio" name="mode" value="flexible" checked={selectedMode === "flexible"} onChange={() => setSelectedMode("flexible")} />
            <span className="mode-icon" aria-hidden="true">↗</span>
            <span><strong>Entrenamiento flexible</strong><small>Al llegar a 00:00, el examen continúa y empieza a medir tu tiempo adicional.</small></span>
            <span className="mode-check" aria-hidden="true">✓</span>
          </label>

          <label className={`mode-option ${selectedMode === "strict" ? "selected" : ""}`}>
            <input type="radio" name="mode" value="strict" checked={selectedMode === "strict"} onChange={() => setSelectedMode("strict")} />
            <span className="mode-icon" aria-hidden="true">⌛</span>
            <span><strong>Simulacro con tiempo estricto</strong><small>La sesión finaliza automáticamente al completar los 180 minutos.</small></span>
            <span className="mode-check" aria-hidden="true">✓</span>
          </label>

          <button className="start-button" type="button" onClick={beginExam}>Comenzar simulacro <span aria-hidden="true">→</span></button>
          <span className="privacy-note">Tus avances se guardan únicamente en este dispositivo.</span>
        </aside>
      </section>
    </main>
  );
}

function isValidPersistedExam(value: unknown): value is PersistedExam {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const stored = value as Partial<PersistedExam>;
  const questionIds = stored.questionIds;
  if (
    stored.version !== SESSION_VERSION
    || (stored.mode !== "flexible" && stored.mode !== "strict")
    || typeof stored.startedAt !== "number"
    || !Number.isFinite(stored.startedAt)
    || stored.startedAt <= 0
    || typeof stored.currentIndex !== "number"
    || !Number.isInteger(stored.currentIndex)
    || !Array.isArray(questionIds)
    || questionIds.length !== 80
    || new Set(questionIds).size !== 80
    || !questionIds.every((id) => typeof id === "string" && Boolean(questionsById[id]))
    || stored.currentIndex < 0
    || stored.currentIndex >= questionIds.length
    || !stored.answers
    || typeof stored.answers !== "object"
    || Array.isArray(stored.answers)
    || !stored.optionOrders
    || typeof stored.optionOrders !== "object"
    || Array.isArray(stored.optionOrders)
    || !Array.isArray(stored.marked)
  ) return false;

  const selectedIds = new Set(questionIds);
  const validAnswers = Object.entries(stored.answers).every(([id, option]) =>
    selectedIds.has(id) && typeof option === "number" && Number.isInteger(option) && option >= 0 && option <= 3,
  );
  const validMarked = stored.marked.every((id) => typeof id === "string" && selectedIds.has(id));
  const validOptionOrders = questionIds.every((id) => isValidOptionOrder(stored.optionOrders?.[id], 4));
  return validAnswers && validMarked && validOptionOrders;
}

function normalizePersistedExam(value: unknown): PersistedExam | null {
  if (isValidPersistedExam(value)) return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Partial<PersistedExam>;
  if (
    legacy.version !== 2
    || !Array.isArray(legacy.questionIds)
    || legacy.questionIds.length !== 80
    || !legacy.questionIds.every((id) => typeof id === "string" && Boolean(questionsById[id]))
  ) return null;

  const questions = legacy.questionIds.map((id) => questionsById[id]);
  const migrated = {
    ...legacy,
    version: SESSION_VERSION,
    optionOrders: Object.assign({}, ...[questions.slice(0, 40), questions.slice(40)].map((section) =>
      createBalancedOptionOrders(section.map((question) => ({
        id: question.id,
        optionCount: question.options.length,
        correctOption: question.correctOption,
      }))),
    )),
  };
  return isValidPersistedExam(migrated) ? migrated : null;
}

function QuestionNumber({ questionId, index, session, onClick }: { questionId: string; index: number; session: PersistedExam; onClick: (index: number) => void }) {
  const answered = session.answers[questionId] !== undefined;
  const marked = session.marked.includes(questionId);
  const current = session.currentIndex === index;
  return (
    <button
      type="button"
      className={`${answered ? "answered" : ""} ${marked ? "marked" : ""} ${current ? "current" : ""}`}
      onClick={() => onClick(index)}
      aria-label={`Pregunta ${index + 1}${answered ? ", respondida" : ""}${marked ? ", marcada" : ""}`}
      aria-current={current ? "step" : undefined}
    >
      {index + 1}
    </button>
  );
}

function Results({
  finished,
  onRestart,
  onExploreCourse,
}: {
  finished: FinishedExam;
  onRestart: () => void;
  onExploreCourse: (track: CourseTrack | null) => void;
}) {
  const examQuestions = useMemo(
    () => finished.questionIds.map((id) => questionsById[id]),
    [finished.questionIds],
  );
  const score = useMemo(() => getScore(examQuestions, finished.answers), [examQuestions, finished.answers]);
  const overtime = Math.max(0, finished.elapsedSeconds - EXAM_DURATION_SECONDS);
  const incorrect = examQuestions.filter((question) => finished.answers[question.id] !== question.correctOption);
  const logical = score.byCompetency["Razonamiento lógico"];
  const reading = score.byCompetency["Comprensión lectora"];
  const recommendation = getCourseRecommendation(logical, reading);
  const recommendationLabel = recommendation.track === "math" ? "Razonamiento lógico" : "Comprensión lectora";
  const recommendationMessage = recommendation.kind === "recommended"
    ? `Empieza por ${recommendationLabel}`
    : recommendation.kind === "tie"
      ? "Tu desempeño está equilibrado"
      : "Necesitamos más respuestas para personalizar";
  const recommendationDetail = recommendation.kind === "recommended"
    ? `Razonamiento lógico: ${logical.correct}/${logical.answered} correctas respondidas. Comprensión lectora: ${reading.correct}/${reading.answered}.`
    : recommendation.kind === "tie"
      ? `Las tasas están muy próximas: ${logical.correct}/${logical.answered} y ${reading.correct}/${reading.answered}. Puedes elegir cualquiera de las dos rutas.`
      : `Respondiste ${logical.answered} de 40 en razonamiento lógico y ${reading.answered} de 40 en comprensión lectora. Elige la ruta que prefieras.`;

  return (
    <main className="results-shell">
      <header className="topbar results-topbar"><span className="brand"><span className="brand-mark">U</span><span>Entrena UdeA</span></span><button className="secondary-button" type="button" onClick={onRestart}>Nuevo simulacro</button></header>
      <section className="results-hero">
        <div>
          <span className="eyebrow">Simulacro finalizado</span>
          <h1>Este intento ya te mostró por dónde seguir.</h1>
          <p>Revisa el desempeño por competencia y estudia las explicaciones de las preguntas que aún puedes fortalecer.</p>
        </div>
        <div className="score-ring" style={{ background: `conic-gradient(var(--green) ${score.percentage}%, #dce5dd 0)` }}>
          <div><strong>{score.percentage}%</strong><span>{score.correct} de {score.total}</span></div>
        </div>
      </section>

      <section className="result-cards">
        <article><span>Razonamiento lógico</span><strong>{logical.correct}/{logical.answered}</strong><small>{logical.answered} respondidas de {logical.total}</small><div><i style={{ width: `${logical.answered > 0 ? (logical.correct / logical.answered) * 100 : 0}%` }} /></div></article>
        <article><span>Comprensión lectora</span><strong>{reading.correct}/{reading.answered}</strong><small>{reading.answered} respondidas de {reading.total}</small><div><i style={{ width: `${reading.answered > 0 ? (reading.correct / reading.answered) * 100 : 0}%` }} /></div></article>
        <article><span>Tiempo utilizado</span><strong>{formatClock(finished.elapsedSeconds)}</strong><small>{overtime > 0 ? `Incluye +${formatClock(overtime)} adicionales` : `${formatClock(EXAM_DURATION_SECONDS - finished.elapsedSeconds)} disponibles`}</small></article>
        <article><span>Preguntas respondidas</span><strong>{score.answered}/{score.total}</strong><small>{finished.mode === "flexible" ? "Entrenamiento flexible" : "Tiempo estricto"}</small></article>
      </section>

      <section className="course-offer" aria-labelledby="course-offer-title">
        <div className="course-offer-intro">
          <span className="eyebrow">Siguiente paso</span>
          <h2 id="course-offer-title">No te quedes solo con el resultado.</h2>
          <p>Fortalece cada habilidad con una ruta flexible de microlecciones, ejemplos resueltos y práctica interactiva.</p>
          <div className="course-recommendation"><span>✦</span><div><strong>{recommendationMessage}</strong><small>{recommendationDetail}</small></div></div>
          <button className="course-offer-button" type="button" onClick={() => onExploreCourse(recommendation.track)}>Explorar vista previa gratuita <span>→</span></button>
          <small className="course-demo-label">Vista educativa disponible · Pagos todavía no habilitados</small>
        </div>
        <div className="course-offer-tracks">
          <article>
            <span className="track-symbol">∑</span><div><strong>Razonamiento lógico</strong><small>8 módulos</small></div>
            <ul><li>Aritmética y porcentajes</li><li>Álgebra y ecuaciones</li><li>Geometría y datos</li><li>Probabilidad, patrones y lógica</li></ul>
          </article>
          <article>
            <span className="track-symbol">Aa</span><div><strong>Comprensión lectora</strong><small>9 módulos</small></div>
            <ul><li>Lectura literal e inferencial</li><li>Idea principal y relaciones</li><li>Argumentos y comparación</li><li>Textos visuales y analogías</li></ul>
          </article>
        </div>
      </section>

      <section className="review-section">
        <div className="review-heading"><div><span className="step-label">Revisión guiada</span><h2>{incorrect.length === 0 ? "¡Todas correctas!" : `${incorrect.length} preguntas para fortalecer`}</h2></div><button className="primary-button" type="button" onClick={onRestart}>Intentar de nuevo →</button></div>
        <div className="review-list">
          {incorrect.map((question, index) => (
            <details key={question.id} open={index === 0}>
              <summary><span>{examQuestions.indexOf(question) + 1}</span><div><strong>{question.stem}</strong><small>{question.competency} · {question.skill}</small></div><i aria-hidden="true">+</i></summary>
              <div className="review-answer">
                <p><b>Tu respuesta:</b> {finished.answers[question.id] === undefined ? "Sin responder" : `${optionLetters[displayedOptionIndex(finished.optionOrders[question.id], finished.answers[question.id])]}. ${question.options[finished.answers[question.id]]}`}</p>
                <p className="correct-answer"><b>Respuesta correcta:</b> {optionLetters[displayedOptionIndex(finished.optionOrders[question.id], question.correctOption)]}. {question.options[question.correctOption]}</p>
                <p>{question.explanation}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
