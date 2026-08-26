"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ProjectCaseStudy } from "@/data/types";
import { ArrowRight, Network } from "lucide-react";
import { useMemo, useState } from "react";

type CaseStudyStepId =
  "problem" | "architecture" | "implementation" | "testing" | "performance" | "impact";

interface CaseStudyStep {
  readonly id: CaseStudyStepId;
  readonly label: string;
  readonly title: string;
  readonly body: string;
}

const stepOrder: readonly CaseStudyStepId[] = [
  "problem",
  "architecture",
  "implementation",
  "testing",
  "performance",
  "impact"
];

export function FlagshipCaseStudy({
  project,
  onExploreArchitecture
}: Readonly<{
  project: ProjectCaseStudy;
  onExploreArchitecture?: () => void;
}>): React.ReactElement {
  const layers = project.architectureLayers ?? [];
  const [activeStepId, setActiveStepId] = useState<CaseStudyStepId>("problem");
  const [activeLayerId, setActiveLayerId] = useState(layers[1]?.id ?? layers[0]?.id ?? "");
  const steps = useMemo(() => getCaseStudySteps(project), [project]);
  const activeStep = steps.find((step) => step.id === activeStepId) ?? steps[0];
  const activeLayer = layers.find((layer) => layer.id === activeLayerId) ?? layers[0];
  const primaryCategory = project.categories[0] ?? "build";

  return (
    <article className="case-study-shell">
      <header className="case-study-hero">
        <section className="case-study-intro">
          <div className="case-study-badge-row">
            <Badge tone={primaryCategory === "quality" ? "success" : "info"}>
              {project.label ?? project.role ?? "Project Case Study"}
            </Badge>
            <Badge tone={project.status === "portfolio-safe" ? "success" : "warning"}>
              {project.status}
            </Badge>
          </div>
          <p className="eyebrow">project.open</p>
          <h1>{project.title}</h1>
          <p>{project.overview ?? project.context}</p>

          <div className="case-study-actions">
            {onExploreArchitecture ? (
              <Button
                variant="primary"
                icon={<Network aria-hidden="true" size={18} />}
                onClick={onExploreArchitecture}
              >
                Explore Architecture
              </Button>
            ) : null}
            <div className="case-study-role-card">
              <span>role</span>
              <strong>{project.role ?? "Engineer"}</strong>
            </div>
          </div>
        </section>

        <aside className="case-study-proof-card">
          <span>engineered</span>
          <p>{project.engineered ?? project.responsibility}</p>
        </aside>
      </header>

      <section className="case-study-sequence" aria-labelledby="case-study-sequence-title">
        <div className="case-study-section-heading">
          <p className="eyebrow">case-study.flow</p>
          <h2 id="case-study-sequence-title">Problem to impact, inspectable step by step.</h2>
        </div>

        <div className="case-study-tabs" role="tablist" aria-label="Case study sections">
          {steps.map((step, index) => {
            const isActive = step.id === activeStep.id;

            return (
              <button
                key={step.id}
                id={`case-study-tab-${step.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="case-study-active-panel"
                onClick={() => setActiveStepId(step.id)}
                className="case-study-tab"
                data-active={isActive}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.label}</strong>
              </button>
            );
          })}
        </div>

        <div
          id="case-study-active-panel"
          role="tabpanel"
          aria-labelledby={`case-study-tab-${activeStep.id}`}
          className="case-study-active-panel"
        >
          <span>{activeStep.label}</span>
          <h3>{activeStep.title}</h3>
          <p>{activeStep.body}</p>
        </div>
      </section>

      <section className="case-study-system" aria-labelledby="case-study-system-title">
        <div className="case-study-section-heading">
          <p className="eyebrow">system.architecture</p>
          <h2 id="case-study-system-title">Architecture and implementation surface.</h2>
        </div>

        {layers.length > 0 ? (
          <div className="case-study-architecture-grid">
            <ol className="case-study-layer-map">
              {layers.map((layer, index) => {
                const isSelected = layer.id === activeLayer?.id;

                return (
                  <li key={layer.id}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setActiveLayerId(layer.id)}
                      onFocus={() => setActiveLayerId(layer.id)}
                      className="case-study-layer-button"
                      data-active={isSelected}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{layer.label}</strong>
                      <small>{layer.stack}</small>
                    </button>
                    {index < layers.length - 1 ? <ArrowRight aria-hidden="true" size={15} /> : null}
                  </li>
                );
              })}
            </ol>

            <aside className="case-study-layer-detail">
              {activeLayer ? (
                <>
                  <span>selected.layer</span>
                  <h3>{activeLayer.label}</h3>
                  <strong>{activeLayer.stack}</strong>
                  <p>{activeLayer.purpose}</p>
                </>
              ) : (
                <p>No architecture layer configured.</p>
              )}
            </aside>
          </div>
        ) : (
          <div className="case-study-architecture-note">
            <span>public-safe architecture</span>
            <p>{project.architecture}</p>
          </div>
        )}

        {project.architectureBranches ? (
          <div className="case-study-branch-grid" aria-label="Architecture branches">
            {project.architectureBranches.map((branch) => (
              <article key={branch.id}>
                <h3>{branch.label}</h3>
                <p>{branch.purpose}</p>
                <div>
                  {branch.technologies.map((technology) => (
                    <Badge key={technology} tone="info">
                      {technology}
                    </Badge>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {project.keyCapabilities ? (
        <section
          className="case-study-capabilities"
          aria-labelledby="case-study-capabilities-title"
        >
          <div className="case-study-section-heading">
            <p className="eyebrow">capabilities</p>
            <h2 id="case-study-capabilities-title">What this project proves.</h2>
          </div>
          <div>
            {project.keyCapabilities.map((capability) => (
              <span key={capability}>{capability}</span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="case-study-evidence-grid" aria-label="Project evidence details">
        <ListBlock title="Engineering Decisions" items={project.engineeringDecisions} />
        <ListBlock title="Testing Strategy" items={project.testingStrategy} />
        <ListBlock title="Lessons" items={project.lessons} />
      </section>

      <section className="case-study-tech-stack" aria-labelledby="case-study-tech-title">
        <div className="case-study-section-heading">
          <p className="eyebrow">tech-stack</p>
          <h2 id="case-study-tech-title">Verified tools and technologies.</h2>
        </div>
        <div>
          {project.technologies.map((technology) => (
            <Badge key={technology} tone="info">
              {technology}
            </Badge>
          ))}
        </div>
      </section>
    </article>
  );
}

function getCaseStudySteps(project: ProjectCaseStudy): readonly CaseStudyStep[] {
  return stepOrder.map((stepId) => {
    if (stepId === "problem") {
      return {
        id: stepId,
        label: "Problem",
        title: "What needed solving",
        body: project.problem
      };
    }

    if (stepId === "architecture") {
      return {
        id: stepId,
        label: "Architecture",
        title: "How the system was shaped",
        body: project.architecture
      };
    }

    if (stepId === "implementation") {
      return {
        id: stepId,
        label: "Implementation",
        title: "What Ryan engineered",
        body: project.engineered ?? project.responsibility
      };
    }

    if (stepId === "testing") {
      return {
        id: stepId,
        label: "Testing",
        title: "How quality was handled",
        body: project.testingStrategy.join(" ")
      };
    }

    if (stepId === "performance") {
      return {
        id: stepId,
        label: "Performance",
        title: "Performance and reliability signal",
        body: getPublicPerformanceSignal(project)
      };
    }

    return {
      id: stepId,
      label: "Impact",
      title: "Public-safe outcome",
      body: project.outcome
    };
  });
}

function getPublicPerformanceSignal(project: ProjectCaseStudy): string {
  const candidateTexts = [
    project.engineered,
    project.problem,
    project.responsibility,
    project.architecture,
    project.outcome,
    ...project.testingStrategy,
    ...project.engineeringDecisions,
    ...project.lessons,
    ...project.technologies
  ].filter((text): text is string => Boolean(text));
  const explicitSignal = candidateTexts.find((text) =>
    /performance|load|stress|latency|threshold|p95|p99|repeatable|reliable|reliability|production|risk/i.test(
      text
    )
  );

  if (explicitSignal) {
    return explicitSignal;
  }

  return "No public performance metric is published for this case study. The portfolio keeps the focus on public-safe reliability signals: maintainable boundaries, validation, repeatable checks, and delivery risk visibility.";
}

function ListBlock({
  title,
  items
}: Readonly<{ title: string; items: readonly string[] }>): React.ReactElement {
  return (
    <section className="case-study-list-block">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
