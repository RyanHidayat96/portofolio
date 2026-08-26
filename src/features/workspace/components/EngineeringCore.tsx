"use client";

import { Badge } from "@/components/ui/Badge";
import { capabilities } from "@/data/capabilities";
import type { EngineeringDomain } from "@/data/types";
import { cn } from "@/lib/cn";
import { Braces, GitBranch, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type SystemNodeId = "build" | "quality" | "ship";
type SystemNodeTone = "build" | "quality" | "ship";

interface SystemNode {
  readonly id: SystemNodeId;
  readonly label: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly technologies: readonly string[];
  readonly x: number;
  readonly y: number;
  readonly tone: SystemNodeTone;
  readonly icon: typeof Braces;
}

interface SystemEdge {
  readonly id: string;
  readonly source: SystemNodeId;
  readonly target: SystemNodeId;
}

interface PendingSceneStyle {
  readonly lightX: string;
  readonly lightY: string;
  readonly tiltX: string;
  readonly tiltY: string;
}

const capabilityByDomain = new Map<EngineeringDomain, (typeof capabilities)[number]>(
  capabilities.map((capability) => [capability.domain, capability])
);

const systemNodes: readonly SystemNode[] = [
  {
    id: "build",
    label: "BUILD",
    eyebrow: "Frontend / API / Backend / Data",
    title: "Full-stack product construction",
    description: capabilityByDomain.get("build")?.description ?? "Full-stack application work.",
    technologies: capabilityByDomain.get("build")?.technologies.slice(0, 5) ?? [],
    x: 50,
    y: 16,
    tone: "build",
    icon: Braces
  },
  {
    id: "quality",
    label: "QUALITY",
    eyebrow: "Automation / API / Mobile / Performance",
    title: "Quality engineered into delivery",
    description: capabilityByDomain.get("quality")?.description ?? "Quality engineering work.",
    technologies: capabilityByDomain.get("quality")?.technologies.slice(0, 5) ?? [],
    x: 24,
    y: 62,
    tone: "quality",
    icon: ShieldCheck
  },
  {
    id: "ship",
    label: "SHIP",
    eyebrow: "CI/CD / Docker / Gates",
    title: "Release confidence and delivery signals",
    description: capabilityByDomain.get("delivery")?.description ?? "Delivery engineering work.",
    technologies: capabilityByDomain.get("delivery")?.technologies.slice(0, 5) ?? [],
    x: 76,
    y: 62,
    tone: "ship",
    icon: GitBranch
  }
] as const;

const systemEdges: readonly SystemEdge[] = [
  { id: "build-quality", source: "build", target: "quality" },
  { id: "build-ship", source: "build", target: "ship" },
  { id: "quality-ship", source: "quality", target: "ship" }
] as const;

export function EngineeringCore(): React.ReactElement {
  const [activeNodeId, setActiveNodeId] = useState<SystemNodeId>("build");
  const [isWebGlAvailable, setIsWebGlAvailable] = useState(true);
  const sceneRef = useRef<HTMLElement | null>(null);
  const reducedMotionRef = useRef(false);
  const sceneAnimationFrameRef = useRef<number | null>(null);
  const pendingSceneStyleRef = useRef<PendingSceneStyle | null>(null);
  const activeNode = systemNodes.find((node) => node.id === activeNodeId) ?? systemNodes[0];
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

      if (!nextStyle || reducedMotionRef.current) {
        return;
      }

      const element = sceneRef.current;
      element?.style.setProperty("--core-light-x", nextStyle.lightX);
      element?.style.setProperty("--core-light-y", nextStyle.lightY);
      element?.style.setProperty("--core-tilt-x", nextStyle.tiltX);
      element?.style.setProperty("--core-tilt-y", nextStyle.tiltY);
    });
  }, []);

  useEffect(() => {
    const webGlTimerId = window.setTimeout(() => {
      setIsWebGlAvailable(detectWebGlSupport());
    }, 0);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = (): void => {
      reducedMotionRef.current = motionQuery.matches;
      if (motionQuery.matches) {
        cancelPendingSceneFrame();
        resetSceneStyle(sceneRef.current);
      }
    };

    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => {
      window.clearTimeout(webGlTimerId);
      cancelPendingSceneFrame();
      motionQuery.removeEventListener("change", updateMotionPreference);
    };
  }, [cancelPendingSceneFrame]);

  function onPointerMove(event: React.PointerEvent<HTMLElement>): void {
    if (reducedMotionRef.current || event.pointerType !== "mouse") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    const tiltY = (x - 50) * 0.045;
    const tiltX = (50 - y) * 0.035;

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
      data-webgl={isWebGlAvailable ? "available" : "unavailable"}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="hero-core-copy">
        <p className="eyebrow">interactive engineering core</p>
        <h2 id="hero-system-core-title">Build. Test. Measure. Ship.</h2>
        <p id="hero-system-core-fallback" className="sr-only">
          {isWebGlAvailable
            ? "DOM and SVG visualization is active."
            : "WebGL is unavailable; DOM and SVG fallback visualization remains active."}
        </p>
      </div>

      <div className="hero-core-stage" aria-label="Build Quality Ship system map">
        <svg
          className="hero-core-edges"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {systemEdges.map((edge) => {
            const source = systemNodes.find((node) => node.id === edge.source);
            const target = systemNodes.find((node) => node.id === edge.target);
            const isActive = edge.source === activeNodeId || edge.target === activeNodeId;

            if (!source || !target) {
              return null;
            }

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

        {systemNodes.map((node) => {
          const Icon = node.icon;
          const isActive = node.id === activeNodeId;

          return (
            <button
              key={node.id}
              type="button"
              aria-pressed={isActive}
              className={cn("hero-core-node", isActive && "hero-core-node-active")}
              data-tone={node.tone}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => setActiveNodeId(node.id)}
              onFocus={() => setActiveNodeId(node.id)}
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
      </div>

      <aside className="hero-core-detail" aria-live="polite">
        <div>
          <Badge tone={activeNode.id === "quality" ? "success" : "info"}>{activeNode.label}</Badge>
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
