"use client";

import { Badge } from "@/components/ui/Badge";
import { capabilities, fullCycleNodes } from "@/data/capabilities";
import type { EngineeringDomain, FullCycleNode } from "@/data/types";
import { useReducedMotion } from "@/features/interaction/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import { Braces, Database, GitBranch, ShieldCheck, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type NarrativePhaseId = "build" | "quality" | "delivery";

interface NarrativePhase {
  readonly id: NarrativePhaseId;
  readonly label: string;
  readonly title: string;
  readonly summary: string;
  readonly domain: EngineeringDomain;
  readonly nodeIds: readonly FullCycleNode["id"][];
  readonly publicSignal: string;
  readonly icon: LucideIcon;
}

const phases: readonly NarrativePhase[] = [
  {
    id: "build",
    label: "BUILD",
    title: "From product workflow to working software.",
    summary:
      "Ryan builds frontend screens, API contracts, backend services, and database workflows as one connected product system.",
    domain: "build",
    nodeIds: ["frontend", "api", "backend", "data"],
    publicSignal: "Application systems",
    icon: Braces
  },
  {
    id: "quality",
    label: "QUALITY",
    title: "Quality is designed before release pressure.",
    summary:
      "Automation, API checks, mobile coverage, performance signals, and failure analysis turn testing into delivery confidence.",
    domain: "quality",
    nodeIds: ["quality"],
    publicSignal: "Release confidence",
    icon: ShieldCheck
  },
  {
    id: "delivery",
    label: "SHIP",
    title: "Delivery needs signals, gates, and discipline.",
    summary:
      "CI/CD, Docker, runners, reports, and quality gates help teams decide what can move forward and what needs root-cause work.",
    domain: "delivery",
    nodeIds: ["cicd", "production"],
    publicSignal: "Delivery readiness",
    icon: GitBranch
  }
] as const;

const capabilityByDomain = new Map<EngineeringDomain, (typeof capabilities)[number]>(
  capabilities.map((capability) => [capability.domain, capability])
);

