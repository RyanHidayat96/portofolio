import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { apiEndpoints } from "@/data/api-endpoints";
import { capabilities } from "@/data/capabilities";
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
  MapPin,
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
  const hiringSignals: readonly {
    readonly label: string;
    readonly value: string;
    readonly detail: string;
  }[] = [
    {
      label: "Target",
      value: profile.availability,
      detail: "Full Stack development with SDET-level quality ownership."
    },
    {
      label: "Experience",
      value: profile.yearsOfExperience,
      detail: "Enterprise apps, backend/API, automation, performance, and CI/CD."
    },
    {
      label: "Location",
      value: profile.location,
      detail: "Ready for recruiter follow-up through email, phone, LinkedIn, or CV."
    }
  ];
  const careerSnapshot: readonly {
    readonly label: string;
    readonly title: string;
    readonly meta: string;
    readonly section: WorkspaceSection;
  }[] = [
    {
      label: "Build",
      title: "Full Stack Development",
      meta: "Frontend, backend, API, and data workflows.",
      section: "experience"
    },
    {
      label: "Quality",
      title: "SDET Depth",
      meta: "Automation, API checks, mobile coverage, and release confidence.",
      section: "experience"
    },
    {
      label: "Ship",
      title: "Delivery Discipline",
      meta: "CI/CD, Docker, reporting, gates, and production readiness.",
      section: "experience"
    }
  ];
  const hiringPath: readonly {
    readonly label: string;
    readonly title: string;
    readonly detail: string;
    readonly cta: string;
    readonly section?: WorkspaceSection;
    readonly isCv?: boolean;
  }[] = [
    {
      label: "01",
      title: "Scan fit",
      detail: "Full Stack Developer with SDET depth across build, quality, and delivery.",
      cta: "View Profile",
      section: "profile"
    },
    {
      label: "02",
      title: "Review experience",
      detail: "Role scope, delivery depth, and career direction stay in the experience section.",
      cta: "View Experience",
      section: "experience"
    },
    {
      label: "03",
      title: "Read details",
      detail: "CV carries full responsibilities, timeline, and deeper role information.",
      cta: "Download CV",
      isCv: true
    },
    {
      label: "04",
      title: "Start contact",
      detail: "Email, phone, and LinkedIn are available from the contact workspace.",
      cta: "Contact",
      section: "contact"
    }
  ];

  return (
    <div className="recruiter-scan">
      <Panel className="recruiter-scan-hero p-5 sm:p-7">
        <section>
          <Badge tone="info">Portfolio Snapshot</Badge>
          <h1>{profile.name}</h1>
          <p className="recruiter-scan-headline">{profile.headline}</p>
          <p className="recruiter-scan-summary">{profile.summary}</p>
          <div className="recruiter-scan-actions">
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

        <section className="recruiter-scan-fit" aria-label="Recruiter fit summary">
          <div className="recruiter-scan-fit-header">
            <p className="mono">30.sec.fit</p>
            <MapPin aria-hidden="true" size={18} />
          </div>
          <dl>
            {hiringSignals.map((signal) => (
              <div key={signal.label}>
                <dt>{signal.label}</dt>
                <dd>
                  <strong>{signal.value}</strong>
                  <span>{signal.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </Panel>

      <Panel className="recruiter-fast-path p-5 sm:p-6">
        <div className="recruiter-scan-section-header">
          <div>
            <p className="mono text-sm text-[var(--accent)]">decision.path</p>
            <h2>Four-step hiring scan.</h2>
          </div>
          <Badge tone="success">No WebGL required</Badge>
        </div>
        <div className="recruiter-fast-path-grid">
          {hiringPath.map((item) => {
            const targetSection = item.section;

            return (
              <article key={item.title}>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                {item.isCv && isPortfolioValueConfigured(cv.href) ? (
                  <a className="action-link" href={cv.href} download="cv.pdf">
                    <Download aria-hidden="true" size={16} />
                    {item.cta}
                  </a>
                ) : targetSection ? (
                  <Button variant="secondary" onClick={() => onNavigate(targetSection)}>
                    {item.cta}
                  </Button>
                ) : null}
              </article>
            );
          })}
        </div>
      </Panel>

      <div className="recruiter-scan-grid">
        <Panel className="recruiter-scan-priority p-5 sm:p-6">
          <p className="mono text-sm text-[var(--accent)]">quick.summary</p>
          <h2>What hiring teams should remember.</h2>
          <ul>
            <li>Current Full Stack Developer building enterprise workflow applications.</li>
            <li>SDET background across web, mobile, API, performance, and quality gates.</li>
            <li>Comfortable across frontend, backend, data, automation, and delivery signals.</li>
          </ul>
        </Panel>

        <Panel className="recruiter-scan-career p-5 sm:p-6">
          <p className="mono text-sm text-[var(--accent)]">career.path</p>
          <div className="recruiter-scan-career-list">
            {careerSnapshot.map((item) => (
              <button key={item.label} type="button" onClick={() => onNavigate(item.section)}>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <small>{item.meta}</small>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="recruiter-scan-skills p-5 sm:p-7">
        <div className="recruiter-scan-section-header">
          <div>
            <p className="mono text-sm text-[var(--accent)]">strongest.skills</p>
            <h2>Build, Quality, Data, Delivery.</h2>
          </div>
          <Button
            icon={<UserRound aria-hidden="true" size={17} />}
            onClick={() => onNavigate("profile")}
          >
            Full Profile
          </Button>
        </div>
        <div className="recruiter-scan-skill-grid">
          {capabilities.map((capability) => (
            <article key={capability.id}>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <div>
                {capability.technologies.slice(0, 5).map((technology) => (
                  <Badge key={technology}>{technology}</Badge>
                ))}
              </div>
            </article>
          ))}
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
