export type PipelineStageStatus =
  "pending" | "running" | "passed" | "failed" | "skipped" | "blocked";

export type PipelineStageId =
  "commit" | "build" | "unit" | "automation" | "performance" | "quality" | "deploy";

export type PipelineScenarioId = "success" | "regression-failure" | "performance-gate-failure";
export type PipelineQualityGateStatus = "pending" | "passed" | "blocked";

export interface PipelineStageDefinition {
  readonly id: PipelineStageId;
  readonly label: string;
  readonly durationMs: number;
  readonly successSummary: string;
}

export interface PipelineStage {
  readonly id: PipelineStageId;
  readonly label: string;
  readonly status: PipelineStageStatus;
  readonly durationMs: number;
  readonly summary: string;
}

export interface PipelineScenario {
  readonly id: PipelineScenarioId;
  readonly label: string;
  readonly summary: string;
  readonly failureStageId?: PipelineStageId;
  readonly failureSummary?: string;
  readonly gateSummary: string;
}

export interface PipelineRunOptions {
  readonly scenarioId: PipelineScenarioId;
}

export type PipelineEvent =
  | {
      readonly type: "pipeline.started";
      readonly scenarioId: PipelineScenarioId;
      readonly label: string;
    }
  | {
      readonly type: "stage.started";
      readonly stageId: PipelineStageId;
      readonly label: string;
    }
  | {
      readonly type: "stage.completed";
      readonly stageId: PipelineStageId;
      readonly status: "passed" | "failed" | "blocked";
      readonly summary: string;
    }
  | {
      readonly type: "stage.skipped";
      readonly stageId: PipelineStageId;
      readonly reason: string;
    }
  | {
      readonly type: "quality-gate.evaluated";
      readonly status: PipelineQualityGateStatus;
      readonly message: string;
    }
  | {
      readonly type: "pipeline.completed";
      readonly status: "passed" | "blocked";
      readonly durationMs: number;
      readonly summary: string;
    };

export interface TimedPipelineEvent {
  readonly atMs: number;
  readonly event: PipelineEvent;
}

export interface PipelineRunResult {
  readonly scenario: PipelineScenario;
  readonly stages: readonly PipelineStage[];
  readonly qualityGate: Exclude<PipelineQualityGateStatus, "pending">;
  readonly durationMs: number;
  readonly summary: string;
  readonly events: readonly TimedPipelineEvent[];
}

export interface PipelineSnapshot {
  readonly stages: readonly PipelineStage[];
  readonly qualityGate: PipelineQualityGateStatus;
  readonly summary: string;
}

export const pipelineStageDefinitions: readonly PipelineStageDefinition[] = [
  {
    id: "commit",
    label: "Commit",
    durationMs: 220,
    successSummary: "Source change received by pipeline trigger."
  },
  {
    id: "build",
    label: "Build",
    durationMs: 540,
    successSummary: "Application package and automation image prepared."
  },
  {
    id: "unit",
    label: "Unit Test",
    durationMs: 680,
    successSummary: "Fast TypeScript and domain checks passed."
  },
  {
    id: "automation",
    label: "Automation Test",
    durationMs: 920,
    successSummary: "Web and mobile regression signal passed."
  },
  {
    id: "performance",
    label: "Performance Check",
    durationMs: 760,
    successSummary: "K6-style latency and error thresholds passed."
  },
  {
    id: "quality",
    label: "Quality Gate",
    durationMs: 280,
    successSummary: "Release policy allowed deployment."
  },
  {
    id: "deploy",
    label: "Deploy",
    durationMs: 420,
    successSummary: "Deployment stage allowed after gate pass."
  }
] as const;

export const pipelineScenarios: readonly PipelineScenario[] = [
  {
    id: "success",
    label: "Successful Pipeline",
    summary: "All checks pass; quality gate allows deployment.",
    gateSummary: "Quality gate passed. Deployment can continue."
  },
  {
    id: "regression-failure",
    label: "Regression Failure",
    summary: "Automation test fails; quality gate blocks deployment.",
    failureStageId: "automation",
    failureSummary: "Regression suite failed. Release requires investigation before promotion.",
    gateSummary: "Quality gate blocked deployment because regression test failed."
  },
  {
    id: "performance-gate-failure",
    label: "Performance Gate Failure",
    summary: "Functional checks pass, but performance threshold blocks deployment.",
    failureStageId: "performance",
    failureSummary: "Performance threshold failed. P95 latency exceeded release budget.",
    gateSummary: "Quality gate blocked deployment because performance threshold failed."
  }
] as const;

const firstScenario = pipelineScenarios[0];

export function findPipelineScenario(id: PipelineScenarioId): PipelineScenario {
  return pipelineScenarios.find((scenario) => scenario.id === id) ?? firstScenario;
}

export function createPendingPipelineSnapshot(): PipelineSnapshot {
  return {
    stages: pipelineStageDefinitions.map((definition) => ({
      id: definition.id,
      label: definition.label,
      status: "pending",
      durationMs: definition.durationMs,
      summary: "Waiting for pipeline run."
    })),
    qualityGate: "pending",
    summary: "Pipeline idle."
  };
}

