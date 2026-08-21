import type { CourseTrackV2 } from "@/types/course-v2";
import { mathModulesV2 } from "./math";
import { readingModulesV2 } from "./reading";

export const courseModulesV2 = [...mathModulesV2, ...readingModulesV2];

export const courseTracksV2: Record<"math" | "reading", CourseTrackV2> = {
  math: { label: "Razonamiento lógico", description: "De fundamentos numéricos a problemas tipo UdeA." },
  reading: { label: "Comprensión lectora", description: "De localizar información a evaluar y transferir ideas." },
};
