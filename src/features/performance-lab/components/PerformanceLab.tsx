"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import {
  createDefaultPerformanceConfig,
  findPerformanceScenario,
  performanceScenarios,
  simulatePerformanceRun,
  type PerformanceRunConfig,
  type PerformanceScenario,
  type PerformanceScenarioId
} from "@/features/performance-lab/domain/performance";
import { Gauge, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

const initialConfig = createDefaultPerformanceConfig("normal");

export function PerformanceLab(): React.ReactElement {
  const [config, setConfig] = useState<PerformanceRunConfig>(initialConfig);
  const scenario = findPerformanceScenario(config.scenarioId);
  const result = useMemo(() => simulatePerformanceRun(config), [config]);
  const failedThresholds = result.thresholds.filter((threshold) => threshold.status === "failed");

  const updateScenario = (scenarioId: PerformanceScenarioId): void => {
    setConfig(createDefaultPerformanceConfig(scenarioId));
  };

  const updateVirtualUsers = (virtualUsers: number): void => {
    setConfig((currentConfig) => ({
      ...currentConfig,
      virtualUsers
    }));
  };

  const updateDuration = (durationSeconds: number): void => {
    setConfig((currentConfig) => ({
      ...currentConfig,
      durationSeconds
    }));
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Panel className="p-5">
        <p className="mono text-sm text-[#55d7ff]">k6.workflow.demo</p>
        <h1 className="mt-3 text-2xl font-semibold">Performance Lab</h1>
        <p className="mt-3 text-sm leading-6 text-[#8a96a8]">
          K6-inspired deterministic simulation. No live load is generated from this portfolio.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <SlidersHorizontal aria-hidden="true" className="text-[#55d7ff]" size={18} />
          <h2 className="font-semibold text-[#eef5ff]">Load Controls</h2>
        </div>

        <label
          className="mt-5 block text-sm font-semibold text-[#c8d4e6]"
          htmlFor="performance-scenario"
        >
          Scenario
        </label>
        <select
          id="performance-scenario"
          className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[#111722] px-3 text-sm text-[#eef5ff]"
          value={config.scenarioId}
          onChange={(event) => updateScenario(event.target.value as PerformanceScenarioId)}
        >
          {performanceScenarios.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>

        <PerformanceControl
          id="virtual-users"
          label="Virtual Users"
          value={config.virtualUsers}
          range={scenario.virtualUserRange}
          onChange={updateVirtualUsers}
        />

        <PerformanceControl
          id="duration-seconds"
          label="Duration"
          value={config.durationSeconds}
          suffix="s"
          range={scenario.durationRange}
          onChange={updateDuration}
        />

        <Button
          className="mt-5 w-full"
          icon={<RotateCcw aria-hidden="true" size={17} />}
          onClick={() => setConfig(createDefaultPerformanceConfig(config.scenarioId))}
        >
          Reset Scenario
        </Button>

        <div className="mt-5 border border-[var(--border)] bg-[#0b0f16] p-4">
          <p className="text-sm font-semibold text-[#eef5ff]">{scenario.label}</p>
          <p className="mt-2 text-sm leading-6 text-[#8a96a8]">{scenario.description}</p>
        </div>
      </Panel>

      <div className="grid gap-5">
        <Panel className="p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mono text-sm text-[#55d7ff]">
                VU: {result.metrics.virtualUsers} | Duration: {result.metrics.durationSeconds}s
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{result.scenario.label}</h2>
              <p className="mt-2 text-sm text-[#8a96a8]">
                Requests, latency, errors, checks, and threshold outcome are computed
                deterministically.
              </p>
            </div>
            <Badge tone={result.qualityGate === "passed" ? "success" : "danger"}>
              thresholds {result.qualityGate}
            </Badge>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Requests" value={result.metrics.requests.toLocaleString()} />
            <Metric label="Iterations" value={result.metrics.iterations.toLocaleString()} />
            <Metric label="Throughput" value={`${result.metrics.throughput}/s`} />
            <Metric label="Error Rate" value={`${result.metrics.errorRate.toFixed(1)}%`} />
            <Metric label="Check Rate" value={`${result.metrics.checkRate.toFixed(1)}%`} />
            <Metric label="P50" value={`${result.metrics.p50} ms`} />
            <Metric label="P95" value={`${result.metrics.p95} ms`} />
            <Metric label="P99" value={`${result.metrics.p99} ms`} />
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <Panel className="p-5">
            <div className="flex items-center gap-3">
              <Gauge aria-hidden="true" className="text-[#55d7ff]" size={18} />
              <div>
                <p className="mono text-sm text-[#55d7ff]">LIGHTWEIGHT CHARTS</p>
                <h2 className="mt-1 text-xl font-semibold">Latency & Reliability</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-6">
              <section>
                <h3 className="font-semibold">Latency Distribution</h3>
                <div className="mt-4 space-y-4">
                  <LatencyBar label="P50" value={result.metrics.p50} max={4500} />
                  <LatencyBar label="P95" value={result.metrics.p95} max={4500} dangerAt={2000} />
                  <LatencyBar label="P99" value={result.metrics.p99} max={4500} dangerAt={3000} />
                </div>
              </section>

              <section>
                <h3 className="font-semibold">Reliability Signals</h3>
                <div className="mt-4 space-y-4">
                  <PercentBar label="Error Rate" value={result.metrics.errorRate} max={4} invert />
                  <PercentBar label="Check Rate" value={result.metrics.checkRate} max={100} />
                </div>
              </section>
            </div>
          </Panel>

          <Panel className="p-5">
            <p className="mono text-sm text-[#55d7ff]">THRESHOLD ENGINE</p>
            <h2 className="mt-2 text-xl font-semibold">
              {failedThresholds.length === 0
                ? "Release Thresholds Passed"
                : `${failedThresholds.length} Threshold Failure${failedThresholds.length > 1 ? "s" : ""}`}
            </h2>
            <div className="mt-5 space-y-3">
              {result.thresholds.map((threshold) => (
                <div
                  key={threshold.id}
                  className="flex items-center justify-between gap-4 border border-[var(--border)] bg-[#0b0f16] p-3"
                >
                  <div>
                    <p className="font-medium">{threshold.label}</p>
                    <p className="mt-1 text-xs text-[#8a96a8]">
                      {threshold.observed} / {threshold.target}
                    </p>
                  </div>
                  <Badge tone={threshold.status === "passed" ? "success" : "danger"}>
                    {threshold.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function PerformanceControl({
  id,
  label,
  value,
  suffix = "",
  range,
  onChange
}: Readonly<{
  id: string;
  label: string;
  value: number;
  suffix?: string;
  range: PerformanceScenario["virtualUserRange"];
  onChange: (value: number) => void;
}>): React.ReactElement {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-[#c8d4e6]" htmlFor={id}>
          {label}
        </label>
        <input
          aria-label={`${label} value`}
          className="mono w-24 border border-[var(--border)] bg-[#111722] px-2 py-1 text-right text-sm text-[#eef5ff]"
          type="number"
          min={range.min}
          max={range.max}
          step={range.step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
      <input
        id={id}
        className="mt-3 w-full accent-[#55d7ff]"
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="mt-2 flex justify-between text-xs text-[#8a96a8]">
        <span>
          {range.min}
          {suffix}
        </span>
        <span className="mono text-[#c8d4e6]">
          {value}
          {suffix}
        </span>
        <span>
          {range.max}
          {suffix}
        </span>
      </div>
    </div>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: string }>): React.ReactElement {
  return (
    <section className="border border-[var(--border)] bg-[#10141d] p-4">
      <p className="text-sm text-[#8a96a8]">{label}</p>
      <p className="mono mt-2 text-2xl font-semibold text-[#eef5ff]">{value}</p>
    </section>
  );
}

function LatencyBar({
  label,
  value,
  max,
  dangerAt
}: Readonly<{
  label: string;
  value: number;
  max: number;
  dangerAt?: number;
}>): React.ReactElement {
  const width = `${Math.min(100, Math.round((value / max) * 100))}%`;
  const toneClass = dangerAt && value >= dangerAt ? "bg-[#ff6f7d]" : "bg-[#55d7ff]";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="mono text-[#8a96a8]">{value} ms</span>
      </div>
      <div className="h-3 border border-[var(--border)] bg-[#0b0f16]">
        <div className={`h-full ${toneClass}`} style={{ width }} />
      </div>
    </div>
  );
}

function PercentBar({
  label,
  value,
  max,
  invert = false
}: Readonly<{
  label: string;
  value: number;
  max: number;
  invert?: boolean;
}>): React.ReactElement {
  const width = `${Math.min(100, Math.round((value / max) * 100))}%`;
  const isRisky = invert ? value >= 1 : value <= 95;
  const toneClass = isRisky ? "bg-[#ff6f7d]" : "bg-[#6ee7a8]";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="mono text-[#8a96a8]">{value.toFixed(1)}%</span>
      </div>
      <div className="h-3 border border-[var(--border)] bg-[#0b0f16]">
        <div className={`h-full ${toneClass}`} style={{ width }} />
      </div>
    </div>
  );
}
