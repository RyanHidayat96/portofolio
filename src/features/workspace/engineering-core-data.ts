import { fullCycleNodes } from "@/data/capabilities";
import type { FullCycleNode } from "@/data/types";

export type EngineeringCoreNodeId = "frontend" | "api" | "backend" | "test" | "database" | "cicd";
export type EngineeringCoreNodeTone = "build" | "quality" | "data" | "ship";

export interface EngineeringCoreNode {
  readonly id: EngineeringCoreNodeId;
  readonly sourceId: FullCycleNode["id"];
  readonly label: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly technologies: readonly string[];
  readonly tone: EngineeringCoreNodeTone;
  readonly x: number;
  readonly y: number;
  readonly position: readonly [number, number, number];
}

export interface EngineeringCoreEdge {
  readonly id: string;
  readonly source: EngineeringCoreNodeId;
  readonly target: EngineeringCoreNodeId;
}

const fullCycleNodeById = new Map<FullCycleNode["id"], FullCycleNode>(
  fullCycleNodes.map((node) => [node.id, node])
);

export const engineeringCoreNodes: readonly EngineeringCoreNode[] = [
  createEngineeringCoreNode({
    id: "frontend",
    sourceId: "frontend",
    label: "FRONTEND",
    eyebrow: "Screens / forms / UX",
    title: "Frontend workflow surfaces",
    tone: "build",
    x: 50,
    y: 14,
    position: [0, 1.9, 0.36]
  }),
  createEngineeringCoreNode({
    id: "api",
    sourceId: "api",
    label: "API",
    eyebrow: "Contracts / routes",
    title: "API boundaries and contracts",
    tone: "build",
    x: 30,
    y: 38,
    position: [-1.85, 0.55, 0.04]
  }),
  createEngineeringCoreNode({
    id: "backend",
    sourceId: "backend",
    label: "BACKEND",
    eyebrow: "Services / auth / logic",
    title: "Backend service logic",
    tone: "build",
    x: 70,
    y: 38,
    position: [1.85, 0.55, 0.04]
  }),
  createEngineeringCoreNode({
    id: "test",
    sourceId: "quality",
    label: "TEST",
    eyebrow: "Automation / performance",
    title: "Quality pressure layer",
    tone: "quality",
    x: 30,
    y: 64,
    position: [-1.85, -0.95, 0.42]
  }),
  createEngineeringCoreNode({
    id: "database",
    sourceId: "data",
    label: "DATABASE",
    eyebrow: "SQL / modeling / storage",
    title: "Data persistence and validation",
    tone: "data",
    x: 50,
    y: 84,
    position: [0, -2.05, -0.12]
  }),
  createEngineeringCoreNode({
    id: "cicd",
    sourceId: "cicd",
    label: "CI/CD",
    eyebrow: "Docker / runners / gates",
    title: "Delivery signal pipeline",
    tone: "ship",
    x: 72,
    y: 80,
    position: [2.05, -1.82, 0.3]
  })
] as const;

export const engineeringCoreEdges: readonly EngineeringCoreEdge[] = [
  { id: "frontend-api", source: "frontend", target: "api" },
  { id: "frontend-backend", source: "frontend", target: "backend" },
  { id: "api-backend", source: "api", target: "backend" },
  { id: "api-test", source: "api", target: "test" },
  { id: "backend-database", source: "backend", target: "database" },
  { id: "test-database", source: "test", target: "database" },
  { id: "test-cicd", source: "test", target: "cicd" },
  { id: "database-cicd", source: "database", target: "cicd" }
] as const;

export function getEngineeringCoreNode(id: EngineeringCoreNodeId): EngineeringCoreNode {
  return engineeringCoreNodes.find((node) => node.id === id) ?? engineeringCoreNodes[0];
}

export function isEngineeringCoreEdgeActive(
  edge: EngineeringCoreEdge,
  activeNodeId: EngineeringCoreNodeId
): boolean {
  return edge.source === activeNodeId || edge.target === activeNodeId;
}

function createEngineeringCoreNode(
  input: Readonly<{
    id: EngineeringCoreNodeId;
    sourceId: FullCycleNode["id"];
    label: string;
    eyebrow: string;
    title: string;
    tone: EngineeringCoreNodeTone;
    x: number;
    y: number;
    position: readonly [number, number, number];
  }>
): EngineeringCoreNode {
  const sourceNode = fullCycleNodeById.get(input.sourceId);

  return {
    ...input,
    description: sourceNode?.description ?? `${input.label} layer in the engineering core.`,
    technologies: sourceNode?.technologies.slice(0, 5) ?? []
  };
}
