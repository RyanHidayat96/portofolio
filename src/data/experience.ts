import type { ExperienceRole } from "./types";

export const experience: readonly ExperienceRole[] = [
  {
    id: "jasa-marga-sdet",
    company: "PT Jasa Marga (Persero) Tbk",
    role: "Software Development Engineer in Test (SDET)",
    period: "Jul 2025 - Present",
    location: "Jakarta, Indonesia",
    responsibilities: [
      "First and only SDET in the organization.",
      "Established and maintained the end-to-end automation ecosystem for web and mobile applications.",
      "Architected scalable automation frameworks using Playwright, WebDriverIO, Appium, and TypeScript.",
      "Supported regression and smoke testing across release workflows.",
      "Performed real-device testing on AWS Device Farm using UIAutomator2 for Android and XCUITest for iOS.",
      "Designed custom Docker images and integrated automation execution with GitLab Runners.",
      "Integrated automated quality gates into GitLab CI/CD and maintained Allure reporting via GitLab Pages.",
      "Conducted load and stress testing using K6.",
      "Developed a custom SMTP bulk testing solution using Node.js and Nodemailer."
    ],
    impact: [
      "Enabled parallel and isolated test execution.",
      "Helped ensure deployments meet quality standards before promotion.",
      "Implemented AI-powered self-healing mechanisms for automation maintenance.",
      "Collaborated with developers, DevOps engineers, QA teams, Product Owners, and business stakeholders."
    ],
    technologies: [
      "Playwright",
      "WebDriverIO",
      "Appium",
      "TypeScript",
      "GitLab CI/CD",
      "Docker",
      "AWS Device Farm",
      "Allure Report",
      "K6",
      "Node.js",
      "Nodemailer"
    ]
  },
  {
    id: "astra-sqa",
    company: "PT Astra International Tbk",
    role: "SQA Manual & Automation",
    period: "Dec 2022 - Jun 2025",
    location: "Jakarta, Indonesia",
    responsibilities: [
      "Performed end-to-end manual testing across web, Android, and iOS applications.",
      "Developed and maintained automation scripts using WebDriverIO and Playwright.",
      "Performed API testing and API automation using Postman and Jest.",
      "Executed performance, load, and stress testing using K6.",
      "Created and maintained Test Plans, Test Scenarios, Test Cases, and Test Execution activities in Jira based on Business Process Specifications.",
      "Performed SIT, Smoke Testing, Smooth Testing, Regression Testing, and UAT.",
      "Identified, analyzed, documented, and tracked defects in Jira.",
      "Prepared user documentation and user guides."
    ],
    impact: [
      "Validated application data using MySQL and SAP S/4HANA.",
      "Participated in grooming sessions with PM, BPA, Frontend, and Backend teams.",
      "Clarified requirements and estimated testing effort for Agile delivery."
    ],
    technologies: [
      "WebDriverIO",
      "Playwright",
      "Postman",
      "Jest",
      "K6",
      "Jira",
      "MySQL",
      "SAP S/4HANA",
      "Android",
      "iOS"
    ]
  },
  {
    id: "adira-software-engineer",
    company: "PT Adira Finance",
    role: "Software Engineer",
    period: "Aug 2021 - Nov 2022",
    location: "Jakarta, Indonesia",
    responsibilities: [
      "Developed and maintained the ACTION core financial application using Java Spring Boot and ZK Framework.",
      "Supported loan processing operations across branch offices.",
      "Resolved production support tickets and investigated defects and root causes.",
      "Performed Oracle SQL corrections, updates, inserts, validation, and query optimization.",
      "Developed digital document generation services using Spring Boot, Apache POI, and electronic stamp integration.",
      "Designed and implemented RESTful APIs and contributed to microservices architecture.",
      "Developed and maintained SSIS packages for ETL and data integration."
    ],
    impact: [
      "Analyzed business issues and data integrity problems in production support workflows.",
      "Performed troubleshooting, debugging, and maintenance enhancements.",
      "Collaborated across BA, SA, QA, and infrastructure teams."
    ],
    technologies: [
      "Java",
      "Spring Boot",
      "ZK Framework",
      "REST API",
      "Microservices",
      "Oracle",
      "SQL",
      "Apache POI",
      "SSIS"
    ]
  }
] as const;
