"use client";

import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { projects } from "@/data/projects";
import type { ProjectCategory } from "@/data/types";
import { FlagshipCaseStudy } from "@/features/workspace/components/FlagshipCaseStudy";
import { cn } from "@/lib/cn";
import { useState } from "react";

type ProjectFilter = "all" | ProjectCategory;

const projectFilters: readonly ProjectFilter[] = ["all", "build", "quality", "devops"];
const projectsByFilter: Readonly<Record<ProjectFilter, typeof projects>> = {
  all: projects,
  build: projects.filter((project) => project.categories.includes("build")),
  quality: projects.filter((project) => project.categories.includes("quality")),
  devops: projects.filter((project) => project.categories.includes("devops"))
};
const projectCounts: Readonly<Record<ProjectFilter, number>> = {
  all: projects.length,
  build: projectsByFilter.build.length,
  quality: projectsByFilter.quality.length,
  devops: projectsByFilter.devops.length
};

export function ProjectsPanel({
  activeSlug,
  onActiveSlugChange,
  onExploreArchitecture
}: Readonly<{
  activeSlug?: string;
  onActiveSlugChange?: (slug: string) => void;
  onExploreArchitecture?: () => void;
}>): React.ReactElement {
  const [internalActiveSlug, setInternalActiveSlug] = useState(projects[0]?.slug ?? "");
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const resolvedActiveSlug = activeSlug ?? internalActiveSlug;
  const filteredProjects = projectsByFilter[filter];
  const activeProject =
    filteredProjects.find((project) => project.slug === resolvedActiveSlug) ??
    filteredProjects[0] ??
    projects[0];

  const selectProject = (slug: string): void => {
    setInternalActiveSlug(slug);
    onActiveSlugChange?.(slug);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Panel className="p-4">
        <p className="mono px-2 py-2 text-sm text-[var(--accent)]">case-studies</p>
        <div className="grid grid-cols-2 gap-2 px-2 pb-3" aria-label="Project filters">
          {projectFilters.map((item) => {
            const isActive = filter === item;
            const count = projectCounts[item];

            return (
              <button
                key={item}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  const nextProjects = projectsByFilter[item];
                  setFilter(item);
                  if (nextProjects[0]) {
                    selectProject(nextProjects[0].slug);
                  }
                }}
                className={cn(
                  "min-h-[var(--touch-target)] rounded-[var(--radius-control)] border px-3 py-2 text-left transition",
                  isActive
                    ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-strong)]"
                )}
              >
                <span className="mono block text-xs uppercase text-[var(--accent)]">{item}</span>
                <span className="mt-1 block text-xs text-[var(--text-muted)]">{count} items</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 space-y-2">
          {filteredProjects.map((project) => (
            <button
              key={project.slug}
              type="button"
              onClick={() => selectProject(project.slug)}
              className={`w-full rounded-[var(--radius-control)] border p-4 text-left transition ${
                activeProject?.slug === project.slug
                  ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-strong)]"
              }`}
            >
              <span className="block font-semibold">{project.title}</span>
              <span className="mt-2 block text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
                {project.label ?? project.status}
              </span>
              <span className="mt-3 flex flex-wrap gap-1">
                {project.categories.map((category) => (
                  <Badge key={category} tone={getCategoryTone(category)}>
                    {category}
                  </Badge>
                ))}
              </span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="p-5 sm:p-7">
        {activeProject ? (
          activeProject.slug === "enterprise-audit-monitoring-platform" ? (
            <FlagshipCaseStudy
              project={activeProject}
              onExploreArchitecture={onExploreArchitecture}
            />
          ) : (
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
                <ListBlock
                  title="Engineering Decisions"
                  items={activeProject.engineeringDecisions}
                />
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
          )
        ) : (
          <p>No projects configured.</p>
        )}
      </Panel>
    </div>
  );
}

function getCategoryTone(category: ProjectCategory): "info" | "success" | "warning" {
  if (category === "quality") {
    return "success";
  }

  if (category === "devops") {
    return "warning";
  }

  return "info";
}

function Field({ title, value }: Readonly<{ title: string; value: string }>): React.ReactElement {
  return (
    <section className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4">
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
    <section className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4">
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
