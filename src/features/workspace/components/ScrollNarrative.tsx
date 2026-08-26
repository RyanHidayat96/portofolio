"use client";

import { Badge } from "@/components/ui/Badge";
import { capabilities, fullCycleNodes } from "@/data/capabilities";
import { projects } from "@/data/projects";
import type { EngineeringDomain, FullCycleNode, ProjectCategory } from "@/data/types";
import { cn } from "@/lib/cn";
import { Braces, Database, GitBranch, ShieldCheck, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

type NarrativePhaseId = "build" | "quality" | "delivery";

interface NarrativePhase {
  readonly id: NarrativePhaseId;
  readonly label: string;
  readonly title: string;
  readonly summary: string;
  readonly domain: EngineeringDomain;
  readonly projectCategory: ProjectCategory;
  readonly nodeIds: readonly FullCycleNode["id"][];
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
    projectCategory: "build",
    nodeIds: ["frontend", "api", "backend", "data"],
    icon: Braces
  },
  {
    id: "quality",
    label: "QUALITY",
    title: "Quality is designed before release pressure.",
    summary:
      "Automation, API checks, mobile coverage, performance signals, and failure analysis turn testing into delivery confidence.",
    domain: "quality",
    projectCategory: "quality",
    nodeIds: ["quality"],
    icon: ShieldCheck
  },
  {
    id: "delivery",
    label: "SHIP",
    title: "Delivery needs signals, gates, and discipline.",
    summary:
      "CI/CD, Docker, runners, reports, and quality gates help teams decide what can move forward and what needs root-cause work.",
    domain: "delivery",
    projectCategory: "devops",
    nodeIds: ["cicd", "production"],
    icon: GitBranch
  }
] as const;

const capabilityByDomain = new Map<EngineeringDomain, (typeof capabilities)[number]>(
  capabilities.map((capability) => [capability.domain, capability])
);

const validPhaseIds = new Set<NarrativePhaseId>(phases.map((phase) => phase.id));

export function ScrollNarrative(): React.ReactElement {
  const [activePhaseId, setActivePhaseId] = useState<NarrativePhaseId>("build");
  const activePhase = phases.find((phase) => phase.id === activePhaseId) ?? phases[0];

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return undefined;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-narrative-phase]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const visibleTarget = visibleEntry?.target;

        if (!(visibleTarget instanceof HTMLElement)) {
          return;
        }

        const nextPhaseId = visibleTarget.dataset.narrativePhase as NarrativePhaseId | undefined;

        if (nextPhaseId && validPhaseIds.has(nextPhaseId)) {
          setActivePhaseId(nextPhaseId);
        }
      },
      {
        rootMargin: "-30% 0px -42% 0px",
        threshold: [0.15, 0.35, 0.6]
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="build-quality-ship"
      className="scroll-narrative"
      aria-labelledby="scroll-narrative-title"
    >
      <div className="content-container narrative-grid">
        <div className="narrative-copy">
          <p className="eyebrow">portfolio story</p>
          <h2 id="scroll-narrative-title">Build, quality, and ship as one system.</h2>
          <p>
            Short path for humans first. Every section maps back to real portfolio data, then deeper
            labs remain available inside Engineer Mode.
          </p>

          <div className="narrative-sections">
            {phases.map((phase, index) => (
              <NarrativeSection
                key={phase.id}
                phase={phase}
                index={index}
                isActive={phase.id === activePhaseId}
              />
            ))}
          </div>
        </div>

        <aside className="narrative-visual" aria-label="Active Build Quality Ship system state">
          <div className="narrative-sticky">
            <div className="narrative-core-map" data-active-phase={activePhase.id}>
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
                  >
                    <Icon aria-hidden="true" size={18} />
                    <span>{phase.label}</span>
                  </a>
                );
              })}
              <div className="narrative-core-center" aria-hidden="true">
                <Database size={22} />
                <span>RyanOS</span>
              </div>
            </div>

            <div className="narrative-active-card">
              <Badge tone={activePhase.id === "quality" ? "success" : "info"}>
                {activePhase.label}
              </Badge>
              <h3>{activePhase.title}</h3>
              <p>{activePhase.summary}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function NarrativeSection({
  phase,
  index,
  isActive
}: Readonly<{
  phase: NarrativePhase;
  index: number;
  isActive: boolean;
}>): React.ReactElement {
  const capability = capabilityByDomain.get(phase.domain);
  const phaseNodes = fullCycleNodes.filter((node) => phase.nodeIds.includes(node.id));
  const project = projects.find((item) => item.categories.includes(phase.projectCategory));
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
            <span>Evidence</span>
            <p>{project?.title ?? capability?.title ?? phase.label}</p>
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
