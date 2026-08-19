import type { ProjectCaseStudy } from "./types";

export const projects: readonly ProjectCaseStudy[] = [
  {
    slug: "enterprise-web-automation-ecosystem",
    title: "Enterprise Web Automation Ecosystem",
    status: "portfolio-safe",
    problem:
      "Enterprise release workflows need reliable regression and smoke coverage without depending only on manual checks.",
    context:
      "Work highlight based on Ryan's verified SDET experience establishing and maintaining automation ecosystems for enterprise web applications.",
    responsibility:
      "Architected, developed, and maintained scalable automation frameworks using Playwright, WebDriverIO, Appium, and TypeScript.",
    architecture:
      "Layered automation design with reusable flows, typed helpers, CI execution, custom Docker images, runner integration, and Allure evidence.",
    engineeringDecisions: [
      "Separate test intent from low-level selectors and infrastructure setup.",
      "Use TypeScript to keep automation helpers explicit and maintainable.",
      "Capture readable evidence through Allure reports for release decisions."
    ],
    testingStrategy: [
      "Regression coverage for high-risk workflows.",
      "Smoke tests for deployment confidence.",
      "CI/CD quality gate integration before promotion."
    ],
    outcome:
      "Enabled structured automation execution and quality-gate readiness without exposing employer-confidential details.",
    lessons: [
      "Reliable automation needs product testability, stable selectors, and useful failure evidence.",
      "A good framework improves debugging speed as much as pass/fail confidence."
    ],
    technologies: [
      "Playwright",
      "WebDriverIO",
      "TypeScript",
      "Docker",
      "GitLab CI/CD",
      "Allure Report"
    ]
  },
  {
    slug: "cross-platform-mobile-automation",
    title: "Cross-Platform Mobile Automation",
    status: "portfolio-safe",
    problem:
      "Mobile releases require Android and iOS validation across real devices while keeping automation maintainable.",
    context:
      "Work highlight based on Ryan's verified mobile automation and AWS Device Farm experience.",
    responsibility:
      "Performed real-device testing on AWS Device Farm and supported Appium-based Android and iOS automation.",
    architecture:
      "Mobile automation structure with platform-aware capabilities, Appium execution, UIAutomator2, XCUITest, and report artifacts.",
    engineeringDecisions: [
      "Model Android and iOS differences explicitly.",
      "Use real-device execution where environment risk matters.",
      "Keep platform setup separate from scenario assertions."
    ],
    testingStrategy: [
      "Critical journey validation on mobile platforms.",
      "Smoke and regression workflows aligned to release risk.",
      "Failure evidence captured for investigation."
    ],
    outcome:
      "Supported cross-platform mobile quality validation using verified tools and device infrastructure.",
    lessons: [
      "Mobile automation stability depends on locator strategy and device environment control.",
      "Real-device evidence helps teams separate product defects from environment noise."
    ],
    technologies: ["Appium", "AWS Device Farm", "UIAutomator2", "XCUITest", "Android", "iOS"]
  },
  {
    slug: "cicd-quality-gates",
    title: "CI/CD Quality Gates",
    status: "portfolio-safe",
    problem:
      "Deployment promotion needs automated quality signals that are visible, repeatable, and tied to release standards.",
    context:
      "Work highlight based on Ryan's verified GitLab CI/CD, GitLab Runners, Docker, and Allure reporting experience.",
    responsibility:
      "Integrated automated quality gates into GitLab CI/CD and maintained automation reporting pipelines published through GitLab Pages.",
    architecture:
      "Pipeline stages connect build, automation execution, performance checks, report publishing, and deployment gate decisions.",
    engineeringDecisions: [
      "Run tests in custom Docker images for predictable execution.",
      "Use GitLab Runners for isolated and parallel test execution.",
      "Publish reports so failures are reviewable by engineering and QA stakeholders."
    ],
    testingStrategy: [
      "Smoke and regression stages before promotion.",
      "Quality gate checks for release readiness.",
      "Report-driven failure review."
    ],
    outcome:
      "Helped ensure deployments meet quality standards before promotion using automated release evidence.",
    lessons: [
      "A quality gate is useful only when teams trust its signals.",
      "CI/CD automation needs maintainable infrastructure, not only test scripts."
    ],
    technologies: ["GitLab CI/CD", "GitLab Runners", "Docker", "GitLab Pages", "Allure Report"]
  },
  {
    slug: "performance-load-testing",
    title: "Performance & Load Testing",
    status: "portfolio-safe",
    problem:
      "Enterprise systems need load and stress testing to reveal latency, error-rate, and capacity risks before release.",
    context: "Work highlight based on Ryan's verified performance testing with K6 and JMeter.",
    responsibility:
      "Conducted load and stress testing, interpreted threshold behavior, and connected results to release quality decisions.",
    architecture:
      "Scenario-based performance checks with virtual-user load models, latency metrics, error-rate thresholds, and reportable outcomes.",
    engineeringDecisions: [
      "Treat P95/P99 latency and error rate as release-relevant signals.",
      "Separate normal, peak, and stress scenarios.",
      "Use threshold failures to drive investigation rather than vanity dashboards."
    ],
    testingStrategy: [
      "Normal load simulation.",
      "Peak load validation.",
      "Stress testing for bottleneck discovery."
    ],
    outcome:
      "Supported performance quality decisions using verified load and stress testing tools.",
    lessons: [
      "Performance testing is strongest when tied to user-impact thresholds.",
      "A failed threshold should point engineers toward a next investigation."
    ],
    technologies: ["K6", "JMeter", "API Testing", "Performance Testing"]
  },
  {
    slug: "smtp-bulk-testing-solution",
    title: "SMTP Bulk Testing Solution",
    status: "portfolio-safe",
    problem:
      "Bulk email workflows need controlled testing support without relying on manual repetition.",
    context:
      "Work highlight based on Ryan's verified custom SMTP bulk testing solution using Node.js and Nodemailer.",
    responsibility:
      "Developed a custom SMTP bulk testing solution to support test execution and delivery validation.",
    architecture:
      "Node.js utility using Nodemailer to drive repeatable SMTP test flows in a controlled environment.",
    engineeringDecisions: [
      "Use a focused tool rather than overloading general automation suites.",
      "Keep SMTP behavior configurable for test scenarios.",
      "Support repeatable execution for investigation and validation."
    ],
    testingStrategy: [
      "Bulk send workflow validation.",
      "SMTP behavior checks.",
      "Controlled repeatability for defect investigation."
    ],
    outcome: "Improved ability to test SMTP bulk behavior through a purpose-built utility.",
    lessons: [
      "Good SDET work often means building the right small tool.",
      "Repeatability matters when validating integration-heavy behavior."
    ],
    technologies: ["Node.js", "Nodemailer", "SMTP", "JavaScript"]
  },
  {
    slug: "enterprise-backend-development",
    title: "Enterprise Backend Development",
    status: "portfolio-safe",
    problem:
      "Core financial applications need maintainable backend features, production support, and data integrity validation.",
    context:
      "Work highlight based on Ryan's verified Software Engineer experience at PT Adira Finance.",
    responsibility:
      "Developed and maintained Java Spring Boot applications, REST APIs, document generation services, Oracle SQL corrections, and SSIS packages.",
    architecture:
      "Enterprise backend stack with Spring Boot services, ZK Framework, RESTful APIs, Oracle data workflows, Apache POI document generation, and ETL integration.",
    engineeringDecisions: [
      "Use REST APIs and microservices patterns for service boundaries.",
      "Validate data integrity directly with SQL when production issues require it.",
      "Optimize Oracle queries during troubleshooting and maintenance."
    ],
    testingStrategy: [
      "Defect investigation and root-cause validation.",
      "Production support troubleshooting.",
      "Data correction verification."
    ],
    outcome:
      "Contributed to maintenance, production support, and backend delivery for core financial application workflows.",
    lessons: [
      "Backend development experience makes QA automation stronger because system behavior is easier to reason about.",
      "Data integrity and test strategy are closely connected in enterprise systems."
    ],
    technologies: [
      "Java",
      "Spring Boot",
      "REST API",
      "Microservices",
      "ZK Framework",
      "Oracle",
      "SSIS"
    ]
  }
] as const;
