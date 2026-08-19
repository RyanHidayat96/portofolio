export type FailureType =
  "none" | "locator" | "api" | "timeout" | "missing-element" | "slow-response" | "auth";

export type TestStatus = "idle" | "running" | "passed" | "failed" | "healing";
export type RecoveryMode = "none" | "self-healing" | "controlled-retry" | "not-recoverable";
export type QualityGateImpact = "none" | "warning" | "blocked";

export interface TestStep {
  readonly id: string;
  readonly label: string;
  readonly expectedMs: number;
}

export interface AutomationScenario {
  readonly id: string;
  readonly environment: "UAT" | "Staging";
  readonly browser: "Chromium" | "Firefox" | "WebKit";
  readonly failureType: FailureType;
  readonly steps: readonly TestStep[];
}

export type SimulationEvent =
  | {
      readonly type: "test.started";
      readonly testId: string;
    }
  | {
      readonly type: "step.started";
      readonly stepId: string;
      readonly label: string;
    }
  | {
      readonly type: "step.passed";
      readonly stepId: string;
      readonly durationMs: number;
    }
  | {
      readonly type: "test.failed";
      readonly reason: string;
    }
  | {
      readonly type: "failure.detected";
      readonly failureType: FailureType;
      readonly reason: string;
      readonly stepId: string;
    }
  | {
      readonly type: "inspection.note";
      readonly title: string;
      readonly detail: string;
    }
  | {
      readonly type: "failure.classified";
      readonly classification: string;
      readonly detail: string;
    }
  | {
      readonly type: "retry.scheduled";
      readonly attempt: number;
      readonly policy: string;
    }
  | {
      readonly type: "retry.completed";
      readonly attempt: number;
      readonly outcome: string;
    }
  | {
      readonly type: "performance.warning";
      readonly metric: string;
      readonly detail: string;
    }
  | {
      readonly type: "gate.impact";
      readonly impact: QualityGateImpact;
      readonly message: string;
    }
  | {
      readonly type: "healing.started";
      readonly target: string;
    }
  | {
      readonly type: "healing.candidate";
      readonly selector: string;
      readonly score: number;
      readonly rationale: string;
    }
  | {
      readonly type: "healing.completed";
      readonly selector: string;
      readonly confidence: number;
    }
  | {
      readonly type: "healing.unavailable";
      readonly reason: string;
    }
  | {
      readonly type: "test.completed";
      readonly status: "passed" | "failed";
      readonly durationMs: number;
    };

export interface TimedSimulationEvent {
  readonly atMs: number;
  readonly event: SimulationEvent;
}

export interface AutomationExecutionResult {
  readonly status: "passed" | "failed";
  readonly durationMs: number;
  readonly events: readonly TimedSimulationEvent[];
}

export interface SimulationEngine<TScenario, TResult> {
  execute(scenario: TScenario): Promise<TResult>;
}

export interface FailureStrategy {
  readonly type: FailureType;
  readonly label: string;
  readonly failureReason: string;
  readonly triggerStepId?: string;
  readonly expectedStatus: "passed" | "failed";
  readonly recoveryMode: RecoveryMode;
  readonly qualityGateImpact: QualityGateImpact;
  readonly summary: string;
  readonly inspectorFocus: readonly string[];
  inject(scenario: AutomationScenario): AutomationScenario;
}
