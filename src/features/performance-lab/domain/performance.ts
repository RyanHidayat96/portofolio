export type PerformanceScenarioId = "normal" | "peak" | "stress";
export type ThresholdStatus = "passed" | "failed";
export type PerformanceQualityGateStatus = "passed" | "failed";
export type PerformanceMetricKey = "p95" | "p99" | "errorRate" | "checkRate";
export type ThresholdComparison = "less-than" | "greater-than";

export interface PerformanceControlRange {
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

export interface PerformanceLoadProfile {
  readonly requestsPerVirtualUserSecond: number;
  readonly iterationsPerVirtualUserSecond: number;
  readonly p50BaseMs: number;
  readonly p95BaseMs: number;
  readonly p99BaseMs: number;
  readonly latencyGrowthFactor: number;
  readonly errorBaseRate: number;
  readonly errorGrowthFactor: number;
  readonly checkBaseRate: number;
  readonly checkDecayFactor: number;
}

export interface PerformanceMetrics {
  readonly virtualUsers: number;
  readonly durationSeconds: number;
  readonly requests: number;
  readonly iterations: number;
  readonly throughput: number;
  readonly errorRate: number;
  readonly checkRate: number;
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
}

export interface PerformanceScenario {
  readonly id: PerformanceScenarioId;
  readonly label: string;
  readonly description: string;
  readonly defaultVirtualUsers: number;
  readonly defaultDurationSeconds: number;
  readonly virtualUserRange: PerformanceControlRange;
  readonly durationRange: PerformanceControlRange;
  readonly profile: PerformanceLoadProfile;
}

export interface PerformanceRunConfig {
  readonly scenarioId: PerformanceScenarioId;
  readonly virtualUsers: number;
  readonly durationSeconds: number;
}

export interface PerformanceRunResult {
  readonly scenario: PerformanceScenario;
  readonly config: PerformanceRunConfig;
  readonly metrics: PerformanceMetrics;
  readonly thresholds: readonly ThresholdResult[];
  readonly qualityGate: PerformanceQualityGateStatus;
}

export interface PerformanceThreshold {
  readonly id: string;
  readonly label: string;
  readonly metric: PerformanceMetricKey;
  readonly comparison: ThresholdComparison;
  readonly target: number;
  readonly unit: "ms" | "%" | "";
}

export interface ThresholdResult {
  readonly id: string;
  readonly label: string;
  readonly status: ThresholdStatus;
  readonly observed: string;
  readonly target: string;
}

export const performanceScenarios: readonly PerformanceScenario[] = [
  {
    id: "normal",
    label: "Normal Load",
    description: "Steady traffic for release confidence and baseline latency.",
    defaultVirtualUsers: 25,
    defaultDurationSeconds: 30,
    virtualUserRange: { min: 10, max: 80, step: 5 },
    durationRange: { min: 15, max: 120, step: 15 },
    profile: {
      requestsPerVirtualUserSecond: 1.65,
      iterationsPerVirtualUserSecond: 0.413,
      p50BaseMs: 420,
      p95BaseMs: 1180,
      p99BaseMs: 1720,
      latencyGrowthFactor: 0.36,
      errorBaseRate: 0.2,
      errorGrowthFactor: 0.22,
      checkBaseRate: 99.4,
      checkDecayFactor: 0.6
    }
  },
  {
    id: "peak",
    label: "Peak Load",
    description: "High but expected traffic level for release-gate readiness.",
    defaultVirtualUsers: 50,
    defaultDurationSeconds: 30,
    virtualUserRange: { min: 20, max: 120, step: 5 },
    durationRange: { min: 15, max: 180, step: 15 },
    profile: {
      requestsPerVirtualUserSecond: 1.45,
      iterationsPerVirtualUserSecond: 0.363,
      p50BaseMs: 720,
      p95BaseMs: 1840,
      p99BaseMs: 2380,
      latencyGrowthFactor: 0.42,
      errorBaseRate: 0.7,
      errorGrowthFactor: 0.36,
      checkBaseRate: 97.8,
      checkDecayFactor: 1.2
    }
  },
  {
    id: "stress",
    label: "Stress Test",
    description: "Pressure scenario intended to reveal capacity and threshold failure.",
    defaultVirtualUsers: 100,
    defaultDurationSeconds: 30,
    virtualUserRange: { min: 50, max: 200, step: 10 },
    durationRange: { min: 15, max: 240, step: 15 },
    profile: {
      requestsPerVirtualUserSecond: 1.113,
      iterationsPerVirtualUserSecond: 0.278,
      p50BaseMs: 1120,
      p95BaseMs: 2680,
      p99BaseMs: 3910,
      latencyGrowthFactor: 0.58,
      errorBaseRate: 1.6,
      errorGrowthFactor: 0.72,
      checkBaseRate: 94.4,
      checkDecayFactor: 2.8
    }
  }
] as const;

export const performanceThresholds: readonly PerformanceThreshold[] = [
  {
    id: "p95-latency",
    label: "P95 latency",
    metric: "p95",
    comparison: "less-than",
    target: 2000,
    unit: "ms"
  },
  {
    id: "p99-latency",
    label: "P99 latency",
    metric: "p99",
    comparison: "less-than",
    target: 3000,
    unit: "ms"
  },
  {
    id: "error-rate",
    label: "Error rate",
    metric: "errorRate",
    comparison: "less-than",
    target: 1,
    unit: "%"
  },
  {
    id: "check-rate",
    label: "Check rate",
    metric: "checkRate",
    comparison: "greater-than",
    target: 95,
    unit: "%"
  }
] as const;

const firstScenario = performanceScenarios[0];

export function findPerformanceScenario(id: PerformanceScenarioId): PerformanceScenario {
  return performanceScenarios.find((scenario) => scenario.id === id) ?? firstScenario;
}

export function createDefaultPerformanceConfig(
  scenarioId: PerformanceScenarioId
): PerformanceRunConfig {
  const scenario = findPerformanceScenario(scenarioId);

  return {
    scenarioId: scenario.id,
    virtualUsers: scenario.defaultVirtualUsers,
    durationSeconds: scenario.defaultDurationSeconds
  };
}

export function normalizePerformanceConfig(config: PerformanceRunConfig): PerformanceRunConfig {
  const scenario = findPerformanceScenario(config.scenarioId);

  return {
    scenarioId: scenario.id,
    virtualUsers: clampToStep(config.virtualUsers, scenario.virtualUserRange),
    durationSeconds: clampToStep(config.durationSeconds, scenario.durationRange)
  };
}

export function simulatePerformanceRun(config: PerformanceRunConfig): PerformanceRunResult {
  const normalizedConfig = normalizePerformanceConfig(config);
  const scenario = findPerformanceScenario(normalizedConfig.scenarioId);
  const metrics = calculateMetrics(scenario, normalizedConfig);
  const thresholds = evaluateThresholds(metrics);
  const qualityGate = thresholds.every((threshold) => threshold.status === "passed")
    ? "passed"
    : "failed";

  return {
    scenario,
    config: normalizedConfig,
    metrics,
    thresholds,
    qualityGate
  };
}

export function evaluateThresholds(metrics: PerformanceMetrics): readonly ThresholdResult[] {
  return performanceThresholds.map((threshold) => {
    const value = getMetricValue(metrics, threshold.metric);
    const passed =
      threshold.comparison === "less-than" ? value < threshold.target : value > threshold.target;

    return {
      id: threshold.id,
      label: threshold.label,
      status: passed ? "passed" : "failed",
      observed: formatMetricValue(value, threshold.unit),
      target: formatThresholdTarget(threshold)
    };
  });
}

function calculateMetrics(
  scenario: PerformanceScenario,
  config: PerformanceRunConfig
): PerformanceMetrics {
  const loadRatio = config.virtualUsers / scenario.defaultVirtualUsers;
  const durationRatio = config.durationSeconds / scenario.defaultDurationSeconds;
  const positivePressure = Math.max(0, loadRatio - 1);
  const latencyMultiplier = Math.max(
    0.72,
    1 + (loadRatio - 1) * scenario.profile.latencyGrowthFactor
  );
  const requestEfficiency = Math.max(0.58, 1 - positivePressure * 0.035);
  const requests = Math.round(
    config.virtualUsers *
      config.durationSeconds *
      scenario.profile.requestsPerVirtualUserSecond *
      requestEfficiency
  );
  const iterations = Math.round(
    config.virtualUsers * config.durationSeconds * scenario.profile.iterationsPerVirtualUserSecond
  );
  const errorRate = roundToOneDecimal(
    Math.max(
      0,
      scenario.profile.errorBaseRate +
        positivePressure * scenario.profile.errorGrowthFactor +
        Math.max(0, durationRatio - 1) * 0.08
    )
  );
  const checkRate = roundToOneDecimal(
    Math.min(
      99.9,
      Math.max(
        0,
        scenario.profile.checkBaseRate -
          positivePressure * scenario.profile.checkDecayFactor -
          Math.max(0, durationRatio - 1) * 0.16
      )
    )
  );

  return {
    virtualUsers: config.virtualUsers,
    durationSeconds: config.durationSeconds,
    requests,
    iterations,
    throughput: Math.round(requests / config.durationSeconds),
    errorRate,
    checkRate,
    p50: Math.round(scenario.profile.p50BaseMs * latencyMultiplier),
    p95: Math.round(scenario.profile.p95BaseMs * latencyMultiplier),
    p99: Math.round(scenario.profile.p99BaseMs * latencyMultiplier)
  };
}

function clampToStep(value: number, range: PerformanceControlRange): number {
  const clamped = Math.min(range.max, Math.max(range.min, value));
  const stepsFromMin = Math.round((clamped - range.min) / range.step);

  return range.min + stepsFromMin * range.step;
}

function getMetricValue(metrics: PerformanceMetrics, metric: PerformanceMetricKey): number {
  return metrics[metric];
}

function formatThresholdTarget(threshold: PerformanceThreshold): string {
  const operator = threshold.comparison === "less-than" ? "<" : ">";

  return `${operator} ${formatMetricValue(threshold.target, threshold.unit)}`;
}

function formatMetricValue(value: number, unit: PerformanceThreshold["unit"]): string {
  if (unit === "ms") {
    return `${value} ms`;
  }

  if (unit === "%") {
    return `${value.toFixed(1)}%`;
  }

  return value.toString();
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
