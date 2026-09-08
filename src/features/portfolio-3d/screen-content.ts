import { architectureNodes, architecturePresets } from "@/data/architecture";
import { apiEndpoints } from "@/data/api-endpoints";
import { capabilities, fullCycleNodes } from "@/data/capabilities";
import { pipelinePanelMetadata } from "@/data/pipeline-metadata";
import { profile } from "@/data/profile";
import { professionalExperience, skillApplications } from "@/data/professional-summary";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import type { ContactLink, EngineeringDomain, ProjectCategory } from "@/data/types";
import {
  performanceScenarios,
  performanceThresholds
} from "@/features/performance-lab/domain/performance";
import { pipelineScenarios, pipelineStageDefinitions } from "@/features/pipeline/domain/pipeline";
import type { Portfolio3dScreenNodeName, Portfolio3dSectionId } from "./types";

export interface Portfolio3dScreenPreview {
  readonly sectionId: Portfolio3dSectionId;
  readonly screenNodeName: Portfolio3dScreenNodeName;
  readonly eyebrow: string;
  readonly title: string;
  readonly lines: readonly string[];
  readonly accent: string;
}

export interface Portfolio3dPanelBlock {
  readonly heading: string;
  readonly body?: string;
  readonly items?: readonly string[];
}

export interface Portfolio3dPanelLink {
  readonly label: string;
  readonly href: string;
  readonly external: boolean;
}

export interface Portfolio3dSectionPanelContent {
  readonly sectionId: Portfolio3dSectionId;
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly blocks: readonly Portfolio3dPanelBlock[];
  readonly tags: readonly string[];
  readonly links: readonly Portfolio3dPanelLink[];
  readonly emptyLabel: string;
}

const maxPanelItems = 4;
const maxPanelTags = 8;
const maxScreenLines = 4;

const buildCapability = findCapability("build");
const qualityCapability = findCapability("quality");
const dataCapability = findCapability("data");
const deliveryCapability = findCapability("delivery");
const frontendNode = fullCycleNodes.find((node) => node.id === "frontend");
const apiNode = fullCycleNodes.find((node) => node.id === "api");
const backendNode = fullCycleNodes.find((node) => node.id === "backend");
const dataNode = fullCycleNodes.find((node) => node.id === "data");
const cicdNode = fullCycleNodes.find((node) => node.id === "cicd");
const contactLinks = Object.values(profile.contact)
  .filter(isConfiguredSafeContactLink)
  .map(toPanelLink);
const primaryContactLinks = contactLinks.filter((link) =>
  ["CV", "Email", "Phone", "LinkedIn"].includes(link.label)
);
const buildProjects = projectsByCategory("build");
const qualityProjects = projectsByCategory("quality");
const deliveryProjects = projectsByCategory("devops");

export const portfolio3dScreenPreviews = [
  {
    sectionId: "projects",
    screenNodeName: "Screen_Projects",
    eyebrow: "case studies",
    title: "Project systems",
    lines: projectTitleLines(projects),
    accent: "#51d8ff"
  },
  {
    sectionId: "architecture",
    screenNodeName: "Screen_Architecture",
    eyebrow: "architecture",
    title: "System maps",
    lines: architecturePresets.slice(0, maxScreenLines).map((preset) => preset.title),
    accent: "#8ff5c5"
  },
  {
    sectionId: "fullstack",
    screenNodeName: "Screen_Fullstack",
    eyebrow: "full stack",
    title: "Build path",
    lines: compactStrings([
      frontendNode?.label,
      apiNode?.label,
      backendNode?.label,
      dataNode?.label
    ]),
    accent: "#7fc8ff"
  },
  {
    sectionId: "backend",
    screenNodeName: "Screen_Backend",
    eyebrow: "backend",
    title: "API boundary",
    lines: apiEndpoints.slice(0, maxScreenLines).map((endpoint) => endpoint.path),
    accent: "#9df2d0"
  },
  {
    sectionId: "performance",
    screenNodeName: "Hologram_Surface",
    eyebrow: "quality signal",
    title: "Performance gates",
    lines: performanceScenarios.slice(0, maxScreenLines).map((scenario) => scenario.label),
    accent: "#ffd86b"
  },
  {
    sectionId: "contact",
    screenNodeName: "Phone_Display",
    eyebrow: "contact",
    title: profile.name,
    lines: primaryContactLinks.slice(0, 3).map((link) => link.label),
    accent: "#53e0ff"
  }
] as const satisfies readonly Portfolio3dScreenPreview[];

