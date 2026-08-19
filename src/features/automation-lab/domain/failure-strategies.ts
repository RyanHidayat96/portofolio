import type {
  AutomationScenario,
  FailureStrategy,
  FailureType,
  QualityGateImpact,
  RecoveryMode
} from "./types";

abstract class BaseFailureStrategy implements FailureStrategy {
  readonly type: FailureType;
  readonly label: string;
  readonly failureReason: string;
  readonly triggerStepId?: string;
  readonly expectedStatus: "passed" | "failed";
  readonly recoveryMode: RecoveryMode;
  readonly qualityGateImpact: QualityGateImpact;
  readonly summary: string;
  readonly inspectorFocus: readonly string[];

  constructor(config: FailureStrategyConfig) {
    this.type = config.type;
    this.label = config.label;
    this.failureReason = config.failureReason;
    this.triggerStepId = config.triggerStepId;
    this.expectedStatus = config.expectedStatus;
    this.recoveryMode = config.recoveryMode;
    this.qualityGateImpact = config.qualityGateImpact;
    this.summary = config.summary;
    this.inspectorFocus = config.inspectorFocus;
  }

  inject(scenario: AutomationScenario): AutomationScenario {
    return {
      ...scenario,
      failureType: this.type
    };
  }
}

interface FailureStrategyConfig {
  readonly type: FailureType;
  readonly label: string;
  readonly failureReason: string;
  readonly triggerStepId?: string;
  readonly expectedStatus: "passed" | "failed";
  readonly recoveryMode: RecoveryMode;
  readonly qualityGateImpact: QualityGateImpact;
  readonly summary: string;
  readonly inspectorFocus: readonly string[];
}

export class NoFailureStrategy extends BaseFailureStrategy {
  constructor() {
    super({
      type: "none",
      label: "Healthy Run",
      failureReason: "",
      expectedStatus: "passed",
      recoveryMode: "none",
      qualityGateImpact: "none",
      summary: "Baseline regression path with no injected failure.",
      inspectorFocus: ["Runner telemetry", "Step duration budget", "Quality gate pass"]
    });
  }
}

export class LocatorFailureStrategy extends BaseFailureStrategy {
  constructor() {
    super({
      type: "locator",
      label: "Locator Change",
      failureReason: 'locator("#submit") failed: element not found.',
      triggerStepId: "approval",
      expectedStatus: "passed",
      recoveryMode: "self-healing",
      qualityGateImpact: "none",
      summary: "DOM drift breaks the original selector; candidate scoring repairs the action.",
      inspectorFocus: ["DOM analysis", "Candidate generation", "Selector scoring", "Retry pass"]
    });
  }
}

export class ApiFailureStrategy extends BaseFailureStrategy {
  constructor() {
    super({
      type: "api",
      label: "API 500",
      failureReason: "POST /approval returned 500.",
      triggerStepId: "api",
      expectedStatus: "failed",
      recoveryMode: "controlled-retry",
      qualityGateImpact: "blocked",
      summary: "Server error is validated, retried once, classified, then blocks promotion.",
      inspectorFocus: ["Error validation", "Retry policy", "Failure classification", "Gate impact"]
    });
  }
}

export class TimeoutFailureStrategy extends BaseFailureStrategy {
  constructor() {
    super({
      type: "timeout",
      label: "Network Timeout",
      failureReason: "Request exceeded timeout threshold.",
      triggerStepId: "api",
      expectedStatus: "failed",
      recoveryMode: "controlled-retry",
      qualityGateImpact: "blocked",
      summary: "Timeout is diagnosed, retried under control, then reported as performance risk.",
      inspectorFocus: [
        "Timeout diagnosis",
        "Controlled retry",
        "Performance warning",
        "Fail result"
      ]
    });
  }
}

export class MissingElementFailureStrategy extends BaseFailureStrategy {
  constructor() {
    super({
      type: "missing-element",
      label: "Element Disappears",
      failureReason: "Submit control detached before click.",
      triggerStepId: "approval",
      expectedStatus: "passed",
      recoveryMode: "self-healing",
      qualityGateImpact: "none",
      summary: "Detached UI control is refetched through a stable semantic candidate.",
      inspectorFocus: ["Detached element", "DOM refresh", "Stable role candidate", "Retry pass"]
    });
  }
}

export class SlowResponseFailureStrategy extends BaseFailureStrategy {
  constructor() {
    super({
      type: "slow-response",
      label: "Slow Response",
      failureReason: "API response exceeded performance budget.",
      triggerStepId: "api",
      expectedStatus: "passed",
      recoveryMode: "none",
      qualityGateImpact: "warning",
      summary: "Functional assertion passes, but latency budget violation is flagged.",
      inspectorFocus: ["Latency budget", "Performance warning", "Pass with warning", "Gate risk"]
    });
  }
}

export class AuthenticationFailureStrategy extends BaseFailureStrategy {
  constructor() {
    super({
      type: "auth",
      label: "Invalid Authentication",
      failureReason: "Session token rejected during protected request.",
      triggerStepId: "auth",
      expectedStatus: "failed",
      recoveryMode: "not-recoverable",
      qualityGateImpact: "blocked",
      summary: "Credential/session failure is classified; selector healing is not applicable.",
      inspectorFocus: [
        "Auth validation",
        "401/403 classification",
        "No self-heal path",
        "Gate blocked"
      ]
    });
  }
}

export const failureStrategies: readonly FailureStrategy[] = [
  new NoFailureStrategy(),
  new LocatorFailureStrategy(),
  new ApiFailureStrategy(),
  new TimeoutFailureStrategy(),
  new MissingElementFailureStrategy(),
  new SlowResponseFailureStrategy(),
  new AuthenticationFailureStrategy()
] as const;

export function findFailureStrategy(type: FailureType): FailureStrategy {
  return failureStrategies.find((strategy) => strategy.type === type) ?? failureStrategies[0];
}
