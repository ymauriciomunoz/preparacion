import type { CourseModuleV2 } from "@/types/course-v2";

export const v2Mastery = (checkpointId: string): CourseModuleV2["mastery"] => ({
  minCorrect: 4,
  checkpointId,
});
