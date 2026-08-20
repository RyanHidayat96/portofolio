import type { Metadata } from "next";
import { branding } from "@/data/branding";
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
  name: branding.appName,
  title: `${profile.name} — ${profile.headline}`,
  description: branding.metadataDescription,
  shortDescription: profile.tagline,
  ownerName: profile.name,
  locale: "en_US",
  siteUrl: resolveSiteUrl(),
  ogImagePath: "/opengraph-image",
  twitterImagePath: "/twitter-image"
} as const;

const sectionMetadata: Readonly<Record<WorkspaceSection, RouteMetadataText>> = {
  overview: {
    title: branding.appName,
    description: siteConfig.description
  },
  profile: {
    title: "Profile",
    description: profile.summary
  },
  experience: {
    title: "Experience",
    description: "Verified professional experience."
  },
  projects: {
    title: "Projects",
    description: "Portfolio-safe case studies and work highlights."
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
    description: `Portfolio API contract explorer for ${branding.appName} data routes.`
  },
  architecture: {
    title: "Architecture",
    description: `${branding.appName} architecture map for data, UI, simulations, tests, and API routes.`
  },
  terminal: {
    title: "Terminal",
    description: `Interactive ${branding.appName} terminal command surface.`
  },
  challenge: {
    title: "Test Me",
    description: "Scenario-based decision challenge."
  },
  contact: {
    title: "Contact",
    description: `Contact ${profile.name} for relevant opportunities.`
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
