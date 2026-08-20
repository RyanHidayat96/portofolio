import { parseJsonEnv } from "./env";
import type { ProjectCaseStudy } from "./types";

export const projects: readonly ProjectCaseStudy[] = parseJsonEnv<readonly ProjectCaseStudy[]>(
  process.env.NEXT_PUBLIC_RYANOS_PROJECTS_JSON,
  "NEXT_PUBLIC_RYANOS_PROJECTS_JSON",
  []
);
