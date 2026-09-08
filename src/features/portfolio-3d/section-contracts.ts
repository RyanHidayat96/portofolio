import { apiEndpoints } from "@/data/api-endpoints";
import { branding } from "@/data/branding";
import { capabilities, fullCycleNodes } from "@/data/capabilities";
import { profile } from "@/data/profile";
import { professionalExperience } from "@/data/professional-summary";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { getWorkspacePath } from "@/features/workspace/routing";
import type { WorkspaceSection } from "@/features/workspace/types";
import type { Portfolio3dDataSourceRef, Portfolio3dSectionContract } from "./types";

const dataSource = (
  modulePath: string,
  exportName: string,
  usage: string
): Portfolio3dDataSourceRef => ({ modulePath, exportName, usage });

const routePathFor = (section: WorkspaceSection): string =>
  section === "overview" ? "/workspace" : getWorkspacePath({ section });

export const portfolio3dContentSnapshot = {
  appName: branding.appName,
  ownerName: profile.name,
  projectCount: projects.length,
  capabilityCount: capabilities.length,
  fullCycleNodeCount: fullCycleNodes.length,
  professionalExperienceCount: professionalExperience.length,
  skillGroupCount: skillGroups.length,
  apiEndpointCount: apiEndpoints.length
} as const;

