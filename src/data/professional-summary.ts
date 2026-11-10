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
      "Prepared test plans, scenarios, defect reports, and regression checks, supporting SIT, regression, and UAT.",
      "Maintained WebDriverIO and Playwright automation, validated APIs with Postman and Jest, and tested performance with K6.",
      "Validated application data through MySQL and SAP S/4HANA enterprise workflows."
    ],
    outcome:
      "Ensured cross-platform software stability, thorough defect tracking, and release confidence."
  },
  "kpp-full-stack": {
    summary: "Full stack enterprise web and mobile application development.",
    contributions: [
      "Built the LIMAS training management platform using .NET Core, JavaScript, and SQL Server.",
      "Developed mobile modules for Mobile Office KPP (M-OK) with React Native, TypeScript, and GraphQL.",
      "Developed the MOKA mobile/web assistant using React Native, Vite React, and Python.",
      "Engineered invoice processing service with ASP.NET and document extraction services.",
      "Built enterprise web solutions and RESTful APIs using .NET, JavaScript, and SQL Server."
    ],
    outcome:
      "Delivered scalable web and mobile application modules across enterprise operational systems."
  },
  "adira-software-engineer": {
    summary: "Backend development and production support for core financial applications.",
    contributions: [
      "Developed application features, REST APIs, and digital document generation with Java, Spring Boot, and ZK Framework.",
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
  { id: "jasa-marga-full-stack", title: "Enterprise Full Stack Development" },
  { id: "jasa-marga-sdet", title: "SDET & Automation Ecosystem" },
  { id: "kpp-full-stack", title: "Full Stack Web, Mobile & AI Solutions" },
  { id: "adira-software-engineer", title: "Financial Backend Engineering" }
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
    title: "Full Stack Development",
    example: "Next.js, React, React Native, Node.js, .NET Core, and Azure OpenAI enterprise web and mobile applications.",
    experienceId: "jasa-marga-full-stack"
  },
  quality: {
    title: "Software Development Engineer in Test (SDET)",
    example: "Web and mobile automation frameworks, API validation, self-healing, and performance testing.",
    experienceId: "jasa-marga-sdet"
  },
  data: {
    title: "Databases & Persistence",
    example:
      "PostgreSQL, MySQL, SQL Server, and Oracle database design, query optimization, and data workflows.",
    experienceId: "jasa-marga-full-stack"
  },
  delivery: {
    title: "CI/CD & Quality Gates",
    example: "Dockerized execution, GitLab pipelines, Azure DevOps, device testing, and Allure reports.",
    experienceId: "jasa-marga-sdet"
  }
};
