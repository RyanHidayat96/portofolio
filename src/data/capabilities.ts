import type { Capability, FullCycleNode } from "./types";

export const capabilities: readonly Capability[] = [
  {
    id: "build-frontend-backend",
    domain: "build",
    title: "Build",
    description: "Frontend, backend, API, and enterprise application development.",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "Express",
      "Java",
      "Spring Boot",
      "REST API",
      "Microservices"
    ],
    relatedExperience: ["jasa-marga-full-stack", "adira-software-engineer"],
    relatedProjects: [
      "enterprise-audit-monitoring-platform",
      "enterprise-backend-development",
      "ryanos-portfolio"
    ]
  },
  {
    id: "quality-automation-performance",
    domain: "quality",
    title: "Quality",
    description: "Automation, API testing, mobile testing, performance testing, and quality gates.",
    technologies: [
      "Playwright",
      "WebDriverIO",
      "Appium",
      "Selenium",
      "Jest",
      "Postman",
      "K6",
      "JMeter",
      "Allure"
    ],
    relatedExperience: ["jasa-marga-sdet", "astra-sqa"],
    relatedProjects: [
      "enterprise-web-automation-ecosystem",
      "cross-platform-mobile-automation",
      "performance-load-testing",
      "smtp-bulk-testing-solution"
    ]
  },
  {
    id: "data-relational-enterprise",
    domain: "data",
    title: "Data",
    description:
      "Relational data modeling, SQL validation, ORM work, ETL, and enterprise data context.",
    technologies: ["MySQL", "PostgreSQL", "Oracle", "SQL", "Sequelize", "MongoDB", "SSIS"],
    relatedExperience: ["jasa-marga-full-stack", "adira-software-engineer", "astra-sqa"],
    relatedProjects: ["enterprise-audit-monitoring-platform", "enterprise-backend-development"]
  },
  {
    id: "delivery-cicd",
    domain: "delivery",
    title: "Delivery",
    description:
      "Dockerized execution, CI/CD workflows, runners, device farms, and deploy-readiness signals.",
    technologies: ["GitLab CI/CD", "Docker", "GitLab Runner", "AWS Device Farm", "GitLab Pages"],
    relatedExperience: ["jasa-marga-full-stack", "jasa-marga-sdet"],
    relatedProjects: [
      "enterprise-audit-monitoring-platform",
      "enterprise-web-automation-ecosystem",
      "cicd-quality-gates",
      "dockerized-automation-execution"
    ]
  }
];

export const fullCycleNodes: readonly FullCycleNode[] = [
  {
    id: "idea",
    label: "Idea",
    description: "Translate business requirements into safe, testable engineering scope.",
    technologies: ["Requirements", "Workflow analysis", "Jira"],
    relatedExperience: ["astra-sqa", "jasa-marga-full-stack"],
    relatedProjects: ["enterprise-audit-monitoring-platform"],
    domain: "build"
  },
  {
    id: "frontend",
    label: "Frontend",
    description: "Build responsive interfaces, forms, tables, and workflow screens.",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "TanStack Query",
      "TanStack Table"
    ],
    relatedExperience: ["jasa-marga-full-stack"],
    relatedProjects: ["enterprise-audit-monitoring-platform", "ryanos-portfolio"],
    domain: "build"
  },
  {
    id: "api",
    label: "API",
    description: "Design RESTful boundaries between UI workflows and backend services.",
    technologies: ["REST API", "Node.js", "Express", "Spring Boot"],
    relatedExperience: ["jasa-marga-full-stack", "adira-software-engineer"],
    relatedProjects: ["enterprise-audit-monitoring-platform", "enterprise-backend-development"],
    domain: "build"
  },
  {
    id: "backend",
    label: "Backend",
    description:
      "Implement service logic, validation, authentication, authorization, and integration work.",
    technologies: ["Node.js", "Express", "Java", "Spring Boot", "Microservices"],
    relatedExperience: ["jasa-marga-full-stack", "adira-software-engineer"],
    relatedProjects: ["enterprise-audit-monitoring-platform", "enterprise-backend-development"],
    domain: "build"
  },
  {
    id: "data",
    label: "Data",
    description: "Model, query, validate, migrate, and integrate enterprise data safely.",
    technologies: ["PostgreSQL", "MySQL", "Oracle", "SQL", "Sequelize", "SSIS"],
    relatedExperience: ["jasa-marga-full-stack", "adira-software-engineer", "astra-sqa"],
    relatedProjects: ["enterprise-audit-monitoring-platform", "enterprise-backend-development"],
    domain: "data"
  },
  {
    id: "quality",
    label: "Quality",
    description:
      "Automate and reason about failure modes across web, mobile, API, and performance layers.",
    technologies: ["Playwright", "WebDriverIO", "Appium", "Postman", "Jest", "K6", "JMeter"],
    relatedExperience: ["jasa-marga-sdet", "astra-sqa"],
    relatedProjects: [
      "enterprise-web-automation-ecosystem",
      "cross-platform-mobile-automation",
      "performance-load-testing",
      "smtp-bulk-testing-solution"
    ],
    domain: "quality"
  },
  {
    id: "cicd",
    label: "CI/CD",
    description:
      "Connect build, test, report, and deploy signals through repeatable delivery workflows.",
    technologies: ["GitLab CI/CD", "Docker", "GitLab Runner", "Allure", "GitLab Pages"],
    relatedExperience: ["jasa-marga-full-stack", "jasa-marga-sdet"],
    relatedProjects: [
      "enterprise-audit-monitoring-platform",
      "enterprise-web-automation-ecosystem",
      "cicd-quality-gates",
      "dockerized-automation-execution"
    ],
    domain: "delivery"
  },
  {
    id: "production",
    label: "Production",
    description:
      "Support release confidence through operational visibility, troubleshooting, and public-safe delivery thinking.",
    technologies: ["Production support", "Troubleshooting", "Dashboards", "Quality gates"],
    relatedExperience: ["jasa-marga-full-stack", "adira-software-engineer"],
    relatedProjects: ["enterprise-audit-monitoring-platform", "enterprise-backend-development"],
    domain: "delivery"
  }
];
