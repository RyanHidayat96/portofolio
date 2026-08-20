"use client";

import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { fullCycleNodes } from "@/data/capabilities";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import type { FullCycleNode, PortfolioMode } from "@/data/types";
import { cn } from "@/lib/cn";
import { useEffect, useMemo, useState } from "react";

type FullCycleNodeId = FullCycleNode["id"];

const modeNodeIds: Record<PortfolioMode, readonly FullCycleNodeId[]> = {
  build: ["idea", "frontend", "api", "backend", "data"],
  quality: ["api", "quality", "cicd", "production"],
  "full-cycle": ["idea", "frontend", "api", "backend", "data", "quality", "cicd", "production"]
};

const modeOptions: readonly {
  readonly id: PortfolioMode;
  readonly label: string;
  readonly description: string;
}[] = [
  {
    id: "build",
    label: "Build",
    description: "Frontend, backend, API, data, architecture."
  },
  {
    id: "quality",
    label: "Quality",
    description: "Automation, API checks, performance, quality gates."
  },
  {
    id: "full-cycle",
    label: "Full Cycle",
    description: "Product build and delivery confidence together."
  }
];

const nodeEvidence: Record<FullCycleNodeId, string> = {
  idea: "Ryan turns requirements, audit workflows, and delivery risk into scoped engineering slices that can be built and verified.",
  frontend:
    "Ryan builds enterprise screens with Next.js, React, TypeScript, forms, tables, filters, and data-heavy workflows.",
  api: "Ryan designs and validates REST boundaries between user workflows, backend services, and portfolio-safe route handlers.",
  backend:
    "Ryan has built Node.js / Express services and earlier Java Spring Boot backend systems for enterprise applications.",
  data: "Ryan works with relational databases, SQL validation, ORM modeling, ETL context, filters, pagination, and data integrity.",
  quality:
    "Ryan engineers automation across web, mobile, API, and performance layers using Playwright, WebDriverIO, Appium, Jest, Postman, K6, and JMeter.",
  cicd: "Ryan connects build, automation, reports, Docker execution, GitLab Runner, GitLab CI/CD, and quality gates into delivery signals.",
  production:
    "Ryan carries production support, troubleshooting, release confidence, dashboards, and public-safe operational thinking into full-stack work."
};

