"use client";

import { useEffect, useState } from "react";
import { hasStoredCourseV2Progress, loadCourseV2Progress } from "@/lib/course-v2-progress";
import type { CourseTrack } from "@/types/course";

export function CourseCheckout({
  recommendedTrack,
  onBack,
  onContinue,
}: {
  recommendedTrack: CourseTrack | null;
  onBack: () => void;
  onContinue: (mode: "start" | "resume", track: CourseTrack) => void;
}) {
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [savedTrack, setSavedTrack] = useState<CourseTrack>("math");
  const [selectedTrack, setSelectedTrack] = useState<CourseTrack>(recommendedTrack ?? "math");

  useEffect(() => {
    let progress: ReturnType<typeof loadCourseV2Progress> | null = null;
    try {
      progress = hasStoredCourseV2Progress(window.localStorage)
        ? loadCourseV2Progress(window.localStorage)
        : null;
    } catch {
      // La vista educativa también funciona cuando el navegador bloquea el almacenamiento.
    }
    const frame = window.requestAnimationFrame(() => {
      setHasSavedProgress(Boolean(progress));
      if (progress) setSavedTrack(progress.track);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const recommendation = recommendedTrack === "math"
    ? "Razonamiento lógico"
    : recommendedTrack === "reading"
      ? "Comprensión lectora"
      : null;

  return (
    <main className="checkout-shell">
      <header className="course-topbar">
        <button className="course-brand" type="button" onClick={onBack} aria-label="Volver a los resultados">
          <span className="brand-mark">U</span>
          <span>Entrena UdeA<small>Curso de habilidades</small></span>
        </button>
        <button className="secondary-button" type="button" onClick={onBack}>← Volver a resultados</button>
      </header>

      <section className="checkout-layout">
        <div className="checkout-copy">
          <span className="eyebrow">Curso de habilidades · Vista educativa</span>
          <h1>Convierte tu resultado en una ruta de mejora.</h1>
          <p>Explora una ruta profunda para principiantes: conceptos explicados desde cero, ejemplos resueltos, práctica guiada, trabajo independiente y comprobaciones tipo UdeA.</p>

          <div className="checkout-benefits">
            <article><span>17</span><div><strong>Módulos guiados</strong><small>8 de razonamiento lógico y 9 de comprensión lectora</small></div></article>
            <article><span>85</span><div><strong>Actividades progresivas</strong><small>Fundamento, aplicación y cierre tipo UdeA</small></div></article>
            <article><span>∞</span><div><strong>Ritmo flexible</strong><small>Avanza y retoma desde este dispositivo</small></div></article>
          </div>

          <div className="recommendation-note">
            <span aria-hidden="true">✦</span>
            <div>
              <strong>{recommendation ? `Ruta sugerida: ${recommendation}` : "Elige la ruta que quieras fortalecer"}</strong>
              <p>{recommendation ? "La sugerencia usa suficientes respuestas de este intento. Puedes cambiar de competencia en cualquier momento." : "Este intento no aporta evidencia suficiente para declarar una competencia más débil."}</p>
            </div>
          </div>
        </div>

        <aside className="payment-card preview-access-card" aria-labelledby="preview-title">
          <div className="payment-card-heading">
            <span>Acceso de demostración</span>
            <strong id="preview-title">Vista previa gratuita</strong>
            <p>No se solicita pago, billetera ni datos financieros.</p>
          </div>

          <fieldset className="preview-track-options">
            <legend>Selecciona una competencia</legend>
            <button type="button" className={selectedTrack === "math" ? "selected" : ""} aria-pressed={selectedTrack === "math"} onClick={() => setSelectedTrack("math")}>
              <span>∑</span><div><strong>Razonamiento lógico</strong><small>8 módulos</small></div>
            </button>
            <button type="button" className={selectedTrack === "reading" ? "selected" : ""} aria-pressed={selectedTrack === "reading"} onClick={() => setSelectedTrack("reading")}>
              <span>Aa</span><div><strong>Comprensión lectora</strong><small>9 módulos</small></div>
            </button>
          </fieldset>

          <fieldset className="payment-options demo-methods">
            <legend>Opciones de pago — demostración visual</legend>
            <label className="payment-option selected">
              <input type="radio" name="payment" defaultChecked />
              <span className="payment-icon crypto" aria-hidden="true">₿</span>
              <span><strong>Cripto</strong><small>Opción prevista con Binance</small></span>
              <i aria-hidden="true">✓</i>
            </label>
            <label className="payment-option disabled" aria-disabled="true">
              <input type="radio" name="payment" disabled />
              <span className="payment-icon" aria-hidden="true">P</span>
              <span><strong>PSE</strong><small>Próximamente</small></span>
              <b>NO DISPONIBLE</b>
            </label>
            <label className="payment-option disabled" aria-disabled="true">
              <input type="radio" name="payment" disabled />
              <span className="payment-icon" aria-hidden="true">▰</span>
              <span><strong>Tarjeta de crédito</strong><small>Próximamente</small></span>
              <b>NO DISPONIBLE</b>
            </label>
          </fieldset>

          <div className="demo-payment-notice">
            <strong>Sin proceso de cobro</strong>
            <p>Esta pantalla no crea órdenes, no solicita billeteras y no realiza transferencias. Las opciones anteriores son únicamente una maqueta.</p>
          </div>

          <button className="payment-continue" type="button" onClick={() => onContinue("start", selectedTrack)}>
            Avanzar sin pagar al curso <span aria-hidden="true">→</span>
          </button>
          {hasSavedProgress && (
            <button className="continue-saved-course" type="button" onClick={() => onContinue("resume", savedTrack)}>
              Continuar donde iba
            </button>
          )}
        </aside>
      </section>
    </main>
  );
}
