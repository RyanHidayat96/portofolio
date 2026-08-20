"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ProjectCaseStudy } from "@/data/types";
import { cn } from "@/lib/cn";
import { Network } from "lucide-react";
import { useState } from "react";

export function FlagshipCaseStudy({
  project,
  onExploreArchitecture
}: Readonly<{
  project: ProjectCaseStudy;
  onExploreArchitecture?: () => void;
}>): React.ReactElement {
  const layers = project.architectureLayers ?? [];
  const [activeLayerId, setActiveLayerId] = useState(layers[1]?.id ?? layers[0]?.id ?? "");
  const activeLayer = layers.find((layer) => layer.id === activeLayerId) ?? layers[0];

  return (
    <article>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success">{project.label ?? "Full Stack Enterprise Application"}</Badge>
            <Badge tone="info">{project.status}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{project.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#b7c2d2]">
            {project.overview ?? project.context}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {onExploreArchitecture ? (
              <Button
                variant="primary"
                icon={<Network aria-hidden="true" size={18} />}
                onClick={onExploreArchitecture}
              >
                Explore Architecture
              </Button>
            ) : null}
            <div className="border border-[var(--border)] bg-[var(--surface)] px-4 py-2">
              <p className="mono text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                role
              </p>
              <p className="mt-1 font-semibold">{project.role ?? "Full Stack Developer"}</p>
            </div>
          </div>
        </section>

        <section className="border border-[var(--accent-strong)] bg-[var(--accent-soft)] p-4">
          <p className="mono text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            current.full_stack_work
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Build proof, not claim.</h2>
          <p className="mt-3 text-sm leading-6 text-[#c8d4e6]">
            This case study shows Ryan building product workflows while applying API, data, file,
            reporting, validation, delivery, and quality-thinking discipline. Internal names,
            endpoints, business rules, and company source details stay private.
          </p>
        </section>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        <CaseStudyField title="Overview" value={project.overview ?? project.context} />
        <CaseStudyField title="Problem" value={project.problem} />
        <CaseStudyField title="My Role" value={project.responsibility} />
      </div>

      {project.keyCapabilities ? (
        <section className="mt-7">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Key Capabilities
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {project.keyCapabilities.map((capability) => (
              <div
                key={capability}
                className="border border-[var(--border)] bg-[var(--surface)] p-4 text-sm font-semibold"
              >
                {capability}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {layers.length > 0 ? (
        <section className="mt-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mono text-sm text-[var(--accent)]">system.architecture</p>
              <h2 className="mt-2 text-2xl font-semibold">Public-Safe Full Stack Architecture</h2>
            </div>
            <Badge tone="info">Inspectable layers</Badge>
          </div>

          <div className="mt-5 grid gap-4 2xl:grid-cols-[1.1fr_0.9fr]">
            <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
              {layers.map((layer, index) => {
                const isSelected = layer.id === activeLayer?.id;

                return (
                  <li key={layer.id} className="relative">
                    {index > 0 ? (
                      <span
                        aria-hidden="true"
                        className="absolute -top-3 left-5 h-3 w-px bg-[var(--accent-strong)] xl:-left-3 xl:top-1/2 xl:h-px xl:w-3"
                      />
                    ) : null}
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setActiveLayerId(layer.id)}
                      onFocus={() => setActiveLayerId(layer.id)}
                      className={cn(
                        "min-h-40 w-full border p-4 text-left transition",
                        isSelected
                          ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
                          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-strong)]"
                      )}
                    >
                      <span className="mono text-xs text-[var(--accent)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-3 block text-sm font-semibold leading-5">
                        {layer.label}
                      </span>
                      <span className="mt-3 block text-xs leading-5 text-[var(--text-muted)]">
                        {layer.stack}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <aside className="border border-[var(--border)] bg-[var(--surface)] p-5">
              {activeLayer ? (
                <>
                  <p className="mono text-sm text-[var(--accent)]">selected.layer</p>
                  <h3 className="mt-3 text-2xl font-semibold">{activeLayer.label}</h3>
                  <p className="mono mt-3 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {activeLayer.stack}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-[#c8d4e6]">{activeLayer.purpose}</p>
                </>
              ) : (
                <p>No architecture layer configured.</p>
              )}

              {project.architectureBranches ? (
                <section className="mt-6">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Verified Branches
                  </h4>
                  <div className="mt-3 grid gap-3">
                    {project.architectureBranches.map((branch) => (
                      <article
                        key={branch.id}
                        className="border border-[var(--border)] bg-[#0b1018] p-3"
                      >
                        <p className="font-semibold">{branch.label}</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                          {branch.purpose}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {branch.technologies.map((technology) => (
                            <Badge key={technology} tone="info">
                              {technology}
                            </Badge>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </aside>
          </div>
        </section>
      ) : (
        <CaseStudyField title="System Architecture" value={project.architecture} />
      )}

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        <ListBlock title="Engineering Decisions" items={project.engineeringDecisions} />
        <ListBlock title="Quality Strategy" items={project.testingStrategy} />
        <ListBlock title="What I Learned" items={project.lessons} />
      </div>

      <section className="mt-7 border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Outcome
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#c8d4e6]">{project.outcome}</p>
      </section>

      <section className="mt-7">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Tech Stack
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.technologies.map((technology) => (
            <Badge key={technology} tone="info">
              {technology}
            </Badge>
          ))}
        </div>
      </section>
    </article>
  );
}

function CaseStudyField({
  title,
  value
}: Readonly<{ title: string; value: string }>): React.ReactElement {
  return (
    <section className="border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#c8d4e6]">{value}</p>
    </section>
  );
}

function ListBlock({
  title,
  items
}: Readonly<{ title: string; items: readonly string[] }>): React.ReactElement {
  return (
    <section className="border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {title}
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#c8d4e6]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
