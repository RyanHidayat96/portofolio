import {
  AutomationSimulationEngine,
  defaultAutomationScenario
} from "@/features/automation-lab/domain/simulation-engine";
import { failureStrategies } from "@/features/automation-lab/domain/failure-strategies";
import type { FailureType } from "@/features/automation-lab/domain/types";
import {
  createPendingPipelineSnapshot,
  createPipelineSnapshot,
  PipelineSimulator,
  pipelineStageDefinitions,
  type TimedPipelineEvent
} from "@/features/pipeline/domain/pipeline";
import {
  createDefaultPerformanceConfig,
  evaluateThresholds,
  normalizePerformanceConfig,
  performanceScenarios,
  simulatePerformanceRun,
  type PerformanceMetrics
} from "@/features/performance-lab/domain/performance";
import { describe, expect, it } from "vitest";

function eventTypes(events: readonly { readonly event: { readonly type: string } }[]): string[] {
  return events.map((item) => item.event.type);
}

describe("automation simulation engine", () => {
  it("passes healthy run through every step without failure telemetry", async () => {
    const engine = new AutomationSimulationEngine();
    const result = await engine.execute(defaultAutomationScenario);

    expect(result.status).toBe("passed");
    expect(result.events.filter((item) => item.event.type === "step.passed")).toHaveLength(
      defaultAutomationScenario.steps.length
    );
    expect(eventTypes(result.events)).not.toContain("failure.detected");
    expect(eventTypes(result.events)).not.toContain("healing.completed");
  });

  it("recovers from locator failure with healing event", async () => {
    const engine = new AutomationSimulationEngine();
    const result = await engine.execute({ ...defaultAutomationScenario, failureType: "locator" });

    expect(result.status).toBe("passed");
    expect(result.events.some((item) => item.event.type === "healing.candidate")).toBe(true);
    expect(result.events.some((item) => item.event.type === "healing.completed")).toBe(true);
  });

  it("fails unrecoverable API failure", async () => {
    const engine = new AutomationSimulationEngine();
    const result = await engine.execute({ ...defaultAutomationScenario, failureType: "api" });

    expect(result.status).toBe("failed");
    expect(
      result.events.some(
        (item) => item.event.type === "gate.impact" && item.event.impact === "blocked"
      )
    ).toBe(true);
    expect(result.events.some((item) => item.event.type === "failure.classified")).toBe(true);
    expect(result.events.some((item) => item.event.type === "healing.completed")).toBe(false);
  });

  it("keeps network timeout failed after controlled retry", async () => {
    const engine = new AutomationSimulationEngine();
    const result = await engine.execute({ ...defaultAutomationScenario, failureType: "timeout" });

    expect(result.status).toBe("failed");
    expect(result.events.some((item) => item.event.type === "retry.completed")).toBe(true);
    expect(result.events.some((item) => item.event.type === "performance.warning")).toBe(true);
    expect(result.events.some((item) => item.event.type === "healing.completed")).toBe(false);
  });

  it("passes slow response with quality warning and no healing", async () => {
    const engine = new AutomationSimulationEngine();
    const result = await engine.execute({
      ...defaultAutomationScenario,
      failureType: "slow-response"
    });

    expect(result.status).toBe("passed");
    expect(
      result.events.some(
        (item) => item.event.type === "gate.impact" && item.event.impact === "warning"
      )
    ).toBe(true);
    expect(result.events.some((item) => item.event.type === "healing.completed")).toBe(false);
  });

  it("blocks invalid authentication without self-healing", async () => {
    const engine = new AutomationSimulationEngine();
    const result = await engine.execute({ ...defaultAutomationScenario, failureType: "auth" });

    expect(result.status).toBe("failed");
    expect(result.events.some((item) => item.event.type === "healing.unavailable")).toBe(true);
    expect(result.events.some((item) => item.event.type === "healing.completed")).toBe(false);
  });

  it("recovers missing element through semantic refetch", async () => {
    const engine = new AutomationSimulationEngine();
    const result = await engine.execute({
      ...defaultAutomationScenario,
      failureType: "missing-element"
    });

    expect(result.status).toBe("passed");
    expect(
      result.events.some(
        (item) => item.event.type === "healing.completed" && item.event.confidence === 93
      )
    ).toBe(true);
    expect(
      result.events.some(
        (item) => item.event.type === "gate.impact" && item.event.impact === "none"
      )
    ).toBe(true);
  });

  it("keeps each failure strategy aligned with final execution status", async () => {
    const engine = new AutomationSimulationEngine();

    for (const strategy of failureStrategies) {
      const result = await engine.execute(strategy.inject(defaultAutomationScenario));
      expect(result.status).toBe(strategy.expectedStatus);
    }
  });

  it("uses deterministic monotonic timing for replayable runs", async () => {
    const engine = new AutomationSimulationEngine();
    const scenario = { ...defaultAutomationScenario, failureType: "locator" as FailureType };
    const firstRun = await engine.execute(scenario);
    const replay = await engine.execute(scenario);

    expect(replay).toEqual(firstRun);
    expect(firstRun.events.map((item) => item.atMs)).toEqual(
      [...firstRun.events].map((item) => item.atMs).sort((a, b) => a - b)
    );
    expect(firstRun.durationMs).toBe(firstRun.events.at(-1)?.atMs);
  });
});

