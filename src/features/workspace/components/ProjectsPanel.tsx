"use client";

import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { projects } from "@/data/projects";
import { useState } from "react";

export function ProjectsPanel({
  activeSlug,
  onActiveSlugChange
}: Readonly<{
  activeSlug?: string;
  onActiveSlugChange?: (slug: string) => void;
}>): React.ReactElement {
  const [internalActiveSlug, setInternalActiveSlug] = useState(projects[0]?.slug ?? "");
  const resolvedActiveSlug = activeSlug ?? internalActiveSlug;
  const activeProject =
    projects.find((project) => project.slug === resolvedActiveSlug) ?? projects[0];

  const selectProject = (slug: string): void => {
    setInternalActiveSlug(slug);
    onActiveSlugChange?.(slug);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Panel className="p-4">
        <p className="mono px-2 py-2 text-sm text-[var(--accent)]">case-studies</p>
        <div className="mt-2 space-y-2">
          {projects.map((project) => (
            <button
              key={project.slug}
              type="button"
              onClick={() => selectProject(project.slug)}
              className={`w-full border p-4 text-left transition ${
                activeProject?.slug === project.slug
                  ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-strong)]"
              }`}
            >
              <span className="block font-semibold">{project.title}</span>
              <span className="mt-2 block text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                {project.status}
              </span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="p-5 sm:p-7">
        {activeProject ? (
          <article>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mono text-sm text-[var(--accent)]">project.open</p>
                <h1 className="mt-2 text-3xl font-semibold">{activeProject.title}</h1>
              </div>
              <Badge tone={activeProject.status === "portfolio-safe" ? "success" : "warning"}>
                {activeProject.status}
              </Badge>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              <Field title="Problem" value={activeProject.problem} />
              <Field title="Context" value={activeProject.context} />
              <Field title="Responsibility" value={activeProject.responsibility} />
              <Field title="Architecture" value={activeProject.architecture} />
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-3">
              <ListBlock title="Engineering Decisions" items={activeProject.engineeringDecisions} />
              <ListBlock title="Testing Strategy" items={activeProject.testingStrategy} />
              <ListBlock title="Lessons" items={activeProject.lessons} />
            </div>

            <div className="mt-7">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Outcome
              </h2>
              <p className="mt-3 leading-7 text-[#c8d4e6]">{activeProject.outcome}</p>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {activeProject.technologies.map((technology) => (
                <Badge key={technology} tone="info">
                  {technology}
                </Badge>
              ))}
            </div>
          </article>
        ) : (
          <p>No projects configured.</p>
        )}
      </Panel>
    </div>
  );
}

function Field({ title, value }: Readonly<{ title: string; value: string }>): React.ReactElement {
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
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#c8d4e6]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
