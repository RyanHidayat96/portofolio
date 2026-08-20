import type { ArchitectureEdge, ArchitectureMap, ArchitectureNode } from "./types";
import { architectureMap, architecturePresets as presetData } from "./portfolio-content";

const typedArchitectureMap: ArchitectureMap = architectureMap;

export const architectureNodes = typedArchitectureMap.nodes;
export const architectureEdges = typedArchitectureMap.edges;
export const architecturePresets = presetData;

export function findArchitectureNode(
  nodeId: string,
  nodes: readonly ArchitectureNode[] = architectureNodes
): ArchitectureNode | undefined {
  return nodes.find((node) => node.id === nodeId);
}

export function getConnectedArchitectureNodeIds(
  nodeId: string,
  edges: readonly ArchitectureEdge[] = architectureEdges
): readonly string[] {
  return edges
    .filter((edge) => edge.source === nodeId || edge.target === nodeId)
    .flatMap((edge) => (edge.source === nodeId ? [edge.target] : [edge.source]));
}