export function createPipelineSnapshot(events: readonly TimedPipelineEvent[]): PipelineSnapshot {
  const snapshot = createPendingPipelineSnapshot();
  const stages = snapshot.stages.map((stage) => ({ ...stage }));
  let qualityGate: PipelineQualityGateStatus = "pending";
  let summary = snapshot.summary;

  for (const item of events) {
    const event = item.event;

    if (event.type === "pipeline.started") {
      summary = `${event.label} running.`;
      continue;
    }

    if (event.type === "stage.started") {
      updateStage(stages, event.stageId, {
        status: "running",
        summary: "Running..."
      });
      continue;
    }

    if (event.type === "stage.completed") {
      updateStage(stages, event.stageId, {
        status: event.status,
        summary: event.summary
      });
      continue;
    }

    if (event.type === "stage.skipped") {
      updateStage(stages, event.stageId, {
        status: "skipped",
        summary: event.reason
      });
      continue;
    }

    if (event.type === "quality-gate.evaluated") {
      qualityGate = event.status;
      summary = event.message;
      continue;
    }

    if (event.type === "pipeline.completed") {
      summary = event.summary;
    }
  }

  return {
    stages,
    qualityGate,
    summary
  };
}

export class PipelineSimulator {
  run(options: PipelineRunOptions = { scenarioId: "success" }): PipelineRunResult {
    const scenario = findPipelineScenario(options.scenarioId);
    const events: TimedPipelineEvent[] = [
      {
        atMs: 0,
        event: {
          type: "pipeline.started",
          scenarioId: scenario.id,
          label: scenario.label
        }
      }
    ];
    let elapsedMs = 120;
    let failedStageId: PipelineStageId | undefined;
    let qualityGate: Exclude<PipelineQualityGateStatus, "pending"> = "passed";

    for (const definition of pipelineStageDefinitions) {
      if (definition.id === "deploy" && qualityGate === "blocked") {
        pushEvent(events, elapsedMs, {
          type: "stage.skipped",
          stageId: definition.id,
          reason: "Skipped because quality gate blocked deployment."
        });
        elapsedMs += 80;
        continue;
      }

      if (definition.id !== "quality" && failedStageId && definition.id !== "deploy") {
        pushEvent(events, elapsedMs, {
          type: "stage.skipped",
          stageId: definition.id,
          reason: `Skipped because ${formatStageLabel(failedStageId)} already failed.`
        });
        elapsedMs += 80;
        continue;
      }

      pushEvent(events, elapsedMs, {
        type: "stage.started",
        stageId: definition.id,
        label: definition.label
      });
      elapsedMs += definition.durationMs;

      if (definition.id === scenario.failureStageId) {
        failedStageId = definition.id;
        pushEvent(events, elapsedMs, {
          type: "stage.completed",
          stageId: definition.id,
          status: "failed",
          summary: scenario.failureSummary ?? "Stage failed."
        });
        elapsedMs += 120;
        continue;
      }

      if (definition.id === "quality") {
        qualityGate = failedStageId ? "blocked" : "passed";
        pushEvent(events, elapsedMs, {
          type: "stage.completed",
          stageId: definition.id,
          status: qualityGate === "passed" ? "passed" : "blocked",
          summary: scenario.gateSummary
        });
        pushEvent(events, elapsedMs + 80, {
          type: "quality-gate.evaluated",
          status: qualityGate,
          message: scenario.gateSummary
        });
        elapsedMs += 160;
        continue;
      }

      pushEvent(events, elapsedMs, {
        type: "stage.completed",
        stageId: definition.id,
        status: "passed",
        summary: definition.successSummary
      });
      elapsedMs += 120;
    }

    const summary =
      qualityGate === "passed"
        ? "Quality gate passed. Deployment can continue."
        : scenario.gateSummary;

    pushEvent(events, elapsedMs, {
      type: "pipeline.completed",
      status: qualityGate,
      durationMs: elapsedMs,
      summary
    });

    return {
      scenario,
      stages: createPipelineSnapshot(events).stages,
      qualityGate,
      durationMs: elapsedMs,
      summary,
      events
    };
  }
}

function updateStage(
  stages: PipelineStage[],
  stageId: PipelineStageId,
  update: Pick<PipelineStage, "status" | "summary">
): void {
  const stageIndex = stages.findIndex((stage) => stage.id === stageId);

  if (stageIndex === -1) {
    return;
  }

  stages[stageIndex] = {
    ...stages[stageIndex],
    ...update
  };
}

function pushEvent(events: TimedPipelineEvent[], atMs: number, event: PipelineEvent): void {
  events.push({ atMs, event });
}

function formatStageLabel(stageId: PipelineStageId): string {
  return pipelineStageDefinitions.find((definition) => definition.id === stageId)?.label ?? stageId;
}