export const portfolio3dPanelContentBySection: Readonly<
  Partial<Record<Portfolio3dSectionId, Portfolio3dSectionPanelContent>>
> = {
  overview: {
    sectionId: "overview",
    eyebrow: "portfolio 3d",
    title: `${profile.name} workspace`,
    summary: profile.summary,
    blocks: [
      {
        heading: "Public focus",
        items: profile.focusAreas.slice(0, maxPanelItems)
      },
      {
        heading: "How to read it",
        body: "The room opens concise proof areas first. Detailed employment history stays in the CV."
      }
    ],
    tags: uniqueStrings([
      profile.role,
      ...profile.focusAreas,
      ...compactStrings([
        buildCapability?.title,
        qualityCapability?.title,
        deliveryCapability?.title
      ])
    ]).slice(0, maxPanelTags),
    links: primaryContactLinks,
    emptyLabel: "Portfolio summary is not configured yet."
  },
  profile: {
    sectionId: "profile",
    eyebrow: "profile",
    title: "Professional Profile",
    summary:
      "Development background across financial applications, enterprise workflows, software testing, and full-stack delivery.",
    blocks: [
      {
        heading: "Current positioning",
        items: compactStrings([
          professionalExperience[0]
            ? `${professionalExperience[0].role} at ${professionalExperience[0].company}`
            : profile.role,
          `${profile.yearsOfExperience} in development and quality`,
          profile.location,
          profile.availability
        ])
      },
      {
        heading: "Core skills",
        items: Object.values(skillApplications).map((application) => application.title)
      }
    ],
    tags: uniqueStrings([
      profile.role,
      ...profile.focusAreas,
      ...Object.values(skillApplications).map((application) => application.title)
    ]).slice(0, maxPanelTags),
    links: primaryContactLinks,
    emptyLabel: "Profile data is not configured yet."
  },
  experience: {
    sectionId: "experience",
    eyebrow: "work experience",
    title: "Work Experience",
    summary: "Software development, test automation, and enterprise delivery.",
    blocks: professionalExperience.slice(0, 4).map((role) => ({
      heading: `${role.role} - ${role.company}`,
      body: `${role.period} - ${role.summary}`,
      items: role.contributions.slice(0, maxPanelItems)
    })),
    tags: uniqueStrings(professionalExperience.flatMap((role) => role.technologies)).slice(
      0,
      maxPanelTags
    ),
    links: contactLinks.filter((link) => link.label === "CV"),
    emptyLabel: "Work experience is not configured yet."
  },
  projects: {
    sectionId: "projects",
    eyebrow: "projects",
    title: "Project systems",
    summary:
      "Public-safe case studies show product build, automation, performance, and delivery thinking.",
    blocks: projects.slice(0, maxPanelItems).map((project) => ({
      heading: project.title,
      body: project.engineered ?? project.overview ?? project.problem,
      items: project.technologies.slice(0, 4)
    })),
    tags: uniqueStrings(projects.flatMap((project) => project.categories)).slice(0, maxPanelTags),
    links: [],
    emptyLabel: "Project data is not configured yet."
  },
  fullstack: {
    sectionId: "fullstack",
    eyebrow: "full stack",
    title: "Application path",
    summary:
      buildCapability?.description ??
      "Frontend, API, backend, and data work as one application system.",
    blocks: [
      {
        heading: "Build flow",
        items: compactStrings([
          frontendNode ? `${frontendNode.label}: ${frontendNode.description}` : undefined,
          apiNode ? `${apiNode.label}: ${apiNode.description}` : undefined,
          backendNode ? `${backendNode.label}: ${backendNode.description}` : undefined,
          dataNode ? `${dataNode.label}: ${dataNode.description}` : undefined
        ]).slice(0, maxPanelItems)
      },
      {
        heading: "Project signal",
        items: buildProjects.slice(0, 3).map((project) => project.title)
      }
    ],
    tags: uniqueStrings([
      ...(buildCapability?.technologies ?? []),
      ...(dataCapability?.technologies ?? [])
    ]).slice(0, maxPanelTags),
    links: [],
    emptyLabel: "Full-stack content is not configured yet."
  },
  backend: {
    sectionId: "backend",
    eyebrow: "backend",
    title: "Backend and API boundary",
    summary:
      backendNode?.description ??
      "Backend services connect route contracts, validation, data, and integration work.",
    blocks: [
      {
        heading: "API surface",
        items: apiEndpoints
          .slice(0, maxPanelItems)
          .map((endpoint) => `${endpoint.method} ${endpoint.path}`)
      },
      {
        heading: "Backend signal",
        items: buildProjects.slice(0, 2).map((project) => project.title)
      }
    ],
    tags: uniqueStrings([
      ...(backendNode?.technologies ?? []),
      ...(apiNode?.technologies ?? [])
    ]).slice(0, maxPanelTags),
    links: [],
    emptyLabel: "Backend content is not configured yet."
  },
  architecture: {
    sectionId: "architecture",
    eyebrow: "architecture",
    title: "Architecture maps",
    summary:
      "Public-safe maps connect build, quality, data, and delivery decisions without exposing private systems.",
    blocks: [
      {
        heading: "Available views",
        items: architecturePresets.slice(0, maxPanelItems).map((preset) => preset.title)
      },
      {
        heading: "Core nodes",
        items: architectureNodes
          .slice(0, maxPanelItems)
          .map((node) => `${node.label}: ${node.layer}`)
      }
    ],
    tags: uniqueStrings(architectureNodes.map((node) => node.layer)).slice(0, maxPanelTags),
    links: [],
    emptyLabel: "Architecture content is not configured yet."
  },
  automation: {
    sectionId: "automation",
    eyebrow: "automation",
    title: "SDET automation layer",
    summary:
      qualityCapability?.description ??
      "Automation makes web, mobile, API, and release signals repeatable.",
    blocks: [
      ...skillGroups
        .filter((group) => group.id === "quality")
        .flatMap((group) =>
          group.skills.slice(0, 3).map((skill) => ({
            heading: skill.name,
            body: skill.purpose,
            items: skill.relatedProjects.slice(0, 3)
          }))
        ),
      {
        heading: "Project signal",
        items: qualityProjects.slice(0, 3).map((project) => project.title)
      }
    ].slice(0, maxPanelItems),
    tags: uniqueStrings(qualityCapability?.technologies ?? []).slice(0, maxPanelTags),
    links: [],
    emptyLabel: "Automation content is not configured yet."
  },
  performance: {
    sectionId: "performance",
    eyebrow: "performance and quality",
    title: "Performance as release signal",
    summary:
      "Scenario data shows how latency, checks, and threshold posture can inform release decisions.",
    blocks: [
      {
        heading: "Scenarios",
        items: performanceScenarios.slice(0, maxPanelItems).map((scenario) => scenario.label)
      },
      {
        heading: "Thresholds",
        items: performanceThresholds
          .slice(0, maxPanelItems)
          .map((threshold) => `${threshold.label}: ${formatThresholdTarget(threshold)}`)
      }
    ],
    tags: uniqueStrings([...(qualityCapability?.technologies ?? []), "Performance Testing"]).slice(
      0,
      maxPanelTags
    ),
    links: [],
    emptyLabel: "Performance content is not configured yet."
  },
  pipeline: {
    sectionId: "pipeline",
    eyebrow: "ci/cd and sdet",
    title: pipelinePanelMetadata.title,
    summary: pipelinePanelMetadata.description,
    blocks: [
      {
        heading: "Delivery flow",
        items: pipelinePanelMetadata.flow.slice(0, maxPanelItems)
      },
      {
        heading: "Decision states",
        items: pipelineScenarios.slice(0, maxPanelItems).map((scenario) => scenario.label)
      },
      {
        heading: "Gate stages",
        items: pipelineStageDefinitions.slice(0, maxPanelItems).map((stage) => stage.label)
      },
      {
        heading: "Delivery signals",
        items: deliveryProjects.slice(0, maxPanelItems).map((project) => project.title)
      }
    ],
    tags: uniqueStrings([
      ...(deliveryCapability?.technologies ?? []),
      ...(cicdNode?.technologies ?? [])
    ]).slice(0, maxPanelTags),
    links: [],
    emptyLabel: "Pipeline content is not configured yet."
  },
  terminal: {
    sectionId: "terminal",
    eyebrow: "skills",
    title: "Skills and command surface",
    summary:
      "Terminal commands expose the same public portfolio data through a concise engineering interface.",
    blocks: skillGroups.slice(0, maxPanelItems).map((group) => ({
      heading: group.title,
      items: group.skills.slice(0, 3).map((skill) => skill.name)
    })),
    tags: uniqueStrings(
      skillGroups.flatMap((group) => group.skills.map((skill) => skill.name))
    ).slice(0, maxPanelTags),
    links: [],
    emptyLabel: "Skill groups are not configured yet."
  },
  contact: {
    sectionId: "contact",
    eyebrow: "contact",
    title: "Contact and CV",
    summary: "Recruiter-safe contact actions come from configured profile data only.",
    blocks: [
      {
        heading: "Available channels",
        items: contactLinks.map((link) => link.label).slice(0, maxPanelItems)
      },
      {
        heading: "CV first",
        body: "The public site keeps work history light. Full employment detail belongs in the downloadable CV."
      }
    ],
    tags: contactLinks.map((link) => link.label).slice(0, maxPanelTags),
    links: contactLinks,
    emptyLabel: "Contact links are not configured yet."
  }
};

