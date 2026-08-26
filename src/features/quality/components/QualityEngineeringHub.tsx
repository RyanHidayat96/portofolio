"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { capabilities } from "@/data/capabilities";
import { projects } from "@/data/projects";
import dynamic from "next/dynamic";
import { Activity, Gauge, Play, ShieldCheck, Workflow } from "lucide-react";
import { useState } from "react";

const AutomationLabPanel = dynamic(
  () =>
    import("@/features/automation-lab/components/AutomationLab").then(
      (module) => module.AutomationLab
    ),
  {
    loading: () => <QualityLabLoading label="Automation Lab" />
  }
);

const PerformanceLabPanel = dynamic(
  () =>
    import("@/features/performance-lab/components/PerformanceLab").then(
      (module) => module.PerformanceLab
    ),
  {
    loading: () => <QualityLabLoading label="Performance Lab" />
  }
);

const PipelineSimulatorPanel = dynamic(
  () =>
    import("@/features/pipeline/components/PipelineSimulatorPanel").then(
      (module) => module.PipelineSimulatorPanel
    ),
  {
    loading: () => <QualityLabLoading label="Quality Gate Pipeline" />
  }
);

type QualityView = "overview" | "automation" | "performance" | "gates";

interface QualityViewMeta {
  readonly id: QualityView;
  readonly label: string;
  readonly title: string;
  readonly summary: string;
}

interface QualitySystemLayer {
  readonly id: string;
  readonly label: string;
  readonly stack: readonly string[];
  readonly summary: string;
}

const qualityViews: readonly QualityViewMeta[] = [
  {
    id: "overview",
    label: "Overview",
    title: "Quality engineering as release signal.",
    summary: "Fast map of automation, mobile, performance, and quality gate thinking."
  },
  {
    id: "automation",
    label: "Automation",
    title: "Playwright, WebDriverIO, Appium, and self-healing flows.",
    summary: "Run deterministic failure, locator recovery, retry, timeout, auth, and gate outcomes."
  },
  {
    id: "performance",
    label: "Performance",
    title: "K6-inspired load and threshold analysis.",
    summary:
      "Tune virtual users and duration, then inspect latency, checks, errors, and thresholds."
  },
  {
    id: "gates",
    label: "Quality Gates",
    title: "Build plus automation plus performance decide deploy readiness.",
    summary: "Run pipeline scenarios where regression or performance failures block deployment."
  }
];

const qualityLayers: readonly QualitySystemLayer[] = [
  {
    id: "web-api",
    label: "Web + API Automation",
    stack: ["Playwright", "WebDriverIO", "Postman", "Jest"],
    summary: "Reusable flows, selector strategy, API-adjacent checks, and readable reports."
  },
  {
    id: "mobile",
    label: "Mobile Automation",
    stack: ["Appium", "AWS Device Farm", "UIAutomator2", "XCUITest"],
    summary: "Platform-aware coverage for Android and iOS with real-device execution context."
  },
  {
    id: "performance",
    label: "Performance Signals",
    stack: ["K6", "JMeter", "Load Testing", "Stress Testing"],
    summary:
      "Latency, error rate, check rate, and threshold interpretation before release pressure."
  },
  {
    id: "delivery",
    label: "Quality Gates",
    stack: ["GitLab CI/CD", "Docker", "GitLab Runner", "Allure"],
    summary: "Reports, runner output, and threshold results become explicit deploy decisions."
  }
];

const qualityCapability = capabilities.find((capability) => capability.domain === "quality");
const qualityProjects = projects.filter(
  (project) => project.categories.includes("quality") || project.categories.includes("devops")
);

