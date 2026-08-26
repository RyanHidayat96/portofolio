"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type {
  ProjectArchitectureBranch,
  ProjectArchitectureLayer,
  ProjectCaseStudy
} from "@/data/types";
import { Gauge, Network, Rocket, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

type CaseStudyStepId =
  "problem" | "architecture" | "implementation" | "testing" | "performance" | "impact";
type ProjectWorldTone = "context" | "build" | "quality" | "impact";

interface CaseStudyStep {
  readonly id: CaseStudyStepId;
  readonly label: string;
  readonly title: string;
  readonly body: string;
}

interface ProjectWorldLayer {
  readonly id: string;
  readonly label: string;
  readonly stack: string;
  readonly purpose: string;
  readonly tone: ProjectWorldTone;
  readonly x: number;
  readonly y: number;
}

const stepOrder: readonly CaseStudyStepId[] = [
  "problem",
  "architecture",
  "implementation",
  "testing",
  "performance",
  "impact"
];

const worldLayerCoordinates: readonly { readonly x: number; readonly y: number }[] = [
  { x: 14, y: 48 },
  { x: 30, y: 22 },
  { x: 47, y: 38 },
  { x: 64, y: 24 },
  { x: 80, y: 48 },
  { x: 62, y: 74 },
  { x: 42, y: 68 },
  { x: 24, y: 76 }
];

const branchCoordinates: readonly { readonly x: number; readonly y: number }[] = [
  { x: 86, y: 18 },
  { x: 90, y: 58 },
  { x: 72, y: 86 }
];

export function FlagshipCaseStudy({
  project,
  onExploreArchitecture
}: Readonly<{
  project: ProjectCaseStudy;
  onExploreArchitecture?: () => void;
}>): React.ReactElement {
  const worldLayers = useMemo(() => getProjectWorldLayers(project), [project]);
  const [activeStepId, setActiveStepId] = useState<CaseStudyStepId>("problem");
  const [activeLayerId, setActiveLayerId] = useState(resolveInitialLayerId(worldLayers));
  const steps = useMemo(() => getCaseStudySteps(project), [project]);
  const activeStep = steps.find((step) => step.id === activeStepId) ?? steps[0];
  const activeLayer = worldLayers.find((layer) => layer.id === activeLayerId) ?? worldLayers[0];
  const primaryCategory = project.categories[0] ?? "build";

  return (
    <article className="case-study-shell" data-project-world={project.slug} data-step={activeStep.id}>
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
          <p className="eyebrow">project.world</p>
          <h1>{project.title}</h1>
          <p>{project.overview ?? project.context}</p>

          <div className="case-study-actions">
            {onExploreArchitecture ? (
              <Button
                variant="primary"
                icon={<Network aria-hidden="true" size={18} />}
                onClick={onExploreArchitecture}
                cursorLabel="MAP"
                magnetic
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
          <div className="case-study-proof-signals" aria-label="Project evidence coverage">
            <span><Network aria-hidden="true" size={15} /> Architecture</span>
            <span><ShieldCheck aria-hidden="true" size={15} /> Testing</span>
            <span><Gauge aria-hidden="true" size={15} /> Performance</span>
            <span><Rocket aria-hidden="true" size={15} /> Impact</span>
          </div>
        </aside>
      </header>

      <section className="case-study-world-section" aria-labelledby="case-study-world-title">
        <div className="case-study-section-heading">
          <p className="eyebrow">technical.world</p>
          <h2 id="case-study-world-title">Project architecture as an inspectable system.</h2>
        </div>

        <div className="case-study-world-grid">
          <ProjectWorldMap
            layers={worldLayers}
            branches={project.architectureBranches ?? []}
            activeLayerId={activeLayer?.id ?? ""}
            onLayerSelect={setActiveLayerId}
          />

          <aside className="case-study-layer-detail case-study-world-detail">
            {activeLayer ? (
              <>
                <span>selected.node</span>
                <h3>{activeLayer.label}</h3>
                <strong>{activeLayer.stack}</strong>
                <p>{activeLayer.purpose}</p>
              </>
            ) : (
              <p>No architecture layer configured.</p>
            )}
          </aside>
        </div>
      </section>

      <section className="case-study-sequence" aria-labelledby="case-study-sequence-title">
        <div className="case-study-section-heading">
          <p className="eyebrow">case-study.flow</p>
          <h2 id="case-study-sequence-title">Problem to impact, inspectable step by step.</h2>
        </div>

        <div className="case-study-timeline" aria-hidden="true">
          {steps.map((step) => (
            <span key={step.id} data-active={step.id === activeStep.id} />
          ))}
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
                onKeyDown={(event) => onCaseStudyTabKeyDown(event, step.id, setActiveStepId)}
                className="case-study-tab"
                data-active={isActive}
                data-cursor-intent="button"
                data-cursor-label="STEP"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.label}</strong>
              </button>
            );
          })}
        </div>

        <div
          key={activeStep.id}
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
          <p className="eyebrow">implementation.surface</p>
          <h2 id="case-study-system-title">Architecture, branches, and delivery surface.</h2>
        </div>

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
        ) : (
          <div className="case-study-architecture-note">
            <span>public-safe architecture</span>
            <p>{project.architecture}</p>
          </div>
        )}
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

