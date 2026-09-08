import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { apiEndpoints } from "@/data/api-endpoints";
import { professionalExperience, professionalHighlights } from "@/data/professional-summary";
import { profile } from "@/data/profile";
import { FullCycleExperience } from "@/features/workspace/components/FullCycleExperience";
import type { WorkspaceMode, WorkspaceSection } from "@/features/workspace/types";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import {
  BriefcaseBusiness,
  Code2,
  Download,
  FlaskConical,
  Gauge,
  GitBranch,
  Layers3,
  Mail,
  Network,
  PlayCircle,
  Route,
  Send,
  TerminalSquare,
  UserRound,
  type LucideIcon
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
  const cv = profile.contact.cv;
  const currentRole = professionalExperience[0];

  return (
    <div className="professional-page">
      <section className="professional-section professional-intro" aria-labelledby="overview-name">
        <p className="professional-eyebrow">Professional Summary</p>
        <h1 id="overview-name">{profile.name}</h1>
        <p className="professional-role-title">{profile.role}</p>
        <p className="professional-lead">
          I build enterprise applications, from user interfaces and APIs to databases and delivery.
          My background as a Software Development Engineer in Test (SDET) brings practical
          experience in automation and software quality to that work.
        </p>
        {currentRole ? (
          <p className="professional-current">Currently at {currentRole.company}</p>
        ) : null}
        <dl className="professional-facts">
          <div>
            <dt>Experience</dt>
            <dd>{profile.yearsOfExperience} in development &amp; quality</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt>Opportunities</dt>
            <dd>{profile.availability}</dd>
          </div>
        </dl>
        <div className="professional-actions">
          {isPortfolioValueConfigured(cv.href) ? (
            <a className="button-base button-primary" href={cv.href} download="cv.pdf">
              <Download aria-hidden="true" size={18} />
              <span>Download CV</span>
            </a>
          ) : null}
          <Button
            icon={<BriefcaseBusiness aria-hidden="true" size={18} />}
            onClick={() => onNavigate("experience")}
          >
            View Experience
          </Button>
          <Button
            icon={<Mail aria-hidden="true" size={18} />}
            onClick={() => onNavigate("contact")}
          >
            Contact
          </Button>
        </div>
      </section>

      <section className="professional-section" aria-labelledby="overview-contributions">
        <h2 id="overview-contributions">Selected Contributions</h2>
        <div className="professional-highlights">
          {professionalHighlights.map((highlight) => (
            <article key={highlight.id}>
              <p className="professional-context">{highlight.company}</p>
              <h3>{highlight.title}</h3>
              <p>{highlight.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="professional-section" aria-labelledby="overview-technologies">
        <div className="professional-section-heading">
          <h2 id="overview-technologies">Key Technologies</h2>
          <Button
            icon={<UserRound aria-hidden="true" size={17} />}
            onClick={() => onNavigate("profile")}
          >
            View Profile
          </Button>
        </div>
        <ul className="professional-tags">
          {["Next.js", "React", "Node.js", "Spring Boot", "Playwright", "GitLab CI/CD"].map(
            (technology) => (
              <li key={technology}>
                <Badge>{technology}</Badge>
              </li>
            )
          )}
        </ul>
      </section>
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
    readonly command: string;
    readonly signal: string;
    readonly icon: LucideIcon;
  }[] = [
    {
      section: "terminal",
      title: "Terminal",
      description: "Command router for profile, stack, project, quality, CV, and navigation flows.",
      command: "help",
      signal: "history + autocomplete",
      icon: TerminalSquare
    },
    {
      section: "api",
      title: "API Playground",
      description: `Probe ${apiEndpoints.length} public route handlers and inspect typed JSON contracts.`,
      command: "GET /api/ryan",
      signal: "live route handlers",
      icon: Send
    },
    {
      section: "architecture",
      title: "Architecture Explorer",
      description: "Inspect build, API, data, quality, and delivery topology as a visual system.",
      command: "architecture",
      signal: "interactive topology",
      icon: Network
    },
    {
      section: "automation",
      title: "Automation",
      description: "Run automation, healing, API failure, auth failure, and recovery simulations.",
      command: "automation",
      signal: "recovery loop",
      icon: FlaskConical
    },
    {
      section: "performance",
      title: "Performance Lab",
      description: "Evaluate threshold decisions and load-test signals.",
      command: "performance",
      signal: "pass/fail gates",
      icon: Gauge
    },
    {
      section: "pipeline",
      title: "Pipeline / Delivery",
      description: "Inspect build, checks, gates, and deploy-readiness flow.",
      command: "pipeline",
      signal: "delivery states",
      icon: GitBranch
    }
  ];

  const developerFlow: readonly {
    readonly label: string;
    readonly detail: string;
    readonly icon: LucideIcon;
  }[] = [
    {
      label: "Build",
      detail: "Frontend, backend, API, data, and integration flow.",
      icon: Code2
    },
    {
      label: "Quality",
      detail: "Automation, healing, contract failure, performance, and gate decisions.",
      icon: FlaskConical
    },
    {
      label: "Ship",
      detail: "Pipeline state, release confidence, and production asset readiness.",
      icon: Layers3
    }
  ];

  return (
    <div className="engineer-playground">
      <Panel className="engineer-playground-hero p-5 sm:p-7">
        <div className="engineer-playground-hero-grid">
          <section>
            <Badge tone="info">Interactive Workspace</Badge>
            <h1>Developer playground for the full portfolio system.</h1>
            <p>
              Explore architecture, live route handlers, deterministic simulations, and terminal
              commands without burying the quick hiring path.
            </p>
            <div className="engineer-playground-actions">
              <Button
                variant="primary"
                icon={<PlayCircle aria-hidden="true" size={18} />}
                onClick={() => onNavigate("terminal")}
              >
                Start Terminal
              </Button>
              <Button
                icon={<Send aria-hidden="true" size={18} />}
                onClick={() => onNavigate("api")}
              >
                Probe API
              </Button>
              <Button
                icon={<FlaskConical aria-hidden="true" size={18} />}
                onClick={() => onNavigate("automation")}
              >
                Run Automation
              </Button>
            </div>
          </section>

          <section className="engineer-playground-console" aria-label="Portfolio command map">
            <div className="engineer-playground-console-bar">
              <span />
              <span />
              <span />
              <p>ryan.workspace</p>
            </div>
            <ol>
              <li>
                <span>$ architecture</span>
                <strong>visualize full stack flow</strong>
              </li>
              <li>
                <span>$ automation</span>
                <strong>simulate recovery loop</strong>
              </li>
              <li>
                <span>$ performance</span>
                <strong>evaluate load threshold</strong>
              </li>
              <li>
                <span>$ pipeline</span>
                <strong>inspect release gate</strong>
              </li>
            </ol>
          </section>
        </div>
      </Panel>

      <section aria-label="Full-cycle technical visualization">
        <FullCycleExperience />
      </section>

      <Panel className="engineer-playground-panel p-5 sm:p-7">
        <div className="engineer-playground-section-header">
          <div>
            <p className="mono text-sm text-[var(--accent)]">technical.playground</p>
            <h2>Open one surface, follow the system.</h2>
          </div>
          <Badge tone="success">Recruiter-safe depth</Badge>
        </div>
        <div className="engineer-playground-grid">
          {engineerEntryPoints.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.section}
                type="button"
                onClick={() => onNavigate(action.section)}
                className="engineer-playground-card"
              >
                <span className="engineer-playground-card-top">
                  <Icon aria-hidden="true" size={20} />
                  <span>{action.signal}</span>
                </span>
                <strong>{action.title}</strong>
                <span>{action.description}</span>
                <code>{action.command}</code>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel className="engineer-playground-flow p-5 sm:p-7">
        <div className="engineer-playground-section-header">
          <div>
            <p className="mono text-sm text-[var(--accent)]">developer.flow</p>
            <h2>Designed as layers, not isolated toys.</h2>
          </div>
          <Button
            icon={<Route aria-hidden="true" size={17} />}
            onClick={() => onNavigate("architecture")}
          >
            Open System Map
          </Button>
        </div>
        <div className="engineer-playground-flow-grid">
          {developerFlow.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label}>
                <Icon aria-hidden="true" size={20} />
                <h3>{item.label}</h3>
                <p>{item.detail}</p>
              </article>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
