import type { Metadata } from "next";
import { CourseV2Page } from "@/components/course-v2/CourseV2Page";

export const metadata: Metadata = {
  title: "Curso | Entrena UdeA",
  description: "Curso progresivo de razonamiento lógico y comprensión lectora con explicaciones, ejemplos y práctica tipo UdeA.",
};

export default function CourseRoute() {
  return <CourseV2Page />;
}
