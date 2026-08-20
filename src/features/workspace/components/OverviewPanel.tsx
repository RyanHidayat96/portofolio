import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import type { WorkspaceMode, WorkspaceSection } from "@/features/workspace/types";
import {
  Brain,
  FlaskConical,
  Gauge,
  GitBranch,
  Mail,
  Network,
  Send,
  TerminalSquare
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
  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel className="p-5 sm:p-7">
        <Badge tone="info">Professional Snapshot</Badge>
        <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
          {profile.name}
          <span className="block text-[var(--accent)]">{profile.headline}</span>
        </h1>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          {profile.yearsOfExperience} • {profile.location}
        </p>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#b7c2d2]">{profile.summary}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button
            icon={<FlaskConical aria-hidden="true" size={18} />}
            onClick={() => onNavigate("automation")}
          >
            Run Automation
          </Button>
          <Button
            icon={<TerminalSquare aria-hidden="true" size={18} />}
            onClick={() => onNavigate("terminal")}
          >
            Open Terminal
          </Button>
          <Button
            variant="primary"
            icon={<Mail aria-hidden="true" size={18} />}
            onClick={() => onNavigate("contact")}
          >
            Contact {profile.name}
          </Button>
        </div>
      </Panel>

      <Panel className="p-5 sm:p-7">
        <p className="mono text-sm text-[var(--accent)]">Engineering Focus</p>
        <div className="mt-5 grid gap-3">
          {profile.focusAreas.map((focus) => (
            <div
              key={focus}
              className="flex items-center justify-between border border-[var(--border)] bg-[#121722] p-3"
            >
              <span className="font-medium">{focus}</span>
              <Badge tone="success">ready</Badge>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-6 text-[var(--text-muted)]">
          Recruiter path keeps verified profile, experience, work highlights, education, and contact
          above deeper simulations.
        </p>
      </Panel>

      <Panel className="p-5 sm:p-7 xl:col-span-2">
        <div className="grid gap-5 lg:grid-cols-3">
          <section>
            <p className="mono text-sm text-[var(--accent)]">experience.quicklook</p>
            <div className="mt-4 space-y-3">
              {experience.map((role) => (
                <article
                  key={role.id}
                  className="border border-[var(--border)] bg-[var(--surface)] p-3"
                >
                  <h2 className="font-semibold">{role.company}</h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{role.role}</p>
                  <p className="mono mt-2 text-xs text-[var(--accent)]">{role.period}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <p className="mono text-sm text-[var(--accent)]">selected.highlights</p>
            <div className="mt-4 space-y-3">
              {projects.slice(0, 3).map((project) => (
                <article
                  key={project.slug}
                  className="border border-[var(--border)] bg-[var(--surface)] p-3"
                >
                  <h2 className="font-semibold">{project.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                    {project.problem}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <p className="mono text-sm text-[var(--accent)]">education</p>
            <div className="mt-4 space-y-3">
              {education.map((item) => (
                <article
                  key={item.institution}
                  className="border border-[var(--border)] bg-[var(--surface)] p-3"
                >
                  <h2 className="font-semibold">{item.institution}</h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{item.degree}</p>
                  <p className="mono mt-2 text-xs text-[var(--accent)]">{item.period}</p>
                  <p className="mt-2 text-sm text-[#c8d4e6]">GPA {item.gpa}</p>
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
  const labActions: readonly {
    readonly section: WorkspaceSection;
    readonly title: string;
    readonly description: string;
    readonly icon: React.ElementType;
  }[] = [
    {
      section: "automation",
      title: "Automation Lab",
      description: "Run test execution and failure-recovery simulations.",
      icon: FlaskConical
    },
    {
      section: "pipeline",
      title: "CI/CD Pipeline",
      description: "Inspect quality gate behavior and blocked deployment flow.",
      icon: GitBranch
    },
    {
      section: "performance",
      title: "Performance Lab",
      description: "Evaluate K6-style metrics and threshold decisions.",
      icon: Gauge
    },
    {
      section: "api",
      title: "API Lab",
      description: "Send portfolio-safe requests to actual Next.js route handlers.",
      icon: Send
    },
    {
      section: "architecture",
      title: "Architecture",
      description: "Explore automation, mobile, API, performance, and reporting nodes.",
      icon: Network
    },
    {
      section: "terminal",
      title: "Terminal",
      description: "Use command pattern-driven navigation and profile commands.",
      icon: TerminalSquare
    },
    {
      section: "challenge",
      title: "Test Me",
      description: "Try QA and SDET reasoning scenarios.",
      icon: Brain
    }
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel className="p-5 sm:p-7">
        <Badge tone="info">Engineering Workbench</Badge>
        <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">
          Explore how {profile.name} thinks about quality systems.
        </h1>
        <p className="mt-5 text-base leading-7 text-[#b7c2d2]">
          Engineer Mode puts simulations first: automation recovery, CI/CD quality gates,
          performance thresholds, API contracts, architecture, terminal workflows, and reasoning
          challenges.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            icon={<FlaskConical aria-hidden="true" size={18} />}
            onClick={() => onNavigate("automation")}
          >
            Start Automation Lab
          </Button>
          <Button
            icon={<TerminalSquare aria-hidden="true" size={18} />}
            onClick={() => onNavigate("terminal")}
          >
            Open Terminal
          </Button>
        </div>
      </Panel>

      <Panel className="p-5 sm:p-7">
        <p className="mono text-sm text-[var(--accent)]">engineer.mode.priority</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {labActions.map((action) => {
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

      <Panel className="p-5 sm:p-7 xl:col-span-2">
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="mono text-sm text-[var(--accent)]">verified.context</p>
            <h2 className="mt-3 text-lg font-semibold">{profile.headline}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {profile.yearsOfExperience} across enterprise web, mobile, API, performance, CI/CD,
              and backend systems.
            </p>
          </section>
          {projects.slice(0, 2).map((project) => (
            <section
              key={project.slug}
              className="border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <p className="mono text-sm text-[var(--accent)]">work.highlight</p>
              <h2 className="mt-3 text-lg font-semibold">{project.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                {project.responsibility}
              </p>
            </section>
          ))}
        </div>
      </Panel>
    </div>
  );
}