export function FullCycleExperience(): React.ReactElement {
  const [mode, setMode] = useState<PortfolioMode>("full-cycle");
  const [activeNodeId, setActiveNodeId] = useState<FullCycleNodeId>("frontend");
  const visibleNodeIds = modeNodeIds[mode];
  const visibleNodes = useMemo(
    () => fullCycleNodes.filter((node) => visibleNodeIds.includes(node.id)),
    [visibleNodeIds]
  );
  const activeNode =
    visibleNodes.find((node) => node.id === activeNodeId) ?? visibleNodes[0] ?? fullCycleNodes[0];
  const relatedRoles = experience.filter((role) => activeNode?.relatedExperience.includes(role.id));
  const relatedProjects = projects.filter((project) =>
    activeNode?.relatedProjects.includes(project.slug)
  );

  useEffect(() => {
    if (!visibleNodeIds.includes(activeNodeId)) {
      setActiveNodeId(visibleNodeIds[0] ?? "idea");
    }
  }, [activeNodeId, visibleNodeIds]);

  const selectMode = (nextMode: PortfolioMode): void => {
    setMode(nextMode);
    setActiveNodeId(modeNodeIds[nextMode][0] ?? "idea");
  };

  const onModeKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentMode: PortfolioMode
  ): void => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const currentIndex = modeOptions.findIndex((option) => option.id === currentMode);
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (currentIndex + direction + modeOptions.length) % modeOptions.length;
    const nextMode = modeOptions[nextIndex]?.id ?? "full-cycle";

    selectMode(nextMode);
    window.requestAnimationFrame(() =>
      document.getElementById(`full-cycle-mode-${nextMode}`)?.focus()
    );
  };

  if (!activeNode) {
    return (
      <Panel className="p-5 sm:p-7">
        <p>No full-cycle data configured.</p>
      </Panel>
    );
  }

  return (
    <Panel className="overflow-hidden p-5 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <Badge tone="info">Signature Lifecycle</Badge>
          <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
            Full-cycle engineering experience.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#b7c2d2]">
            Follow the path from product idea through frontend, API, backend, data, quality, CI/CD,
            and production readiness. Each layer shows what it does, what Ryan has done there,
            verified technologies, related roles, and related projects.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Engineering mode"
          className="grid gap-2 sm:grid-cols-3 lg:w-[520px]"
        >
          {modeOptions.map((option) => {
            const isSelected = mode === option.id;
            return (
              <button
                key={option.id}
                id={`full-cycle-mode-${option.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls="full-cycle-panel"
                onClick={() => selectMode(option.id)}
                onKeyDown={(event) => onModeKeyDown(event, option.id)}
                className={cn(
                  "min-h-20 rounded-[var(--radius-control)] border p-3 text-left transition",
                  isSelected
                    ? "border-[var(--accent-strong)] bg-[var(--accent)] text-[var(--accent-contrast)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent-strong)] hover:text-[var(--text-primary)]"
                )}
              >
                <span className="mono block text-xs font-semibold uppercase tracking-[0.16em]">
                  {option.label}
                </span>
                <span className="mt-2 block text-xs leading-5">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="full-cycle-panel"
        role="tabpanel"
        aria-labelledby={`full-cycle-mode-${mode}`}
        className="mt-7 grid gap-5 2xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]"
      >
        <section
          aria-label="Interactive full-cycle lifecycle"
          className="relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#080d14] p-4"
        >
          <div
            aria-hidden="true"
            className="full-cycle-flow-line absolute left-8 right-8 top-10 hidden h-px lg:block"
          />
          <ol className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {visibleNodes.map((node, index) => {
              const isActive = node.id === activeNode.id;
              return (
                <li key={node.id}>
                  <button
                    type="button"
                    onClick={() => setActiveNodeId(node.id)}
                    onFocus={() => setActiveNodeId(node.id)}
                    aria-pressed={isActive}
                    className={cn(
                      "group flex min-h-44 w-full flex-col justify-between rounded-[var(--radius-control)] border p-4 text-left transition",
                      isActive
                        ? "border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--text-primary)] shadow-[0_0_32px_rgba(85,215,255,0.12)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
                    )}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="mono text-xs text-[var(--accent)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="mt-3 block text-lg font-semibold text-[var(--text-primary)]">
                          {node.label}
                        </span>
                      </span>
                      <Badge tone={getDomainBadgeTone(node.domain)}>{node.domain}</Badge>
                    </span>
                    <span className="mt-5 block text-sm leading-6">{node.description}</span>
                    <span className="mono mt-5 text-xs text-[var(--accent)]">
                      {isActive ? "selected.layer" : "inspect.layer"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="mono text-sm text-[var(--accent)]">selected.layer</p>
          <h3 className="mt-3 text-2xl font-semibold">{activeNode.label}</h3>

          <div className="mt-5 space-y-5">
            <EvidenceBlock title="What this layer does" value={activeNode.description} />
            <EvidenceBlock title="What Ryan has done here" value={nodeEvidence[activeNode.id]} />

            <section>
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Technologies
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeNode.technologies.map((technology) => (
                  <Badge key={technology} tone="info">
                    {technology}
                  </Badge>
                ))}
              </div>
            </section>

            <section>
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Related Role
              </h4>
              <div className="mt-3 space-y-2">
                {relatedRoles.map((role) => (
                  <article
                    key={role.id}
                    className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[#0b1018] p-3"
                  >
                    <p className="font-semibold">{role.role}</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{role.company}</p>
                    <p className="mono mt-2 text-xs text-[var(--accent)]">{role.period}</p>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Related Project
              </h4>
              <div className="mt-3 space-y-2">
                {relatedProjects.map((project) => (
                  <article
                    key={project.slug}
                    className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[#0b1018] p-3"
                  >
                    <p className="font-semibold">{project.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                      {project.responsibility}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </Panel>
  );
}

function EvidenceBlock({
  title,
  value
}: Readonly<{ title: string; value: string }>): React.ReactElement {
  return (
    <section>
      <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {title}
      </h4>
      <p className="mt-3 text-sm leading-6 text-[#c8d4e6]">{value}</p>
    </section>
  );
}

function getDomainBadgeTone(domain: FullCycleNode["domain"]): "info" | "success" | "warning" {
  if (domain === "quality") {
    return "success";
  }

  if (domain === "delivery") {
    return "warning";
  }

  return "info";
}
