import type { WorkspaceMode, WorkspaceSection } from "@/features/workspace/types";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
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
  readonly description: string;
  readonly section?: WorkspaceSection;
  readonly mode?: WorkspaceMode;
  readonly projectSlug?: string;
  readonly href?: string;
  readonly isExternal?: boolean;
  readonly keywords?: readonly string[];
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
    description: "Identity, education, and engineering capability matrix."
  },
  experience: {
    id: "experience",
    label: "Experience",
    icon: BriefcaseBusiness,
    description: "Career evolution, Jasa Marga role growth, and role evidence."
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
    description: "Inspect delivery lifecycle and quality gate behavior."
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
    description: "Explore full-cycle engineering topology."
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

const engineerPrimary: readonly WorkspaceSection[] = [
  "overview",
  "architecture",
  "projects",
  "api",
  "automation",
  "performance",
  "pipeline",
  "terminal"
];

const engineerSecondary: readonly WorkspaceSection[] = [
  "profile",
  "experience",
  "challenge",
  "contact"
];

export const modeDefaultSection: Record<WorkspaceMode, WorkspaceSection> = {
  recruiter: "overview",
  engineer: "overview"
};

export function getNavigationItem(section: WorkspaceSection): WorkspaceNavigationItem {
  return navigationItems[section];
}

export function getNavigationGroups(mode: WorkspaceMode): readonly WorkspaceNavigationGroup[] {
  if (mode === "recruiter") {
    return [
      {
        label: "Recruiter Path",
        items: recruiterPrimary.map((section) => navigationItems[section])
      }
    ];
  }

  return [
    {
      label: "Engineer Path",
      items: engineerPrimary.map((section) => navigationItems[section])
    },
    {
      label: "Profile Context",
      items: engineerSecondary.map((section) => navigationItems[section])
    }
  ];
}

export function getNavigationItemsForMode(mode: WorkspaceMode): readonly WorkspaceNavigationItem[] {
  return getNavigationGroups(mode).flatMap((group) => group.items);
}

export function getPaletteActions(mode: WorkspaceMode): readonly PaletteAction[] {
  const flagshipProject =
    projects.find((project) => project.slug === "enterprise-audit-monitoring-platform") ??
    projects[0];
  const quickActions: PaletteAction[] = [
    {
      id: "quick-recruiter",
      label: "Open Recruiter Mode",
      section: "overview",
      mode: "recruiter",
      description: "Switch to the 60-second hiring overview.",
      keywords: ["overview", "summary", "hr"]
    },
    {
      id: "quick-engineer",
      label: "Open Engineer Mode",
      section: "overview",
      mode: "engineer",
      description: "Switch to the deeper RyanOS engineering workspace.",
      keywords: ["workspace", "technical", "labs"]
    },
    {
      id: "quick-full-cycle",
      label: "Explore Full Cycle",
      section: "overview",
      mode: "engineer",
      description: "Open the Build, Quality, and Full Cycle engineering experience.",
      keywords: ["build", "quality", "data", "delivery"]
    },
    {
      id: "quick-current-role",
      label: "View Current Role",
      section: "experience",
      description: `${profile.role} career evidence and role evolution.`,
      keywords: ["career", "experience"]
    },
    {
      id: "quick-flagship",
      label: "Open Flagship Project",
      section: "projects",
      projectSlug: flagshipProject?.slug,
      description: flagshipProject
        ? flagshipProject.title
        : "Open portfolio-safe project case studies.",
      keywords: ["project", "case study", "full stack"]
    },
    {
      id: "quick-architecture",
      label: "Explore Architecture",
      section: "architecture",
      mode: "engineer",
      description: "Inspect full stack, quality, and CI/CD architecture presets.",
      keywords: ["topology", "system", "ci/cd"]
    },
    {
      id: "quick-terminal",
      label: "Open Terminal",
      section: "terminal",
      mode: "engineer",
      description: "Run RyanOS commands like whoami, career, build, quality, cv.",
      keywords: ["commands", "cli"]
    },
    {
      id: "quick-contact",
      label: `Contact ${profile.name}`,
      section: "contact",
      description: "Open verified contact channels.",
      keywords: ["email", "hire"]
    }
  ];

  if (isPortfolioValueConfigured(profile.contact.cv.href)) {
    quickActions.push({
      id: "quick-cv",
      label: "Download CV",
      href: profile.contact.cv.href,
      description: profile.contact.cv.value,
      keywords: ["resume", "pdf"]
    });
  }

  if (isPortfolioValueConfigured(profile.contact.linkedIn.href)) {
    quickActions.push({
      id: "quick-linkedin",
      label: "Open LinkedIn",
      href: profile.contact.linkedIn.href,
      isExternal: true,
      description: profile.contact.linkedIn.value,
      keywords: ["social", "profile"]
    });
  }

  const navigationActions = getNavigationItemsForMode(mode).map((item) => ({
    id: `${mode}-${item.id}`,
    label: mode === "recruiter" ? getRecruiterActionLabel(item) : getEngineerActionLabel(item),
    section: item.id,
    description: item.description
  }));

  return [...quickActions, ...navigationActions];
}

function getRecruiterActionLabel(item: WorkspaceNavigationItem): string {
  if (item.id === "overview") {
    return "Open Recruiter Mode";
  }

  if (item.id === "experience") {
    return "View Current Role";
  }

  if (item.id === "projects") {
    return "View Featured Work";
  }

  if (item.id === "contact") {
    return `Contact ${profile.name}`;
  }

  return `Go to ${item.label}`;
}

function getEngineerActionLabel(item: WorkspaceNavigationItem): string {
  if (item.id === "overview") {
    return "Open Engineer Mode";
  }

  if (item.id === "architecture") {
    return "Explore Full Cycle";
  }

  if (item.id === "automation") {
    return "Run Quality Lab";
  }

  if (item.id === "pipeline") {
    return "Run Delivery Pipeline";
  }

  if (item.id === "api") {
    return "Open API Playground";
  }

  if (item.id === "terminal") {
    return "Open Terminal";
  }

  return `Go to ${item.label}`;
}
