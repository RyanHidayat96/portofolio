import { findFailureStrategy } from "./failure-strategies";
import type {
  AutomationExecutionResult,
  AutomationScenario,
  FailureStrategy,
  FailureType,
  SimulationEvent,
  SimulationEngine,
  TestStep,
  TimedSimulationEvent
} from "./types";

export const defaultAutomationScenario: AutomationScenario = {
  id: "approval-flow",
  environment: "UAT",
  browser: "Chromium",
  failureType: "none",
  steps: [
    { id: "auth", label: "Authenticate user", expectedMs: 420 },
    { id: "dashboard", label: "Navigate dashboard", expectedMs: 360 },
    { id: "inspection", label: "Create inspection", expectedMs: 520 },
    { id: "approval", label: "Submit approval", expectedMs: 610 },
    { id: "api", label: "Validate API response", expectedMs: 440 },
    { id: "result", label: "Verify result", expectedMs: 390 }
  ]
} as const;

type FailureHandlerResult = "recovered" | "failed";
type PushSimulationEvent = (deltaMs: number, event: SimulationEvent) => void;

interface FailureHandlerContext {
  readonly step: TestStep;
  readonly strategy: FailureStrategy;
  readonly push: PushSimulationEvent;
}

const slowResponseExtraMs = 1_250;

const failureHandlers: Partial<
  Record<FailureType, (context: FailureHandlerContext) => FailureHandlerResult>
> = {
  locator: ({ step, strategy, push }) => {
    push(80, {
      type: "failure.detected",
      failureType: strategy.type,
      reason: strategy.failureReason,
      stepId: step.id
    });
    push(110, {
      type: "inspection.note",
      title: "DOM analysis",
      detail: 'Original locator "#submit" no longer resolves in the current DOM.'
    });
    push(120, {
      type: "inspection.note",
      title: "Candidate generation",
      detail: "Generated role, data-testid, and accessible-name selector candidates."
    });
    push(90, { type: "healing.started", target: "Submit approval control" });
    push(95, {
      type: "healing.candidate",
      selector: 'button[data-testid="submit-approval"]',
      score: 97,
      rationale: "Stable test id plus matching button semantics."
    });
    push(80, {
      type: "healing.candidate",
      selector: 'role=button[name="Submit approval"]',
      score: 92,
      rationale: "Accessible role remains valid after locator drift."
    });
    push(100, {
      type: "healing.completed",
      selector: 'button[data-testid="submit-approval"]',
      confidence: 97
    });
    push(90, {
      type: "retry.scheduled",
      attempt: 1,
      policy: "Retry action with highest-scoring selector."
    });
    push(160, {
      type: "retry.completed",
      attempt: 1,
      outcome: "Submit action succeeded after selector repair."
    });
    push(0, {
      type: "gate.impact",
      impact: "none",
      message: "Quality gate remains passing after deterministic selector recovery."
    });

    return "recovered";
  },
  api: ({ step, strategy, push }) => {
    push(80, {
      type: "failure.detected",
      failureType: strategy.type,
      reason: strategy.failureReason,
      stepId: step.id
    });
    push(100, {
      type: "inspection.note",
      title: "Error validation",
      detail: "HTTP 500 confirmed while response contract and request payload are captured."
    });
    push(120, {
      type: "retry.scheduled",
      attempt: 1,
      policy: "Retry once for transient 5xx before quality gate decision."
    });
    push(320, {
      type: "retry.completed",
      attempt: 1,
      outcome: "HTTP 500 persisted on retry."
    });
    push(80, {
      type: "failure.classified",
      classification: "service-error",
      detail: "Server failure is outside UI self-healing scope."
    });
    push(0, {
      type: "healing.unavailable",
      reason: "Self-healing selectors cannot repair an API 500."
    });
    push(80, {
      type: "gate.impact",
      impact: "blocked",
      message: "Quality gate blocked deployment because API contract is unreliable."
    });

    return "failed";
  },
  timeout: ({ step, strategy, push }) => {
    push(80, {
      type: "failure.detected",
      failureType: strategy.type,
      reason: strategy.failureReason,
      stepId: step.id
    });
    push(120, {
      type: "inspection.note",
      title: "Timeout diagnosis",
      detail: "No HTTP response arrived before the configured network timeout budget."
    });
    push(120, {
      type: "retry.scheduled",
      attempt: 1,
      policy: "Controlled retry with the same timeout threshold."
    });
    push(480, {
      type: "retry.completed",
      attempt: 1,
      outcome: "Timeout reproduced after controlled retry."
    });
    push(90, {
      type: "performance.warning",
      metric: "network-timeout",
      detail: "Performance risk flagged; automatic healing is not applied."
    });
    push(0, {
      type: "healing.unavailable",
      reason: "Timeout requires service or network investigation, not selector repair."
    });
    push(80, {
      type: "gate.impact",
      impact: "blocked",
      message: "Quality gate blocked deployment because timeout persisted."
    });

    return "failed";
  },
  "missing-element": ({ step, strategy, push }) => {
    push(80, {
      type: "failure.detected",
      failureType: strategy.type,
      reason: strategy.failureReason,
      stepId: step.id
    });
    push(110, {
      type: "inspection.note",
      title: "Detached element",
      detail: "Control disappeared between locator resolution and click action."
    });
    push(90, { type: "healing.started", target: "Detached submit control" });
    push(95, {
      type: "healing.candidate",
      selector: 'role=button[name="Submit approval"]',
      score: 93,
      rationale: "Semantic role candidate survives DOM re-render."
    });
    push(100, {
      type: "healing.completed",
      selector: 'role=button[name="Submit approval"]',
      confidence: 93
    });
    push(90, {
      type: "retry.scheduled",
      attempt: 1,
      policy: "Refetch element after DOM settles, then retry click."
    });
    push(170, {
      type: "retry.completed",
      attempt: 1,
      outcome: "Submit control refetched and clicked."
    });
    push(0, {
      type: "gate.impact",
      impact: "none",
      message: "Quality gate remains passing after stable element refetch."
    });

    return "recovered";
  },
  auth: ({ step, strategy, push }) => {
    push(80, {
      type: "failure.detected",
      failureType: strategy.type,
      reason: strategy.failureReason,
      stepId: step.id
    });
    push(100, {
      type: "inspection.note",
      title: "Auth validation",
      detail: "Protected request rejected by the session layer before workflow execution."
    });
    push(80, {
      type: "failure.classified",
      classification: "invalid-authentication",
      detail: "Credential or token state must be fixed outside the UI test."
    });
    push(0, {
      type: "healing.unavailable",
      reason: "No self-healing path for invalid credentials."
    });
    push(80, {
      type: "gate.impact",
      impact: "blocked",
      message: "Quality gate blocked deployment because authentication failed."
    });

    return "failed";
  }
};