export function ScrollNarrative(): React.ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activePhaseId, setActivePhaseId] = useState<NarrativePhaseId>("build");
  const prefersReducedMotion = useReducedMotion();
  const activePhase = phases.find((phase) => phase.id === activePhaseId) ?? phases[0];


  useNarrativeScrollChoreography({
    sectionRef,
    prefersReducedMotion
  });

  return (
    <section
      ref={sectionRef}
      id="build-quality-ship"
      className="scroll-narrative"
      data-scroll-phase={activePhase.id}
      aria-labelledby="scroll-narrative-title"
    >
      <div className="content-container narrative-grid">
        <header className="narrative-copy">
          <p className="eyebrow">portfolio story</p>
          <h2 id="scroll-narrative-title">Build, quality, and ship as one system.</h2>
          <p>
            Short path for humans first. The public view stays concise, while deeper technical labs
            remain available inside the portfolio workspace.
          </p>
        </header>

        <aside className="narrative-visual" aria-label="Active Build Quality Ship system state">
          <div className="narrative-sticky">
            <div className="narrative-progress-rail" aria-hidden="true">
              <span />
            </div>

            <div className="narrative-core-map" data-active-phase={activePhase.id}>
              <div className="narrative-layer-stack" aria-hidden="true">
                {phases.map((phase) => (
                  <span key={phase.id} className={`narrative-layer narrative-layer-${phase.id}`}>
                    <span>{phase.label}</span>
                  </span>
                ))}
              </div>

              {phases.map((phase) => {
                const Icon = phase.icon;
                const isActive = phase.id === activePhase.id;

                return (
                  <a
                    key={phase.id}
                    href={`#narrative-${phase.id}`}
                    className={cn("narrative-core-node", isActive && "narrative-core-node-active")}
                    data-phase={phase.id}
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => setActivePhaseId(phase.id)}
                  >
                    <Icon aria-hidden="true" size={18} />
                    <span>{phase.label}</span>
                  </a>
                );
              })}
              <div className="narrative-core-center" aria-hidden="true">
                <Database size={22} />
                <span>Ryan</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="narrative-sections">
          {phases.map((phase, index) => (
            <NarrativeSection
              key={phase.id}
              phase={phase}
              index={index}
              isActive={phase.id === activePhaseId}
              onSelect={setActivePhaseId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function NarrativeSection({
  phase,
  index,
  isActive,
  onSelect
}: Readonly<{
  phase: NarrativePhase;
  index: number;
  isActive: boolean;
  onSelect: (phaseId: NarrativePhaseId) => void;
}>): React.ReactElement {
  const capability = capabilityByDomain.get(phase.domain);
  const phaseNodes = fullCycleNodes.filter((node) => phase.nodeIds.includes(node.id));
  const technologies = Array.from(
    new Set([
      ...(capability?.technologies ?? []),
      ...phaseNodes.flatMap((node) => node.technologies)
    ])
  ).slice(0, 8);

  return (
    <section
      id={`narrative-${phase.id}`}
      className="narrative-phase"
      data-narrative-phase={phase.id}
      data-active={isActive}
      aria-labelledby={`narrative-${phase.id}-title`}
      aria-pressed={isActive}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(phase.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(phase.id);
        }
      }}
    >
      <div className="narrative-phase-index">{String(index + 1).padStart(2, "0")}</div>
      <div>
        <Badge tone={phase.id === "quality" ? "success" : "info"}>{phase.label}</Badge>
        <h3 id={`narrative-${phase.id}-title`}>{phase.title}</h3>
        <p>{phase.summary}</p>

        <div className="narrative-node-list" aria-label={`${phase.label} capability layers`}>
          {phaseNodes.map((node) => (
            <span key={node.id}>{node.label}</span>
          ))}
        </div>

        <div className="narrative-proof-grid">
          <div>
            <span>Focus</span>
            <p>{phase.publicSignal}</p>
          </div>
          <div>
            <span>Stack</span>
            <p>{technologies.join(", ")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function useNarrativeScrollChoreography({
  sectionRef,
  prefersReducedMotion
}: Readonly<{
  sectionRef: React.RefObject<HTMLElement | null>;
  prefersReducedMotion: boolean;
}>): void {
  useEffect(() => {
    const element = sectionRef.current;
    if (!element) {
      return undefined;
    }

    let frameId: number | null = null;

    const update = (): void => {
      frameId = null;
      const progress = getScrollProgress(element);
      const displayProgress = prefersReducedMotion ? 1 : progress;
      const buildProgress = prefersReducedMotion ? 1 : getLayerProgress(progress, 0);
      const qualityProgress = prefersReducedMotion ? 1 : getLayerProgress(progress, 1);
      const deliveryProgress = prefersReducedMotion ? 1 : getLayerProgress(progress, 2);

      element.style.setProperty("--narrative-progress", displayProgress.toFixed(4));
      element.style.setProperty(
        "--narrative-connection-opacity",
        (0.24 + displayProgress * 0.66).toFixed(4)
      );
      element.style.setProperty(
        "--narrative-camera-rotate-x",
        prefersReducedMotion ? "0deg" : `${(5 - progress * 10).toFixed(2)}deg`
      );
      element.style.setProperty(
        "--narrative-camera-rotate-y",
        prefersReducedMotion ? "0deg" : `${((progress - 0.5) * -10).toFixed(2)}deg`
      );
      element.style.setProperty(
        "--narrative-camera-y",
        prefersReducedMotion ? "0rem" : `${((progress - 0.5) * -1.1).toFixed(3)}rem`
      );
      element.style.setProperty(
        "--narrative-camera-scale",
        prefersReducedMotion ? "1" : (1 + progress * 0.035).toFixed(4)
      );
      element.style.setProperty(
        "--narrative-card-y",
        prefersReducedMotion ? "0rem" : `${((1 - progress) * 0.45).toFixed(3)}rem`
      );
      setLayerProperties(element, "build", buildProgress);
      setLayerProperties(element, "quality", qualityProgress);
      setLayerProperties(element, "delivery", deliveryProgress);
    };

    const requestUpdate = (): void => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [prefersReducedMotion, sectionRef]);
}

function getScrollProgress(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
  const scrollableDistance = Math.max(1, rect.height - viewportHeight * 0.55);
  const distance = viewportHeight * 0.1 - rect.top;

  return clamp(distance / scrollableDistance);
}

function getLayerProgress(progress: number, index: number): number {
  return clamp((progress - index / phases.length) * phases.length);
}


function setLayerProperties(
  element: HTMLElement,
  phaseId: NarrativePhaseId,
  progress: number
): void {
  element.style.setProperty(`--narrative-${phaseId}-progress`, progress.toFixed(4));
  element.style.setProperty(`--narrative-${phaseId}-opacity`, (0.16 + progress * 0.84).toFixed(4));
  element.style.setProperty(`--narrative-${phaseId}-offset`, `${((1 - progress) * 1.15).toFixed(3)}rem`);
  element.style.setProperty(`--narrative-${phaseId}-depth`, `${(progress * 28).toFixed(2)}px`);
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
