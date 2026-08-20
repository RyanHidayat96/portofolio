import { parseJsonEnv } from "./env";
import type { Branding } from "./types";

const fallbackBranding: Branding = {
  appName: "Portfolio",
  workspaceLabel: "Workspace",
  heroStatementLead: "Portfolio content not configured.",
  heroStatementAccent: "Set NEXT_PUBLIC_RYANOS_BRANDING_JSON in .env.",
  metadataDescription: "Configured portfolio workspace.",
  openGraphBadge: "Engineering portfolio",
  openGraphHighlights: [],
  twitterDescription: "Configured portfolio workspace."
};

export const branding: Branding = parseJsonEnv<Branding>(
  process.env.NEXT_PUBLIC_RYANOS_BRANDING_JSON,
  "NEXT_PUBLIC_RYANOS_BRANDING_JSON",
  fallbackBranding
);