export function getPortfolio3dPanelContent(
  sectionId: Portfolio3dSectionId
): Portfolio3dSectionPanelContent | null {
  return portfolio3dPanelContentBySection[sectionId] ?? null;
}

export function isPortfolio3dSafeHref(href: string): boolean {
  return (
    href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("https://")
  );
}

function isConfiguredSafeContactLink(link: ContactLink): boolean {
  return (
    link.href.trim().length > 0 && link.value.trim().length > 0 && isPortfolio3dSafeHref(link.href)
  );
}

function toPanelLink(link: ContactLink): Portfolio3dPanelLink {
  return {
    label: link.label,
    href: link.href,
    external: link.href.startsWith("https://")
  };
}

function findCapability(domain: EngineeringDomain) {
  return capabilities.find((capability) => capability.domain === domain);
}

function projectsByCategory(category: ProjectCategory) {
  return projects.filter((project) => project.categories.includes(category));
}

function projectTitleLines(sourceProjects: typeof projects): readonly string[] {
  return sourceProjects.slice(0, maxScreenLines).map((project) => project.title);
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function compactStrings(values: readonly (string | undefined)[]): readonly string[] {
  return values.filter((value): value is string => Boolean(value && value.trim().length > 0));
}

function formatThresholdTarget(threshold: (typeof performanceThresholds)[number]): string {
  const operator = threshold.comparison === "less-than" ? "<" : ">";
  const suffix = threshold.unit ? ` ${threshold.unit}` : "";

  return `${operator} ${threshold.target}${suffix}`;
}
