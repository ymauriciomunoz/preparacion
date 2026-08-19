"use client";

import { useEffect, useRef, useState } from "react";
import { EXAM_DURATION_SECONDS, formatClock } from "@/lib/exam-utils";
import type { ExamMode } from "@/types/exam";

interface ExamTimerProps {
  mode: ExamMode;
  startedAt: number;
  onStrictExpired: () => void;
}

export function ExamTimer({ mode, startedAt, onStrictExpired }: ExamTimerProps) {
  const [now, setNow] = useState(() => Date.now());
  const didExpire = useRef(false);
  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const remaining = Math.max(0, EXAM_DURATION_SECONDS - elapsed);
  const overtime = Math.max(0, elapsed - EXAM_DURATION_SECONDS);
  const isOvertime = elapsed >= EXAM_DURATION_SECONDS;

  useEffect(() => {
    didExpire.current = false;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  useEffect(() => {
    if (mode === "strict" && remaining === 0 && !didExpire.current) {
      didExpire.current = true;
      onStrictExpired();
    }
  }, [mode, onStrictExpired, remaining]);

  return (
    <div className={`exam-timer ${isOvertime ? "overtime" : ""}`} aria-label={isOvertime ? `Tiempo adicional ${formatClock(overtime)}` : `Tiempo restante ${formatClock(remaining)}`}>
      <span className="timer-dot" aria-hidden="true" />
      <span>
        <small>{isOvertime ? "Tiempo adicional" : "Tiempo restante"}</small>
        <strong>{isOvertime ? `+${formatClock(overtime)}` : formatClock(remaining)}</strong>
      </span>
    </div>
  );
}
