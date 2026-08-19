import { projects } from "@/data/projects";
import type { WorkspaceMode, WorkspaceSection } from "@/features/workspace/types";

export interface WorkspaceRouteState {
  readonly section: WorkspaceSection;
  readonly mode: WorkspaceMode;
  readonly projectSlug?: string;
  readonly isDeepLink: boolean;
  readonly isKnownRoute: boolean;
}

export interface WorkspacePathInput {
  readonly section: WorkspaceSection;
  readonly mode?: WorkspaceMode;
  readonly projectSlug?: string;
}

const knownProjectSlugs = new Set(projects.map((project) => project.slug));

const labSectionBySegment: Readonly<Record<string, WorkspaceSection>> = {
  automation: "automation",
  pipeline: "pipeline",
  performance: "performance",
  api: "api",
  architecture: "architecture"
};

const standaloneSectionBySegment: Readonly<Record<string, WorkspaceSection>> = {
  overview: "overview",
  profile: "profile",
  experience: "experience",
  terminal: "terminal",
  "test-me": "challenge",
  contact: "contact"
};

const pathBySection: Readonly<Record<WorkspaceSection, string>> = {
  overview: "/overview",
  profile: "/profile",
  experience: "/experience",
  projects: "/projects",
  automation: "/labs/automation",
  pipeline: "/labs/pipeline",
  performance: "/labs/performance",
  api: "/labs/api",
  architecture: "/labs/architecture",
  terminal: "/terminal",
  challenge: "/test-me",
  contact: "/contact"
};

export const homeWorkspaceRoute: WorkspaceRouteState = {
  section: "overview",
  mode: "recruiter",
  isDeepLink: false,
  isKnownRoute: true
};

export function resolveWorkspaceRouteFromPathname(pathname: string): WorkspaceRouteState {
  const segments = pathname
    .split("/")
    .map((segment) => decodeURIComponent(segment.trim()))
    .filter(Boolean);

  return resolveWorkspaceRouteFromSegments(segments);
}

export function resolveWorkspaceRouteFromSegments(
  segments: readonly string[] | undefined
): WorkspaceRouteState {
  if (!segments || segments.length === 0) {
    return homeWorkspaceRoute;
  }

  const [firstSegment, secondSegment, ...restSegments] = segments;

  if (firstSegment === "projects" && restSegments.length === 0) {
    if (!secondSegment) {
      return createKnownRoute("projects", "recruiter");
    }

    if (knownProjectSlugs.has(secondSegment)) {
      return {
        ...createKnownRoute("projects", "recruiter"),
        projectSlug: secondSegment
      };
    }
  }

  if (firstSegment === "labs" && restSegments.length === 0) {
    if (!secondSegment) {
      return createKnownRoute("overview", "engineer");
    }

    const labSection = labSectionBySegment[secondSegment];
    if (labSection) {
      return createKnownRoute(labSection, "engineer");
    }
  }

  if (!secondSegment) {
    const standaloneSection = standaloneSectionBySegment[firstSegment];
    if (standaloneSection) {
      return createKnownRoute(standaloneSection, preferredModeForSection(standaloneSection));
    }
  }

  return {
    ...homeWorkspaceRoute,
    isKnownRoute: false
  };
}

export function getWorkspacePath(input: WorkspacePathInput): string {
  if (input.section === "overview" && input.mode === "engineer") {
    return "/labs";
  }

  if (input.section === "projects" && isKnownProjectSlug(input.projectSlug)) {
    return `/projects/${input.projectSlug}`;
  }

  return pathBySection[input.section];
}

export function createRouteForSection(
  section: WorkspaceSection,
  options: Readonly<{
    mode?: WorkspaceMode;
    projectSlug?: string;
  }> = {}
): WorkspaceRouteState {
  return {
    section,
    mode: options.mode ?? preferredModeForSection(section),
    projectSlug: section === "projects" ? options.projectSlug : undefined,
    isDeepLink: true,
    isKnownRoute: true
  };
}

export function getStaticWorkspacePaths(): readonly string[] {
  return [
    "/",
    ...Object.values(pathBySection),
    "/labs",
    ...projects.map((project) => `/projects/${project.slug}`)
  ];
}

export function preferredModeForSection(section: WorkspaceSection): WorkspaceMode {
  return section === "automation" ||
    section === "pipeline" ||
    section === "performance" ||
    section === "api" ||
    section === "architecture" ||
    section === "terminal" ||
    section === "challenge"
    ? "engineer"
    : "recruiter";
}

function createKnownRoute(section: WorkspaceSection, mode: WorkspaceMode): WorkspaceRouteState {
  return {
    section,
    mode,
    isDeepLink: true,
    isKnownRoute: true
  };
}

function isKnownProjectSlug(slug: string | undefined): slug is string {
  return typeof slug === "string" && knownProjectSlugs.has(slug);
}
