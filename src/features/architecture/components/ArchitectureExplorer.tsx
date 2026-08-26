"use client";

import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import {
  architecturePresets,
  findArchitectureNode,
  getConnectedArchitectureNodeIds
} from "@/data/architecture";
import type { ArchitectureEdge, ArchitectureNode, ArchitecturePresetId } from "@/data/types";
import { ArrowRight, Boxes, GitBranch, Layers3, Network } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

const emptyArchitectureNodes: readonly ArchitectureNode[] = [];
const emptyArchitectureEdges: readonly ArchitectureEdge[] = [];

type NodeStatus = "selected" | "connected" | "idle";

type NodeStyle = CSSProperties & {
  readonly "--node-x": string;
  readonly "--node-y": string;
  readonly "--node-depth": string;
};

const presetMeta: Record<
  ArchitecturePresetId,
  { readonly label: string; readonly icon: typeof Boxes }
> = {
  "full-stack-application": { label: "Build", icon: Boxes },
  "quality-engineering": { label: "Quality", icon: Layers3 },
  "cicd-delivery": { label: "Ship", icon: GitBranch }
};

export function ArchitectureExplorer(): React.ReactElement {
  const [presetId, setPresetId] = useState<ArchitecturePresetId>(
    architecturePresets[0]?.id ?? "full-stack-application"
  );
  const activePreset = architecturePresets.find((preset) => preset.id === presetId);
  const activeNodes = activePreset?.nodes ?? emptyArchitectureNodes;
  const activeEdges = activePreset?.edges ?? emptyArchitectureEdges;
  const [selectedId, setSelectedId] = useState(activeNodes[0]?.id ?? "");
  const selectedNode = activeNodes.find((node) => node.id === selectedId) ?? activeNodes[0];

  const connectedNodeIds = useMemo(
    () => (selectedNode ? getConnectedArchitectureNodeIds(selectedNode.id, activeEdges) : []),
    [activeEdges, selectedNode]
  );
  const connectedNodes = useMemo(
    () =>
      connectedNodeIds
        .map((nodeId) => findArchitectureNode(nodeId, activeNodes))
        .filter((node): node is ArchitectureNode => Boolean(node)),
    [activeNodes, connectedNodeIds]
  );
  const activeConnections = useMemo(
    () =>
      selectedNode
        ? activeEdges.filter(
            (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id
          )
        : [],
    [activeEdges, selectedNode]
  );
  const activeEdgeIds = useMemo(
    () => new Set(activeConnections.map((edge) => edge.id)),
    [activeConnections]
  );

  const selectPreset = (nextPresetId: ArchitecturePresetId): void => {
    const nextPreset = architecturePresets.find((preset) => preset.id === nextPresetId);
    setPresetId(nextPresetId);
    setSelectedId(nextPreset?.nodes[0]?.id ?? "");
  };

  const selectNodeByOffset = (currentNodeId: string, offset: number): void => {
    if (activeNodes.length === 0) {
      return;
    }

    const currentIndex = activeNodes.findIndex((node) => node.id === currentNodeId);
    const nextIndex = (currentIndex + offset + activeNodes.length) % activeNodes.length;
    const nextNode = activeNodes[nextIndex];

    if (!nextNode) {
      return;
    }

    setSelectedId(nextNode.id);
    window.requestAnimationFrame(() =>
      document.getElementById(`architecture-node-${nextNode.id}`)?.focus()
    );
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

  const onNodeKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentNodeId: string
  ): void => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    selectNodeByOffset(
      currentNodeId,
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1
    );
  };

  return (
    <div className="architecture-explorer">
      <Panel className="architecture-stage-panel">
        <header className="architecture-header">
          <div className="architecture-heading">
            <span className="architecture-heading-icon" aria-hidden="true">
              <Network size={22} />
            </span>
            <div>
              <p className="eyebrow">architecture.presets</p>
              <h1>{activePreset?.title ?? "Architecture Explorer"}</h1>
              <p>
                {activePreset?.description ??
                  "Architecture data is not configured for this workspace."}
              </p>
            </div>
          </div>

          <div className="architecture-presets" role="tablist" aria-label="Architecture presets">
            {architecturePresets.map((preset) => {
              const isActive = preset.id === presetId;
              const meta = presetMeta[preset.id];
              const Icon = meta.icon;

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
                  className="architecture-preset-button"
                  data-active={isActive}
                >
                  <Icon aria-hidden="true" size={16} />
                  <span>{meta.label}</span>
                  <strong>{preset.title}</strong>
                </button>
              );
            })}
          </div>
        </header>

        <div
          id="architecture-topology-panel"
          role="tabpanel"
          aria-labelledby={`architecture-preset-${presetId}`}
          className="architecture-topology-panel"
        >
          <div className="architecture-mobile-list" aria-label="Architecture nodes">
            {activeNodes.map((node) => {
              const status = getNodeStatus(node, selectedNode, connectedNodeIds);

              return (
                <MobileNodeButton
                  key={node.id}
                  node={node}
                  status={status}
                  onSelect={() => setSelectedId(node.id)}
                />
              );
            })}
          </div>

          <div className="architecture-map-shell">
            <div
              className="architecture-map"
              data-preset={presetId}
              aria-label="Architecture topology map"
            >
              <div className="architecture-plane architecture-plane-back" aria-hidden="true" />
              <div className="architecture-plane architecture-plane-mid" aria-hidden="true" />
              <div className="architecture-plane architecture-plane-front" aria-hidden="true" />

              <svg
                className="architecture-edges"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="architecture-arrow-active"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="4"
                    markerHeight="4"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                </defs>
                {activeEdges.map((edge) => (
                  <TopologyEdge
                    key={edge.id}
                    edge={edge}
                    nodes={activeNodes}
                    isActive={activeEdgeIds.has(edge.id)}
                  />
                ))}
              </svg>

              <div className="architecture-nodes">
                {activeNodes.map((node) => (
                  <TopologyNodeButton
                    key={node.id}
                    node={node}
                    status={getNodeStatus(node, selectedNode, connectedNodeIds)}
                    onSelect={() => setSelectedId(node.id)}
                    onKeyDown={(event) => onNodeKeyDown(event, node.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="architecture-details-panel">
        {selectedNode ? (
          <TopologyDetails
            node={selectedNode}
            nodes={activeNodes}
            connections={activeConnections}
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

function getNodeStatus(
  node: ArchitectureNode,
  selectedNode: ArchitectureNode | undefined,
  connectedNodeIds: readonly string[]
): NodeStatus {
  if (node.id === selectedNode?.id) {
    return "selected";
  }

  if (connectedNodeIds.includes(node.id)) {
    return "connected";
  }

  return "idle";
}

function getNodeStyle(node: ArchitectureNode): NodeStyle {
  return {
    "--node-x": `${node.x}%`,
    "--node-y": `${node.y}%`,
    "--node-depth": `${Math.round((node.y - 50) * 1.1)}px`
  };
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

  const controlOffset = Math.max(7, Math.abs(source.y - target.y) * 0.22);
  const path = `M ${source.x} ${source.y} C ${source.x} ${source.y + controlOffset}, ${target.x} ${target.y - controlOffset}, ${target.x} ${target.y}`;
  const labelX = (source.x + target.x) / 2;
  const labelY = (source.y + target.y) / 2;

  return (
    <g className="architecture-edge" data-active={isActive}>
      <path d={path} markerEnd={isActive ? "url(#architecture-arrow-active)" : undefined} />
      {isActive ? (
        <text x={labelX} y={labelY} textAnchor="middle">
          {edge.label}
        </text>
      ) : null}
    </g>
  );
}

function TopologyNodeButton({
  node,
  status,
  onSelect,
  onKeyDown
}: Readonly<{
  node: ArchitectureNode;
  status: NodeStatus;
  onSelect: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}>): React.ReactElement {
  return (
    <button
      id={`architecture-node-${node.id}`}
      type="button"
      aria-pressed={status === "selected"}
      aria-label={`${node.label} architecture node`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className="architecture-node"
      data-status={status}
      style={getNodeStyle(node)}
    >
      <span>{node.layer}</span>
      <strong>{node.label}</strong>
    </button>
  );
}

function MobileNodeButton({
  node,
  status,
  onSelect
}: Readonly<{
  node: ArchitectureNode;
  status: NodeStatus;
  onSelect: () => void;
}>): React.ReactElement {
  return (
    <button
      type="button"
      aria-pressed={status === "selected"}
      onClick={onSelect}
      className="architecture-mobile-node"
      data-status={status}
    >
      <span>{node.layer}</span>
      <strong>{node.label}</strong>
      <small>{node.purpose}</small>
    </button>
  );
}

function TopologyDetails({
  node,
  nodes,
  connections,
  connectedNodes,
  onSelectNode
}: Readonly<{
  node: ArchitectureNode;
  nodes: readonly ArchitectureNode[];
  connections: readonly ArchitectureEdge[];
  connectedNodes: readonly ArchitectureNode[];
  onSelectNode: (nodeId: string) => void;
}>): React.ReactElement {
  return (
    <div className="architecture-details">
      <div className="architecture-details-kicker">
        <Badge tone="info">{node.layer}</Badge>
        <span>{node.id}</span>
      </div>
      <h2>{node.label}</h2>
      <p>{node.purpose}</p>

      <section className="architecture-detail-section">
        <h3>Dependency Path</h3>
        <div className="architecture-path-list">
          {connections.length > 0 ? (
            connections.map((connection) => (
              <ConnectionRow key={connection.id} connection={connection} nodes={nodes} />
            ))
          ) : (
            <p>No connected edges configured.</p>
          )}
        </div>
      </section>

      <section className="architecture-detail-section">
        <h3>Connected Nodes</h3>
        <div className="architecture-connected-list">
          {connectedNodes.length > 0 ? (
            connectedNodes.map((connectedNode) => (
              <button
                key={connectedNode.id}
                type="button"
                className="architecture-connected-button"
                onClick={() => onSelectNode(connectedNode.id)}
              >
                {connectedNode.label}
              </button>
            ))
          ) : (
            <p>No connected nodes configured.</p>
          )}
        </div>
      </section>

      <section className="architecture-detail-section">
        <h3>Related Skills</h3>
        <div className="architecture-badge-list">
          {node.relatedSkills.map((skill) => (
            <Badge key={skill} tone="success">
              {skill}
            </Badge>
          ))}
        </div>
      </section>

      <section className="architecture-detail-section">
        <h3>Engineering Highlights</h3>
        <div className="architecture-project-list">
          {node.relatedProjects.map((project) => (
            <div key={project}>{project}</div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ConnectionRow({
  connection,
  nodes
}: Readonly<{
  connection: ArchitectureEdge;
  nodes: readonly ArchitectureNode[];
}>): React.ReactElement | null {
  const source = findArchitectureNode(connection.source, nodes);
  const target = findArchitectureNode(connection.target, nodes);

  if (!source || !target) {
    return null;
  }

  return (
    <div className="architecture-path-row">
      <span>{source.label}</span>
      <ArrowRight aria-hidden="true" size={15} />
      <strong>{connection.label}</strong>
      <ArrowRight aria-hidden="true" size={15} />
      <span>{target.label}</span>
    </div>
  );
}
