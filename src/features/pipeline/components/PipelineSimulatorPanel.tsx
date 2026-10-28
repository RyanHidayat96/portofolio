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
  pipelineStageDefinitions,
  type PipelineEvent,
  type PipelineQualityGateStatus,
  type PipelineRunResult,
  type PipelineScenarioId,
  type PipelineStage,
  type PipelineStageStatus,
  type TimedPipelineEvent
} from "@/features/pipeline/domain/pipeline";
import {
  Activity,
  Cpu,
  GitBranch,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal as TerminalIcon,
  Workflow
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const playbackDelayMs = 120;

export function PipelineSimulatorPanel({
  variant = "workspace",
  interactive = true
}: Readonly<{ variant?: "workspace" | "screen"; interactive?: boolean }> = {}): React.ReactElement {
  const simulator = useMemo(() => new PipelineSimulator(), []);
  const [scenarioId, setScenarioId] = useState<PipelineScenarioId>("success");
  const [currentRun, setCurrentRun] = useState<PipelineRunResult | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timersRef = useRef<number[]>([]);
  const elapsedTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const selectedScenario = findPipelineScenario(scenarioId);
  const visibleEvents = currentRun?.events.slice(0, visibleCount) ?? [];
  const snapshot = createPipelineSnapshot(visibleEvents);
  const completedStageCount = snapshot.stages.filter((stage) =>
    ["passed", "failed", "skipped", "blocked"].includes(stage.status)
  ).length;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
    if (elapsedTimerRef.current !== null) {
      window.clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  // When not interactive (e.g. viewed from room overview), pause simulation timers to keep room rendering smooth
  useEffect(() => {
    if (!interactive && isRunning) {
      clearTimers();
      setIsRunning(false);
    }
  }, [clearTimers, interactive, isRunning]);

  const isPulseActive = isRunning && interactive;

  const runPipeline = useCallback(() => {
    clearTimers();
    setIsRunning(true);
    setVisibleCount(0);
    setElapsedMs(0);
    startTimeRef.current = performance.now();

    const run = simulator.run({ scenarioId });
    setCurrentRun(run);

    elapsedTimerRef.current = window.setInterval(() => {
      setElapsedMs(Math.round(performance.now() - startTimeRef.current));
    }, 50);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    run.events.forEach((_event, index) => {
      const delay = prefersReducedMotion ? 0 : index * playbackDelayMs;
      const timerId = window.setTimeout(() => {
        setVisibleCount(index + 1);
        if (index === run.events.length - 1) {
          setIsRunning(false);
          if (elapsedTimerRef.current !== null) {
            window.clearInterval(elapsedTimerRef.current);
            elapsedTimerRef.current = null;
          }
          setElapsedMs(run.durationMs);
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
    setElapsedMs(0);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const isScreen = variant === "screen";
  const passRate =
    snapshot.qualityGate === "passed"
      ? "100%"
      : snapshot.qualityGate === "blocked"
        ? "00%"
        : isRunning
          ? "RUNNING"
          : "READY";

  const cycleTimeLabel = formatElapsedDisplay(elapsedMs, isRunning);

  return (
    <div
      className={
        isScreen
          ? "pipeline-simulator-screen pipeline-crt-console"
          : "pipeline-simulator-workspace grid gap-5 xl:grid-cols-[380px_1fr]"
      }
    >
      {/* LEFT: Retro Telemetry Hardware Controls */}
      <Panel className="pipeline-controls border-2 border-[var(--border-strong)] bg-[var(--surface-deep)] p-4 sm:p-5 shadow-[4px_4px_0_#000]">
        {/* Hardware Status Header */}
        <div className="border-b border-[var(--border-strong)] pb-3">
          <div className="flex items-center justify-between text-xs mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--accent)] font-bold">
              <Cpu size={14} aria-hidden="true" />
              <span>TELEMETRY CONSOLE v2.4</span>
            </span>
            <span className="text-[var(--accent-secondary)]">[STATION-04]</span>
          </div>
          {!isScreen ? (
            <>
              <p className="mono mt-2 text-xs uppercase tracking-widest text-[#ffb000]">
                {pipelinePanelMetadata.eyebrow}
              </p>
              <h1 className="mt-1 text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
                {pipelinePanelMetadata.title}
              </h1>
              <p className="mt-2 text-sm leading-5 text-[var(--text-muted)]">
                {pipelinePanelMetadata.description}
              </p>
            </>
          ) : null}
        </div>

        {/* Preset Hardware Mode Bank */}
        <div className="mt-4">
          <label
            className="block text-xs font-bold uppercase tracking-wider text-[var(--accent)] mono"
            htmlFor="pipeline-mode"
          >
            Pipeline Scenario
          </label>
          <select
            id="pipeline-mode"
            className="mt-2 min-h-11 w-full border-2 border-[var(--border-strong)] bg-[var(--surface-raised)] px-3 text-sm mono font-bold uppercase text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
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

          {/* Quick Hardware Mode Pushbuttons */}
          <div className="mt-2 grid grid-cols-3 gap-1 mono text-[11px]">
            {pipelineScenarios.map((scenario, idx) => {
              const active = scenario.id === scenarioId;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setScenarioId(scenario.id)}
                  disabled={isRunning}
                  className={`border p-1 text-center uppercase tracking-tighter ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-[0_0_8px_rgba(255,176,0,0.5)]"
                      : "border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  0{idx + 1}:{scenario.id.slice(0, 4)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenario Details & Hardware Specs */}
        <div className="pipeline-scenario-detail mt-4 border border-[var(--border)] bg-[var(--surface-deep)] p-3">
          <div className="flex items-start gap-2">
            <GitBranch aria-hidden="true" className="mt-1 text-[#ffb000] shrink-0" size={16} />
            <div>
              <h2 className="mono font-bold text-sm uppercase text-[var(--text-primary)]">
                {selectedScenario.label}
              </h2>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                {selectedScenario.summary}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {pipelinePanelMetadata.stack.map((item) => (
              <span
                key={item}
                className="mono text-[10px] uppercase border border-[var(--border-strong)] bg-[var(--surface-raised)] px-1.5 py-0.5 text-[var(--accent-secondary)]"
              >
                [{item}]
              </span>
            ))}
          </div>
        </div>

        {/* Big Retro Action Controls */}
        <div className="pipeline-actions mt-5 grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            icon={<Play aria-hidden="true" size={16} />}
            onClick={runPipeline}
            disabled={isRunning}
            cursorLabel="RUN"
            magnetic={!isScreen}
            className={`min-h-12 border-2 text-sm font-bold uppercase mono ${
              isPulseActive ? "animate-pulse" : ""
            }`}
          >
            Run
          </Button>
          <Button
            icon={<RotateCcw aria-hidden="true" size={16} />}
            onClick={resetPipeline}
            cursorLabel="RESET"
            magnetic={!isScreen}
            className="min-h-12 border-2 text-sm font-bold uppercase mono"
          >
            Reset
          </Button>
        </div>

        {/* Telemetry Status Line */}
        <div className="mt-4 border-t border-[var(--border-strong)] pt-3 mono text-[11px] flex justify-between text-[var(--text-muted)]">
          <span>PORT: 0x8080 // AMBER</span>
          <span className="text-[var(--accent)] font-bold">
            {isRunning ? "● STREAMING" : "○ READY"}
          </span>
        </div>
      </Panel>

      {/* RIGHT: CRT Telemetry Display & Execution Dashboard */}
      <div className="pipeline-results grid gap-5">
        <Panel className="pipeline-execution border-2 border-[var(--border-strong)] bg-[var(--surface-deep)] p-4 sm:p-6 shadow-[4px_4px_0_#000]">
          {/* Top Telemetry Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-strong)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[#ffb000] inline-block shadow-[0_0_8px_#ffb000]" />
                <p className="mono text-xs uppercase tracking-widest text-[#ffb000]">
                  PIPELINE EXECUTION TELEMETRY
                </p>
              </div>
              <h2 className="mt-1 text-2xl font-bold uppercase text-[var(--text-primary)] tracking-tight">
                Software Delivery Lifecycle
              </h2>
              <p className="mt-1 text-xs mono text-[var(--text-muted)]">
                {pipelinePanelMetadata.flow.join(" ══► ")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="mono text-xs text-[var(--text-muted)] uppercase">GATE:</span>
              <Badge
                tone={getQualityGateTone(snapshot.qualityGate, isRunning)}
                className="mono text-xs uppercase font-bold px-2 py-1"
              >
                {getQualityGateLabel(snapshot.qualityGate, isRunning)}
              </Badge>
            </div>
          </div>

          {/* 4 HUGE RETRO KPI CARDS (Mirroring Image 1) */}
          <div className="pipeline-telemetry-kpi-grid mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <TelemetryKpiCard
              label="PASS RATE"
              value={passRate}
              subtext={
                snapshot.qualityGate === "passed"
                  ? "▲ ZERO DEFECTS"
                  : snapshot.qualityGate === "blocked"
                    ? "▼ GATE VIOLATION"
                    : "STANDBY"
              }
              status={snapshot.qualityGate}
            />
            <TelemetryKpiCard
              label="CYCLE TIME"
              value={cycleTimeLabel}
              subtext="TARGET: <04m 00s"
              status="neutral"
            />
            <TelemetryKpiCard
              label="STAGES RESOLVED"
              value={`${completedStageCount} / ${snapshot.stages.length}`}
              subtext={`[${makeAsciiBar(completedStageCount, snapshot.stages.length, 8)}]`}
              status="info"
            />
            <TelemetryKpiCard
              label="QUALITY GATE"
              value={formatQualityGateStatus(snapshot.qualityGate).toUpperCase()}
              subtext={isRunning ? "EVALUATING..." : snapshot.qualityGate === "passed" ? "DEPLOY CLEARED" : "IDLE / PENDING"}
              status={snapshot.qualityGate === "passed" ? "passed" : snapshot.qualityGate === "blocked" ? "blocked" : "neutral"}
            />
          </div>

          {/* LATENCY HISTOGRAM WITH DITHERED BARS & SPLINE CURVE (Directly mirroring Image 1) */}
          <div className="mt-5 border border-[var(--border-strong)] bg-[var(--surface-raised)] p-3">
            <div className="flex items-center justify-between mono text-xs mb-2 text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5 text-[var(--accent)] font-bold">
                <Activity size={14} aria-hidden="true" />
                <span>STAGE LATENCY &amp; EXECUTION DISTRIBUTION (MS)</span>
              </span>
              <span>SCALE: 0-1500ms</span>
            </div>
            <StageLatencyHistogram stages={snapshot.stages} />
          </div>

          {/* RETRO ARCADE PIPELINE FLOW SCHEMATIC (Inspired by Image 3) */}
          <div className="mt-5">
            <div className="flex items-center justify-between mono text-xs text-[var(--text-muted)] mb-2">
              <span className="text-[var(--accent)] font-bold flex items-center gap-1">
                <Workflow size={14} aria-hidden="true" />
                <span>STAGE TOPOLOGY CONDUIT</span>
              </span>
              <span>8 STAGES // DISPATCH READY</span>
            </div>
            <PipelineStageFlow stages={snapshot.stages} />
          </div>

          {/* Detailed Stage Execution Table */}
          <ol className="pipeline-stage-list mt-5 grid gap-2">
            {snapshot.stages.map((stage, index) => (
              <PipelineStageItem key={stage.id} index={index} stage={stage} />
            ))}
          </ol>

          {/* Bottom Telemetry Oscilloscope Spline Wave (Directly from Image 1) */}
          <div className="mt-5 border-t border-[var(--border-strong)] pt-3">
            <div className="flex items-center justify-between mono text-[11px] text-[var(--text-muted)] mb-1">
              <span>RUNNER TELEMETRY WAVEFORM (0.5Hz OSCILLATION)</span>
              <span className="text-[var(--accent-secondary)]">[SIGNAL: STABLE]</span>
            </div>
            <TelemetryOscilloscope isRunning={isPulseActive} />
          </div>
        </Panel>

        {/* Bottom Reports: Quality Gate Verdict & Telemetry Log */}
        <div className="pipeline-reports grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <Panel className="border-2 border-[var(--border-strong)] bg-[var(--surface-deep)] p-4 sm:p-5 shadow-[4px_4px_0_#000]">
            <div className="flex items-start gap-2.5 border-b border-[var(--border-strong)] pb-3">
              {snapshot.qualityGate === "blocked" ? (
                <ShieldAlert aria-hidden="true" className="mt-1 text-[var(--danger-text)] shrink-0" size={18} />
              ) : (
                <ShieldCheck aria-hidden="true" className="mt-1 text-[#ffb000] shrink-0" size={18} />
              )}
              <div>
                <p className="mono text-xs uppercase tracking-wider text-[#ffb000]">QUALITY GATE</p>
                <h2 className="mt-1 text-xl font-bold uppercase text-[var(--text-primary)]">
                  {formatQualityGateStatus(snapshot.qualityGate)}
                </h2>
              </div>
            </div>
            <p className="mt-3 border-2 border-[var(--border-strong)] bg-[var(--surface-raised)] p-3 text-sm mono leading-5 text-[var(--text-secondary)]">
              {snapshot.summary}
            </p>
            <div className="mt-3 mono text-xs text-[var(--text-muted)] flex justify-between">
              <span>STAGES RESOLVED:</span>
              <span className="text-[var(--text-primary)] font-bold">
                {completedStageCount} / {snapshot.stages.length}
              </span>
            </div>
          </Panel>

          <Panel className="border-2 border-[var(--border-strong)] bg-[var(--surface-deep)] p-4 sm:p-5 shadow-[4px_4px_0_#000]">
            <div className="flex items-start gap-2.5 border-b border-[var(--border-strong)] pb-3">
              <TerminalIcon aria-hidden="true" className="mt-1 text-[#ffb000] shrink-0" size={18} />
              <div>
                <p className="mono text-xs uppercase tracking-wider text-[#ffb000]">EXECUTION TRACE</p>
                <h2 className="mt-1 text-xl font-bold uppercase text-[var(--text-primary)]">
                  Deterministic Events
                </h2>
              </div>
            </div>
            <EventFeed events={visibleEvents} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

/** Retro KPI Telemetry Card */
function TelemetryKpiCard({
  label,
  value,
  subtext,
  status
}: Readonly<{
  label: string;
  value: string;
  subtext: string;
  status: "passed" | "blocked" | "pending" | "info" | "neutral";
}>): React.ReactElement {
  const isDanger = status === "blocked";
  const isSuccess = status === "passed";

  return (
    <div
      className={`border-2 p-3 mono flex flex-col justify-between ${
        isDanger
          ? "border-[var(--danger)] bg-[var(--surface-raised)] text-[var(--danger-text)] shadow-[2px_2px_0_#000]"
          : isSuccess
            ? "border-[var(--accent)] bg-[var(--surface-raised)] text-[var(--accent)] shadow-[2px_2px_0_#000]"
            : "border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-[2px_2px_0_#000]"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight truncate leading-none">
        {value}
      </p>
      <p className="mt-2 text-[10px] text-[var(--text-secondary)] opacity-90 truncate">
        {subtext}
      </p>
    </div>
  );
}

/** Stage Latency Histogram with Dithered Raster Bars (Directly from Image 1) */
function StageLatencyHistogram({
  stages
}: Readonly<{ stages: readonly PipelineStage[] }>): React.ReactElement {
  const maxMs = 1500;
  const stageDefs = pipelineStageDefinitions;

  // Points for trendline spline
  const points = stages.map((stage, idx) => {
    const def = stageDefs.find((d) => d.id === stage.id);
    const ms = def ? def.durationMs : 300;
    const x = 46 + idx * 76;
    const y = 125 - (ms / maxMs) * 95;
    return { x, y, ms, stage };
  });

  const splinePath = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 660 148"
        className="w-full h-28 sm:h-32 font-mono text-[10px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Authentic CRT Dither Pattern (Alternating pixel dots) */}
          <pattern id="crt-dither-pat" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="2" height="2" fill="#ffb000" fillOpacity="0.8" />
            <rect x="2" y="2" width="2" height="2" fill="#ffb000" fillOpacity="0.8" />
          </pattern>
          <pattern id="crt-dither-dim" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="1" height="1" fill="#ffb000" fillOpacity="0.3" />
            <rect x="2" y="2" width="1" height="1" fill="#ffb000" fillOpacity="0.3" />
          </pattern>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = 125 - (pct / 100) * 95;
          return (
            <g key={pct}>
              <line
                x1="30"
                y1={y}
                x2="650"
                y2={y}
                stroke="#ffb000"
                strokeOpacity="0.18"
                strokeDasharray="2 3"
              />
              <text x="2" y={y + 3} fill="#ffb000" fillOpacity="0.5" fontSize="8">
                {Math.round((pct / 100) * maxMs)}
              </text>
            </g>
          );
        })}

        {/* Stepped Dithered Histogram Bars */}
        {stages.map((stage, idx) => {
          const def = stageDefs.find((d) => d.id === stage.id);
          const ms = def ? def.durationMs : 300;
          const barHeight = (ms / maxMs) * 95;
          const x = 30 + idx * 76;
          const y = 125 - barHeight;
          const isPassed = stage.status === "passed";
          const isRunning = stage.status === "running";
          const isBlocked = stage.status === "failed" || stage.status === "blocked";

          return (
            <g key={stage.id}>
              {/* Bar Rect */}
              <rect
                x={x}
                y={y}
                width="32"
                height={barHeight}
                fill={isPassed || isRunning ? "url(#crt-dither-pat)" : "url(#crt-dither-dim)"}
                stroke={isBlocked ? "#ff704d" : isRunning ? "#ffd24d" : "#ffb000"}
                strokeWidth={isRunning ? 2 : 1}
              />
              {/* Top Bar Highlight Cap */}
              <rect x={x} y={y} width="32" height="2.5" fill={isBlocked ? "#ff704d" : "#ffd24d"} />
              {/* Numeric readout over bar */}
              <text
                x={x + 16}
                y={y - 4}
                textAnchor="middle"
                fill={isBlocked ? "#ff704d" : "#ffe4a3"}
                fontSize="9"
                fontWeight="bold"
              >
                {ms}ms
              </text>
              {/* X-axis stage code label */}
              <text
                x={x + 16}
                y="140"
                textAnchor="middle"
                fill="#ffb000"
                fontSize="9"
                fontWeight="bold"
              >
                {getStageAbbreviation(stage.id)}
              </text>
            </g>
          );
        })}

        {/* Trendline Spline */}
        <path
          d={splinePath}
          fill="none"
          stroke="#ffd24d"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.75"
        />

        {/* Spline node dots */}
        {points.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="2.5" fill="#ffb000" />
        ))}

        {/* Callout Box on Peak Bar (E2E stage at idx 4, mimicking Image 1's 57.1% badge) */}
        <g transform="translate(334, 8)">
          <line x1="25" y1="18" x2="25" y2="38" stroke="#ffd24d" strokeWidth="1" />
          <rect
            x="0"
            y="0"
            width="80"
            height="18"
            fill="#ffb000"
            stroke="#ffd24d"
            strokeWidth="1"
          />
          <text
            x="40"
            y="13"
            textAnchor="middle"
            fill="#070502"
            fontWeight="bold"
            fontSize="9"
          >
            PEAK: 920ms
          </text>
        </g>
      </svg>
    </div>
  );
}

/** Retro Arcade Pipeline Stage Flow Diagram (Inspired by Image 3) */
function PipelineStageFlow({
  stages
}: Readonly<{ stages: readonly PipelineStage[] }>): React.ReactElement {
  return (
    <div className="pipeline-arcade-flow border border-[var(--border-strong)] bg-[var(--surface-raised)] p-1.5 mono text-xs">
      {/* 8-stage direct conduit track: all 8 stages clearly visible across the frame */}
      <div className="grid grid-cols-8 gap-1 items-center">
        {stages.map((stage, idx) => (
          <StageNodeBox
            key={stage.id}
            index={idx}
            stage={stage}
            isArrowRight={idx < 7}
          />
        ))}
      </div>
    </div>
  );
}

/** Individual Stage Node Box */
function StageNodeBox({
  index,
  stage,
  isArrowRight
}: Readonly<{
  index: number;
  stage: PipelineStage;
  isArrowRight?: boolean;
}>): React.ReactElement {
  const isRunning = stage.status === "running";
  const isPassed = stage.status === "passed";
  const isBlocked = stage.status === "failed" || stage.status === "blocked";
  const isSkipped = stage.status === "skipped";

  return (
    <div className="relative">
      <div
        className={`border p-1 text-center transition-none ${
          isRunning
            ? "border-[var(--accent-secondary)] bg-[var(--accent)] text-[var(--accent-contrast)] font-bold animate-pulse shadow-[0_0_8px_rgba(255,176,0,0.6)]"
            : isPassed
              ? "border-[var(--accent)] bg-[var(--surface-deep)] text-[var(--text-primary)]"
              : isBlocked
                ? "border-[var(--danger)] bg-[var(--surface-deep)] text-[var(--danger-text)]"
                : isSkipped
                  ? "border-dashed border-[var(--border)] bg-[var(--surface-deep)] opacity-60"
                  : "border-[var(--border)] bg-[var(--surface-deep)] text-[var(--text-muted)]"
        }`}
      >
        <div className="flex items-center justify-between text-[8px] font-bold">
          <span>0{index + 1}</span>
          <span className="uppercase">{stage.status.slice(0, 4)}</span>
        </div>
        <p className="mt-0.5 font-bold text-[10px] truncate uppercase">{getStageAbbreviation(stage.id)}</p>
        <p className="text-[8px] text-[var(--text-muted)] truncate">{stage.durationMs}ms</p>
      </div>
      {isArrowRight ? (
        <span
          className="hidden sm:inline-block absolute -right-1.5 top-1/2 -translate-y-1/2 text-[var(--accent)] font-bold z-10 text-[8px] pointer-events-none"
          aria-hidden="true"
        >
          ►
        </span>
      ) : null}
    </div>
  );
}

/** Analog Telemetry Oscilloscope Spline Wave (Directly from Image 1) */
function TelemetryOscilloscope({
  isRunning
}: Readonly<{ isRunning: boolean }>): React.ReactElement {
  const numPoints = 60;
  const width = 940;
  const height = 36;
  const midY = height / 2;

  const points = Array.from({ length: numPoints }, (_, i) => {
    const x = (i / (numPoints - 1)) * width;
    const freq = isRunning ? 0.35 : 0.15;
    const amp = isRunning ? 12 : 5;
    const y = midY + Math.sin(i * freq) * amp + (isRunning ? (Math.random() - 0.5) * 4 : 0);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-8 opacity-80"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1={midY}
          x2={width}
          y2={midY}
          stroke="#ffb000"
          strokeOpacity="0.25"
          strokeDasharray="2 4"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#ffb000"
          strokeWidth="1.5"
          className={isRunning ? "animate-pulse" : ""}
        />
      </svg>
    </div>
  );
}

/** Pipeline Detailed Stage Item */
function PipelineStageItem({
  index,
  stage
}: Readonly<{
  index: number;
  stage: PipelineStage;
}>): React.ReactElement {
  return (
    <li className="grid gap-2 border-2 border-[var(--border-strong)] bg-[var(--surface-raised)] p-3 sm:grid-cols-[40px_1fr_auto] sm:items-center mono shadow-[2px_2px_0_#000]">
      <div className="flex h-8 w-8 items-center justify-center border border-[var(--border-strong)] bg-[var(--surface-deep)] text-xs font-bold text-[var(--accent)]">
        0{index + 1}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`h-2.5 w-2.5 ${getStageDotClass(stage.status)}`}
            aria-hidden="true"
          />
          <h3 className="font-bold text-sm uppercase text-[var(--text-primary)]">{stage.label}</h3>
          <span className="text-xs text-[var(--text-muted)]">({stage.durationMs}ms)</span>
        </div>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{stage.summary}</p>
      </div>
      <StageBadge status={stage.status} />
    </li>
  );
}

/** Streaming Event Feed */
function EventFeed({
  events
}: Readonly<{ events: readonly TimedPipelineEvent[] }>): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events.length]);

  return (
    <div
      ref={containerRef}
      className="mt-3 grid gap-2 max-h-72 overflow-y-auto"
      role="log"
      aria-live="polite"
      aria-label="Pipeline event log"
    >
      {events.length === 0 ? (
        <p className="border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface-raised)] p-3 text-xs mono uppercase text-[var(--text-muted)]">
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

/** Event Log Line formatted as ANSI Telemetry */
function PipelineEventLine({ event }: Readonly<{ event: PipelineEvent }>): React.ReactElement {
  const presentation = formatPipelineEvent(event);
  const toneClass = {
    info: "text-[#ffb000]",
    success: "text-[#ffc24a]",
    warning: "text-[var(--accent-secondary)]",
    danger: "text-[var(--danger-text)]"
  }[presentation.tone];

  return (
    <div className="mono border border-[var(--border)] bg-[var(--surface-deep)] p-2.5 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[var(--accent)] select-none mr-1.5" aria-hidden="true">&gt;</span>
          <span className={`font-bold ${toneClass}`}>{presentation.text}</span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)] select-none">[0x{Math.floor(Math.random() * 256).toString(16).toUpperCase()}]</span>
      </div>
      {presentation.detail ? (
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{presentation.detail}</p>
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

  return (
    <Badge
      tone={tone[status]}
      className="mono text-xs uppercase font-bold tracking-wider px-2 py-0.5"
    >
      {status}
    </Badge>
  );
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
    pending: "bg-[var(--surface-raised)] border border-[var(--border-strong)]",
    running: "bg-[#ffb000] animate-pulse shadow-[0_0_6px_#ffb000]",
    passed: "bg-[#ffc24a] shadow-[0_0_4px_#ffc24a]",
    failed: "bg-[var(--danger-strong)]",
    skipped: "bg-[var(--text-subtle)]",
    blocked: "bg-[var(--danger-strong)]"
  };

  return classMap[status];
}

function getStageEventTone(status: "passed" | "failed" | "blocked"): "success" | "danger" {
  return status === "passed" ? "success" : "danger";
}

function formatStageId(stageId: string): string {
  return stageId.replaceAll("-", " ").toUpperCase();
}

function getStageAbbreviation(id: string): string {
  const map: Record<string, string> = {
    commit: "CMT",
    build: "BLD",
    unit: "UNT",
    integration: "INT",
    automation: "E2E",
    performance: "PRF",
    quality: "GAT",
    deploy: "DPL"
  };
  return map[id] ?? id.slice(0, 3).toUpperCase();
}

function makeAsciiBar(curr: number, total: number, len = 8): string {
  const filled = Math.round((curr / Math.max(1, total)) * len);
  return "█".repeat(filled) + "░".repeat(Math.max(0, len - filled));
}

function formatElapsedDisplay(ms: number, isRunning: boolean): string {
  if (ms <= 0 && !isRunning) return "02m 45s";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}
