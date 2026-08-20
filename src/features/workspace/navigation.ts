import type { WorkspaceMode, WorkspaceSection } from "@/features/workspace/types";
import { profile } from "@/data/profile";
import {
  Activity,
  BadgeCheck,
  Brain,
  BriefcaseBusiness,
  FlaskConical,
  Gauge,
  GitBranch,
  Mail,
  Network,
  Send,
  TerminalSquare,
  UserRound,
  type LucideIcon
} from "lucide-react";

export interface WorkspaceNavigationItem {
  readonly id: WorkspaceSection;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly description: string;
}

export interface WorkspaceNavigationGroup {
  readonly label: string;
  readonly items: readonly WorkspaceNavigationItem[];
}

export interface PaletteAction {
  readonly id: string;
  readonly label: string;
  readonly section: WorkspaceSection;
  readonly description: string;
}

const navigationItems: Record<WorkspaceSection, WorkspaceNavigationItem> = {
  overview: {
    id: "overview",
    label: "Overview",
    icon: Activity,
    description: "Fast professional snapshot and entry points."
  },
  profile: {
    id: "profile",
    label: "Profile",
    icon: UserRound,
    description: "Identity, summary, education, and skill groups."
  },
  experience: {
    id: "experience",
    label: "Experience",
    icon: BriefcaseBusiness,
    description: "Verified professional timeline."
  },
  projects: {
    id: "projects",
    label: "Projects",
    icon: BadgeCheck,
    description: "Portfolio-safe engineering work highlights."
  },
  automation: {
    id: "automation",
    label: "Automation Lab",
    icon: FlaskConical,
    description: "Run automation and self-healing simulation."
  },
  pipeline: {
    id: "pipeline",
    label: "Pipeline",
    icon: GitBranch,
    description: "Inspect CI/CD quality gate behavior."
  },
  performance: {
    id: "performance",
    label: "Performance",
    icon: Gauge,
    description: "Evaluate deterministic load-test thresholds."
  },
  api: {
    id: "api",
    label: "API Lab",
    icon: Send,
    description: "Send requests to portfolio-safe API routes."
  },
  architecture: {
    id: "architecture",
    label: "Architecture",
    icon: Network,
    description: "Explore quality engineering topology."
  },
  terminal: {
    id: "terminal",
    label: "Terminal",
    icon: TerminalSquare,
    description: "Run commands for profile, projects, labs, and contact."
  },
  challenge: {
    id: "challenge",
    label: "Test Me",
    icon: Brain,
    description: "Try engineering reasoning scenarios."
  },
  contact: {
    id: "contact",
    label: "Contact",
    icon: Mail,
    description: "Open verified contact channels."
  }
} as const;

const recruiterPrimary: readonly WorkspaceSection[] = [
  "overview",
  "profile",
  "experience",
  "projects",
  "contact"
];

const recruiterSecondary: readonly WorkspaceSection[] = [
  "automation",
  "pipeline",
  "performance",
  "api",
  "architecture",
  "terminal",
  "challenge"
];

const engineerPrimary: readonly WorkspaceSection[] = [
  "automation",
  "pipeline",
  "performance",
  "api",
  "architecture",
  "terminal",
  "challenge"
];

const engineerSecondary: readonly WorkspaceSection[] = [
  "overview",
  "projects",
  "profile",
  "experience",
  "contact"
];

export const modeDefaultSection: Record<WorkspaceMode, WorkspaceSection> = {
  recruiter: "overview",
  engineer: "automation"
};

export function getNavigationItem(section: WorkspaceSection): WorkspaceNavigationItem {
  return navigationItems[section];
}

export function getNavigationGroups(mode: WorkspaceMode): readonly WorkspaceNavigationGroup[] {
  const [primaryLabel, secondaryLabel, primary, secondary] =
    mode === "recruiter"
      ? ["Recruiter Path", "Engineering Labs", recruiterPrimary, recruiterSecondary]
      : ["Engineering Labs", "Profile Context", engineerPrimary, engineerSecondary];

  return [
    {
      label: primaryLabel,
      items: primary.map((section) => navigationItems[section])
    },
    {
      label: secondaryLabel,
      items: secondary.map((section) => navigationItems[section])
    }
  ];
}

export function getNavigationItemsForMode(mode: WorkspaceMode): readonly WorkspaceNavigationItem[] {
  return getNavigationGroups(mode).flatMap((group) => group.items);
}

export function getPaletteActions(mode: WorkspaceMode): readonly PaletteAction[] {
  return getNavigationItemsForMode(mode).map((item) => ({
    id: `${mode}-${item.id}`,
    label:
      item.id === "automation"
        ? "Run Automation"
        : item.id === "pipeline"
          ? "Run Pipeline"
          : item.id === "contact"
            ? `Contact ${profile.name}`
            : `Go to ${item.label}`,
    section: item.id,
    description: item.description
  }));
}
