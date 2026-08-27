"use client";

import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { fullCycleNodes } from "@/data/capabilities";
import type { FullCycleNode, PortfolioMode } from "@/data/types";
import { cn } from "@/lib/cn";
import { useState } from "react";

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

const publicSignal: Record<FullCycleNodeId, string> = {
  idea: "Turns product needs into scoped engineering slices.",
  frontend: "Builds usable interfaces and data-heavy workflows.",
  api: "Keeps route boundaries readable, typed, and testable.",
  backend: "Organizes service logic, validation, and integration boundaries.",
  data: "Protects data integrity through SQL, modeling, and validation habits.",
  quality: "Uses automation mindset to reduce regression and release risk.",
  cicd: "Connects checks, reports, runners, and quality gates into delivery signals.",
  production: "Keeps release readiness, supportability, and operational clarity visible."
};

export function FullCycleExperience(): React.ReactElement {
  const [mode, setMode] = useState<PortfolioMode>("full-cycle");
  const [activeNodeId, setActiveNodeId] = useState<FullCycleNodeId>("frontend");
  const visibleNodeIds = modeNodeIds[mode];
  const visibleNodes = fullCycleNodes.filter((node) => visibleNodeIds.includes(node.id));
  const resolvedActiveNodeId = visibleNodeIds.includes(activeNodeId)
    ? activeNodeId
    : (visibleNodeIds[0] ?? "idea");
  const activeNode =
    visibleNodes.find((node) => node.id === resolvedActiveNodeId) ??
    visibleNodes[0] ??
    fullCycleNodes[0];

  const selectMode = (nextMode: PortfolioMode): void => {
    setMode(nextMode);
    setActiveNodeId(modeNodeIds[nextMode][0] ?? "idea");
  };

  const focusMode = (nextMode: PortfolioMode): void => {
    window.requestAnimationFrame(() =>
      document.getElementById(`full-cycle-mode-${nextMode}`)?.focus()
    );
  };

  const onModeKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentMode: PortfolioMode
  ): void => {
    if (event.key === "Home") {
      event.preventDefault();
      const firstMode = modeOptions[0]?.id ?? "full-cycle";
      selectMode(firstMode);
      focusMode(firstMode);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastMode = modeOptions.at(-1)?.id ?? "full-cycle";
      selectMode(lastMode);
      focusMode(lastMode);
      return;
    }

    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const currentIndex = modeOptions.findIndex((option) => option.id === currentMode);
    const safeIndex = Math.max(0, currentIndex);
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (safeIndex + direction + modeOptions.length) % modeOptions.length;
    const nextMode = modeOptions[nextIndex]?.id ?? "full-cycle";

    selectMode(nextMode);
    focusMode(nextMode);
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
            Full-cycle engineering shape.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#b7c2d2]">
            Interactive overview of how build, quality, data, and delivery connect. Deeper role
            detail stays in the CV so the portfolio remains easy to scan.
          </p>
        </div>

        <div role="tablist" aria-label="Engineering mode" className="grid gap-2 sm:grid-cols-3 lg:w-[520px]">
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
                tabIndex={isSelected ? 0 : -1}
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
          <div aria-hidden="true" className="full-cycle-flow-line absolute left-8 right-8 top-10 hidden h-px lg:block" />
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
                    aria-label={`Inspect ${node.label} layer`}
                    className={cn(
                      "group flex min-h-40 w-full flex-col justify-between rounded-[var(--radius-control)] border p-4 text-left transition",
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
                    <span className="mt-5 block text-sm leading-6">{publicSignal[node.id]}</span>
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
            <SignalBlock title="Layer purpose" value={activeNode.description} />
            <SignalBlock title="Public signal" value={publicSignal[activeNode.id]} />

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

            <p className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[#0b1018] p-3 text-sm leading-6 text-[var(--text-muted)]">
              Full company timeline and responsibility detail are available in the CV.
            </p>
          </div>
        </aside>
      </div>
    </Panel>
  );
}

function SignalBlock({
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