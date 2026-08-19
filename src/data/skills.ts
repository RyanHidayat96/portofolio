import type { SkillGroup } from "./types";

export const skillGroups: readonly SkillGroup[] = [
  {
    id: "programming-languages",
    title: "Programming Languages",
    skills: [
      {
        name: "TypeScript",
        purpose: "Automation framework code, typed helpers, test infrastructure, and RyanOS.",
        relatedProjects: ["Enterprise Web Automation Ecosystem", "CI/CD Quality Gates"]
      },
      {
        name: "JavaScript",
        purpose: "Automation scripting, API test support, and Node.js tooling.",
        relatedProjects: ["SMTP Bulk Testing Solution"]
      },
      {
        name: "Python",
        purpose: "Test tooling and automation support where lightweight scripting is useful.",
        relatedProjects: ["Automation Engineering"]
      },
      {
        name: "Java",
        purpose: "Backend application development with Spring Boot and enterprise systems.",
        relatedProjects: ["Enterprise Backend Development"]
      }
    ]
  },
  {
    id: "frontend-development",
    title: "Frontend Development",
    skills: [
      {
        name: "Next.js",
        purpose: "React application architecture and portfolio engineering.",
        relatedProjects: ["RyanOS"]
      },
      {
        name: "React",
        purpose: "Interactive UI composition and stateful engineering demos.",
        relatedProjects: ["RyanOS"]
      },
      {
        name: "HTML",
        purpose: "Semantic UI structure for accessible testable interfaces.",
        relatedProjects: ["RyanOS"]
      },
      {
        name: "CSS",
        purpose: "Responsive layouts, design systems, and readable engineering dashboards.",
        relatedProjects: ["RyanOS"]
      }
    ]
  },
  {
    id: "backend-development",
    title: "Backend Development",
    skills: [
      {
        name: "Spring Boot",
        purpose: "Backend services, document generation, REST APIs, and production support.",
        relatedProjects: ["Enterprise Backend Development"]
      },
      {
        name: "REST API",
        purpose: "API design, validation, and integration testing.",
        relatedProjects: ["Enterprise Backend Development", "API Testing Workflow"]
      },
      {
        name: "Microservices",
        purpose: "Service-oriented backend contribution and integration support.",
        relatedProjects: ["Enterprise Backend Development"]
      },
      {
        name: "ZK Framework",
        purpose: "Enterprise Java UI/application maintenance.",
        relatedProjects: ["Enterprise Backend Development"]
      }
    ]
  },
  {
    id: "test-automation",
    title: "Test Automation",
    skills: [
      {
        name: "Playwright",
        purpose: "Web automation, regression testing, and CI/CD quality gates.",
        relatedProjects: ["Enterprise Web Automation Ecosystem", "CI/CD Quality Gates"]
      },
      {
        name: "WebDriverIO",
        purpose: "Web and mobile automation script development.",
        relatedProjects: ["Enterprise Web Automation Ecosystem", "Cross-Platform Mobile Automation"]
      },
      {
        name: "Appium",
        purpose: "Android and iOS automation with UIAutomator2 and XCUITest concepts.",
        relatedProjects: ["Cross-Platform Mobile Automation"]
      },
      {
        name: "Selenium",
        purpose: "Browser automation and legacy automation support.",
        relatedProjects: ["Automation Engineering"]
      },
      {
        name: "Katalon Studio",
        purpose: "Test automation support for enterprise QA workflows.",
        relatedProjects: ["Automation Engineering"]
      },
      {
        name: "Jest",
        purpose: "API automation and JavaScript/TypeScript test validation.",
        relatedProjects: ["API Testing Workflow"]
      }
    ]
  },
  {
    id: "performance-api",
    title: "Performance & API Testing",
    skills: [
      {
        name: "K6",
        purpose: "Load and stress testing, threshold design, and performance gate thinking.",
        relatedProjects: ["Performance & Load Testing"]
      },
      {
        name: "JMeter",
        purpose: "Performance testing support for load and stress scenarios.",
        relatedProjects: ["Performance & Load Testing"]
      },
      {
        name: "Postman",
        purpose: "API testing, API automation, and contract validation workflows.",
        relatedProjects: ["API Testing Workflow"]
      }
    ]
  },
  {
    id: "cicd-devops",
    title: "CI/CD & DevOps",
    skills: [
      {
        name: "GitLab CI/CD",
        purpose: "Automated quality gates, pipelines, runners, and deployment confidence.",
        relatedProjects: ["CI/CD Quality Gates"]
      },
      {
        name: "Docker",
        purpose: "Custom automation execution images and isolated test environments.",
        relatedProjects: ["CI/CD Quality Gates"]
      },
      {
        name: "GitLab Runners",
        purpose: "Automation execution infrastructure and pipeline integration.",
        relatedProjects: ["CI/CD Quality Gates"]
      },
      {
        name: "AWS Device Farm",
        purpose: "Real-device Android and iOS validation.",
        relatedProjects: ["Cross-Platform Mobile Automation"]
      },
      {
        name: "GitLab Pages",
        purpose: "Publishing Allure reports and test evidence.",
        relatedProjects: ["CI/CD Quality Gates"]
      }
    ]
  },
  {
    id: "reporting-test-management",
    title: "Reporting & Test Management",
    skills: [
      {
        name: "Allure Report",
        purpose: "Readable automation evidence and failure investigation reports.",
        relatedProjects: ["CI/CD Quality Gates"]
      },
      {
        name: "Jira",
        purpose: "Test planning, execution, defect tracking, and Agile collaboration.",
        relatedProjects: ["Enterprise QA Delivery"]
      },
      {
        name: "Confluence",
        purpose: "Documentation and cross-functional QA knowledge sharing.",
        relatedProjects: ["Enterprise QA Delivery"]
      }
    ]
  },
  {
    id: "databases-enterprise-data",
    title: "Databases & Enterprise Data",
    skills: [
      {
        name: "Oracle",
        purpose: "SQL corrections, validation, query optimization, and production support.",
        relatedProjects: ["Enterprise Backend Development"]
      },
      {
        name: "MySQL",
        purpose: "Application data validation for QA workflows.",
        relatedProjects: ["Enterprise QA Delivery"]
      },
      {
        name: "SQL",
        purpose: "Data validation, troubleshooting, and performance investigation.",
        relatedProjects: ["Enterprise QA Delivery", "Enterprise Backend Development"]
      },
      {
        name: "SAP S/4HANA",
        purpose: "Enterprise data validation in business application testing.",
        relatedProjects: ["Enterprise QA Delivery"]
      },
      {
        name: "SSIS",
        purpose: "ETL and data integration package maintenance.",
        relatedProjects: ["Enterprise Backend Development"]
      }
    ]
  }
] as const;
