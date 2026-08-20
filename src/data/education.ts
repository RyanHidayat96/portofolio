import { parseJsonEnv } from "./env";
import type { EducationCredential } from "./types";

export const education: readonly EducationCredential[] = parseJsonEnv<
  readonly EducationCredential[]
>(process.env.NEXT_PUBLIC_RYANOS_EDUCATION_JSON, "NEXT_PUBLIC_RYANOS_EDUCATION_JSON", []);
