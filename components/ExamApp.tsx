"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { questionBank, stimuliById } from "@/data/question-bank";
import { EXAM_DURATION_SECONDS, formatClock, getScore } from "@/lib/exam-utils";
import type { ExamMode, PersistedExam } from "@/types/exam";
import { ExamTimer } from "./ExamTimer";
import { QuestionVisual } from "./QuestionVisual";

const STORAGE_KEY = "entrena-udea-exam-v1";
const SESSION_VERSION = 1;
const optionLetters = ["A", "B", "C", "D"];

type Screen = "home" | "exam" | "results";

interface FinishedExam {
  mode: ExamMode;
  answers: Record<string, number>;
  elapsedSeconds: number;
}

export function ExamApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedMode, setSelectedMode] = useState<ExamMode>("flexible");
  const [session, setSession] = useState<PersistedExam | null>(null);
  const [savedSession, setSavedSession] = useState<PersistedExam | null>(null);
  const [finished, setFinished] = useState<FinishedExam | null>(null);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as PersistedExam;
      if (stored.version === SESSION_VERSION && stored.currentIndex < questionBank.length) {
        const frame = window.requestAnimationFrame(() => setSavedSession(stored));
        return () => window.cancelAnimationFrame(frame);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (screen === "exam" && session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [screen, session]);

  useEffect(() => {
    if (!showFinishDialog) return;
    continueButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowFinishDialog(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showFinishDialog]);

  const beginExam = () => {
    const nextSession: PersistedExam = {
      version: SESSION_VERSION,
      mode: selectedMode,
      startedAt: Date.now(),
      currentIndex: 0,
      answers: {},
      marked: [],
    };
    setSession(nextSession);
    setSavedSession(null);
    setFinished(null);
    setScreen("exam");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resumeExam = () => {
    if (!savedSession) return;
    setSession(savedSession);
    setSelectedMode(savedSession.mode);
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
    setFinished({ mode: session.mode, answers: session.answers, elapsedSeconds });
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
    const currentQuestion = questionBank[session.currentIndex];
    const stimulus = currentQuestion.stimulusId ? stimuliById[currentQuestion.stimulusId] : undefined;
    const answeredCount = Object.keys(session.answers).length;
    const isMarked = session.marked.includes(currentQuestion.id);

    const goTo = (index: number) => {
      setSession((current) => current ? { ...current, currentIndex: Math.min(Math.max(index, 0), questionBank.length - 1) } : current);
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
        <header className="exam-header">
          <div className="exam-brand"><span className="brand-mark">U</span><span>Entrena UdeA<small>Simulacro de admisión</small></span></div>
          <div className="exam-header-actions">
            <span className={`mode-badge ${session.mode}`}>{session.mode === "flexible" ? "Entrenamiento flexible" : "Tiempo estricto"}</span>
            <ExamTimer mode={session.mode} startedAt={session.startedAt} onStrictExpired={finishExam} />
            <button className="finish-button" type="button" onClick={() => setShowFinishDialog(true)}>Finalizar</button>
          </div>
        </header>

        <div className="progress-line" aria-label={`${answeredCount} de ${questionBank.length} preguntas respondidas`}>
          <span style={{ width: `${(answeredCount / questionBank.length) * 100}%` }} />
        </div>

        <div className="exam-layout">
          <aside className="question-navigator" aria-label="Navegador de preguntas">
            <div className="navigator-heading">
              <div><span>Tu avance</span><strong>{answeredCount}/{questionBank.length}</strong></div>
              <small>{session.marked.length} marcadas para revisar</small>
            </div>
            <div className="navigator-section-label">Razonamiento lógico</div>
            <div className="question-grid">
              {questionBank.slice(0, 40).map((question, index) => (
                <QuestionNumber key={question.id} questionId={question.id} index={index} session={session} onClick={goTo} />
              ))}
            </div>
            <div className="navigator-section-label">Comprensión lectora</div>
            <div className="question-grid">
              {questionBank.slice(40).map((question, offset) => {
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
                <span>Pregunta {session.currentIndex + 1} de {questionBank.length}</span>
                <button className={`mark-button ${isMarked ? "active" : ""}`} type="button" onClick={toggleMarked} aria-pressed={isMarked}>
                  <span aria-hidden="true">{isMarked ? "★" : "☆"}</span> {isMarked ? "Marcada" : "Marcar para revisar"}
                </button>
              </div>
              <h1>{currentQuestion.stem}</h1>
              {currentQuestion.visual && <QuestionVisual visual={currentQuestion.visual} />}

              <fieldset className="answer-list">
                <legend className="sr-only">Selecciona una respuesta</legend>
                {currentQuestion.options.map((option, optionIndex) => {
                  const selected = session.answers[currentQuestion.id] === optionIndex;
                  return (
                    <label className={`answer-option ${selected ? "selected" : ""}`} key={option}>
                      <input type="radio" name={currentQuestion.id} checked={selected} onChange={() => chooseAnswer(optionIndex)} />
                      <span className="answer-letter">{optionLetters[optionIndex]}</span>
                      <span>{option}</span>
                      <i aria-hidden="true">✓</i>
                    </label>
                  );
                })}
              </fieldset>

              <footer className="question-actions">
                <button type="button" className="secondary-button" onClick={() => goTo(session.currentIndex - 1)} disabled={session.currentIndex === 0}>← Anterior</button>
                {session.currentIndex < questionBank.length - 1
                  ? <button type="button" className="primary-button" onClick={() => goTo(session.currentIndex + 1)}>Siguiente →</button>
                  : <button type="button" className="primary-button" onClick={() => setShowFinishDialog(true)}>Ver resultados →</button>}
              </footer>
            </article>
          </section>
        </div>

        {showFinishDialog && (
          <div className="dialog-backdrop" role="presentation">
            <section
              className="finish-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="finish-dialog-title"
              aria-describedby="finish-dialog-description"
            >
              <span className="dialog-icon" aria-hidden="true">✓</span>
              <h2 id="finish-dialog-title">¿Finalizar el simulacro?</h2>
              <p id="finish-dialog-description">
                Has respondido {answeredCount} de {questionBank.length} preguntas. Al finalizar podrás revisar tus resultados y explicaciones.
              </p>
              <div className="dialog-actions">
                <button ref={continueButtonRef} className="secondary-button" type="button" onClick={() => setShowFinishDialog(false)}>
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
    return <Results finished={finished} onRestart={restart} />;
  }

  return (
    <main className="landing-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Entrena UdeA, inicio">
          <span className="brand-mark" aria-hidden="true">U</span><span>Entrena UdeA</span>
        </a>
        <span className="topbar-note">Simulador de práctica · Medellín</span>
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
            <span>✓ Preguntas originales tipo UdeA</span>
            <span>✓ Gráficas y ejercicios visuales</span>
            <span>✓ Explicaciones al finalizar</span>
          </div>
        </div>

        <aside className="mode-card" aria-labelledby="mode-title">
          {savedSession && (
            <div className="resume-card">
              <div><strong>Tienes un simulacro en curso</strong><span>{Object.keys(savedSession.answers).length} de {questionBank.length} respondidas</span></div>
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

function Results({ finished, onRestart }: { finished: FinishedExam; onRestart: () => void }) {
  const score = useMemo(() => getScore(questionBank, finished.answers), [finished.answers]);
  const overtime = Math.max(0, finished.elapsedSeconds - EXAM_DURATION_SECONDS);
  const incorrect = questionBank.filter((question) => finished.answers[question.id] !== question.correctOption);
  const logical = score.byCompetency["Razonamiento lógico"];
  const reading = score.byCompetency["Comprensión lectora"];

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
        <article><span>Razonamiento lógico</span><strong>{logical.correct}/{logical.total}</strong><div><i style={{ width: `${(logical.correct / logical.total) * 100}%` }} /></div></article>
        <article><span>Comprensión lectora</span><strong>{reading.correct}/{reading.total}</strong><div><i style={{ width: `${(reading.correct / reading.total) * 100}%` }} /></div></article>
        <article><span>Tiempo utilizado</span><strong>{formatClock(finished.elapsedSeconds)}</strong><small>{overtime > 0 ? `Incluye +${formatClock(overtime)} adicionales` : `${formatClock(EXAM_DURATION_SECONDS - finished.elapsedSeconds)} disponibles`}</small></article>
        <article><span>Preguntas respondidas</span><strong>{score.answered}/{score.total}</strong><small>{finished.mode === "flexible" ? "Entrenamiento flexible" : "Tiempo estricto"}</small></article>
      </section>

      <section className="review-section">
        <div className="review-heading"><div><span className="step-label">Revisión guiada</span><h2>{incorrect.length === 0 ? "¡Todas correctas!" : `${incorrect.length} preguntas para fortalecer`}</h2></div><button className="primary-button" type="button" onClick={onRestart}>Intentar de nuevo →</button></div>
        <div className="review-list">
          {incorrect.map((question, index) => (
            <details key={question.id} open={index === 0}>
              <summary><span>{questionBank.indexOf(question) + 1}</span><div><strong>{question.stem}</strong><small>{question.competency} · {question.skill}</small></div><i aria-hidden="true">+</i></summary>
              <div className="review-answer">
                <p><b>Tu respuesta:</b> {finished.answers[question.id] === undefined ? "Sin responder" : `${optionLetters[finished.answers[question.id]]}. ${question.options[finished.answers[question.id]]}`}</p>
                <p className="correct-answer"><b>Respuesta correcta:</b> {optionLetters[question.correctOption]}. {question.options[question.correctOption]}</p>
                <p>{question.explanation}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
