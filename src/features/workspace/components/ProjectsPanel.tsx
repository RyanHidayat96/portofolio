"use client";

import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { projects } from "@/data/projects";
import type { ProjectCaseStudy, ProjectCategory } from "@/data/types";
import { FlagshipCaseStudy } from "@/features/workspace/components/FlagshipCaseStudy";
import { useState } from "react";

type ProjectFilter = "all" | ProjectCategory;

const projectFilters: readonly ProjectFilter[] = ["all", "build", "quality", "devops"];
const featuredProjectSlugs = new Set([
  "enterprise-audit-monitoring-platform",
  "enterprise-web-automation-ecosystem",
  "cicd-quality-gates"
]);
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
    projects.find((project) => project.slug === resolvedActiveSlug) ??
    filteredProjects[0] ??
    projects[0];

  const selectProject = (slug: string): void => {
    setInternalActiveSlug(slug);
    onActiveSlugChange?.(slug);
  };

  return (
    <div className="projects-explorer">
      <Panel className="projects-index-panel">
        <header className="projects-index-header">
          <p className="eyebrow">case-studies</p>
          <h1>Project worlds, not resume bullets.</h1>
          <p>
            Pick a case study. Each project opens into public-safe architecture, build decisions,
            testing strategy, performance signal, and impact.
          </p>
        </header>

        <div className="project-filter-grid" role="group" aria-label="Project filters">
          {projectFilters.map((item) => {
            const isActive = filter === item;
            const count = projectCounts[item];

            return (
              <button
                key={item}
                type="button"
                aria-pressed={isActive}
                aria-label={`Show ${item} projects (${count})`}
                onClick={() => {
                  const nextProjects = projectsByFilter[item];
                  setFilter(item);
                  if (nextProjects[0]) {
                    selectProject(nextProjects[0].slug);
                  }
                }}
                className="project-filter-button"
                data-active={isActive}
              >
                <span>{item}</span>
                <strong>{count}</strong>
              </button>
            );
          })}
        </div>

        <div className="project-card-list" aria-label="Project case study list">
          {filteredProjects.map((project) => {
            const isActive = activeProject?.slug === project.slug;
            const isFeatured = featuredProjectSlugs.has(project.slug);

            return (
              <button
                key={project.slug}
                type="button"
                onClick={() => selectProject(project.slug)}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Open ${project.title} case study`}
                className="project-card-button"
                data-cursor-intent="project"
                data-cursor-label="OPEN"
                data-active={isActive}
              >
                <ProjectCardPreview project={project} />
                <span className="project-card-kicker">
                  {isFeatured ? "featured world" : project.status}
                </span>
                <strong>{project.title}</strong>
                <small>{project.engineered ?? project.responsibility}</small>
                <span className="project-card-badges">
                  {project.categories.map((category) => (
                    <Badge key={category} tone={getCategoryTone(category)}>
                      {category}
                    </Badge>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel key={activeProject?.slug ?? "empty"} className="projects-case-panel">
        {activeProject ? (
          <FlagshipCaseStudy
            project={activeProject}
            onExploreArchitecture={onExploreArchitecture}
          />
        ) : (
          <p>No projects configured.</p>
        )}
      </Panel>
    </div>
  );
}

function ProjectCardPreview({
  project
}: Readonly<{ project: ProjectCaseStudy }>): React.ReactElement {
  const previewNodes = getPreviewNodes(project);

  return (
    <span className="project-card-preview" aria-hidden="true">
      {previewNodes.map((node, index) => (
        <span key={`${project.slug}-${node}-${index}`}>
          {node}
        </span>
      ))}
    </span>
  );
}

function getPreviewNodes(project: ProjectCaseStudy): readonly string[] {
  if (project.architectureLayers && project.architectureLayers.length > 0) {
    return project.architectureLayers.slice(0, 4).map((layer) => layer.label.split(" /")[0]);
  }

  const categoryLabels = project.categories.map((category) => category.toUpperCase());
  const technologyLabels = project.technologies.slice(0, 3);
  return [...categoryLabels, ...technologyLabels].slice(0, 4);
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
