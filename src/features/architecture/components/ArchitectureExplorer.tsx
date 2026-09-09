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

interface TopologyStats {
  readonly nodes: number;
  readonly edges: number;
  readonly activeConnections: number;
  readonly relatedSkills: number;
  readonly relatedProjects: number;
}

const presetMeta: Record<
  ArchitecturePresetId,
  { readonly label: string; readonly icon: typeof Boxes }
> = {
  "full-stack-application": { label: "Build", icon: Boxes },
  "quality-engineering": { label: "Quality", icon: Layers3 },
  "cicd-delivery": { label: "Ship", icon: GitBranch }
};

const topologyNodeBounds = {
  halfWidth: 10.4,
  halfHeight: 6.8
};

interface TopologyPoint {
  readonly x: number;
  readonly y: number;
}

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
  const topologyStats = useMemo(
    () => getTopologyStats(activeNodes, activeEdges, activeConnections, connectedNodes),
    [activeNodes, activeEdges, activeConnections, connectedNodes]
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
    if (event.key === "Home") {
      event.preventDefault();
      const firstPreset = architecturePresets[0];
      if (firstPreset) {
        selectPreset(firstPreset.id);
        window.requestAnimationFrame(() =>
          document.getElementById(`architecture-preset-${firstPreset.id}`)?.focus()
        );
      }
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastPreset = architecturePresets.at(-1);
      if (lastPreset) {
        selectPreset(lastPreset.id);
        window.requestAnimationFrame(() =>
          document.getElementById(`architecture-preset-${lastPreset.id}`)?.focus()
        );
      }
      return;
    }

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
                  tabIndex={isActive ? 0 : -1}
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
                    markerWidth="5.2"
                    markerHeight="5.2"
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
            stats={topologyStats}
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

function getNodeEdgeAnchor(node: ArchitectureNode, toward: ArchitectureNode): TopologyPoint {
  const deltaX = toward.x - node.x;
  const deltaY = toward.y - node.y;

  if (deltaX === 0 && deltaY === 0) {
    return { x: node.x, y: node.y };
  }

  const scaleX =
    deltaX === 0 ? Number.POSITIVE_INFINITY : topologyNodeBounds.halfWidth / Math.abs(deltaX);
  const scaleY =
    deltaY === 0 ? Number.POSITIVE_INFINITY : topologyNodeBounds.halfHeight / Math.abs(deltaY);
  const edgeScale = Math.min(scaleX, scaleY);

  return {
    x: node.x + deltaX * edgeScale,
    y: node.y + deltaY * edgeScale
  };
}

function formatTopologyCoordinate(value: number): string {
  return Number(value.toFixed(2)).toString();
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

  const sourceAnchor = getNodeEdgeAnchor(source, target);
  const targetAnchor = getNodeEdgeAnchor(target, source);
  const controlOffset = Math.max(4, Math.abs(sourceAnchor.y - targetAnchor.y) * 0.22);
  const verticalDirection = targetAnchor.y >= sourceAnchor.y ? 1 : -1;
  const path = [
    `M ${formatTopologyCoordinate(sourceAnchor.x)} ${formatTopologyCoordinate(sourceAnchor.y)}`,
    `C ${formatTopologyCoordinate(sourceAnchor.x)} ${formatTopologyCoordinate(
      sourceAnchor.y + controlOffset * verticalDirection
    )}`,
    `${formatTopologyCoordinate(targetAnchor.x)} ${formatTopologyCoordinate(
      targetAnchor.y - controlOffset * verticalDirection
    )}`,
    `${formatTopologyCoordinate(targetAnchor.x)} ${formatTopologyCoordinate(targetAnchor.y)}`
  ].join(" ");
  const labelX = (sourceAnchor.x + targetAnchor.x) / 2;
  const labelY = (sourceAnchor.y + targetAnchor.y) / 2;

  return (
    <g className="architecture-edge" data-active={isActive} data-edge-id={edge.id}>
      <path className="architecture-edge-glow" d={path} />
      <path
        className="architecture-edge-line"
        d={path}
        markerEnd={isActive ? "url(#architecture-arrow-active)" : undefined}
      />
      {isActive ? (
        <text
          className="architecture-edge-label"
          x={formatTopologyCoordinate(labelX)}
          y={formatTopologyCoordinate(labelY)}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={
            "SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace"
          }
          fontSize={2.2}
          fontWeight={800}
          letterSpacing="0.06em"
          fill="var(--accent)"
          stroke="var(--surface-deeper)"
          strokeWidth={0.9}
          paintOrder="stroke"
        >
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
      data-cursor-intent="node"
      data-cursor-label="NODE"
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
      aria-label={`Select ${node.label} architecture node`}
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
  stats,
  onSelectNode
}: Readonly<{
  node: ArchitectureNode;
  nodes: readonly ArchitectureNode[];
  connections: readonly ArchitectureEdge[];
  connectedNodes: readonly ArchitectureNode[];
  stats: TopologyStats;
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

      <TopologySignalGrid stats={stats} />

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
                aria-label={`Select connected architecture node ${connectedNode.label}`}
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

function TopologySignalGrid({
  stats
}: Readonly<{ stats: TopologyStats }>): React.ReactElement {
  return (
    <section className="architecture-signal-grid" aria-label="Architecture topology signals">
      <TopologySignal label="nodes" value={stats.nodes.toString()} />
      <TopologySignal label="edges" value={stats.edges.toString()} />
      <TopologySignal label="active paths" value={stats.activeConnections.toString()} />
      <TopologySignal label="skills" value={stats.relatedSkills.toString()} />
      <TopologySignal label="projects" value={stats.relatedProjects.toString()} />
    </section>
  );
}

function TopologySignal({
  label,
  value
}: Readonly<{ label: string; value: string }>): React.ReactElement {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function getTopologyStats(
  nodes: readonly ArchitectureNode[],
  edges: readonly ArchitectureEdge[],
  activeConnections: readonly ArchitectureEdge[],
  connectedNodes: readonly ArchitectureNode[]
): TopologyStats {
  return {
    nodes: nodes.length,
    edges: edges.length,
    activeConnections: activeConnections.length,
    relatedSkills: new Set(connectedNodes.flatMap((node) => node.relatedSkills)).size,
    relatedProjects: new Set(connectedNodes.flatMap((node) => node.relatedProjects)).size
  };
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
