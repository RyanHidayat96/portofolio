import { parseJsonEnv } from "./env";
import type { ArchitectureMap, ArchitectureNode } from "./types";

const architectureMap = parseJsonEnv<ArchitectureMap>(
  process.env.NEXT_PUBLIC_RYANOS_ARCHITECTURE_JSON,
  "NEXT_PUBLIC_RYANOS_ARCHITECTURE_JSON",
  { nodes: [], edges: [] }
);

export const architectureNodes = architectureMap.nodes;
export const architectureEdges = architectureMap.edges;

export function findArchitectureNode(nodeId: string): ArchitectureNode | undefined {
  return architectureNodes.find((node) => node.id === nodeId);
}

export function getConnectedArchitectureNodeIds(nodeId: string): readonly string[] {
  return architectureEdges
    .filter((edge) => edge.source === nodeId || edge.target === nodeId)
    .flatMap((edge) => (edge.source === nodeId ? [edge.target] : [edge.source]));
}
