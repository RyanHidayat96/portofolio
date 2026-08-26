"use client";

import { Button } from "@/components/ui/Button";
import { branding } from "@/data/branding";
import { useReducedMotion } from "@/features/interaction/hooks/useReducedMotion";
import {
  engineeringCoreEdges,
  engineeringCoreNodes,
  getEngineeringCoreNode,
  type EngineeringCoreNodeId
} from "@/features/workspace/engineering-core-data";
import { cn } from "@/lib/cn";
import { CheckCircle2, FastForward } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const awakeningSteps: readonly {
  readonly label: string;
  readonly detail: string;
  readonly nodes: readonly EngineeringCoreNodeId[];
}[] = [
  {
    label: "BUILD",
    detail: "Frontend, API, backend, and data layers align.",
    nodes: ["frontend", "api", "backend", "database"]
  },
  {
    label: "QUALITY",
    detail: "Automation and validation pressure enter the system.",
    nodes: ["test"]
  },
  {
    label: "PERFORMANCE",
    detail: "Load, latency, and regression signals become visible.",
    nodes: ["api", "backend", "database", "test"]
  },
  {
    label: "DELIVERY",
    detail: "CI/CD gates connect the system to release readiness.",
    nodes: ["cicd"]
  }
] as const;

export function BootSequence({
  onComplete
}: Readonly<{
  onComplete: () => void;
}>): React.ReactElement {
  const [completedCount, setCompletedCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const isSystemReady = completedCount >= awakeningSteps.length;
  const activeStep = awakeningSteps[Math.min(completedCount, awakeningSteps.length - 1)];
  const revealedNodeIds = useMemo(() => {
    const visibleNodes = awakeningSteps
      .slice(0, Math.min(completedCount + 1, awakeningSteps.length))
      .flatMap((step) => step.nodes);

    return new Set<EngineeringCoreNodeId>(visibleNodes);
  }, [completedCount]);

  useEffect(() => {
    if (prefersReducedMotion) {
      const revealAllId = window.setTimeout(() => setCompletedCount(awakeningSteps.length), 0);
      const completeId = window.setTimeout(onComplete, 180);
      return () => {
        window.clearTimeout(revealAllId);
        window.clearTimeout(completeId);
      };
    }

    const intervalId = window.setInterval(() => {
      setCompletedCount((current) => Math.min(current + 1, awakeningSteps.length));
    }, 150);

    return () => window.clearInterval(intervalId);
  }, [onComplete, prefersReducedMotion]);

  useEffect(() => {
    if (!prefersReducedMotion && isSystemReady) {
      const timeoutId = window.setTimeout(onComplete, 320);
      return () => window.clearTimeout(timeoutId);
    }

    return undefined;
  }, [isSystemReady, onComplete, prefersReducedMotion]);

  return (
    <main className="system-awakening-shell">
      <div aria-hidden="true" className="engineering-grid system-awakening-grid" />
      <section className="content-container system-awakening" aria-labelledby="system-awakening-title">
        <div className="system-awakening-copy">
          <p className="eyebrow">{branding.appName}</p>
          <h1 id="system-awakening-title">Initializing engineering system</h1>
          <p className="system-awakening-status" aria-live="polite">
            {isSystemReady ? "System ready" : activeStep.detail}
          </p>

          <ol className="system-awakening-steps" aria-label="System awakening sequence">
            {awakeningSteps.map((step, index) => {
              const isDone = index < completedCount;
              const isActive = index === completedCount && !isSystemReady;

              return (
                <li key={step.label} data-active={isActive} data-done={isDone}>
                  <span>{step.label}</span>
                  {isDone ? (
                    <CheckCircle2 aria-label="loaded" size={18} />
                  ) : (
                    <span aria-hidden="true" className="system-awakening-step-line" />
                  )}
                </li>
              );
            })}
          </ol>

          <Button
            variant="ghost"
            icon={<FastForward aria-hidden="true" size={18} />}
            onClick={onComplete}
            cursorLabel="SKIP"
            className="system-awakening-skip"
          >
            Skip Intro
          </Button>
        </div>

        <div className="system-awakening-map" aria-label="Engineering system formation">
          <svg className="system-awakening-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {engineeringCoreEdges.map((edge) => {
              const source = getEngineeringCoreNode(edge.source);
              const target = getEngineeringCoreNode(edge.target);
              const isActive = revealedNodeIds.has(edge.source) && revealedNodeIds.has(edge.target);

              return (
                <line
                  key={edge.id}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  className="system-awakening-edge"
                  data-active={isActive}
                />
              );
            })}
          </svg>

          {engineeringCoreNodes.map((node) => {
            const isRevealed = revealedNodeIds.has(node.id);
            const isActive = activeStep.nodes.includes(node.id);

            return (
              <span
                key={node.id}
                className={cn("system-awakening-node", isActive && "system-awakening-node-active")}
                data-revealed={isRevealed}
                data-tone={node.tone}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <span aria-hidden="true" />
                <span>{node.label}</span>
              </span>
            );
          })}
        </div>
      </section>
    </main>
  );
}