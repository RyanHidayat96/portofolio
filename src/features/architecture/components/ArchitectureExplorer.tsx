"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import {
  architectureEdges,
  architectureNodes,
  findArchitectureNode,
  getConnectedArchitectureNodeIds
} from "@/data/architecture";
import type { ArchitectureEdge, ArchitectureNode } from "@/data/types";
import { cn } from "@/lib/cn";
import { Network } from "lucide-react";
import { useMemo, useState } from "react";

export function ArchitectureExplorer(): React.ReactElement {
  const [selectedId, setSelectedId] = useState(architectureNodes[0]?.id ?? "");
  const selectedNode =
    architectureNodes.find((node) => node.id === selectedId) ?? architectureNodes[0];
  const connectedNodeIds = useMemo(() => getConnectedArchitectureNodeIds(selectedId), [selectedId]);
  const connectedNodes = connectedNodeIds
    .map((nodeId) => findArchitectureNode(nodeId))
    .filter((node): node is ArchitectureNode => Boolean(node));

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel className="overflow-hidden p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <Network className="text-[#55d7ff]" aria-hidden="true" size={22} />
          <div>
            <p className="mono text-sm text-[#55d7ff]">architecture.visualization</p>
            <h1 className="mt-1 text-2xl font-semibold">Quality Engineering Topology</h1>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto pb-2">
          <div
            className="relative min-h-[620px] min-w-[720px] border border-[var(--border)] bg-[#090d14]"
            aria-label="Architecture topology map"
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="architecture-arrow"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="4"
                  markerHeight="4"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#55d7ff" opacity="0.9" />
                </marker>
              </defs>
              {architectureEdges.map((edge) => (
                <TopologyEdge
                  key={edge.id}
                  edge={edge}
                  isActive={edge.source === selectedId || edge.target === selectedId}
                />
              ))}
            </svg>

            <div className="absolute inset-0">
              {architectureNodes.map((node) => (
                <TopologyNodeButton
                  key={node.id}
                  node={node}
                  isSelected={node.id === selectedId}
                  isConnected={connectedNodeIds.includes(node.id)}
                  onSelect={() => setSelectedId(node.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-5 sm:p-7">
        {selectedNode ? (
          <TopologyDetails
            node={selectedNode}
            connectedNodes={connectedNodes}
            onSelectNode={setSelectedId}
          />
        ) : (
          <p>No architecture data configured.</p>
        )}
      </Panel>
    </div>
  );
}

function TopologyEdge({
  edge,
  isActive
}: Readonly<{
  edge: ArchitectureEdge;
  isActive: boolean;
}>): React.ReactElement | null {
  const source = findArchitectureNode(edge.source);
  const target = findArchitectureNode(edge.target);

  if (!source || !target) {
    return null;
  }

  return (
    <g>
      <line
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        className={cn("motion-safe:transition", isActive ? "stroke-[#55d7ff]" : "stroke-[#2e3a4d]")}
        strokeWidth={isActive ? 0.45 : 0.28}
        strokeDasharray={isActive ? "0" : "1.2 1.1"}
        markerEnd={isActive ? "url(#architecture-arrow)" : undefined}
      />
    </g>
  );
}

function TopologyNodeButton({
  node,
  isSelected,
  isConnected,
  onSelect
}: Readonly<{
  node: ArchitectureNode;
  isSelected: boolean;
  isConnected: boolean;
  onSelect: () => void;
}>): React.ReactElement {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`${node.label} architecture node`}
      onClick={onSelect}
      className={cn(
        "absolute min-h-20 w-36 -translate-x-1/2 -translate-y-1/2 border p-3 text-left shadow-[0_18px_50px_rgba(0,0,0,0.3)] motion-safe:transition motion-safe:duration-200",
        isSelected
          ? "border-[#55d7ff] bg-[#55d7ff]/18 text-[#eef5ff]"
          : isConnected
            ? "border-[#6ee7a8]/60 bg-[#6ee7a8]/12 text-[#eef5ff]"
            : "border-[var(--border)] bg-[#10141d] text-[#c8d4e6] hover:border-[#55d7ff]/60"
      )}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
    >
      <span className="mono block text-[10px] uppercase text-[#8a96a8]">{node.layer}</span>
      <span className="mt-2 block text-sm font-semibold leading-5">{node.label}</span>
      <span className={cn("mt-2 block h-1.5 w-10", isSelected ? "bg-[#55d7ff]" : "bg-[#2e3a4d]")} />
    </button>
  );
}

function TopologyDetails({
  node,
  connectedNodes,
  onSelectNode
}: Readonly<{
  node: ArchitectureNode;
  connectedNodes: readonly ArchitectureNode[];
  onSelectNode: (nodeId: string) => void;
}>): React.ReactElement {
  return (
    <>
      <Badge tone="info">{node.layer}</Badge>
      <h2 className="mt-4 text-2xl font-semibold">{node.label}</h2>
      <p className="mt-4 leading-7 text-[#b7c2d2]">{node.purpose}</p>

      <section className="mt-7">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a96a8]">
          Connected Nodes
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {connectedNodes.map((connectedNode) => (
            <Button
              key={connectedNode.id}
              variant="ghost"
              className="min-h-8 px-3 py-1 text-xs"
              onClick={() => onSelectNode(connectedNode.id)}
            >
              {connectedNode.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a96a8]">
          Related Skills
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {node.relatedSkills.map((skill) => (
            <Badge key={skill} tone="success">
              {skill}
            </Badge>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a96a8]">
          Engineering Highlights
        </h3>
        <div className="mt-3 grid gap-2">
          {node.relatedProjects.map((project) => (
            <div key={project} className="border border-[var(--border)] bg-[#0b0f16] p-3 text-sm">
              {project}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
