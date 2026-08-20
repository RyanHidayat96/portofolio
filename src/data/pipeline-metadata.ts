import { parseJsonEnv } from "./env";
import type { PipelinePanelMetadata } from "./types";

export const pipelinePanelMetadata: PipelinePanelMetadata = parseJsonEnv<PipelinePanelMetadata>(
  process.env.NEXT_PUBLIC_RYANOS_PIPELINE_PANEL_JSON,
  "NEXT_PUBLIC_RYANOS_PIPELINE_PANEL_JSON",
  {
    eyebrow: "workflow.demo",
    title: "CI/CD Pipeline Simulator",
    description: "Simulation only. Shows quality gate decisions; no deployment runs here.",
    stack: [],
    flow: ["Commit", "Build", "Unit Test", "Automation Test", "Performance Check", "Gate", "Deploy"]
  }
);