export function QualityEngineeringHub(): React.ReactElement {
  const [activeView, setActiveView] = useState<QualityView>("overview");
  const activeMeta = qualityViews.find((view) => view.id === activeView) ?? qualityViews[0];

  const selectView = (view: QualityView): void => {
    setActiveView(view);
  };

  const focusTab = (view: QualityView): void => {
    window.requestAnimationFrame(() => document.getElementById(`quality-hub-tab-${view}`)?.focus());
  };

  const selectViewByOffset = (currentView: QualityView, offset: number): void => {
    const currentIndex = qualityViews.findIndex((view) => view.id === currentView);
    const nextIndex = (currentIndex + offset + qualityViews.length) % qualityViews.length;
    const nextView = qualityViews[nextIndex];

    if (!nextView) {
      return;
    }

    selectView(nextView.id);
    focusTab(nextView.id);
  };

  const onViewKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentView: QualityView
  ): void => {
    if (event.key === "Home") {
      event.preventDefault();
      const firstView = qualityViews[0];
      if (firstView) {
        selectView(firstView.id);
        focusTab(firstView.id);
      }
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastView = qualityViews.at(-1);
      if (lastView) {
        selectView(lastView.id);
        focusTab(lastView.id);
      }
      return;
    }

    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    selectViewByOffset(
      currentView,
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1
    );
  };

  return (
    <div className="quality-hub">
      <Panel className="quality-hub-header">
        <div className="quality-hub-heading">
          <Badge tone="success">Quality Engineering</Badge>
          <h1>{activeMeta.title}</h1>
          <p>{activeMeta.summary}</p>
        </div>

        <div className="quality-hub-tabs" role="tablist" aria-label="Quality engineering views">
          {qualityViews.map((view) => {
            const isActive = view.id === activeView;

            return (
              <button
                key={view.id}
                id={`quality-hub-tab-${view.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="quality-hub-panel"
                onClick={() => selectView(view.id)}
                onKeyDown={(event) => onViewKeyDown(event, view.id)}
                tabIndex={isActive ? 0 : -1}
                data-active={isActive}
              >
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <div
        id="quality-hub-panel"
        role="tabpanel"
        aria-labelledby={`quality-hub-tab-${activeView}`}
        className="quality-hub-panel"
      >
        {activeView === "overview" ? <QualityOverview onSelectView={setActiveView} /> : null}
        {activeView === "automation" ? <AutomationLabPanel /> : null}
        {activeView === "performance" ? <PerformanceLabPanel /> : null}
        {activeView === "gates" ? <PipelineSimulatorPanel /> : null}
      </div>
    </div>
  );
}

function QualityOverview({
  onSelectView
}: Readonly<{
  onSelectView: (view: QualityView) => void;
}>): React.ReactElement {
  return (
    <div className="quality-overview">
      <section className="quality-system-map" aria-labelledby="quality-system-title">
        <div className="quality-section-heading">
          <p className="eyebrow">quality.system</p>
          <h2 id="quality-system-title">Ryan tests software like an engineering system.</h2>
          <p>{qualityCapability?.description}</p>
        </div>

        <div className="quality-layer-grid">
          {qualityLayers.map((layer, index) => (
            <article key={layer.id}>
              <div className="quality-layer-index">{String(index + 1).padStart(2, "0")}</div>
              <h3>{layer.label}</h3>
              <p>{layer.summary}</p>
              <div>
                {layer.stack.map((technology) => (
                  <Badge key={technology} tone={layer.id === "mobile" ? "info" : "success"}>
                    {technology}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="quality-lab-grid" aria-label="Interactive quality labs">
        <QualityLabCard
          icon={<Activity aria-hidden="true" size={20} />}
          title="Automation Lab"
          summary="Inject locator, API, timeout, auth, and performance-style failures. Watch recovery and quality gate impact."
          action="Run automation simulation"
          onClick={() => onSelectView("automation")}
        />
        <QualityLabCard
          icon={<Gauge aria-hidden="true" size={20} />}
          title="Performance Lab"
          summary="Use K6-inspired deterministic scenarios to compare normal, peak, and stress release risk."
          action="Inspect K6 thresholds"
          onClick={() => onSelectView("performance")}
        />
        <QualityLabCard
          icon={<ShieldCheck aria-hidden="true" size={20} />}
          title="Quality Gates"
          summary="Run delivery scenarios where automation or performance failures block deploy readiness."
          action="Run quality gate pipeline"
          onClick={() => onSelectView("gates")}
        />
      </section>

      <section className="quality-proof-panel" aria-labelledby="quality-proof-title">
        <div className="quality-section-heading">
          <p className="eyebrow">evidence</p>
          <h2 id="quality-proof-title">Public-safe project proof.</h2>
        </div>
        <div className="quality-proof-list">
          {qualityProjects.slice(0, 5).map((project) => (
            <article key={project.slug}>
              <h3>{project.title}</h3>
              <p>{project.engineered ?? project.responsibility}</p>
              <div>
                {project.technologies.slice(0, 5).map((technology) => (
                  <Badge key={technology} tone="info">
                    {technology}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function QualityLabCard({
  icon,
  title,
  summary,
  action,
  onClick
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  summary: string;
  action: string;
  onClick: () => void;
}>): React.ReactElement {
  return (
    <article className="quality-lab-card">
      <div className="quality-lab-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{summary}</p>
      <Button variant="secondary" icon={<Play aria-hidden="true" size={17} />} onClick={onClick}>
        {action}
      </Button>
    </article>
  );
}

function QualityLabLoading({ label }: Readonly<{ label: string }>): React.ReactElement {
  return (
    <Panel className="quality-lab-loading">
      <Workflow aria-hidden="true" size={20} />
      <p>{label} loading...</p>
    </Panel>
  );
}
