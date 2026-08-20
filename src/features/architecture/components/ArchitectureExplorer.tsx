"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import {
  architecturePresets,
  findArchitectureNode,
  getConnectedArchitectureNodeIds
} from "@/data/architecture";
import type { ArchitectureEdge, ArchitectureNode, ArchitecturePresetId } from "@/data/types";
import { cn } from "@/lib/cn";
import { Network } from "lucide-react";
import { useMemo, useState } from "react";

export function ArchitectureExplorer(): React.ReactElement {
  const [presetId, setPresetId] = useState<ArchitecturePresetId>(
    architecturePresets[0]?.id ?? "full-stack-application"
  );
  const activePreset = architecturePresets.find((preset) => preset.id === presetId);
  const activeNodes = activePreset?.nodes ?? [];
  const activeEdges = activePreset?.edges ?? [];
  const [selectedId, setSelectedId] = useState(activeNodes[0]?.id ?? "");
  const selectedNode = activeNodes.find((node) => node.id === selectedId) ?? activeNodes[0];
  const connectedNodeIds = useMemo(
    () => getConnectedArchitectureNodeIds(selectedNode?.id ?? "", activeEdges),
    [activeEdges, selectedNode?.id]
  );
  const connectedNodes = connectedNodeIds
    .map((nodeId) => findArchitectureNode(nodeId, activeNodes))
    .filter((node): node is ArchitectureNode => Boolean(node));

  const selectPreset = (nextPresetId: ArchitecturePresetId): void => {
    const nextPreset = architecturePresets.find((preset) => preset.id === nextPresetId);
    setPresetId(nextPresetId);
    setSelectedId(nextPreset?.nodes[0]?.id ?? "");
  };

  const onPresetKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentPresetId: ArchitecturePresetId
  ): void => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const currentIndex = architecturePresets.findIndex((preset) => preset.id === currentPresetId);
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + architecturePresets.length) % architecturePresets.length;
    const nextPreset = architecturePresets[nextIndex];

    if (!nextPreset) {
      return;
    }

    selectPreset(nextPreset.id);
    window.requestAnimationFrame(() =>
      document.getElementById(`architecture-preset-${nextPreset.id}`)?.focus()
    );
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel className="overflow-hidden p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <Network className="text-[#55d7ff]" aria-hidden="true" size={22} />
            <div>
              <p className="mono text-sm text-[#55d7ff]">architecture.presets</p>
              <h1 className="mt-1 text-2xl font-semibold">
                {activePreset?.title ?? "Architecture Explorer"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8a96a8]">
                {activePreset?.description ??
                  "Architecture data is not configured for this workspace."}
              </p>
            </div>
          </div>

          <div
            className="grid gap-2 sm:grid-cols-3 lg:min-w-[430px]"
            role="tablist"
            aria-label="Architecture presets"
          >
            {architecturePresets.map((preset) => {
              const isActive = preset.id === presetId;

              return (
                <button
                  key={preset.id}
                  id={`architecture-preset-${preset.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="architecture-topology-panel"
                  onClick={() => selectPreset(preset.id)}
                  onKeyDown={(event) => onPresetKeyDown(event, preset.id)}
                  className={cn(
                    "min-h-[var(--touch-target)] rounded-[var(--radius-control)] border px-3 py-2 text-left transition",
                    isActive
                      ? "border-[#55d7ff]/70 bg-[#55d7ff]/14 text-[#eef5ff]"
                      : "border-[var(--border)] bg-[#10141d] text-[#8a96a8] hover:border-[#55d7ff]/50"
                  )}
                >
                  <span className="mono block text-[11px] uppercase">{preset.id}</span>
                  <span className="mt-1 block text-sm font-semibold">{preset.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          id="architecture-topology-panel"
          role="tabpanel"
          aria-labelledby={`architecture-preset-${presetId}`}
          className="mt-6"
        >
          <div className="grid gap-3 md:hidden" aria-label="Architecture nodes">
            {activeNodes.map((node) => {
              const isSelected = node.id === selectedNode?.id;

              return (
                <button
                  key={node.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(node.id)}
                  className={cn(
                    "min-h-[var(--touch-target)] rounded-[var(--radius-control)] border p-4 text-left transition",
                    isSelected
                      ? "border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
                  )}
                >
                  <span className="mono block text-xs uppercase text-[var(--accent)]">
                    {node.layer}
                  </span>
                  <span className="mt-2 block font-semibold">{node.label}</span>
                  <span className="mt-2 block text-sm leading-6">{node.purpose}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto pb-2 md:block">
            <div
              className="relative min-h-[620px] min-w-[720px] rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#090d14]"
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
                {activeEdges.map((edge) => (
                  <TopologyEdge
                    key={edge.id}
                    edge={edge}
                    nodes={activeNodes}
                    isActive={edge.source === selectedNode?.id || edge.target === selectedNode?.id}
                  />
                ))}
              </svg>

              <div className="absolute inset-0">
                {activeNodes.map((node) => (
                  <TopologyNodeButton
                    key={node.id}
                    node={node}
                    isSelected={node.id === selectedNode?.id}
                    isConnected={connectedNodeIds.includes(node.id)}
                    onSelect={() => setSelectedId(node.id)}
                  />
                ))}
              </div>
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
  nodes,
  isActive
}: Readonly<{
  edge: ArchitectureEdge;
  nodes: readonly ArchitectureNode[];
  isActive: boolean;
}>): React.ReactElement | null {
  const source = findArchitectureNode(edge.source, nodes);
  const target = findArchitectureNode(edge.target, nodes);

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
        "absolute min-h-20 w-36 -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-control)] border p-3 text-left shadow-[0_18px_50px_rgba(0,0,0,0.3)] motion-safe:transition motion-safe:duration-200",
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
          {connectedNodes.length > 0 ? (
            connectedNodes.map((connectedNode) => (
              <Button
                key={connectedNode.id}
                variant="ghost"
                className="px-3 py-1 text-xs"
                onClick={() => onSelectNode(connectedNode.id)}
              >
                {connectedNode.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-[#8a96a8]">No connected nodes configured.</p>
          )}
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
