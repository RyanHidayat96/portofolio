"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { pipelinePanelMetadata } from "@/data/pipeline-metadata";
import {
  createPipelineSnapshot,
  findPipelineScenario,
  PipelineSimulator,
  pipelineScenarios,
  type PipelineEvent,
  type PipelineQualityGateStatus,
  type PipelineRunResult,
  type PipelineScenarioId,
  type PipelineStage,
  type PipelineStageStatus,
  type TimedPipelineEvent
} from "@/features/pipeline/domain/pipeline";
import { GitBranch, Play, RotateCcw, ShieldCheck, Workflow } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const playbackDelayMs = 120;

export function PipelineSimulatorPanel(): React.ReactElement {
  const simulator = useMemo(() => new PipelineSimulator(), []);
  const [scenarioId, setScenarioId] = useState<PipelineScenarioId>("success");
  const [currentRun, setCurrentRun] = useState<PipelineRunResult | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timersRef = useRef<number[]>([]);

  const selectedScenario = findPipelineScenario(scenarioId);
  const visibleEvents = currentRun?.events.slice(0, visibleCount) ?? [];
  const snapshot = createPipelineSnapshot(visibleEvents);
  const completedStageCount = snapshot.stages.filter((stage) =>
    ["passed", "failed", "skipped", "blocked"].includes(stage.status)
  ).length;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }, []);

  const runPipeline = useCallback(() => {
    clearTimers();
    setIsRunning(true);
    setVisibleCount(0);

    const run = simulator.run({ scenarioId });
    setCurrentRun(run);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    run.events.forEach((_event, index) => {
      const delay = prefersReducedMotion ? 0 : index * playbackDelayMs;
      const timerId = window.setTimeout(() => {
        setVisibleCount(index + 1);
        if (index === run.events.length - 1) {
          setIsRunning(false);
        }
      }, delay);
      timersRef.current.push(timerId);
    });
  }, [clearTimers, scenarioId, simulator]);

  const resetPipeline = useCallback(() => {
    clearTimers();
    setScenarioId("success");
    setCurrentRun(null);
    setVisibleCount(0);
    setIsRunning(false);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Panel className="p-5">
        <p className="mono text-sm text-[#55d7ff]">{pipelinePanelMetadata.eyebrow}</p>
        <h1 className="mt-3 text-2xl font-semibold">{pipelinePanelMetadata.title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#8a96a8]">{pipelinePanelMetadata.description}</p>

        <label className="mt-6 block text-sm font-semibold text-[#c8d4e6]" htmlFor="pipeline-mode">
          Pipeline Scenario
        </label>
        <select
          id="pipeline-mode"
          className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[#111722] px-3 text-sm text-[#eef5ff]"
          value={scenarioId}
          onChange={(event) => setScenarioId(event.target.value as PipelineScenarioId)}
          disabled={isRunning}
        >
          {pipelineScenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.label}
            </option>
          ))}
        </select>

        <div className="mt-4 border border-[var(--border)] bg-[#0b0f16] p-4">
          <div className="flex items-start gap-3">
            <GitBranch aria-hidden="true" className="mt-1 text-[#55d7ff]" size={18} />
            <div>
              <h2 className="font-semibold text-[#eef5ff]">{selectedScenario.label}</h2>
              <p className="mt-2 text-sm leading-6 text-[#8a96a8]">{selectedScenario.summary}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {pipelinePanelMetadata.stack.map((item) => (
              <Badge key={item} tone="info">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            icon={<Play aria-hidden="true" size={17} />}
            onClick={runPipeline}
            disabled={isRunning}
          >
            Run
          </Button>
          <Button icon={<RotateCcw aria-hidden="true" size={17} />} onClick={resetPipeline}>
            Reset
          </Button>
        </div>
      </Panel>

      <div className="grid gap-5">
        <Panel className="p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mono text-sm text-[#55d7ff]">PIPELINE EXECUTION</p>
              <h2 className="mt-2 text-2xl font-semibold">Release Pipeline</h2>
              <p className="mt-2 text-sm text-[#8a96a8]">
                {pipelinePanelMetadata.flow.join(" | ")}
              </p>
            </div>
            <Badge tone={getQualityGateTone(snapshot.qualityGate, isRunning)}>
              {getQualityGateLabel(snapshot.qualityGate, isRunning)}
            </Badge>
          </div>

          <ol className="mt-7 grid gap-3">
            {snapshot.stages.map((stage, index) => (
              <PipelineStageItem key={stage.id} index={index} stage={stage} />
            ))}
          </ol>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel className="p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck aria-hidden="true" className="mt-1 text-[#55d7ff]" size={18} />
              <div>
                <p className="mono text-sm text-[#55d7ff]">QUALITY GATE</p>
                <h2 className="mt-2 text-xl font-semibold">
                  {formatQualityGateStatus(snapshot.qualityGate)}
                </h2>
              </div>
            </div>
            <p className="mt-4 border border-[var(--border)] bg-[#0b0f16] p-4 text-sm leading-6 text-[#c8d4e6]">
              {snapshot.summary}
            </p>
            <p className="mt-3 text-sm text-[#8a96a8]">
              Stages resolved: {completedStageCount} / {snapshot.stages.length}
            </p>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-start gap-3">
              <Workflow aria-hidden="true" className="mt-1 text-[#55d7ff]" size={18} />
              <div>
                <p className="mono text-sm text-[#55d7ff]">EXECUTION TRACE</p>
                <h2 className="mt-2 text-xl font-semibold">Deterministic Events</h2>
              </div>
            </div>
            <EventFeed events={visibleEvents} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function PipelineStageItem({
  index,
  stage
}: Readonly<{
  index: number;
  stage: PipelineStage;
}>): React.ReactElement {
  return (
    <li className="grid gap-3 border border-[var(--border)] bg-[#10141d] p-4 sm:grid-cols-[40px_1fr_auto] sm:items-center">
      <div className="mono flex h-9 w-9 items-center justify-center border border-[var(--border)] text-sm text-[#8a96a8]">
        {index + 1}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`h-2.5 w-2.5 ${getStageDotClass(stage.status)}`} aria-hidden="true" />
          <h3 className="font-semibold">{stage.label}</h3>
        </div>
        <p className="mt-1 text-sm leading-6 text-[#8a96a8]">{stage.summary}</p>
      </div>
      <StageBadge status={stage.status} />
    </li>
  );
}

function EventFeed({
  events
}: Readonly<{ events: readonly TimedPipelineEvent[] }>): React.ReactElement {
  return (
    <div className="mt-5 grid gap-3" role="log" aria-live="polite" aria-label="Pipeline event log">
      {events.length === 0 ? (
        <p className="border border-dashed border-[var(--border)] p-4 text-sm text-[#8a96a8]">
          Run pipeline to stream stage events.
        </p>
      ) : (
        events.map((item, index) => (
          <PipelineEventLine key={`${item.atMs}-${index}`} event={item.event} />
        ))
      )}
    </div>
  );
}

function PipelineEventLine({ event }: Readonly<{ event: PipelineEvent }>): React.ReactElement {
  const presentation = formatPipelineEvent(event);
  const toneClass = {
    info: "text-[#55d7ff]",
    success: "text-[#6ee7a8]",
    warning: "text-[#ffd36e]",
    danger: "text-[#ff6f7d]"
  }[presentation.tone];

  return (
    <div className="mono border border-[var(--border)] bg-[#0b0f16] p-3 text-sm">
      <span className={toneClass}>{presentation.text}</span>
      {presentation.detail ? (
        <p className="mt-2 whitespace-normal font-sans text-xs leading-5 text-[#8a96a8]">
          {presentation.detail}
        </p>
      ) : null}
    </div>
  );
}

function formatPipelineEvent(event: PipelineEvent): {
  readonly tone: "info" | "success" | "warning" | "danger";
  readonly text: string;
  readonly detail?: string;
} {
  switch (event.type) {
    case "pipeline.started":
      return { tone: "info", text: `PIPELINE STARTED`, detail: event.label };
    case "stage.started":
      return { tone: "info", text: `RUN ${event.label}` };
    case "stage.completed":
      return {
        tone: getStageEventTone(event.status),
        text: `${event.status.toUpperCase()} ${formatStageId(event.stageId)}`,
        detail: event.summary
      };
    case "stage.skipped":
      return {
        tone: "warning",
        text: `SKIPPED ${formatStageId(event.stageId)}`,
        detail: event.reason
      };
    case "quality-gate.evaluated":
      return {
        tone: event.status === "passed" ? "success" : "danger",
        text: `QUALITY GATE ${event.status.toUpperCase()}`,
        detail: event.message
      };
    case "pipeline.completed":
      return {
        tone: event.status === "passed" ? "success" : "danger",
        text: `PIPELINE ${event.status.toUpperCase()}`,
        detail: `${event.durationMs}ms | ${event.summary}`
      };
  }
}

function StageBadge({ status }: Readonly<{ status: PipelineStageStatus }>): React.ReactElement {
  const tone: Record<PipelineStageStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
    pending: "neutral",
    running: "info",
    passed: "success",
    failed: "danger",
    skipped: "neutral",
    blocked: "danger"
  };

  return <Badge tone={tone[status]}>{status}</Badge>;
}

function getQualityGateTone(
  status: PipelineQualityGateStatus,
  isRunning: boolean
): "neutral" | "info" | "success" | "danger" {
  if (status === "passed") {
    return "success";
  }

  if (status === "blocked") {
    return "danger";
  }

  return isRunning ? "info" : "neutral";
}

function getQualityGateLabel(status: PipelineQualityGateStatus, isRunning: boolean): string {
  if (status === "pending") {
    return isRunning ? "running" : "idle";
  }

  return status;
}

function formatQualityGateStatus(status: PipelineQualityGateStatus): string {
  if (status === "pending") {
    return "Pending";
  }

  return status === "passed" ? "Passed" : "Blocked";
}

function getStageDotClass(status: PipelineStageStatus): string {
  const classMap: Record<PipelineStageStatus, string> = {
    pending: "bg-[#293241]",
    running: "bg-[#55d7ff]",
    passed: "bg-[#6ee7a8]",
    failed: "bg-[#ff6f7d]",
    skipped: "bg-[#8a96a8]",
    blocked: "bg-[#ff6f7d]"
  };

  return classMap[status];
}

function getStageEventTone(status: "passed" | "failed" | "blocked"): "success" | "danger" {
  return status === "passed" ? "success" : "danger";
}

function formatStageId(stageId: string): string {
  return stageId.replaceAll("-", " ").toUpperCase();
}
