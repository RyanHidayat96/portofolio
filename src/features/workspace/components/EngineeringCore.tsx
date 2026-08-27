"use client";

import { Badge } from "@/components/ui/Badge";
import { useReducedMotion } from "@/features/interaction/hooks/useReducedMotion";
import {
  engineeringCoreEdges,
  engineeringCoreNodes,
  getEngineeringCoreNode,
  isEngineeringCoreEdgeActive
} from "@/features/workspace/engineering-core-data";
import type { EngineeringCoreNodeId } from "@/features/workspace/engineering-core-data";
import type { EngineeringCore3DProps } from "@/features/workspace/components/EngineeringCore3D";
import { cn } from "@/lib/cn";
import { Braces, Database, GitBranch, Monitor, Send, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

interface PendingSceneStyle {
  readonly lightX: string;
  readonly lightY: string;
  readonly tiltX: string;
  readonly tiltY: string;
}

const EngineeringCore3D = dynamic<EngineeringCore3DProps>(
  () =>
    import("@/features/workspace/components/EngineeringCore3D").then(
      (module) => module.EngineeringCore3D
    ),
  {
    ssr: false,
    loading: () => <div className="hero-core-3d-loading" aria-hidden="true" />
  }
);

const nodeIconById: Record<EngineeringCoreNodeId, typeof Braces> = {
  frontend: Monitor,
  api: Send,
  backend: Braces,
  test: ShieldCheck,
  database: Database,
  cicd: GitBranch
};

export function EngineeringCore(): React.ReactElement {
  const [activeNodeId, setActiveNodeId] = useState<EngineeringCoreNodeId>("frontend");
  const [isWebGlAvailable, setIsWebGlAvailable] = useState(true);
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const sceneRef = useRef<HTMLElement | null>(null);
  const sceneAnimationFrameRef = useRef<number | null>(null);
  const pendingSceneStyleRef = useRef<PendingSceneStyle | null>(null);
  const activeNode = getEngineeringCoreNode(activeNodeId);
  const canRender3D = isWebGlAvailable && hasFinePointer && !prefersReducedMotion;

  const cancelPendingSceneFrame = useCallback((): void => {
    if (sceneAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(sceneAnimationFrameRef.current);
      sceneAnimationFrameRef.current = null;
    }

    pendingSceneStyleRef.current = null;
  }, []);

  const scheduleSceneStyleUpdate = useCallback((style: PendingSceneStyle): void => {
    pendingSceneStyleRef.current = style;

    if (sceneAnimationFrameRef.current !== null) {
      return;
    }

    sceneAnimationFrameRef.current = window.requestAnimationFrame(() => {
      const nextStyle = pendingSceneStyleRef.current;
      sceneAnimationFrameRef.current = null;
      pendingSceneStyleRef.current = null;

      if (!nextStyle || prefersReducedMotion) {
        return;
      }

      const element = sceneRef.current;
      element?.style.setProperty("--core-light-x", nextStyle.lightX);
      element?.style.setProperty("--core-light-y", nextStyle.lightY);
      element?.style.setProperty("--core-tilt-x", nextStyle.tiltX);
      element?.style.setProperty("--core-tilt-y", nextStyle.tiltY);
    });
  }, [prefersReducedMotion]);

  useEffect(() => {
    const webGlTimerId = window.setTimeout(() => {
      setIsWebGlAvailable(detectWebGlSupport());
    }, 0);
    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointerCapability = (): void => setHasFinePointer(finePointerQuery.matches);

    updatePointerCapability();
    finePointerQuery.addEventListener("change", updatePointerCapability);

    return () => {
      window.clearTimeout(webGlTimerId);
      cancelPendingSceneFrame();
      finePointerQuery.removeEventListener("change", updatePointerCapability);
    };
  }, [cancelPendingSceneFrame]);

  useEffect(() => {
    if (prefersReducedMotion) {
      cancelPendingSceneFrame();
      resetSceneStyle(sceneRef.current);
    }
  }, [cancelPendingSceneFrame, prefersReducedMotion]);

  function onPointerMove(event: React.PointerEvent<HTMLElement>): void {
    if (prefersReducedMotion || event.pointerType !== "mouse") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    const tiltY = canRender3D ? 0 : (x - 50) * 0.045;
    const tiltX = canRender3D ? 0 : (50 - y) * 0.035;

    scheduleSceneStyleUpdate({
      lightX: `${x}%`,
      lightY: `${y}%`,
      tiltX: `${tiltX}deg`,
      tiltY: `${tiltY}deg`
    });
  }

  function onPointerLeave(event: React.PointerEvent<HTMLElement>): void {
    cancelPendingSceneFrame();
    resetSceneStyle(event.currentTarget);
  }

  return (
    <section
      ref={sceneRef}
      id="hero-system-core"
      aria-labelledby="hero-system-core-title"
      aria-describedby="hero-system-core-fallback"
      className="hero-core"
      data-renderer={canRender3D ? "r3f" : "dom"}
      data-webgl={isWebGlAvailable ? "available" : "unavailable"}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="hero-core-copy">
        <p className="eyebrow">interactive engineering core</p>
        <h2 id="hero-system-core-title">Build. Test. Measure. Ship.</h2>
        <p id="hero-system-core-fallback" className="sr-only">
          {canRender3D
            ? "WebGL engineering core is active with DOM controls and fallback content."
            : "DOM fallback visualization remains active."}
        </p>
      </div>

      <div
        className="hero-core-stage"
        data-renderer={canRender3D ? "r3f" : "dom"}
        aria-label="Frontend, API, backend, test, database, and CI/CD system map"
      >
        {canRender3D ? (
          <EngineeringCore3D
            nodes={engineeringCoreNodes}
            edges={engineeringCoreEdges}
            activeNodeId={activeNodeId}
            onNodeSelect={setActiveNodeId}
          />
        ) : (
          <EngineeringCoreFallback activeNodeId={activeNodeId} onNodeSelect={setActiveNodeId} />
        )}
      </div>

      <aside className="hero-core-detail" aria-live="polite">
        <div>
          <Badge tone={activeNode.tone === "quality" ? "success" : "info"}>{activeNode.label}</Badge>
          <h3>{activeNode.title}</h3>
          <p>{activeNode.description}</p>
        </div>
        <div className="hero-core-tech" aria-label={`${activeNode.label} technologies`}>
          {activeNode.technologies.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
      </aside>
    </section>
  );
}

function EngineeringCoreFallback({
  activeNodeId,
  onNodeSelect
}: Readonly<{
  activeNodeId: EngineeringCoreNodeId;
  onNodeSelect: (nodeId: EngineeringCoreNodeId) => void;
}>): React.ReactElement {
  return (
    <>
      <svg
        className="hero-core-edges"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {engineeringCoreEdges.map((edge) => {
          const source = getEngineeringCoreNode(edge.source);
          const target = getEngineeringCoreNode(edge.target);
          const isActive = isEngineeringCoreEdgeActive(edge, activeNodeId);

          return (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              className={cn("hero-core-edge", isActive && "hero-core-edge-active")}
            />
          );
        })}
      </svg>

      {engineeringCoreNodes.map((node) => {
        const Icon = nodeIconById[node.id];
        const isActive = node.id === activeNodeId;

        return (
          <button
            key={node.id}
            type="button"
            aria-pressed={isActive}
            aria-label={`Inspect ${node.label} engineering core node`}
            className={cn("hero-core-node", isActive && "hero-core-node-active")}
            data-tone={node.tone}
            data-cursor-intent="node"
            data-cursor-label="NODE"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onClick={() => onNodeSelect(node.id)}
            onFocus={() => onNodeSelect(node.id)}
          >
            <span className="hero-core-node-icon">
              <Icon aria-hidden="true" size={18} />
            </span>
            <span>
              <span className="hero-core-node-label">{node.label}</span>
              <span className="hero-core-node-meta">{node.eyebrow}</span>
            </span>
          </button>
        );
      })}
    </>
  );
}

function resetSceneStyle(element: HTMLElement | null): void {
  element?.style.setProperty("--core-light-x", "68%");
  element?.style.setProperty("--core-light-y", "30%");
  element?.style.setProperty("--core-tilt-x", "0deg");
  element?.style.setProperty("--core-tilt-y", "0deg");
}

function detectWebGlSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}
