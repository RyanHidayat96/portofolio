import { parseJsonEnv } from "./env";
import type { ChallengeScenario } from "./types";

export const challengeScenarios: readonly ChallengeScenario[] = parseJsonEnv<
  readonly ChallengeScenario[]
>(process.env.NEXT_PUBLIC_RYANOS_CHALLENGES_JSON, "NEXT_PUBLIC_RYANOS_CHALLENGES_JSON", []);
