import type { ArchitectureEdge, ArchitectureNode } from "./types";

export const architectureNodes: readonly ArchitectureNode[] = [
  {
    id: "gitlab",
    label: "GitLab CI/CD",
    layer: "Delivery",
    x: 50,
    y: 8,
    purpose:
      "Coordinates build, automation execution, performance checks, report publishing, and deployment gates.",
    relatedSkills: ["GitLab CI/CD", "GitLab Runners", "Docker"],
    relatedProjects: ["CI/CD Quality Gates", "Enterprise Web Automation Ecosystem"]
  },
  {
    id: "quality-gate",
    label: "Quality Gate",
    layer: "Release Policy",
    x: 50,
    y: 22,
    purpose:
      "Turns automated evidence into a release decision before deployment promotion continues.",
    relatedSkills: ["GitLab CI/CD", "Allure Report", "K6"],
    relatedProjects: ["CI/CD Quality Gates"]
  },
  {
    id: "playwright",
    label: "Playwright",
    layer: "Web Automation",
    x: 18,
    y: 40,
    purpose: "Executes browser automation with trace, screenshot, network, and retry evidence.",
    relatedSkills: ["Playwright", "TypeScript", "WebDriverIO"],
    relatedProjects: ["Enterprise Web Automation Ecosystem"]
  },
  {
    id: "appium",
    label: "Appium",
    layer: "Mobile Automation",
    x: 50,
    y: 40,
    purpose:
      "Runs Android and iOS automation paths with platform-aware capabilities and locator strategy.",
    relatedSkills: ["Appium", "AWS Device Farm", "UIAutomator2", "XCUITest"],
    relatedProjects: ["Cross-Platform Mobile Automation"]
  },
  {
    id: "k6",
    label: "K6",
    layer: "Performance",
    x: 82,
    y: 40,
    purpose: "Evaluates load patterns, thresholds, latency budgets, and release-impacting signals.",
    relatedSkills: ["K6", "JMeter", "Performance Testing"],
    relatedProjects: ["Performance & Load Testing"]
  },
  {
    id: "web",
    label: "Web Apps",
    layer: "Target",
    x: 18,
    y: 60,
    purpose: "Represents enterprise web workflows covered by regression and smoke automation.",
    relatedSkills: ["Playwright", "Selenium", "REST API"],
    relatedProjects: ["Enterprise Web Automation Ecosystem", "API Testing Workflow"]
  },
  {
    id: "android",
    label: "Android",
    layer: "Target",
    x: 42,
    y: 60,
    purpose: "Android automation target using Appium and UIAutomator2 concepts.",
    relatedSkills: ["Appium", "UIAutomator2", "AWS Device Farm"],
    relatedProjects: ["Cross-Platform Mobile Automation"]
  },
  {
    id: "ios",
    label: "iOS",
    layer: "Target",
    x: 58,
    y: 60,
    purpose: "iOS automation target using Appium and XCUITest concepts.",
    relatedSkills: ["Appium", "XCUITest", "AWS Device Farm"],
    relatedProjects: ["Cross-Platform Mobile Automation"]
  },
  {
    id: "performance",
    label: "Performance",
    layer: "Target",
    x: 82,
    y: 60,
    purpose: "Load and stress signals that inform release readiness.",
    relatedSkills: ["K6", "JMeter", "API Testing"],
    relatedProjects: ["Performance & Load Testing"]
  },
  {
    id: "test-results",
    label: "Test Results",
    layer: "Evidence",
    x: 50,
    y: 78,
    purpose: "Collects functional, mobile, API, and performance outcomes into release evidence.",
    relatedSkills: ["Allure Report", "Jira", "Confluence"],
    relatedProjects: ["CI/CD Quality Gates", "Enterprise QA Delivery"]
  },
  {
    id: "reports",
    label: "Allure / JUnit",
    layer: "Reporting",
    x: 50,
    y: 92,
    purpose: "Publishes readable automation evidence for engineering, QA, and release review.",
    relatedSkills: ["Allure Report", "GitLab Pages", "Jira"],
    relatedProjects: ["CI/CD Quality Gates", "Cross-Platform Mobile Automation"]
  }
] as const;

export const architectureEdges: readonly ArchitectureEdge[] = [
  { id: "gitlab-gate", source: "gitlab", target: "quality-gate", label: "release policy" },
  { id: "gate-playwright", source: "quality-gate", target: "playwright", label: "web gate" },
  { id: "gate-appium", source: "quality-gate", target: "appium", label: "mobile gate" },
  { id: "gate-k6", source: "quality-gate", target: "k6", label: "performance gate" },
  { id: "playwright-web", source: "playwright", target: "web", label: "browser flows" },
  { id: "appium-android", source: "appium", target: "android", label: "UIAutomator2" },
  { id: "appium-ios", source: "appium", target: "ios", label: "XCUITest" },
  { id: "k6-performance", source: "k6", target: "performance", label: "thresholds" },
  { id: "web-results", source: "web", target: "test-results", label: "evidence" },
  { id: "android-results", source: "android", target: "test-results", label: "device evidence" },
  { id: "ios-results", source: "ios", target: "test-results", label: "device evidence" },
  { id: "performance-results", source: "performance", target: "test-results", label: "metrics" },
  { id: "results-reports", source: "test-results", target: "reports", label: "publish" }
] as const;

export function findArchitectureNode(nodeId: string): ArchitectureNode | undefined {
  return architectureNodes.find((node) => node.id === nodeId);
}

export function getConnectedArchitectureNodeIds(nodeId: string): readonly string[] {
  return architectureEdges
    .filter((edge) => edge.source === nodeId || edge.target === nodeId)
    .flatMap((edge) => (edge.source === nodeId ? [edge.target] : [edge.source]));
}
