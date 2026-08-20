import { parseJsonEnv } from "./env";
import type { SkillGroup } from "./types";

export const skillGroups: readonly SkillGroup[] = parseJsonEnv<readonly SkillGroup[]>(
  process.env.NEXT_PUBLIC_RYANOS_SKILLS_JSON,
  "NEXT_PUBLIC_RYANOS_SKILLS_JSON",
  []
);
