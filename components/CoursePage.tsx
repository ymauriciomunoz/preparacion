"use client";

import { useEffect, useState } from "react";
import type { CourseTrack } from "@/types/course";
import { CourseExperience } from "./CourseExperience";

export function CoursePage() {
  const [entry, setEntry] = useState<{ track: CourseTrack; mode: "resume" | "start" } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const track: CourseTrack = params.get("track") === "reading" ? "reading" : "math";
    const mode = params.get("mode") === "start" ? "start" : "resume";
    const frame = window.requestAnimationFrame(() => setEntry({ track, mode }));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!entry) {
    return <main className="course-loading" aria-live="polite">Recuperando tu curso…</main>;
  }

  return (
    <CourseExperience
      initialTrack={entry.track}
      entryMode={entry.mode}
      onExit={() => window.location.assign("/")}
    />
  );
}
