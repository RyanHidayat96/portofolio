"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import {
  failureStrategies,
  findFailureStrategy
} from "@/features/automation-lab/domain/failure-strategies";
import {
  AutomationSimulationEngine,
  defaultAutomationScenario
} from "@/features/automation-lab/domain/simulation-engine";
import type {
  FailureType,
  QualityGateImpact,
  RecoveryMode,
  SimulationEvent,
  TimedSimulationEvent
} from "@/features/automation-lab/domain/types";
import {
  AlertTriangle,
  FileSearch,
  Gauge,
  Play,
  RotateCcw,
  ShieldCheck,
  Square,
  Wrench
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const playbackDelayMs = 90;

export function AutomationLab(): React.ReactElement {
  const engine = useMemo(() => new AutomationSimulationEngine(), []);
  const [failureType, setFailureType] = useState<FailureType>("none");
  const [events, setEvents] = useState<readonly TimedSimulationEvent[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timersRef = useRef<number[]>([]);

  const selectedStrategy = findFailureStrategy(failureType);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }, []);

  const runSimulation = useCallback(async () => {
    clearTimers();
    setIsRunning(true);
    setVisibleCount(0);

    const strategy = findFailureStrategy(failureType);
    const scenario = strategy.inject(defaultAutomationScenario);
    const result = await engine.execute(scenario);
    setEvents(result.events);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    result.events.forEach((_event, index) => {
      const delay = prefersReducedMotion ? 0 : index * playbackDelayMs;
      const timerId = window.setTimeout(() => {
        setVisibleCount(index + 1);
        if (index === result.events.length - 1) {
          setIsRunning(false);
        }
      }, delay);
      timersRef.current.push(timerId);
    });
  }, [clearTimers, engine, failureType]);

  const resetSimulation = useCallback(() => {
    clearTimers();
    setEvents([]);
    setVisibleCount(0);
    setIsRunning(false);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const visibleEvents = events.slice(0, visibleCount);
  const runnerEvents = visibleEvents.filter(isRunnerEvent);
  const inspectorEvents = visibleEvents.filter(isInspectorEvent);
  const healingEvents = visibleEvents.filter(isHealingEvent);
  const passedSteps = visibleEvents.filter((item) => item.event.type === "step.passed").length;
  const finalEvent = [...visibleEvents]
    .reverse()
    .find((item) => item.event.type === "test.completed")?.event;
  const finalStatus = finalEvent?.type === "test.completed" ? finalEvent.status : undefined;
  const gateImpact = getLatestGateImpact(visibleEvents);
  const statusLabel = getStatusLabel({ finalStatus, gateImpact, isRunning });

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Panel className="p-5">
        <p className="mono text-sm text-[#55d7ff]">interactive.simulation</p>
        <h1 className="mt-3 text-2xl font-semibold">Break My Automation</h1>
        <p className="mt-3 text-sm leading-6 text-[#8a96a8]">
          Deterministic workflow demo. Browser, API, and self-healing activity are simulated.
        </p>

        <label className="mt-6 block text-sm font-semibold text-[#c8d4e6]" htmlFor="failure-type">
          Failure Scenario
        </label>
        <select
          id="failure-type"
          className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[#111722] px-3 text-sm text-[#eef5ff]"
          value={failureType}
          onChange={(event) => setFailureType(event.target.value as FailureType)}
          disabled={isRunning}
        >
          {failureStrategies.map((strategy) => (
            <option key={strategy.type} value={strategy.type}>
              {strategy.label}
            </option>
          ))}
        </select>

        <div className="mt-4 border border-[var(--border)] bg-[#0b0f16] p-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone={getRecoveryTone(selectedStrategy.recoveryMode)}>
              {formatRecoveryMode(selectedStrategy.recoveryMode)}
            </Badge>
            <Badge tone={getGateTone(selectedStrategy.qualityGateImpact)}>
              gate {formatGateImpact(selectedStrategy.qualityGateImpact).toLowerCase()}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#b7c2d2]">{selectedStrategy.summary}</p>
          <div className="mt-4 grid gap-2">
            {selectedStrategy.inspectorFocus.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-[#8a96a8]">
                <span className="h-1.5 w-1.5 bg-[#55d7ff]" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            icon={<Play aria-hidden="true" size={17} />}
            onClick={() => void runSimulation()}
            disabled={isRunning}
          >
            Run
          </Button>
          <Button
            icon={<Square aria-hidden="true" size={17} />}
            onClick={() => {
              clearTimers();
              setIsRunning(false);
            }}
            disabled={!isRunning}
          >
            Stop
          </Button>
          <Button icon={<RotateCcw aria-hidden="true" size={17} />} onClick={resetSimulation}>
            Reset
          </Button>
          <Button
            icon={<Wrench aria-hidden="true" size={17} />}
            onClick={() => void runSimulation()}
            disabled={isRunning}
          >
            Replay
          </Button>
        </div>
      </Panel>

      <div className="grid gap-5">
        <Panel className="p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mono text-sm text-[#55d7ff]">TEST RUNNER</p>
              <h2 className="mt-2 text-2xl font-semibold">Approval Flow Regression</h2>
              <p className="mt-2 text-sm text-[#8a96a8]">
                Environment: {defaultAutomationScenario.environment} | Browser:{" "}
                {defaultAutomationScenario.browser} | Steps: {passedSteps} /{" "}
                {defaultAutomationScenario.steps.length}
              </p>
            </div>
            <Badge tone={statusLabel.tone}>{statusLabel.text}</Badge>
          </div>

          <EventFeed
            events={runnerEvents}
            emptyText="Idle runner timeline."
            ariaLabel="Automation test runner log"
          />
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel className="p-5">
            <SectionHeading
              icon={<FileSearch aria-hidden="true" size={18} />}
              kicker="FAILURE INSPECTOR"
              title={selectedStrategy.label}
            />
            <p className="mt-3 text-sm leading-6 text-[#8a96a8]">
              {selectedStrategy.failureReason || "No failure injected for this run."}
            </p>
            <EventFeed
              events={inspectorEvents}
              emptyText="No failure telemetry yet."
              ariaLabel="Failure inspector log"
            />
          </Panel>

          <Panel className="p-5">
            <SectionHeading
              icon={
                selectedStrategy.qualityGateImpact === "warning" ? (
                  <Gauge aria-hidden="true" size={18} />
                ) : selectedStrategy.recoveryMode === "self-healing" ? (
                  <ShieldCheck aria-hidden="true" size={18} />
                ) : (
                  <AlertTriangle aria-hidden="true" size={18} />
                )
              }
              kicker="HEALING ENGINE"
              title={getHealingTitle(selectedStrategy.recoveryMode)}
            />
            <p className="mt-3 text-sm leading-6 text-[#8a96a8]">
              {getHealingSummary(selectedStrategy.recoveryMode)}
            </p>
            <EventFeed
              events={healingEvents}
              emptyText="No healing activity yet."
              ariaLabel="Self-healing engine log"
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  kicker,
  title
}: Readonly<{
  icon: React.ReactNode;
  kicker: string;
  title: string;
}>): React.ReactElement {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-[#55d7ff]">{icon}</div>
      <div>
        <p className="mono text-sm text-[#55d7ff]">{kicker}</p>
        <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      </div>
    </div>
  );
}

function EventFeed({
  events,
  emptyText,
  ariaLabel
}: Readonly<{
  events: readonly TimedSimulationEvent[];
  emptyText: string;
  ariaLabel: string;
}>): React.ReactElement {
  return (
    <div className="mt-5 grid gap-3" role="log" aria-live="polite" aria-label={ariaLabel}>
      {events.length === 0 ? (
        <p className="border border-dashed border-[var(--border)] p-4 text-sm text-[#8a96a8]">
          {emptyText}
        </p>
      ) : (
        events.map((item, index) => (
          <AutomationEventLine key={`${item.atMs}-${index}`} event={item} />
        ))
      )}
    </div>
  );
}

function AutomationEventLine({
  event
}: Readonly<{ event: TimedSimulationEvent }>): React.ReactElement {
  const presentation = formatEvent(event.event);
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

function formatEvent(event: SimulationEvent): {
  readonly tone: "info" | "success" | "warning" | "danger";
  readonly text: string;
  readonly detail?: string;
} {
  switch (event.type) {
    case "test.started":
      return { tone: "info", text: `START ${event.testId}` };
    case "step.started":
      return { tone: "info", text: `RUN ${event.label}` };
    case "step.passed":
      return { tone: "success", text: `PASS ${event.stepId} ${event.durationMs}ms` };
    case "test.failed":
      return { tone: "danger", text: `ERROR ${event.reason}` };
    case "failure.detected":
      return {
        tone: "danger",
        text: `DETECTED ${event.failureType}`,
        detail: event.reason
      };
    case "inspection.note":
      return { tone: "info", text: event.title.toUpperCase(), detail: event.detail };
    case "failure.classified":
      return {
        tone: "warning",
        text: `CLASSIFIED ${event.classification}`,
        detail: event.detail
      };
    case "retry.scheduled":
      return {
        tone: "warning",
        text: `RETRY ${event.attempt} SCHEDULED`,
        detail: event.policy
      };
    case "retry.completed":
      return {
        tone: "info",
        text: `RETRY ${event.attempt} COMPLETE`,
        detail: event.outcome
      };
    case "performance.warning":
      return { tone: "warning", text: `WARNING ${event.metric}`, detail: event.detail };
    case "gate.impact":
      return {
        tone: getGateTone(event.impact),
        text: `QUALITY GATE ${formatGateImpact(event.impact)}`,
        detail: event.message
      };
    case "healing.started":
      return { tone: "warning", text: "HEALING STARTED", detail: event.target };
    case "healing.candidate":
      return {
        tone: "info",
        text: `SELECTOR CANDIDATE ${event.score}%`,
        detail: `${event.selector} | ${event.rationale}`
      };
    case "healing.completed":
      return {
        tone: "success",
        text: `HEALED ${event.confidence}%`,
        detail: event.selector
      };
    case "healing.unavailable":
      return {
        tone: "warning",
        text: "SELF-HEALING NOT AVAILABLE",
        detail: event.reason
      };
    case "test.completed":
      return {
        tone: event.status === "passed" ? "success" : "danger",
        text: `TEST ${event.status.toUpperCase()}`
      };
  }
}

function isRunnerEvent(item: TimedSimulationEvent): boolean {
  switch (item.event.type) {
    case "test.started":
    case "step.started":
    case "step.passed":
    case "test.failed":
    case "test.completed":
      return true;
    default:
      return false;
  }
}

function isInspectorEvent(item: TimedSimulationEvent): boolean {
  switch (item.event.type) {
    case "failure.detected":
    case "inspection.note":
    case "failure.classified":
    case "retry.scheduled":
    case "retry.completed":
    case "performance.warning":
    case "gate.impact":
      return true;
    default:
      return false;
  }
}

function isHealingEvent(item: TimedSimulationEvent): boolean {
  switch (item.event.type) {
    case "healing.started":
    case "healing.candidate":
    case "healing.completed":
    case "healing.unavailable":
      return true;
    default:
      return false;
  }
}

function getLatestGateImpact(
  events: readonly TimedSimulationEvent[]
): QualityGateImpact | undefined {
  for (const item of [...events].reverse()) {
    if (item.event.type === "gate.impact") {
      return item.event.impact;
    }
  }

  return undefined;
}

function getStatusLabel({
  finalStatus,
  gateImpact,
  isRunning
}: Readonly<{
  finalStatus?: "passed" | "failed";
  gateImpact?: QualityGateImpact;
  isRunning: boolean;
}>): {
  readonly text: string;
  readonly tone: "neutral" | "info" | "success" | "warning" | "danger";
} {
  if (!finalStatus) {
    return isRunning ? { text: "running", tone: "info" } : { text: "idle", tone: "neutral" };
  }

  if (finalStatus === "passed" && gateImpact === "warning") {
    return { text: "passed with warning", tone: "warning" };
  }

  return finalStatus === "passed"
    ? { text: "passed", tone: "success" }
    : { text: "failed", tone: "danger" };
}

function getGateTone(impact: QualityGateImpact): "success" | "warning" | "danger" {
  if (impact === "blocked") {
    return "danger";
  }

  if (impact === "warning") {
    return "warning";
  }

  return "success";
}

function getRecoveryTone(mode: RecoveryMode): "neutral" | "info" | "success" | "warning" {
  if (mode === "self-healing") {
    return "success";
  }

  if (mode === "controlled-retry") {
    return "info";
  }

  if (mode === "not-recoverable") {
    return "warning";
  }

  return "neutral";
}

function formatRecoveryMode(mode: RecoveryMode): string {
  return mode.replaceAll("-", " ");
}

function formatGateImpact(impact: QualityGateImpact): string {
  if (impact === "none") {
    return "PASS";
  }

  return impact.toUpperCase();
}

function getHealingTitle(mode: RecoveryMode): string {
  if (mode === "self-healing") {
    return "Candidate Scoring";
  }

  if (mode === "controlled-retry") {
    return "No Selector Repair";
  }

  if (mode === "not-recoverable") {
    return "Blocked Outside UI";
  }

  return "Standby";
}

function getHealingSummary(mode: RecoveryMode): string {
  if (mode === "self-healing") {
    return "Selector candidates are scored, retried, and reported as simulated recovery.";
  }

  if (mode === "controlled-retry") {
    return "Retry policy can diagnose the failure, but does not pretend to self-heal it.";
  }

  if (mode === "not-recoverable") {
    return "Self-healing is unavailable because the failure is outside selector behavior.";
  }

  return "No self-healing path is needed for the selected scenario.";
}
