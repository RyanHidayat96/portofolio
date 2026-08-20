import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { capabilities } from "@/data/capabilities";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { FullCycleExperience } from "@/features/workspace/components/FullCycleExperience";
import type { WorkspaceMode, WorkspaceSection } from "@/features/workspace/types";
import {
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
  UserRound
} from "lucide-react";

export function OverviewPanel({
  mode,
  onNavigate
}: Readonly<{
  mode: WorkspaceMode;
  onNavigate: (section: WorkspaceSection) => void;
}>): React.ReactElement {
  if (mode === "engineer") {
    return <EngineerOverviewPanel onNavigate={onNavigate} />;
  }

  return <RecruiterOverviewPanel onNavigate={onNavigate} />;
}

function RecruiterOverviewPanel({
  onNavigate
}: Readonly<{
  onNavigate: (section: WorkspaceSection) => void;
}>): React.ReactElement {
  const currentRole = experience.find((role) => role.id === "jasa-marga-full-stack");
  const previousRoles = experience.filter((role) => role.id !== "jasa-marga-full-stack");
  const featuredProject =
    projects.find((project) => project.slug === "enterprise-audit-monitoring-platform") ??
    projects[0];
  const recruiterFlow: readonly {
    readonly step: string;
    readonly title: string;
    readonly summary: string;
    readonly section: WorkspaceSection;
    readonly icon: React.ElementType;
  }[] = [
    {
      step: "01",
      title: "Who I Am",
      summary: `${profile.name}. ${profile.headline}. ${profile.location}.`,
      section: "profile",
      icon: UserRound
    },
    {
      step: "02",
      title: "Current Role",
      summary: `${currentRole?.role ?? profile.role} at ${
        currentRole?.company ?? "PT Jasa Marga (Persero) Tbk"
      }.`,
      section: "experience",
      icon: BriefcaseBusiness
    },
    {
      step: "03",
      title: "Career Evolution",
      summary: "Software Engineer, SQA Manual & Automation, SDET, then Full Stack Developer.",
      section: "experience",
      icon: GitBranch
    },
    {
      step: "04",
      title: "Featured Engineering Work",
      summary: featuredProject?.title ?? "Enterprise Audit Monitoring Platform.",
      section: "projects",
      icon: BadgeCheck
    },
    {
      step: "05",
      title: "Core Capabilities",
      summary: "Build, Quality, Data, and Delivery across full-cycle engineering.",
      section: "profile",
      icon: Network
    },
    {
      step: "06",
      title: "Contact",
      summary: "Email, LinkedIn, phone, and downloadable CV.",
      section: "contact",
      icon: Mail
    }
  ];

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
      <Panel className="p-5 sm:p-7">
        <Badge tone="info">Recruiter Mode</Badge>
        <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
          60-second overview for hiring teams.
          <span className="block text-[var(--accent)]">{profile.headline}</span>
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[#b7c2d2]">{profile.summary}</p>

        <section className="mt-7 border border-[var(--accent-strong)] bg-[var(--accent-soft)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mono text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                current_role
              </p>
              <h2 className="mt-3 text-2xl font-semibold">{currentRole?.role ?? profile.role}</h2>
              <p className="mt-2 text-sm text-[#c8d4e6]">
                {currentRole?.company ?? "PT Jasa Marga (Persero) Tbk"}
              </p>
              <p className="mono mt-3 text-sm text-[var(--accent)]">
                {currentRole?.period ?? "Mar 2026 - Present"}
              </p>
            </div>
            <Badge tone="success">Current</Badge>
          </div>
        </section>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            variant="primary"
            icon={<BriefcaseBusiness aria-hidden="true" size={18} />}
            onClick={() => onNavigate("experience")}
          >
            View Current Role
          </Button>
          <Button
            icon={<BadgeCheck aria-hidden="true" size={18} />}
            onClick={() => onNavigate("projects")}
          >
            Featured Work
          </Button>
          <Button
            icon={<Mail aria-hidden="true" size={18} />}
            onClick={() => onNavigate("contact")}
          >
            Contact {profile.name}
          </Button>
        </div>
      </Panel>

      <Panel className="p-5 sm:p-7">
        <p className="mono text-sm text-[var(--accent)]">recruiter.path</p>
        <div className="mt-5 grid gap-3">
          {recruiterFlow.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => onNavigate(item.section)}
                className="grid grid-cols-[44px_1fr] gap-3 border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
              >
                <span className="mono text-sm text-[var(--accent)]">{item.step}</span>
                <span>
                  <span className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                    <Icon aria-hidden="true" size={16} />
                    {item.title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-[var(--text-muted)]">
                    {item.summary}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel className="p-5 sm:p-7 2xl:col-span-2">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          <section>
            <p className="mono text-sm text-[var(--accent)]">previously</p>
            <div className="mt-4 space-y-3">
              {previousRoles.slice(0, 3).map((role) => (
                <article
                  key={role.id}
                  className="border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <h2 className="font-semibold">{role.role}</h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{role.company}</p>
                  <p className="mono mt-2 text-xs text-[var(--accent)]">{role.period}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <p className="mono text-sm text-[var(--accent)]">featured.work</p>
            {featuredProject ? (
              <article className="mt-4 border border-[var(--border)] bg-[var(--surface)] p-4">
                {featuredProject.label ? (
                  <Badge tone="success">{featuredProject.label}</Badge>
                ) : null}
                <h2 className="mt-3 text-lg font-semibold">{featuredProject.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                  {featuredProject.responsibility}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate("projects")}
                  className="mono mt-4 text-sm font-semibold text-[var(--accent)]"
                >
                  Open project
                </button>
              </article>
            ) : null}
          </section>

          <section>
            <p className="mono text-sm text-[var(--accent)]">core.capabilities</p>
            <div className="mt-4 grid gap-2">
              {capabilities.map((capability) => (
                <article
                  key={capability.id}
                  className="border border-[var(--border)] bg-[var(--surface)] p-3"
                >
                  <h2 className="font-semibold">{capability.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                    {capability.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </Panel>
    </div>
  );
}

function EngineerOverviewPanel({
  onNavigate
}: Readonly<{
  onNavigate: (section: WorkspaceSection) => void;
}>): React.ReactElement {
  const engineerEntryPoints: readonly {
    readonly section: WorkspaceSection;
    readonly title: string;
    readonly description: string;
    readonly icon: React.ElementType;
  }[] = [
    {
      section: "architecture",
      title: "Full-Cycle Engineering",
      description: "Trace how build, API, backend, data, quality, and delivery connect.",
      icon: Network
    },
    {
      section: "projects",
      title: "Projects",
      description: "Inspect portfolio-safe build and quality case studies.",
      icon: BadgeCheck
    },
    {
      section: "api",
      title: "API Playground",
      description: "Call actual Next.js route handlers with public-safe data.",
      icon: Send
    },
    {
      section: "automation",
      title: "Quality Engineering",
      description: "Run automation and recovery simulations.",
      icon: FlaskConical
    },
    {
      section: "performance",
      title: "Performance Lab",
      description: "Evaluate threshold decisions and load-test signals.",
      icon: Gauge
    },
    {
      section: "pipeline",
      title: "Pipeline / Delivery",
      description: "Inspect build, checks, gates, and deploy-readiness flow.",
      icon: GitBranch
    },
    {
      section: "terminal",
      title: "Terminal",
      description: "Use command-driven navigation and profile discovery.",
      icon: TerminalSquare
    },
    {
      section: "challenge",
      title: "Engineering Challenges",
      description: "Try build, data, quality, and delivery reasoning scenarios.",
      icon: Brain
    }
  ];

  return (
    <div className="grid gap-5 2xl:grid-cols-[0.9fr_1.1fr]">
      <Panel className="p-5 sm:p-7">
        <Badge tone="info">Engineer Mode</Badge>
        <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">
          Explore RyanOS as a full-cycle engineering workspace.
        </h1>
        <p className="mt-5 text-base leading-7 text-[#b7c2d2]">
          Engineer Mode opens the deeper system: architecture, projects, API routes, quality
          engineering, performance thresholds, CI/CD delivery, terminal commands, and reasoning
          challenges.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            variant="primary"
            icon={<Network aria-hidden="true" size={18} />}
            onClick={() => onNavigate("architecture")}
          >
            Explore Full Cycle
          </Button>
          <Button
            icon={<BadgeCheck aria-hidden="true" size={18} />}
            onClick={() => onNavigate("projects")}
          >
            Open Projects
          </Button>
          <Button
            icon={<TerminalSquare aria-hidden="true" size={18} />}
            onClick={() => onNavigate("terminal")}
          >
            Open Terminal
          </Button>
        </div>
      </Panel>

      <div className="2xl:col-span-2">
        <FullCycleExperience />
      </div>

      <Panel className="p-5 sm:p-7">
        <p className="mono text-sm text-[var(--accent)]">engineer.entry_points</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {engineerEntryPoints.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.section}
                type="button"
                onClick={() => onNavigate(action.section)}
                className="min-h-36 border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
              >
                <Icon aria-hidden="true" className="text-[var(--accent)]" size={20} />
                <span className="mt-4 block font-semibold">{action.title}</span>
                <span className="mt-2 block text-sm leading-6 text-[var(--text-muted)]">
                  {action.description}
                </span>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