describe("pipeline simulator", () => {
  it("starts with pending snapshot before any run", () => {
    const snapshot = createPendingPipelineSnapshot();

    expect(snapshot.qualityGate).toBe("pending");
    expect(snapshot.summary).toBe("Pipeline idle.");
    expect(snapshot.stages).toHaveLength(pipelineStageDefinitions.length);
    expect(snapshot.stages.every((stage) => stage.status === "pending")).toBe(true);
  });

  it("passes all stages for successful pipeline", () => {
    const result = new PipelineSimulator().run({ scenarioId: "success" });

    expect(result.qualityGate).toBe("passed");
    expect(result.stages.every((stage) => stage.status === "passed")).toBe(true);
    expect(result.events.some((item) => item.event.type === "stage.started")).toBe(true);
  });

  it("blocks deployment when regression fails", () => {
    const result = new PipelineSimulator().run({ scenarioId: "regression-failure" });

    expect(result.qualityGate).toBe("blocked");
    expect(result.stages.find((stage) => stage.id === "automation")?.status).toBe("failed");
    expect(result.stages.find((stage) => stage.id === "performance")?.status).toBe("skipped");
    expect(result.stages.find((stage) => stage.id === "quality")?.status).toBe("blocked");
    expect(result.stages.find((stage) => stage.id === "deploy")?.status).toBe("skipped");
  });

  it("blocks deployment when performance gate fails", () => {
    const result = new PipelineSimulator().run({ scenarioId: "performance-gate-failure" });

    expect(result.qualityGate).toBe("blocked");
    expect(result.stages.find((stage) => stage.id === "automation")?.status).toBe("passed");
    expect(result.stages.find((stage) => stage.id === "performance")?.status).toBe("failed");
    expect(result.stages.find((stage) => stage.id === "deploy")?.status).toBe("skipped");
  });

  it("creates valid snapshots from partial and blocked event streams", () => {
    const events: readonly TimedPipelineEvent[] = [
      {
        atMs: 0,
        event: {
          type: "pipeline.started",
          scenarioId: "regression-failure",
          label: "Regression Failure"
        }
      },
      {
        atMs: 120,
        event: {
          type: "stage.started",
          stageId: "automation",
          label: "Automation Test"
        }
      },
      {
        atMs: 240,
        event: {
          type: "stage.completed",
          stageId: "automation",
          status: "failed",
          summary: "Regression suite failed."
        }
      },
      {
        atMs: 320,
        event: {
          type: "stage.skipped",
          stageId: "performance",
          reason: "Skipped because Automation Test already failed."
        }
      },
      {
        atMs: 420,
        event: {
          type: "quality-gate.evaluated",
          status: "blocked",
          message: "Quality gate blocked deployment because regression test failed."
        }
      }
    ];

    const snapshot = createPipelineSnapshot(events);

    expect(snapshot.qualityGate).toBe("blocked");
    expect(snapshot.summary).toBe(
      "Quality gate blocked deployment because regression test failed."
    );
    expect(snapshot.stages.find((stage) => stage.id === "automation")?.status).toBe("failed");
    expect(snapshot.stages.find((stage) => stage.id === "performance")?.status).toBe("skipped");
  });

  it("keeps stage event times deterministic and non-decreasing", () => {
    const firstRun = new PipelineSimulator().run({ scenarioId: "performance-gate-failure" });
    const replay = new PipelineSimulator().run({ scenarioId: "performance-gate-failure" });

    expect(replay).toEqual(firstRun);
    expect(firstRun.events.map((item) => item.atMs)).toEqual(
      [...firstRun.events].map((item) => item.atMs).sort((a, b) => a - b)
    );
    expect(firstRun.events.at(-1)?.event).toMatchObject({
      type: "pipeline.completed",
      status: "blocked"
    });
  });
});

