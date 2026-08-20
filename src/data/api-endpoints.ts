import { parseJsonEnv } from "./env";
import type { ApiEndpointDefinition } from "./types";

export const apiEndpoints: readonly ApiEndpointDefinition[] = parseJsonEnv<
  readonly ApiEndpointDefinition[]
>(process.env.NEXT_PUBLIC_RYANOS_API_ENDPOINTS_JSON, "NEXT_PUBLIC_RYANOS_API_ENDPOINTS_JSON", []);