export class AutomationSimulationEngine implements SimulationEngine<
  AutomationScenario,
  AutomationExecutionResult
> {
  async execute(scenario: AutomationScenario): Promise<AutomationExecutionResult> {
    const events: TimedSimulationEvent[] = [
      { atMs: 0, event: { type: "test.started", testId: scenario.id } }
    ];
    const failureStrategy = findFailureStrategy(scenario.failureType);
    let elapsedMs = 120;
    let hasFailed = false;
    const push: PushSimulationEvent = (deltaMs, event) => {
      elapsedMs += deltaMs;
      events.push({ atMs: elapsedMs, event });
    };

    for (const step of scenario.steps) {
      events.push({
        atMs: elapsedMs,
        event: { type: "step.started", stepId: step.id, label: step.label }
      });

      const shouldInjectFailure =
        scenario.failureType !== "none" && failureStrategy.triggerStepId === step.id;

      if (scenario.failureType === "slow-response" && shouldInjectFailure) {
        elapsedMs += step.expectedMs + slowResponseExtraMs;
        events.push({
          atMs: elapsedMs,
          event: {
            type: "performance.warning",
            metric: "api-latency",
            detail: "Functional assertion passed, but response time exceeded the warning budget."
          }
        });
        push(90, {
          type: "inspection.note",
          title: "Latency budget",
          detail: "Slow response is flagged for investigation, not treated as self-healed."
        });
        push(80, {
          type: "gate.impact",
          impact: "warning",
          message: "Quality gate allowed pass with performance warning."
        });
        events.push({
          atMs: elapsedMs,
          event: {
            type: "step.passed",
            stepId: step.id,
            durationMs: step.expectedMs + slowResponseExtraMs
          }
        });
        continue;
      }

      elapsedMs += step.expectedMs;

      if (shouldInjectFailure) {
        events.push({
          atMs: elapsedMs,
          event: { type: "test.failed", reason: failureStrategy.failureReason }
        });
        hasFailed = true;

        const handler = failureHandlers[scenario.failureType];
        const failureResult = handler?.({ step, strategy: failureStrategy, push }) ?? "failed";

        if (failureResult === "recovered") {
          events.push({
            atMs: elapsedMs,
            event: { type: "step.passed", stepId: step.id, durationMs: step.expectedMs }
          });
          hasFailed = false;
          continue;
        }

        break;
      }

      events.push({
        atMs: elapsedMs,
        event: { type: "step.passed", stepId: step.id, durationMs: step.expectedMs }
      });
    }

    const status = hasFailed ? "failed" : "passed";
    elapsedMs += 160;
    events.push({
      atMs: elapsedMs,
      event: { type: "test.completed", status, durationMs: elapsedMs }
    });

    return {
      status,
      durationMs: elapsedMs,
      events
    };
  }
}
