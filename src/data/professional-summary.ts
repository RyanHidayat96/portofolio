import { experience } from "./experience";
import type { EngineeringDomain } from "./types";

interface RoleSummary {
  readonly summary: string;
  readonly contributions: readonly string[];
  readonly outcome: string;
}

// Condensed from portfolio-content responsibilities; no estimated performance metrics.
const roleSummaries: Readonly<Record<string, RoleSummary>> = {
  "jasa-marga-full-stack": {
    summary: "Enterprise audit monitoring and follow-up workflows.",
    contributions: [
      "Develop frontend modules for findings, action plans, evidence, deadlines, and dashboards using Next.js, React, and TypeScript.",
      "Build REST APIs with Node.js, Express, and Sequelize, including authentication, role-based access, validation, and audit logging.",
      "Support document storage, spreadsheet import/export, notifications, database migrations, and deployment workflows."
    ],
    outcome:
      "Connected audit tracking, document handling, and reporting across frontend, API, and database workflows."
  },
  "jasa-marga-sdet": {
    summary: "Test automation across web, mobile, APIs, and application performance.",
    contributions: [
      "Built and maintained automation frameworks with Playwright, WebDriverIO, Appium, and TypeScript.",
      "Integrated test execution and reports with Docker, GitLab CI/CD, AWS Device Farm, and Allure.",
      "Ran load and stress tests with K6 and built a bulk email testing tool with Node.js and Nodemailer."
    ],
    outcome:
      "Expanded regression, mobile, API, and performance coverage and connected test results to release checks."
  },
  "astra-sqa": {
    summary: "Manual and automated testing for web, Android, and iOS applications.",
    contributions: [
      "Prepared test plans, scenarios, defect reports, and regression checks, supporting integration and user acceptance testing.",
      "Maintained WebDriverIO and Playwright automation, validated APIs with Postman and Jest, and tested performance with K6.",
      "Validated application data through MySQL and SAP S/4HANA workflows."
    ],
    outcome:
      "Supported release decisions with test execution, defect reporting, and data validation across platforms."
  },
  "adira-software-engineer": {
    summary: "Backend development and production support for financial applications.",
    contributions: [
      "Developed application features, REST APIs, and document generation with Java, Spring Boot, and ZK Framework.",
      "Resolved production tickets through troubleshooting, Oracle SQL validation, and data correction.",
      "Maintained SSIS packages for data transformation and enterprise integration."
    ],
    outcome:
      "Delivered backend and document workflows while supporting production reliability and data integration."
  }
};

export const professionalExperience = experience.map((role) => ({
  ...role,
  summary: roleSummaries[role.id]?.summary ?? role.responsibilities[0] ?? role.role,
  contributions: roleSummaries[role.id]?.contributions ?? role.responsibilities,
  outcome: roleSummaries[role.id]?.outcome
}));

export const professionalHighlights = [
  { id: "jasa-marga-full-stack", title: "Enterprise application development" },
  { id: "jasa-marga-sdet", title: "Automation connected to delivery" },
  { id: "adira-software-engineer", title: "Financial application engineering" }
].flatMap((highlight) => {
  const role = professionalExperience.find((item) => item.id === highlight.id);
  return role
    ? [{ ...highlight, company: role.company, description: role.outcome ?? role.summary }]
    : [];
});

export const skillApplications: Readonly<
  Record<
    EngineeringDomain,
    {
      readonly title: string;
      readonly example: string;
      readonly experienceId: string;
    }
  >
> = {
  build: {
    title: "Application Development",
    example: "Audit tracking screens, role-based APIs, document uploads, and reporting workflows.",
    experienceId: "jasa-marga-full-stack"
  },
  quality: {
    title: "Test Automation & Quality",
    example: "Web and mobile automation frameworks, API validation, and load testing.",
    experienceId: "jasa-marga-sdet"
  },
  data: {
    title: "Databases & Integration",
    example:
      "Oracle SQL troubleshooting, production data correction, and SSIS integration packages.",
    experienceId: "adira-software-engineer"
  },
  delivery: {
    title: "CI/CD & Delivery",
    example: "Docker-based test execution, GitLab pipelines, device testing, and Allure reports.",
    experienceId: "jasa-marga-sdet"
  }
};
