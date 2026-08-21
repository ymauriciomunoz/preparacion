"use client";

import { useEffect, useState } from "react";
import type { CourseTrack } from "@/types/course";
import { CourseV2Experience } from "./CourseV2Experience";

export function CourseV2Page() {
  const [request, setRequest] = useState<{ track: CourseTrack; mode: "start" | "resume" } | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const track: CourseTrack = params.get("track") === "reading" ? "reading" : "math";
    const mode = params.get("mode") === "start" ? "start" : "resume";
    const frame = window.requestAnimationFrame(() => setRequest({ track, mode }));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return request
    ? <CourseV2Experience initialTrack={request.track} entryMode={request.mode} />
    : <main className="course-v2-loading">Preparando el curso…</main>;
}
