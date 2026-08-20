import { parseJsonEnv } from "./env";
import type { ExperienceRole } from "./types";

export const experience: readonly ExperienceRole[] = parseJsonEnv<readonly ExperienceRole[]>(
  process.env.NEXT_PUBLIC_RYANOS_EXPERIENCE_JSON,
  "NEXT_PUBLIC_RYANOS_EXPERIENCE_JSON",
  []
);