function ProjectWorldMap({
  layers,
  branches,
  activeLayerId,
  onLayerSelect
}: Readonly<{
  layers: readonly ProjectWorldLayer[];
  branches: readonly ProjectArchitectureBranch[];
  activeLayerId: string;
  onLayerSelect: (layerId: string) => void;
}>): React.ReactElement {
  const activeLayer = layers.find((layer) => layer.id === activeLayerId) ?? layers[0];

  return (
    <div className="case-study-world-map" aria-label="Interactive project architecture map">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {layers.slice(0, -1).map((layer, index) => {
          const nextLayer = layers[index + 1];
          if (!nextLayer) {
            return null;
          }

          return (
            <line
              key={`${layer.id}-${nextLayer.id}`}
              x1={layer.x}
              y1={layer.y}
              x2={nextLayer.x}
              y2={nextLayer.y}
              className="case-study-world-edge"
              data-active={layer.id === activeLayerId || nextLayer.id === activeLayerId}
            />
          );
        })}

        {branches.slice(0, branchCoordinates.length).map((branch, index) => {
          const point = branchCoordinates[index] ?? branchCoordinates[0];
          if (!activeLayer || !point) {
            return null;
          }

          return (
            <line
              key={branch.id}
              x1={activeLayer.x}
              y1={activeLayer.y}
              x2={point.x}
              y2={point.y}
              className="case-study-world-branch-edge"
            />
          );
        })}
      </svg>

      {layers.map((layer, index) => (
        <button
          key={layer.id}
          type="button"
          aria-pressed={layer.id === activeLayerId}
          onClick={() => onLayerSelect(layer.id)}
          onFocus={() => onLayerSelect(layer.id)}
          className="case-study-world-node"
          data-active={layer.id === activeLayerId}
          data-tone={layer.tone}
          data-cursor-intent="node"
          data-cursor-label="NODE"
          style={{ left: `${layer.x}%`, top: `${layer.y}%` }}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{layer.label}</strong>
        </button>
      ))}

      {branches.slice(0, branchCoordinates.length).map((branch, index) => {
        const point = branchCoordinates[index] ?? branchCoordinates[0];
        if (!point) {
          return null;
        }

        return (
          <span
            key={branch.id}
            className="case-study-world-branch"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            {branch.label}
          </span>
        );
      })}
    </div>
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

function getProjectWorldLayers(project: ProjectCaseStudy): readonly ProjectWorldLayer[] {
  if (project.architectureLayers && project.architectureLayers.length > 0) {
    return project.architectureLayers.map((layer, index) => ({
      ...createWorldLayer(layer, index),
      tone: getWorldTone(project, index)
    }));
  }

  return [
    {
      id: "problem",
      label: "Problem",
      stack: project.role ?? "Project context",
      purpose: project.problem,
      tone: "context",
      ...worldLayerCoordinates[0]
    },
    {
      id: "architecture",
      label: "Architecture",
      stack: project.technologies.slice(0, 4).join(", "),
      purpose: project.architecture,
      tone: "build",
      ...worldLayerCoordinates[2]
    },
    {
      id: "testing",
      label: "Testing",
      stack: project.testingStrategy[0] ?? "Quality strategy",
      purpose: project.testingStrategy.join(" "),
      tone: "quality",
      ...worldLayerCoordinates[5]
    },
    {
      id: "impact",
      label: "Impact",
      stack: project.status,
      purpose: project.outcome,
      tone: "impact",
      ...worldLayerCoordinates[4]
    }
  ];
}

function createWorldLayer(
  layer: ProjectArchitectureLayer,
  index: number
): Omit<ProjectWorldLayer, "tone"> {
  const coordinates = worldLayerCoordinates[index % worldLayerCoordinates.length] ??
    worldLayerCoordinates[0];

  return {
    id: layer.id,
    label: layer.label,
    stack: layer.stack,
    purpose: layer.purpose,
    x: coordinates.x,
    y: coordinates.y
  };
}

function getWorldTone(project: ProjectCaseStudy, index: number): ProjectWorldTone {
  if (project.categories.includes("quality") || /test|quality|automation/i.test(project.title)) {
    return index < 2 ? "context" : "quality";
  }

  if (project.categories.includes("devops") && index > 1) {
    return "impact";
  }

  return index === 0 ? "context" : "build";
}

function resolveInitialLayerId(layers: readonly ProjectWorldLayer[]): string {
  return layers[1]?.id ?? layers[0]?.id ?? "";
}

function onCaseStudyTabKeyDown(
  event: React.KeyboardEvent<HTMLButtonElement>,
  currentStepId: CaseStudyStepId,
  setActiveStepId: React.Dispatch<React.SetStateAction<CaseStudyStepId>>
): void {
  if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
    return;
  }

  event.preventDefault();
  const currentIndex = stepOrder.findIndex((stepId) => stepId === currentStepId);
  const nextIndex = getNextStepIndex(event.key, Math.max(0, currentIndex));
  const nextStepId = stepOrder[nextIndex] ?? "problem";

  setActiveStepId(nextStepId);
  window.requestAnimationFrame(() => document.getElementById(`case-study-tab-${nextStepId}`)?.focus());
}

function getNextStepIndex(key: string, currentIndex: number): number {
  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return stepOrder.length - 1;
  }

  const direction = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
  return (currentIndex + direction + stepOrder.length) % stepOrder.length;
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