describe("performance thresholds", () => {
  const boundaryMetrics: PerformanceMetrics = {
    virtualUsers: 10,
    durationSeconds: 30,
    requests: 100,
    iterations: 25,
    throughput: 3,
    errorRate: 1,
    checkRate: 95,
    p50: 400,
    p95: 2000,
    p99: 3000
  };

  it("passes normal load thresholds", () => {
    const result = simulatePerformanceRun({
      scenarioId: "normal",
      virtualUsers: 25,
      durationSeconds: 30
    });

    expect(result.qualityGate).toBe("passed");
    expect(result.metrics.checkRate).toBeGreaterThan(95);
  });

  it("passes peak load thresholds at default load", () => {
    const result = simulatePerformanceRun(createDefaultPerformanceConfig("peak"));

    expect(result.scenario.label).toBe("Peak Load");
    expect(result.qualityGate).toBe("passed");
    expect(result.thresholds.every((threshold) => threshold.status === "passed")).toBe(true);
  });

  it("fails stress test thresholds", () => {
    const result = simulatePerformanceRun({
      scenarioId: "stress",
      virtualUsers: 100,
      durationSeconds: 30
    });

    expect(result.qualityGate).toBe("failed");
    expect(result.thresholds.some((threshold) => threshold.status === "failed")).toBe(true);
  });

  it("fails exact threshold boundaries", () => {
    const results = evaluateThresholds(boundaryMetrics);

    expect(results.every((result) => result.status === "failed")).toBe(true);
  });

  it("passes values just inside threshold boundaries", () => {
    const results = evaluateThresholds({
      ...boundaryMetrics,
      errorRate: 0.9,
      checkRate: 95.1,
      p95: 1999,
      p99: 2999
    });

    expect(results.every((result) => result.status === "passed")).toBe(true);
  });

  it("normalizes performance controls to scenario ranges", () => {
    const result = simulatePerformanceRun({
      scenarioId: "normal",
      virtualUsers: 999,
      durationSeconds: 1
    });

    expect(result.config.virtualUsers).toBe(80);
    expect(result.config.durationSeconds).toBe(15);
  });

  it("defines defaults and control ranges for every performance scenario", () => {
    expect(performanceScenarios.map((scenario) => scenario.id)).toEqual([
      "normal",
      "peak",
      "stress"
    ]);

    for (const scenario of performanceScenarios) {
      const config = createDefaultPerformanceConfig(scenario.id);
      expect(config.virtualUsers).toBeGreaterThanOrEqual(scenario.virtualUserRange.min);
      expect(config.virtualUsers).toBeLessThanOrEqual(scenario.virtualUserRange.max);
      expect(config.durationSeconds).toBeGreaterThanOrEqual(scenario.durationRange.min);
      expect(config.durationSeconds).toBeLessThanOrEqual(scenario.durationRange.max);
    }
  });

  it("rounds range input to nearest valid step", () => {
    expect(
      normalizePerformanceConfig({
        scenarioId: "normal",
        virtualUsers: 13,
        durationSeconds: 37
      })
    ).toEqual({
      scenarioId: "normal",
      virtualUsers: 15,
      durationSeconds: 30
    });
  });
});
