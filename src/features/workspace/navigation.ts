import type { WorkspaceMode, WorkspaceSection } from "@/features/workspace/types";
import { profile } from "@/data/profile";
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
    description: "Professional background, education, and core skills."
  },
  experience: {
    id: "experience",
    label: "Experience",
    icon: BriefcaseBusiness,
    description: "Roles, companies, dates, and contributions, most recent first."
  },
  projects: {
    id: "projects",
    label: "Archive",
    icon: BadgeCheck,
    description: "Portfolio-safe engineering work archive."
  },
  automation: {
    id: "automation",
    label: "Automation",
    icon: FlaskConical,
    description: "Run automation recovery and failure simulations."
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
    description: "Run commands for profile, labs, and contact."
  },
  challenge: {
    id: "challenge",
    label: "Challenge",
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

const portfolioSections: readonly WorkspaceSection[] = [
  "overview",
  "profile",
  "experience",
  "contact"
];

const labSections: readonly WorkspaceSection[] = [
  "architecture",
  "api",
  "automation",
  "performance",
  "pipeline",
  "terminal"
];

export function getNavigationItem(section: WorkspaceSection): WorkspaceNavigationItem {
  return navigationItems[section];
}

export function getNavigationGroups(): readonly WorkspaceNavigationGroup[] {
  return [
    {
      label: "Portfolio",
      items: portfolioSections.map((section) => navigationItems[section])
    },
    {
      label: "Interactive Proof",
      items: labSections.map((section) => navigationItems[section])
    }
  ];
}

export function getNavigationItems(): readonly WorkspaceNavigationItem[] {
  return getNavigationGroups().flatMap((group) => group.items);
}

export function getPaletteActions(): readonly PaletteAction[] {
  const quickActions: PaletteAction[] = [
    {
      id: "quick-current-role",
      label: "View Career Summary",
      section: "experience",
      description: "Public career summary with full details in CV.",
      keywords: ["career", "experience"]
    },
    {
      id: "quick-architecture",
      label: "Explore Architecture",
      section: "architecture",
      description: "Inspect full stack, quality, and CI/CD architecture presets.",
      keywords: ["topology", "system", "ci/cd"]
    },
    {
      id: "quick-quality",
      label: "Run Automation",
      section: "automation",
      description: "Run automation, healing, API failure, auth failure, and recovery simulations.",
      keywords: ["automation", "qa", "quality", "sdet"]
    },
    {
      id: "quick-terminal",
      label: "Open Terminal",
      section: "terminal",
      description: "Run portfolio commands like whoami, career, build, quality, cv.",
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

  const navigationActions = getNavigationItems().map((item) => ({
    id: `section-${item.id}`,
    label: getActionLabel(item),
    section: item.id,
    description: item.description
  }));

  return [...quickActions, ...navigationActions];
}

function getActionLabel(item: WorkspaceNavigationItem): string {
  if (item.id === "overview") {
    return "Open Portfolio Overview";
  }

  if (item.id === "experience") {
    return "View Experience";
  }

  if (item.id === "architecture") {
    return "Explore Architecture";
  }

  if (item.id === "automation") {
    return "Run Automation";
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

  if (item.id === "contact") {
    return `Contact ${profile.name}`;
  }

  return `Go to ${item.label}`;
}