export const portfolio3dSectionContracts = [
  {
    id: "overview",
    label: "Overview",
    workspaceSection: "overview",
    routePath: routePathFor("overview"),
    cameraPresetId: "overview",
    dataSources: [
      dataSource("@/data/branding", "branding", "hero statement and portfolio positioning"),
      dataSource("@/data/profile", "profile", "public owner identity and contact summary"),
      dataSource("@/data/capabilities", "capabilities", "build quality delivery overview")
    ],
    primaryAssetId: "room-shell",
    contentStrategy:
      "Use existing landing and overview copy as DOM content; keep canvas as navigation context."
  },
  {
    id: "profile",
    label: "Profile",
    workspaceSection: "profile",
    routePath: routePathFor("profile"),
    cameraPresetId: "profile",
    dataSources: [
      dataSource("@/data/profile", "profile", "public profile facts"),
      dataSource(
        "@/data/professional-summary",
        "professionalExperience",
        "current and historical roles"
      ),
      dataSource("@/data/professional-summary", "skillApplications", "applied core skills"),
      dataSource("@/data/education", "education", "education summary")
    ],
    primaryAssetId: "room-shell",
    hotspotId: "profile",
    contentStrategy: "Mirror the standard profile content while fitting the 3D monitor frame."
  },
  {
    id: "experience",
    label: "Experience",
    workspaceSection: "experience",
    routePath: routePathFor("experience"),
    cameraPresetId: "experience",
    dataSources: [
      dataSource(
        "@/data/professional-summary",
        "professionalExperience",
        "roles, companies, dates, contributions, and technologies"
      ),
      dataSource("@/data/profile", "profile", "role and availability")
    ],
    primaryAssetId: "room-shell",
    contentStrategy: "Mirror the standard experience content while fitting the 3D monitor frame."
  },
  {
    id: "projects",
    label: "Projects",
    workspaceSection: "projects",
    routePath: routePathFor("projects"),
    cameraPresetId: "projects",
    dataSources: [
      dataSource("@/data/projects", "projects", "project cards and safe case-study data")
    ],
    primaryAssetId: "main-monitor",
    hotspotId: "projects",
    screenNodeName: "Screen_Projects",
    contentStrategy:
      "Render project previews from existing project data; no private metrics or client facts."
  },
  {
    id: "fullstack",
    label: "Full Stack",
    workspaceSection: "profile",
    routePath: routePathFor("profile"),
    cameraPresetId: "fullstack",
    dataSources: [
      dataSource(
        "@/data/capabilities",
        "fullCycleNodes",
        "frontend API backend data capability nodes"
      ),
      dataSource("@/data/projects", "projects", "related full-stack project signals")
    ],
    primaryAssetId: "laptop",
    hotspotId: "fullstack",
    screenNodeName: "Screen_Fullstack",
    contentStrategy:
      "Use capability data to explain full-stack breadth without adding resume detail."
  },
  {
    id: "backend",
    label: "Backend and API",
    workspaceSection: "api",
    routePath: routePathFor("api"),
    cameraPresetId: "backend",
    dataSources: [
      dataSource("@/data/api-endpoints", "apiEndpoints", "API contract explorer"),
      dataSource("@/data/capabilities", "fullCycleNodes", "backend and data nodes")
    ],
    primaryAssetId: "server-rack",
    hotspotId: "backend",
    screenNodeName: "Screen_Backend",
    contentStrategy: "Expose API/backend competence through existing API lab contracts."
  },
  {
    id: "architecture",
    label: "Architecture",
    workspaceSection: "architecture",
    routePath: routePathFor("architecture"),
    cameraPresetId: "architecture",
    dataSources: [
      dataSource("@/data/architecture", "architectureMap", "system map"),
      dataSource("@/data/architecture", "architecturePresets", "architecture views")
    ],
    primaryAssetId: "architecture-screen",
    hotspotId: "architecture",
    screenNodeName: "Screen_Architecture",
    contentStrategy: "Use architecture explorer data as panel content and screen preview source."
  },
  {
    id: "automation",
    label: "Automation",
    workspaceSection: "automation",
    routePath: routePathFor("automation"),
    cameraPresetId: "automation",
    dataSources: [
      dataSource(
        "@/features/automation-lab/domain",
        "simulation engine",
        "deterministic automation scenarios"
      ),
      dataSource("@/data/capabilities", "capabilities", "quality capability mapping")
    ],
    primaryAssetId: "storage-shelf",
    hotspotId: "automation",
    contentStrategy: "Route to existing automation lab; keep 3D shelf as tooling signal only."
  },
  {
    id: "performance",
    label: "Performance",
    workspaceSection: "performance",
    routePath: routePathFor("performance"),
    cameraPresetId: "performance",
    dataSources: [
      dataSource("@/features/performance-lab/domain", "threshold logic", "performance scenarios")
    ],
    primaryAssetId: "hologram-projector",
    hotspotId: "performance",
    screenNodeName: "Hologram_Surface",
    contentStrategy:
      "Use hologram surface for lightweight threshold preview and DOM for readable details."
  },
  {
    id: "pipeline",
    label: "Pipeline",
    workspaceSection: "pipeline",
    routePath: routePathFor("pipeline"),
    cameraPresetId: "pipeline",
    dataSources: [
      dataSource("@/data/pipeline-metadata", "pipelinePanelMetadata", "pipeline metadata"),
      dataSource("@/features/pipeline/domain", "pipeline engine", "quality gate simulation")
    ],
    primaryAssetId: "pipeline-console",
    hotspotId: "pipeline",
    contentStrategy: "Use pipeline console as CI/CD entry; keep gate details in the existing panel."
  },
  {
    id: "terminal",
    label: "Terminal",
    workspaceSection: "terminal",
    routePath: routePathFor("terminal"),
    cameraPresetId: "terminal",
    dataSources: [dataSource("@/features/terminal/domain", "terminal commands", "command surface")],
    primaryAssetId: "keyboard-mouse",
    hotspotId: "terminal",
    contentStrategy:
      "Open the existing terminal rather than duplicating command parsing inside canvas."
  },
  {
    id: "contact",
    label: "Contact",
    workspaceSection: "contact",
    routePath: routePathFor("contact"),
    cameraPresetId: "contact",
    dataSources: [dataSource("@/data/profile", "profile.contact", "verified contact and CV links")],
    primaryAssetId: "desk-accessories",
    hotspotId: "contact",
    screenNodeName: "Phone_Display",
    contentStrategy:
      "Use existing contact data and CV link; phone/email/link targets stay data-driven."
  }
] as const satisfies readonly Portfolio3dSectionContract[];
