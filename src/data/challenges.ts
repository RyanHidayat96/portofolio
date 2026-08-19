import type { ChallengeScenario } from "./types";

export const challengeScenarios: readonly ChallengeScenario[] = [
  {
    id: "api-performance-diagnosis",
    title: "API Performance Diagnosis",
    domain: "API performance",
    difficulty: "advanced",
    prompt: "Production API metrics show elevated latency. Where should investigation start?",
    metrics: ["P95: 4.8s", "Error Rate: 0.3%", "Application CPU: 42%", "Database CPU: 96%"],
    choices: [
      {
        id: "frontend",
        label: "Inspect frontend bundle size",
        isPreferred: false,
        feedback: "Possible later, but backend metrics point elsewhere first."
      },
      {
        id: "database",
        label: "Investigate database queries and locks",
        isPreferred: true,
        feedback: "Strong first move. DB CPU is saturated while app CPU and error rate remain low."
      },
      {
        id: "rerun-tests",
        label: "Rerun automation suite immediately",
        isPreferred: false,
        feedback: "Reruns may confirm symptoms, but they will not isolate the bottleneck."
      }
    ],
    approach: [
      "Confirm latency distribution and affected endpoints.",
      "Correlate slow requests with database waits, locks, and query plans.",
      "Add a focused regression or performance check after root cause is understood."
    ]
  },
  {
    id: "flaky-automation",
    title: "Flaky Automation",
    domain: "Flaky automation",
    difficulty: "intermediate",
    prompt:
      "A UI test fails only on CI. The element exists locally. What is the first useful action?",
    metrics: ["CI only", "Element appears after API response", "Failure: strict mode violation"],
    choices: [
      {
        id: "sleep",
        label: "Add fixed sleep",
        isPreferred: false,
        feedback: "Sleep hides timing issues and usually creates new flake."
      },
      {
        id: "contract",
        label: "Inspect locator contract and wait condition",
        isPreferred: true,
        feedback: "Correct. Strict locator semantics and readiness signals should be explicit."
      },
      {
        id: "retry",
        label: "Increase retry count",
        isPreferred: false,
        feedback: "Retry can protect releases, but it is not root-cause work."
      }
    ],
    approach: [
      "Reproduce with CI trace and screenshot.",
      "Check selector uniqueness and semantic test IDs.",
      "Wait on user-observable readiness instead of arbitrary time."
    ]
  },
  {
    id: "cicd-failure",
    title: "CI/CD Failure",
    domain: "CI/CD failure",
    difficulty: "intermediate",
    prompt:
      "A pipeline fails at automation setup before tests start. What should be checked first?",
    metrics: ["Docker image updated", "Runner uses cached layer", "Test command never starts"],
    choices: [
      {
        id: "application-code",
        label: "Debug application business logic",
        isPreferred: false,
        feedback: "Application code may be fine; failure happens before tests execute."
      },
      {
        id: "runner-image",
        label: "Inspect runner image and dependency cache",
        isPreferred: true,
        feedback:
          "Best first path. Setup failures often live in image, cache, or runner environment."
      },
      {
        id: "skip-stage",
        label: "Skip automation stage for this release",
        isPreferred: false,
        feedback: "Skipping removes signal. First preserve gate integrity and isolate setup cause."
      }
    ],
    approach: [
      "Separate infrastructure failure from product regression.",
      "Compare image digest, cache state, runner logs, and dependency lockfile.",
      "Add setup validation so future failures fail with a clear reason."
    ]
  },
  {
    id: "database-bottleneck",
    title: "Database Bottleneck",
    domain: "Database bottleneck",
    difficulty: "advanced",
    prompt: "A checkout endpoint slows down under peak load while app CPU stays healthy.",
    metrics: ["P99: 6.1s", "DB waits elevated", "App CPU: 48%", "Error Rate: 0.8%"],
    choices: [
      {
        id: "scale-app",
        label: "Scale application containers first",
        isPreferred: false,
        feedback: "More app capacity will not fix DB wait saturation."
      },
      {
        id: "query-plan",
        label: "Review query plan and lock behavior",
        isPreferred: true,
        feedback: "Correct. Signals point toward database contention or inefficient access."
      },
      {
        id: "ignore",
        label: "Accept high P99 because errors are below 1%",
        isPreferred: false,
        feedback: "Latency is user impact. Passing error rate alone is not enough."
      }
    ],
    approach: [
      "Identify slow query patterns and endpoint correlation.",
      "Check indexes, locks, transaction scope, and connection pool pressure.",
      "Create a repeatable performance scenario to verify fix behavior."
    ]
  },
  {
    id: "mobile-automation",
    title: "Mobile Automation",
    domain: "Mobile automation",
    difficulty: "intermediate",
    prompt: "Android passes locally, but real-device execution fails during app startup.",
    metrics: [
      "Local emulator passed",
      "Real device failed",
      "App install succeeded",
      "Launch timeout"
    ],
    choices: [
      {
        id: "force-wait",
        label: "Add long startup sleep",
        isPreferred: false,
        feedback: "Sleep hides real readiness issues and slows every run."
      },
      {
        id: "capabilities",
        label: "Inspect capabilities, logs, and startup readiness",
        isPreferred: true,
        feedback: "Correct. Real devices need platform setup and readiness signals validated."
      },
      {
        id: "remove-device",
        label: "Remove real-device execution",
        isPreferred: false,
        feedback: "Removing device coverage loses the signal that caught the risk."
      }
    ],
    approach: [
      "Compare emulator and real-device capabilities.",
      "Check device logs, app permissions, launch activity, and readiness condition.",
      "Keep platform setup separate from scenario assertions."
    ]
  },
  {
    id: "regression-strategy",
    title: "Regression Strategy",
    domain: "Regression strategy",
    difficulty: "baseline",
    prompt: "Release window is short. Which tests should run before promotion?",
    metrics: ["High-risk workflow changed", "Full suite: 90 min", "Smoke suite: 8 min"],
    choices: [
      {
        id: "full-only",
        label: "Run full suite only after deployment",
        isPreferred: false,
        feedback: "Too late for release prevention. Promotion needs pre-deploy signal."
      },
      {
        id: "risk-based",
        label: "Run smoke plus targeted regression before gate",
        isPreferred: true,
        feedback:
          "Best release tradeoff. It protects critical risk without pretending coverage is full."
      },
      {
        id: "manual-only",
        label: "Use manual exploratory testing only",
        isPreferred: false,
        feedback: "Exploration helps, but repeatable gate checks still matter."
      }
    ],
    approach: [
      "Map changed area to business risk.",
      "Run smoke plus targeted automated regression before promotion.",
      "Schedule broader regression separately when time allows."
    ]
  },
  {
    id: "quality-gates",
    title: "Quality Gates",
    domain: "Quality gates",
    difficulty: "advanced",
    prompt:
      "One pipeline signal fails, but product pressure is high. What is the release decision?",
    metrics: [
      "Regression: passed",
      "Performance: failed",
      "P95 target breached",
      "Deploy stage pending"
    ],
    choices: [
      {
        id: "deploy-anyway",
        label: "Deploy because functional regression passed",
        isPreferred: false,
        feedback: "Functional pass is not enough when a release gate is designed to block risk."
      },
      {
        id: "block-with-evidence",
        label: "Block deployment and attach evidence",
        isPreferred: true,
        feedback:
          "Correct. Gate decisions need evidence, owner visibility, and a next investigation."
      },
      {
        id: "delete-threshold",
        label: "Remove threshold for this release",
        isPreferred: false,
        feedback: "Changing rules during pressure undermines trust in the gate."
      }
    ],
    approach: [
      "Keep quality gate rule consistent.",
      "Attach reports, threshold data, and suspected risk area.",
      "Re-run after fix or approved risk exception."
    ]
  }
] as const;
