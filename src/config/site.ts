import type { Metadata } from "next";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import type { WorkspaceSection } from "@/features/workspace/types";
import type { WorkspaceRouteState } from "@/features/workspace/routing";
import { getWorkspacePath } from "@/features/workspace/routing";

const fallbackSiteUrl = "http://localhost:3000";

interface RouteMetadataText {
  readonly title: string;
  readonly description: string;
}

export const siteConfig = {
  name: "RyanOS",
  title: `${profile.name} - SDET & QA Automation Engineer`,
  description:
    "Interactive RyanOS engineering portfolio for QA Automation, SDET work, Playwright, Appium, API testing, performance testing, and CI/CD quality gates.",
  shortDescription: profile.tagline,
  ownerName: profile.name,
  locale: "en_US",
  siteUrl: resolveSiteUrl(),
  ogImagePath: "/opengraph-image",
  twitterImagePath: "/twitter-image"
} as const;

const sectionMetadata: Readonly<Record<WorkspaceSection, RouteMetadataText>> = {
  overview: {
    title: "RyanOS",
    description: siteConfig.description
  },
  profile: {
    title: "Profile",
    description: profile.summary
  },
  experience: {
    title: "Experience",
    description: "Verified SDET, QA automation, and software engineering experience."
  },
  projects: {
    title: "Projects",
    description:
      "Portfolio-safe SDET case studies covering automation, mobile, CI/CD, API, and performance work."
  },
  automation: {
    title: "Automation Lab",
    description: "Interactive automation failure, healing, and rerun strategy demo."
  },
  pipeline: {
    title: "Pipeline Lab",
    description: "Deterministic CI/CD quality gate and deployment-readiness simulation."
  },
  performance: {
    title: "Performance Lab",
    description: "Load, peak, and stress threshold simulator for release-quality decisions."
  },
  api: {
    title: "API Lab",
    description: "Portfolio API contract explorer for RyanOS data routes."
  },
  architecture: {
    title: "Architecture",
    description: "RyanOS architecture map for data, UI, simulations, tests, and API routes."
  },
  terminal: {
    title: "Terminal",
    description: "Interactive RyanOS terminal command surface."
  },
  challenge: {
    title: "Test Me",
    description: "Scenario-based SDET decision challenge."
  },
  contact: {
    title: "Contact",
    description: `Contact ${profile.name} for relevant SDET and QA Automation opportunities.`
  }
};

export function resolveSiteUrl(rawUrl = process.env.NEXT_PUBLIC_SITE_URL): URL {
  const value = rawUrl?.trim();

  if (!value) {
    return new URL(fallbackSiteUrl);
  }

  try {
    const url = new URL(value);
    return new URL(url.origin);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export function getAbsoluteUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.siteUrl).toString();
}

export function getWorkspaceRouteMetadata(route: WorkspaceRouteState): Metadata {
  const path = getWorkspacePath(route);
  const project = route.projectSlug
    ? projects.find((candidate) => candidate.slug === route.projectSlug)
    : undefined;
  const fallback = sectionMetadata[route.section];
  const title = project?.title ?? fallback.title;
  const description = project?.problem ?? fallback.description;

  return {
    title,
    description,
    alternates: {
      canonical: path
    },
    openGraph: {
      title,
      description,
      url: path
    },
    twitter: {
      title,
      description
    }
  };
}
