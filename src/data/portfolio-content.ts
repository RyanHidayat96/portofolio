import type {
  ApiEndpointDefinition,
  ArchitectureMap,
  ArchitecturePreset,
  Branding,
  ChallengeScenario,
  EducationCredential,
  ExperienceRole,
  PipelinePanelMetadata,
  Profile,
  ProjectCaseStudy,
  SkillGroup
} from "./types";

export const branding: Branding = {
  appName: "RyanOS",
  workspaceLabel: "Full-Cycle Engineering Workspace",
  heroStatementLead: "I build systems.",
  heroStatementAccent: "I engineer confidence.",
  metadataDescription:
    "Full Stack Engineer and SDET experienced in enterprise application development, Next.js, React, Node.js, Java Spring Boot, APIs, databases, test automation, performance engineering, Docker, and GitLab CI/CD.",
  openGraphBadge: "Full Stack × Quality Engineering",
  openGraphHighlights: ["Next.js", "React", "Node.js", "Spring Boot", "Playwright", "GitLab CI/CD"],
  twitterDescription: "Full Stack Engineer × SDET building enterprise systems and quality."
};

export const profile: Profile = {
  name: "Ryan Hidayat",
  headline: "Full Stack Engineer × SDET",
  role: "Full Stack Developer",
  yearsOfExperience: "5+ years",
  tagline: "Engineering the product. Engineering the confidence behind it.",
  summary:
    "Full Stack Developer with SDET background across enterprise apps, APIs, databases, automation, performance, and CI/CD.",
  location: "Jakarta, Indonesia",
  availability: "Open to Full Stack and SDET roles",
  focusAreas: [
    "Full Stack Development",
    "API and Data Workflows",
    "Quality Engineering",
    "CI/CD Delivery"
  ],
  contact: {
    email: {
      id: "email",
      label: "Email",
      value: "ryanhidayat123456789@gmail.com",
      href: "mailto:ryanhidayat123456789@gmail.com",
      isPrimary: true
    },
    linkedIn: {
      id: "linkedin",
      label: "LinkedIn",
      value: "linkedin.com/in/ryan-hi",
      href: "https://linkedin.com/in/ryan-hi",
      isPrimary: true
    },
    phone: {
      id: "phone",
      label: "Phone",
      value: "087775009393",
      href: "tel:087775009393"
    },
    github: {
      id: "github",
      label: "GitHub",
      value: "",
      href: ""
    },
    cv: {
      id: "cv",
      label: "CV",
      value: "Download CV",
      href: "/cv.pdf",
      isPrimary: true
    }
  }
};

export const education: readonly EducationCredential[] = [
  {
    institution: "Universitas Dian Nusantara",
    degree: "Bachelor of Informatics Engineering",
    period: "Mar 2020 - Jun 2024",
    gpa: "3.77/4.00",
    location: "Jakarta, Indonesia"
  }
];

export const experience: readonly ExperienceRole[] = [
  {
    id: "jasa-marga-full-stack",
    company: "PT Jasa Marga (Persero) Tbk",
    role: "Full Stack Developer",
    period: "Mar 2026 - Present",
    location: "Jakarta, Indonesia",
    responsibilities: [
      "Develop and maintain a public-safe enterprise audit monitoring platform abstraction covering findings, recommendations, action plans, evidence, due dates, status tracking, and dashboards.",
      "Build frontend modules with Next.js, React, TypeScript, Tailwind CSS, TanStack Query/Table, React Hook Form, and Zod.",
      "Develop RESTful backend services with Node.js, Express, Sequelize, relational databases, authentication, role-based access, validation, and audit logging.",
      "Support file upload, object storage, Excel import/export, notification, database model, migration, filter, pagination, and delivery workflows."
    ],
    impact: [
      "Represents the current full-stack role and the build side of Ryan's engineering profile.",
      "Connects product development, API design, data modeling, deployment workflow, and quality awareness.",
      "Keeps internal project naming and business logic abstracted for public portfolio safety."
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "TanStack Query",
      "TanStack Table",
      "React Hook Form",
      "Zod",
      "Node.js",
      "Express",
      "Sequelize",
      "PostgreSQL",
      "MySQL",
      "MinIO",
      "ExcelJS",
      "Docker",
      "GitLab CI/CD"
    ]
  },
  {
    id: "jasa-marga-sdet",
    company: "PT Jasa Marga (Persero) Tbk",
    role: "Software Development Engineer in Test (SDET)",
    period: "Jul 2025 - Feb 2026",
    location: "Jakarta, Indonesia",
    responsibilities: [
      "Established and maintained web, mobile, API, performance, and reporting automation capabilities.",
      "Built scalable automation frameworks using Playwright, WebDriverIO, Appium, and TypeScript.",
      "Integrated automation execution with Docker, GitLab Runners, GitLab CI/CD, AWS Device Farm, and Allure reporting.",
      "Conducted load and stress testing with K6 and built an SMTP bulk testing solution with Node.js and Nodemailer."
    ],
    impact: [
      "Improved regression, smoke, mobile, API, and performance validation coverage.",
      "Connected automation signals to delivery quality gates.",
      "Created public-safe proof of quality engineering and release confidence."
    ],
    technologies: [
      "Playwright",
      "WebDriverIO",
      "Appium",
      "TypeScript",
      "AWS Device Farm",
      "Docker",
      "GitLab Runner",
      "GitLab CI/CD",
      "Allure",
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
      "Performed manual testing across web, Android, and iOS platforms.",
      "Developed and maintained automation scripts using WebDriverIO and Playwright.",
      "Validated APIs with Postman and Jest and performed load and stress testing with K6.",
      "Prepared test plans, scenarios, cases, executions, defect reports, SIT, smoke, regression, and UAT activities."
    ],
    impact: [
      "Built strong product quality context before moving into SDET and full-stack development.",
      "Worked with delivery teams across requirements, testing, documentation, and release support.",
      "Validated application data through MySQL and SAP S/4HANA workflows."
    ],
    technologies: [
      "WebDriverIO",
      "Playwright",
      "Postman",
      "Jest",
      "K6",
      "Jira",
      "MySQL",
      "SAP S/4HANA"
    ]
  },
  {
    id: "adira-software-engineer",
    company: "PT Adira Finance",
    role: "Software Engineer",
    period: "Aug 2021 - Nov 2022",
    location: "Jakarta, Indonesia",
    responsibilities: [
      "Developed and maintained enterprise financial application features using Java Spring Boot and ZK Framework.",
      "Implemented REST APIs, backend services, digital document generation, and microservices-oriented improvements.",
      "Resolved production support tickets through troubleshooting, Oracle SQL validation, and data correction.",
      "Maintained SSIS packages for ETL and enterprise data integration processes."
    ],
    impact: [
      "Established Ryan's original software engineering foundation.",
      "Built backend, database, production support, and enterprise troubleshooting experience.",
      "Connected business-critical application work with reliability and maintainability concerns."
    ],
    technologies: [
      "Java",
      "Spring Boot",
      "ZK Framework",
      "REST API",
      "Microservices",
      "Oracle",
      "SQL",
      "SSIS",
      "Apache POI"
    ]
  }
];

export const projects: readonly ProjectCaseStudy[] = [
  {
    slug: "enterprise-audit-monitoring-platform",
    title: "Enterprise Audit Monitoring Platform",
    categories: ["build"],
    label: "Full Stack Enterprise Application",
    role: "Full Stack Developer",
    engineered:
      "Frontend modules, REST APIs, service/data boundaries, role-based workflows, files, reporting, and delivery support.",
    overview:
      "An enterprise monitoring platform designed to support structured audit workflows, role-based access, data management, reporting, document handling, and operational visibility.",
    status: "portfolio-safe",
    problem:
      "Enterprise audit follow-up work needs structured workflows, evidence tracking, role visibility, reporting, and operational status clarity.",
    context:
      "Public-safe abstraction of Ryan's current full-stack work. Internal names, endpoints, business rules, and infrastructure details are intentionally omitted.",
    responsibility:
      "Full Stack Developer responsible for frontend modules, backend services, data workflows, validation, role-based access, files, reporting, and delivery support.",
    architecture:
      "Next.js and React frontend communicates with Node.js and Express REST APIs backed by Sequelize and relational databases, with object storage and reporting workflows where appropriate.",
    keyCapabilities: [
      "Structured audit workflow tracking",
      "Role-based access and visibility",
      "Data management with filters and pagination",
      "Evidence and document handling",
      "Reporting, import, and export workflows",
      "Operational dashboard visibility"
    ],
    architectureLayers: [
      {
        id: "users",
        label: "Users",
        stack: "Audit users and role-based workflows",
        purpose:
          "People interact with structured audit follow-up, evidence, status, and reporting workflows."
      },
      {
        id: "frontend",
        label: "Next.js / React / TypeScript",
        stack: "Next.js, React, TypeScript, Tailwind CSS",
        purpose:
          "Frontend screens handle data-heavy workflows, forms, tables, filters, and operational visibility."
      },
      {
        id: "api",
        label: "REST API",
        stack: "HTTP routes and contract boundaries",
        purpose:
          "API contracts separate browser workflows from backend services and keep feature boundaries inspectable."
      },
      {
        id: "backend",
        label: "Node.js / Express",
        stack: "Node.js, Express",
        purpose:
          "Backend services coordinate validation, authorization, file workflows, reporting, and domain actions."
      },
      {
        id: "service",
        label: "Business / Service Layer",
        stack: "Service logic, validation, access control",
        purpose:
          "Application rules stay isolated from route handlers so workflows remain maintainable and testable."
      },
      {
        id: "orm",
        label: "Sequelize",
        stack: "Sequelize ORM",
        purpose:
          "Data access stays structured through models, query patterns, migrations, filters, and pagination."
      },
      {
        id: "database",
        label: "Relational Database",
        stack: "PostgreSQL / MySQL",
        purpose:
          "Relational storage supports audit data, status tracking, user access, evidence metadata, and reporting."
      }
    ],
    architectureBranches: [
      {
        id: "object-storage",
        label: "Document / File Storage",
        purpose:
          "Evidence and uploaded documents are handled through object-storage style workflows.",
        technologies: ["MinIO"]
      },
      {
        id: "reporting",
        label: "Reporting / Import-Export",
        purpose: "Operational reporting and data exchange use spreadsheet-oriented workflows.",
        technologies: ["ExcelJS"]
      },
      {
        id: "delivery",
        label: "Delivery",
        purpose:
          "Build and release workflows can be packaged and promoted through repeatable delivery signals.",
        technologies: ["Docker", "GitLab CI/CD"]
      }
    ],
    engineeringDecisions: [
      "Separate UI, API, service, and data-access responsibilities to keep features maintainable.",
      "Use typed forms, schema validation, table workflows, filters, pagination, and reusable data patterns.",
      "Keep portfolio claims abstracted so the project is understandable without exposing internal company logic."
    ],
    testingStrategy: [
      "Apply quality engineering background to API behavior, data validation, form workflows, and delivery checks.",
      "Use testable service boundaries and build/deploy validation where available.",
      "Avoid publishing private test data, internal cases, or production findings."
    ],
    outcome:
      "Shows Ryan's current role building enterprise full-stack software while carrying forward quality and delivery discipline.",
    lessons: [
      "Full-stack delivery benefits from understanding both product construction and failure modes.",
      "Public portfolio case studies should explain architecture and decisions without exposing confidential implementation details."
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "TanStack Query",
      "TanStack Table",
      "React Hook Form",
      "Zod",
      "Node.js",
      "Express",
      "Sequelize",
      "PostgreSQL",
      "MySQL",
      "MinIO",
      "ExcelJS",
      "Docker",
      "GitLab CI/CD"
    ]
  },
  {
    slug: "enterprise-backend-development",
    title: "Enterprise Backend Development",
    categories: ["build"],
    role: "Software Engineer",
    engineered:
      "Java Spring Boot services, REST APIs, Oracle SQL support, document generation, ETL, and production troubleshooting.",
    status: "portfolio-safe",
    problem:
      "Enterprise financial applications require reliable backend services, API communication, data integrity, document generation, and production troubleshooting.",
    context: "Public-safe abstraction of software engineering work at PT Adira Finance.",
    responsibility:
      "Software Engineer working on Java Spring Boot services, REST APIs, Oracle SQL support, microservices improvements, and ETL workflows.",
    architecture:
      "Java Spring Boot services and REST APIs supported enterprise workflows, Oracle-backed data operations, and document generation services.",
    engineeringDecisions: [
      "Use backend service boundaries to keep enterprise features maintainable.",
      "Validate data integrity before production corrections.",
      "Support integration through APIs and ETL where application workflows required it."
    ],
    testingStrategy: [
      "Troubleshoot defects through reproduction, SQL validation, and collaboration with analysts and QA.",
      "Validate production fixes carefully due to business-critical financial context."
    ],
    outcome:
      "Established Ryan's build-side foundation in backend engineering, APIs, database work, and production support.",
    lessons: [
      "Production support builds strong intuition for reliability and root-cause analysis.",
      "Backend engineering and data work inform later quality engineering decisions."
    ],
    technologies: [
      "Java",
      "Spring Boot",
      "ZK Framework",
      "REST API",
      "Oracle",
      "SQL",
      "SSIS",
      "Apache POI"
    ]
  },
  {
    slug: "ryanos-portfolio",
    title: "RyanOS Portfolio",
    categories: ["build", "devops"],
    role: "Full Stack Engineer",
    engineered:
      "Interactive Next.js workspace, typed content architecture, route handlers, terminal flows, and deterministic labs.",
    status: "portfolio-safe",
    problem:
      "A conventional resume site would not show Ryan's full-cycle engineering profile or interactive quality engineering mindset.",
    context:
      "This repository: a Next.js App Router portfolio with typed data, route handlers, simulations, terminal workflows, and component/unit tests.",
    responsibility:
      "Designed and implemented an interactive engineering workspace that balances recruiter scanning and technical exploration.",
    architecture:
      "Next.js App Router, React, TypeScript, Tailwind CSS, typed data modules, API route handlers, and deterministic simulation engines.",
    engineeringDecisions: [
      "Use feature-oriented modules so workspace, terminal, pipeline, performance, and API tools remain isolated.",
      "Keep data public-safe and typed rather than hidden in page copy.",
      "Use deterministic logic for simulations so tests stay stable."
    ],
    testingStrategy: [
      "Vitest unit tests cover data, routing, APIs, terminal commands, simulation logic, and SEO assets.",
      "React Testing Library component tests cover the main interactive panels."
    ],
    outcome:
      "Demonstrates Ryan's ability to build a portfolio product while documenting engineering decisions.",
    lessons: [
      "The portfolio itself can be evidence when its architecture, tests, and content system are inspectable.",
      "Interaction should clarify engineering judgment rather than become decoration."
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Vitest",
      "React Testing Library"
    ]
  },
  {
    slug: "enterprise-web-automation-ecosystem",
    title: "Enterprise Web Automation Ecosystem",
    categories: ["quality", "devops"],
    role: "SDET / SQA Automation",
    engineered:
      "Maintainable web automation frameworks, reusable flows, reporting outputs, Docker execution, and CI/CD quality gate signals.",
    status: "portfolio-safe",
    problem:
      "Regression and smoke testing across enterprise web workflows needed reliable automation and maintainable execution patterns.",
    context: "Public-safe abstraction of SDET and SQA automation work.",
    responsibility:
      "Designed and maintained web automation frameworks, execution flows, reports, and CI/CD quality gate integration.",
    architecture:
      "Automation suites executed through Playwright/WebDriverIO, Docker, GitLab Runner, and Allure/JUnit reporting outputs.",
    engineeringDecisions: [
      "Prefer maintainable selectors, reusable flows, and clear reporting over brittle scripts.",
      "Use CI/CD integration so automation becomes delivery signal rather than local-only evidence."
    ],
    testingStrategy: [
      "Cover smoke, regression, API-adjacent checks, and failure triage.",
      "Keep reports readable for technical and non-technical stakeholders."
    ],
    outcome: "Shows Ryan's quality engineering capability and how it supports release confidence.",
    lessons: [
      "Automation is an engineering system, not a collection of scripts.",
      "Quality signals are most useful when tied to delivery decisions."
    ],
    technologies: [
      "Playwright",
      "WebDriverIO",
      "TypeScript",
      "Docker",
      "GitLab Runner",
      "Allure",
      "JUnit"
    ]
  },
  {
    slug: "cross-platform-mobile-automation",
    title: "Cross-Platform Mobile Automation",
    categories: ["quality"],
    role: "SDET / Automation Engineer",
    engineered:
      "Appium automation coverage, platform-aware mobile abstractions, real-device execution, and actionable reporting.",
    status: "portfolio-safe",
    problem:
      "Mobile applications needed consistent automation coverage across Android and iOS device behavior.",
    context: "Public-safe abstraction of mobile testing and real-device automation work.",
    responsibility:
      "Built and maintained Appium-based automation and coordinated real-device execution workflows.",
    architecture:
      "Appium automation executed against Android and iOS targets with AWS Device Farm support.",
    engineeringDecisions: [
      "Use platform-aware capabilities while preserving shared test intent.",
      "Separate mobile locators, actions, and assertions to reduce maintenance cost."
    ],
    testingStrategy: [
      "Validate critical mobile flows, cross-platform behavior, and device execution reliability.",
      "Use reporting to make failures actionable."
    ],
    outcome: "Demonstrates quality engineering beyond web-only automation.",
    lessons: [
      "Mobile automation reliability depends on environment control and careful abstraction.",
      "Real devices expose issues emulators can miss."
    ],
    technologies: ["Appium", "TypeScript", "AWS Device Farm", "UIAutomator2", "XCUITest"]
  },
  {
    slug: "performance-load-testing",
    title: "Performance & Load Testing",
    categories: ["quality"],
    role: "SDET / Performance Engineer",
    engineered:
      "Load and stress scenarios, threshold interpretation, latency signals, error checks, and release-risk guidance.",
    status: "portfolio-safe",
    problem:
      "Systems need confidence under normal, peak, and stress conditions before release decisions.",
    context: "Public-safe abstraction of performance testing experience.",
    responsibility:
      "Designed load and stress checks, interpreted metrics, and connected threshold results to delivery risk.",
    architecture:
      "K6 and JMeter-style performance scenarios measured latency, throughput, checks, and failure thresholds.",
    engineeringDecisions: [
      "Evaluate thresholds as decision signals rather than decorative charts.",
      "Separate normal, peak, and stress scenarios so risk is easier to explain."
    ],
    testingStrategy: [
      "Measure response time, check rate, failure rate, and p95/p99 style signals where appropriate.",
      "Use repeatable scenarios to compare releases."
    ],
    outcome: "Shows performance engineering knowledge as part of full-cycle delivery.",
    lessons: [
      "Performance issues are easier to fix when measured before release pressure.",
      "Metrics need business context to become useful engineering decisions."
    ],
    technologies: ["K6", "JMeter", "Performance Testing", "Load Testing", "Stress Testing"]
  },
  {
    slug: "smtp-bulk-testing-solution",
    title: "SMTP Bulk Testing Solution",
    categories: ["quality"],
    role: "SDET",
    engineered:
      "A Node.js and Nodemailer-based test utility for validating email behavior at volume in a controlled, public-safe abstraction.",
    status: "portfolio-safe",
    problem:
      "Email workflows need confidence that messages can be generated, sent, and observed without exposing real users or production data.",
    context:
      "Public-safe abstraction of SMTP testing work. Real recipients, templates, hosts, credentials, and internal campaign details are not published.",
    responsibility:
      "Built a focused SMTP testing utility and connected the results to quality engineering investigation.",
    architecture:
      "Node.js orchestration drives Nodemailer-based SMTP checks with controlled inputs, observable outcomes, and safe reporting boundaries.",
    engineeringDecisions: [
      "Keep test input data synthetic and separate from any real user or production data.",
      "Surface send outcome and failure reason clearly enough for triage.",
      "Use a focused utility instead of hiding email behavior behind manual-only checks."
    ],
    testingStrategy: [
      "Validate configuration, message generation, send attempts, failure behavior, and repeatability.",
      "Keep SMTP credentials, real recipients, internal templates, and server details private."
    ],
    outcome:
      "Shows quality engineering work that reaches beyond browser automation into backend-adjacent workflow validation.",
    lessons: [
      "A small test utility can reduce ambiguity around integration behavior.",
      "Public examples must separate technical pattern from private operational details."
    ],
    technologies: ["Node.js", "Nodemailer", "SMTP Testing", "JavaScript"]
  },
  {
    slug: "cicd-quality-gates",
    title: "CI/CD Quality Gates",
    categories: ["devops", "quality"],
    role: "SDET / Delivery Engineer",
    engineered:
      "Pipeline checks that turn build, automation, reports, and performance results into deploy-readiness signals.",
    status: "portfolio-safe",
    problem:
      "Delivery pipelines need visible decision points so releases are not promoted from build status alone.",
    context: "Public-safe abstraction of GitLab CI/CD, runner, reporting, and quality gate work.",
    responsibility:
      "Connected automated checks, report outputs, and gate behavior into repeatable delivery workflows.",
    architecture:
      "GitLab CI/CD and GitLab Runner coordinate build, automated checks, reports, performance signals, quality gate decisions, and deployment readiness.",
    engineeringDecisions: [
      "Treat automation results as delivery signals instead of local-only artifacts.",
      "Separate build success from release confidence so risk stays visible.",
      "Keep gate decisions explicit and explainable for triage."
    ],
    testingStrategy: [
      "Validate happy path, regression failure, performance failure, blocked gate, and deploy skipped states.",
      "Use deterministic simulation in the public portfolio instead of exposing company pipeline internals."
    ],
    outcome:
      "Demonstrates delivery thinking across build, automation, quality gates, and deployment readiness.",
    lessons: [
      "A pipeline is most useful when every stage explains its release signal.",
      "Quality gates should block risk, not hide it."
    ],
    technologies: ["GitLab CI/CD", "GitLab Runner", "Docker", "Allure", "Quality Gates"]
  },
  {
    slug: "dockerized-automation-execution",
    title: "Dockerized Automation Execution",
    categories: ["devops", "quality"],
    role: "SDET / Automation Engineer",
    engineered:
      "Repeatable automation execution containers that reduce environment drift and support CI/CD runner workflows.",
    status: "portfolio-safe",
    problem:
      "Automation suites become fragile when execution depends on inconsistent local environments.",
    context:
      "Public-safe abstraction of Dockerized automation execution used for delivery and regression confidence.",
    responsibility:
      "Packaged automation execution paths so suites could run more consistently across runner-driven workflows.",
    architecture:
      "Docker packages automation dependencies and execution commands, while CI runners trigger suites and collect reporting outputs.",
    engineeringDecisions: [
      "Containerize execution dependencies to reduce machine-specific failures.",
      "Keep logs and reports accessible for triage after CI execution.",
      "Design commands so local replay and runner execution stay aligned."
    ],
    testingStrategy: [
      "Validate container build, suite command, report generation, and failure visibility.",
      "Avoid publishing internal runner hosts, registry paths, or project-specific secrets."
    ],
    outcome: "Shows delivery-oriented automation architecture instead of standalone scripts.",
    lessons: [
      "Reliable automation depends as much on execution environment as test code.",
      "Containerized workflows make failures easier to reproduce and discuss."
    ],
    technologies: ["Docker", "GitLab Runner", "Playwright", "WebDriverIO", "Allure"]
  }
];

export const skillGroups: readonly SkillGroup[] = [
  {
    id: "build",
    title: "Build Engineering",
    skills: [
      {
        name: "Frontend Applications",
        purpose:
          "Build user-facing systems with Next.js, React, TypeScript, Tailwind CSS, and data workflows.",
        relatedProjects: ["Enterprise Audit Monitoring Platform", "RyanOS Portfolio"]
      },
      {
        name: "Backend Services",
        purpose:
          "Design REST APIs and service logic with Node.js, Express, Java Spring Boot, and microservices patterns.",
        relatedProjects: ["Enterprise Audit Monitoring Platform", "Enterprise Backend Development"]
      },
      {
        name: "Forms, Tables, and Workflows",
        purpose:
          "Implement structured UI workflows with TanStack Query/Table, React Hook Form, and Zod.",
        relatedProjects: ["Enterprise Audit Monitoring Platform"]
      }
    ]
  },
  {
    id: "quality",
    title: "Quality Engineering",
    skills: [
      {
        name: "Web and API Automation",
        purpose:
          "Create maintainable automation with Playwright, WebDriverIO, Postman, Jest, and TypeScript.",
        relatedProjects: ["Enterprise Web Automation Ecosystem", "SMTP Bulk Testing Solution"]
      },
      {
        name: "Mobile Automation",
        purpose: "Validate Android and iOS behavior with Appium and AWS Device Farm execution.",
        relatedProjects: ["Cross-Platform Mobile Automation"]
      },
      {
        name: "Performance Engineering",
        purpose: "Evaluate load, stress, thresholds, and bottleneck signals with K6 and JMeter.",
        relatedProjects: ["Performance & Load Testing"]
      }
    ]
  },
  {
    id: "data",
    title: "Data Engineering Context",
    skills: [
      {
        name: "Relational Data",
        purpose:
          "Work with PostgreSQL, MySQL, Oracle, SQL, Sequelize, migrations, filters, and pagination.",
        relatedProjects: ["Enterprise Audit Monitoring Platform", "Enterprise Backend Development"]
      },
      {
        name: "Enterprise Integration",
        purpose:
          "Support ETL, SSIS, SAP S/4HANA validation, and operational data workflows where verified.",
        relatedProjects: ["Enterprise Backend Development"]
      }
    ]
  },
  {
    id: "delivery",
    title: "Delivery and CI/CD",
    skills: [
      {
        name: "CI/CD Quality Gates",
        purpose:
          "Connect build, test, report, and deploy signals through GitLab CI/CD and GitLab Runners.",
        relatedProjects: [
          "Enterprise Web Automation Ecosystem",
          "Enterprise Audit Monitoring Platform",
          "CI/CD Quality Gates"
        ]
      },
      {
        name: "Dockerized Execution",
        purpose: "Use Docker for repeatable automation and application delivery workflows.",
        relatedProjects: [
          "Enterprise Web Automation Ecosystem",
          "Enterprise Audit Monitoring Platform",
          "Dockerized Automation Execution"
        ]
      }
    ]
  }
];

export const architectureMap: ArchitectureMap = {
  nodes: [
    {
      id: "frontend",
      label: "Frontend",
      layer: "Build",
      purpose:
        "Next.js, React, and TypeScript application layers for user workflows and data-heavy screens.",
      x: 50,
      y: 8,
      relatedSkills: ["Frontend Applications", "Forms, Tables, and Workflows"],
      relatedProjects: ["Enterprise Audit Monitoring Platform", "RyanOS Portfolio"]
    },
    {
      id: "api",
      label: "REST API",
      layer: "Build",
      purpose:
        "API boundary connecting frontend workflows with backend services and data operations.",
      x: 50,
      y: 24,
      relatedSkills: ["Backend Services", "Web and API Automation"],
      relatedProjects: ["Enterprise Audit Monitoring Platform", "Enterprise Backend Development"]
    },
    {
      id: "backend",
      label: "Backend Services",
      layer: "Build",
      purpose:
        "Node.js, Express, Java Spring Boot, service logic, validation, authentication, and business workflows.",
      x: 22,
      y: 44,
      relatedSkills: ["Backend Services"],
      relatedProjects: ["Enterprise Audit Monitoring Platform", "Enterprise Backend Development"]
    },
    {
      id: "data",
      label: "Data Layer",
      layer: "Data",
      purpose:
        "Relational database, ORM, SQL, migrations, filters, pagination, object storage, and ETL context.",
      x: 50,
      y: 48,
      relatedSkills: ["Relational Data", "Enterprise Integration"],
      relatedProjects: ["Enterprise Audit Monitoring Platform", "Enterprise Backend Development"]
    },
    {
      id: "quality",
      label: "Quality Layer",
      layer: "Quality",
      purpose:
        "Automation, API checks, mobile testing, performance testing, and release confidence signals.",
      x: 78,
      y: 44,
      relatedSkills: ["Web and API Automation", "Mobile Automation", "Performance Engineering"],
      relatedProjects: [
        "Enterprise Web Automation Ecosystem",
        "Cross-Platform Mobile Automation",
        "Performance & Load Testing"
      ]
    },
    {
      id: "delivery",
      label: "CI/CD Delivery",
      layer: "Delivery",
      purpose:
        "Dockerized execution, GitLab CI/CD, GitLab Runner, reporting, quality gates, and deploy readiness.",
      x: 50,
      y: 72,
      relatedSkills: ["CI/CD Quality Gates", "Dockerized Execution"],
      relatedProjects: [
        "Enterprise Web Automation Ecosystem",
        "Enterprise Audit Monitoring Platform"
      ]
    },
    {
      id: "production",
      label: "Production Readiness",
      layer: "Delivery",
      purpose:
        "Release decisions shaped by build output, data integrity, automation results, and performance signals.",
      x: 50,
      y: 90,
      relatedSkills: ["CI/CD Quality Gates", "Performance Engineering"],
      relatedProjects: ["Enterprise Audit Monitoring Platform", "Performance & Load Testing"]
    }
  ],
  edges: [
    { id: "frontend-api", source: "frontend", target: "api", label: "calls" },
    { id: "api-backend", source: "api", target: "backend", label: "routes" },
    { id: "api-data", source: "api", target: "data", label: "persists" },
    { id: "backend-data", source: "backend", target: "data", label: "models" },
    { id: "quality-api", source: "quality", target: "api", label: "validates" },
    { id: "quality-delivery", source: "quality", target: "delivery", label: "signals" },
    { id: "data-delivery", source: "data", target: "delivery", label: "migrations" },
    { id: "delivery-production", source: "delivery", target: "production", label: "promotes" }
  ]
};

export const architecturePresets: readonly ArchitecturePreset[] = [
  {
    id: "full-stack-application",
    title: "Full Stack Application",
    description:
      "A public-safe application path from browser workflow through frontend, API, service logic, ORM, and database.",
    nodes: [
      {
        id: "browser",
        label: "Browser",
        layer: "User Interface",
        purpose:
          "Where users interact with forms, tables, filters, status views, and operational workflows.",
        x: 50,
        y: 8,
        relatedSkills: ["Frontend Applications", "Forms, Tables, and Workflows"],
        relatedProjects: ["Enterprise Audit Monitoring Platform", "RyanOS Portfolio"]
      },
      {
        id: "nextjs",
        label: "Next.js",
        layer: "Frontend",
        purpose:
          "Ryan builds React and TypeScript application layers that organize user journeys, server/client boundaries, and data-heavy screens.",
        x: 50,
        y: 23,
        relatedSkills: ["Frontend Applications"],
        relatedProjects: ["Enterprise Audit Monitoring Platform", "RyanOS Portfolio"]
      },
      {
        id: "rest-api",
        label: "REST API",
        layer: "Contract",
        purpose:
          "API contracts separate browser behavior from backend services so workflows stay testable and maintainable.",
        x: 50,
        y: 38,
        relatedSkills: ["Backend Services", "Web and API Automation"],
        relatedProjects: ["Enterprise Audit Monitoring Platform", "Enterprise Backend Development"]
      },
      {
        id: "express",
        label: "Express",
        layer: "Backend",
        purpose:
          "Node.js and Express routes coordinate request handling, validation, access control, and backend orchestration.",
        x: 31,
        y: 55,
        relatedSkills: ["Backend Services"],
        relatedProjects: ["Enterprise Audit Monitoring Platform"]
      },
      {
        id: "service-layer",
        label: "Service Layer",
        layer: "Backend",
        purpose:
          "Business rules and workflow logic stay isolated from route handlers so changes remain safer to reason about.",
        x: 69,
        y: 55,
        relatedSkills: ["Backend Services", "Relational Data"],
        relatedProjects: ["Enterprise Audit Monitoring Platform", "Enterprise Backend Development"]
      },
      {
        id: "sequelize",
        label: "Sequelize",
        layer: "Data Access",
        purpose:
          "ORM models, query patterns, filters, pagination, and migrations provide a structured database boundary.",
        x: 50,
        y: 73,
        relatedSkills: ["Relational Data"],
        relatedProjects: ["Enterprise Audit Monitoring Platform"]
      },
      {
        id: "database",
        label: "Database",
        layer: "Data",
        purpose:
          "Relational data stores support application records, access rules, status tracking, and reporting workflows.",
        x: 50,
        y: 90,
        relatedSkills: ["Relational Data", "Enterprise Integration"],
        relatedProjects: ["Enterprise Audit Monitoring Platform", "Enterprise Backend Development"]
      }
    ],
    edges: [
      { id: "browser-nextjs", source: "browser", target: "nextjs", label: "uses" },
      { id: "nextjs-rest-api", source: "nextjs", target: "rest-api", label: "calls" },
      { id: "rest-api-express", source: "rest-api", target: "express", label: "routes" },
      {
        id: "express-service-layer",
        source: "express",
        target: "service-layer",
        label: "delegates"
      },
      {
        id: "service-layer-sequelize",
        source: "service-layer",
        target: "sequelize",
        label: "models"
      },
      { id: "sequelize-database", source: "sequelize", target: "database", label: "persists" }
    ]
  },
  {
    id: "quality-engineering",
    title: "Quality Engineering",
    description:
      "A safe quality engineering topology showing how web, mobile, API, and performance signals become release confidence.",
    nodes: [
      {
        id: "targets",
        label: "Web / Mobile / API",
        layer: "Targets",
        purpose:
          "Ryan validates browser, mobile, API, and backend-adjacent workflows through appropriate automation and checks.",
        x: 50,
        y: 10,
        relatedSkills: ["Web and API Automation", "Mobile Automation"],
        relatedProjects: [
          "Enterprise Web Automation Ecosystem",
          "Cross-Platform Mobile Automation",
          "SMTP Bulk Testing Solution"
        ]
      },
      {
        id: "automation-layer",
        label: "Automation Layer",
        layer: "Framework",
        purpose:
          "Reusable flows, selectors, API helpers, mobile abstractions, and test data boundaries keep suites maintainable.",
        x: 50,
        y: 27,
        relatedSkills: ["Web and API Automation", "Mobile Automation"],
        relatedProjects: ["Enterprise Web Automation Ecosystem", "Cross-Platform Mobile Automation"]
      },
      {
        id: "test-execution",
        label: "Test Execution",
        layer: "Execution",
        purpose:
          "Local, Dockerized, runner-driven, and real-device execution paths help make quality checks repeatable.",
        x: 35,
        y: 47,
        relatedSkills: ["Dockerized Execution", "CI/CD Quality Gates"],
        relatedProjects: ["Dockerized Automation Execution", "Cross-Platform Mobile Automation"]
      },
      {
        id: "performance-signal",
        label: "Performance Signal",
        layer: "Performance",
        purpose:
          "Load, stress, latency, error rate, and threshold checks show risk before release pressure.",
        x: 65,
        y: 47,
        relatedSkills: ["Performance Engineering"],
        relatedProjects: ["Performance & Load Testing"]
      },
      {
        id: "results",
        label: "Results",
        layer: "Evidence",
        purpose:
          "Reports and logs convert execution outcomes into readable evidence for engineers and stakeholders.",
        x: 35,
        y: 67,
        relatedSkills: ["Web and API Automation", "CI/CD Quality Gates"],
        relatedProjects: ["Enterprise Web Automation Ecosystem", "CI/CD Quality Gates"]
      },
      {
        id: "allure",
        label: "Allure",
        layer: "Reporting",
        purpose:
          "Readable test reports help diagnose failures and make automation output useful outside the runner.",
        x: 65,
        y: 67,
        relatedSkills: ["Web and API Automation", "Dockerized Execution"],
        relatedProjects: ["Enterprise Web Automation Ecosystem", "Dockerized Automation Execution"]
      },
      {
        id: "quality-gate",
        label: "Quality Gate",
        layer: "Decision",
        purpose:
          "Build, automation, performance, and report signals become an explicit release decision instead of a hidden risk.",
        x: 50,
        y: 88,
        relatedSkills: ["CI/CD Quality Gates", "Performance Engineering"],
        relatedProjects: ["CI/CD Quality Gates", "Performance & Load Testing"]
      }
    ],
    edges: [
      {
        id: "targets-automation-layer",
        source: "targets",
        target: "automation-layer",
        label: "covered by"
      },
      {
        id: "automation-layer-test-execution",
        source: "automation-layer",
        target: "test-execution",
        label: "runs"
      },
      {
        id: "test-execution-results",
        source: "test-execution",
        target: "results",
        label: "emits"
      },
      { id: "results-allure", source: "results", target: "allure", label: "reports" },
      {
        id: "test-execution-performance-signal",
        source: "test-execution",
        target: "performance-signal",
        label: "pairs with"
      },
      {
        id: "performance-signal-quality-gate",
        source: "performance-signal",
        target: "quality-gate",
        label: "blocks risk"
      },
      {
        id: "allure-quality-gate",
        source: "allure",
        target: "quality-gate",
        label: "informs"
      }
    ]
  },
  {
    id: "cicd-delivery",
    title: "CI/CD Delivery",
    description:
      "A delivery lifecycle showing how source changes move through build, Docker, automated checks, performance signals, gates, and deployment readiness.",
    nodes: [
      {
        id: "gitlab",
        label: "GitLab",
        layer: "Source",
        purpose:
          "Source changes and merge activity trigger delivery workflows without exposing private repository or runner details.",
        x: 50,
        y: 8,
        relatedSkills: ["CI/CD Quality Gates"],
        relatedProjects: ["CI/CD Quality Gates", "RyanOS Portfolio"]
      },
      {
        id: "build",
        label: "Build",
        layer: "Package",
        purpose:
          "Application and automation artifacts are prepared before deeper release confidence checks run.",
        x: 50,
        y: 23,
        relatedSkills: ["CI/CD Quality Gates"],
        relatedProjects: ["CI/CD Quality Gates", "Enterprise Audit Monitoring Platform"]
      },
      {
        id: "docker",
        label: "Docker",
        layer: "Execution",
        purpose:
          "Containerized execution reduces environment drift for automation and delivery workflows.",
        x: 50,
        y: 38,
        relatedSkills: ["Dockerized Execution"],
        relatedProjects: ["Dockerized Automation Execution", "Enterprise Web Automation Ecosystem"]
      },
      {
        id: "automated-tests",
        label: "Automated Tests",
        layer: "Quality",
        purpose:
          "Regression, smoke, API-adjacent, and mobile signals help separate build success from release confidence.",
        x: 32,
        y: 57,
        relatedSkills: ["Web and API Automation", "Mobile Automation"],
        relatedProjects: ["Enterprise Web Automation Ecosystem", "Cross-Platform Mobile Automation"]
      },
      {
        id: "performance",
        label: "Performance",
        layer: "Quality",
        purpose:
          "Threshold and latency signals make performance risk visible before deployment decisions.",
        x: 68,
        y: 57,
        relatedSkills: ["Performance Engineering"],
        relatedProjects: ["Performance & Load Testing"]
      },
      {
        id: "delivery-gate",
        label: "Quality Gate",
        layer: "Decision",
        purpose:
          "Release promotion should wait for build, automation, and performance signals to agree.",
        x: 50,
        y: 76,
        relatedSkills: ["CI/CD Quality Gates"],
        relatedProjects: ["CI/CD Quality Gates"]
      },
      {
        id: "deploy",
        label: "Deploy",
        layer: "Release",
        purpose:
          "Deployment readiness is represented as a public-safe decision state, not a live company production pipeline.",
        x: 50,
        y: 91,
        relatedSkills: ["CI/CD Quality Gates", "Dockerized Execution"],
        relatedProjects: ["CI/CD Quality Gates", "Dockerized Automation Execution"]
      }
    ],
    edges: [
      { id: "gitlab-build", source: "gitlab", target: "build", label: "triggers" },
      { id: "build-docker", source: "build", target: "docker", label: "packages" },
      {
        id: "docker-automated-tests",
        source: "docker",
        target: "automated-tests",
        label: "runs"
      },
      {
        id: "docker-performance",
        source: "docker",
        target: "performance",
        label: "checks"
      },
      {
        id: "automated-tests-delivery-gate",
        source: "automated-tests",
        target: "delivery-gate",
        label: "signals"
      },
      {
        id: "performance-delivery-gate",
        source: "performance",
        target: "delivery-gate",
        label: "thresholds"
      },
      { id: "delivery-gate-deploy", source: "delivery-gate", target: "deploy", label: "allows" }
    ]
  }
];

export const apiEndpoints: readonly ApiEndpointDefinition[] = [
  {
    method: "GET",
    path: "/api/ryan",
    title: "Profile",
    description: "Public-safe profile summary for the portfolio owner.",
    responseShape: [
      "name",
      "role",
      "headline",
      "yearsOfExperience",
      "tagline",
      "location",
      "focus"
    ],
    relatedSkills: ["Full Stack Development", "Quality Engineering"]
  },
  {
    method: "GET",
    path: "/api/skills",
    title: "Skills",
    description: "Grouped build, quality, data, and delivery skill metadata.",
    responseShape: [
      "skillGroups[].title",
      "skillGroups[].skills[].name",
      "skillGroups[].skills[].purpose"
    ],
    relatedSkills: ["Build Engineering", "Quality Engineering", "Data", "Delivery"]
  },
  {
    method: "GET",
    path: "/api/projects",
    title: "Projects",
    description: "Portfolio-safe engineering case studies and work highlights.",
    responseShape: ["projects[].title", "projects[].problem", "projects[].technologies"],
    relatedSkills: ["Case Studies", "Architecture"]
  },
  {
    method: "GET",
    path: "/api/experience",
    title: "Experience",
    description: "Career timeline from Software Engineer through Full Stack Developer.",
    responseShape: ["experience[].role", "experience[].period", "experience[].summary"],
    relatedSkills: ["Career Evolution", "Full Cycle"]
  },
  {
    method: "GET",
    path: "/api/architecture",
    title: "Architecture",
    description: "Public-safe architecture presets for build, quality, and delivery exploration.",
    responseShape: [
      "defaultPresetId",
      "architecture[].title",
      "architecture[].nodes[].label",
      "architecture[].edges[].label"
    ],
    relatedSkills: ["Full Stack Architecture", "Quality Engineering", "CI/CD Delivery"]
  },
  {
    method: "GET",
    path: "/api/career",
    title: "Career",
    description:
      "Condensed career journey from Software Engineer to current Full Stack Developer role.",
    responseShape: ["journey[]", "currentRole", "engineeringProfile", "currentCompany"],
    relatedSkills: ["Career Evolution", "Full Stack Engineer", "SDET"]
  },
  {
    method: "GET",
    path: "/api/contact",
    title: "Contact",
    description: "Configured public contact links and CV download.",
    responseShape: ["contact[].id", "contact[].href", "contact[].value"],
    relatedSkills: ["Recruiter Workflow"]
  }
];

export const pipelinePanelMetadata: PipelinePanelMetadata = {
  eyebrow: "delivery.demo",
  title: "Software Delivery Pipeline",
  description:
    "Simulation only. Shows how build, integration, E2E, performance, and quality gate signals shape deploy readiness.",
  stack: ["GitLab CI/CD", "GitLab Runners", "Docker", "Quality Gates"],
  flow: [
    "Commit",
    "Build",
    "Unit Test",
    "Integration",
    "E2E Automation",
    "Performance Check",
    "Quality Gate",
    "Deploy"
  ]
};

export const challengeScenarios: readonly ChallengeScenario[] = [
  {
    id: "full-stack-data-flow",
    title: "Full-Stack Data Flow",
    domain: "Build",
    difficulty: "intermediate",
    prompt:
      "A dashboard becomes slow after new filtering and pagination requirements. What should be checked first?",
    metrics: ["API latency", "query shape", "frontend cache", "pagination strategy"],
    choices: [
      {
        id: "rewrite-ui",
        label: "Rewrite the whole dashboard UI",
        isPreferred: false,
        feedback:
          "Possible later, but first confirm whether delay comes from API, query, or state handling."
      },
      {
        id: "trace-flow",
        label: "Trace frontend, API, and database timing",
        isPreferred: true,
        feedback: "Best first move. The workflow crosses UI, API, and data layers."
      },
      {
        id: "add-index-randomly",
        label: "Add indexes without checking query behavior",
        isPreferred: false,
        feedback: "Indexes may help, but guessing can create new write or maintenance costs."
      }
    ],
    approach: [
      "Measure frontend render and request timing.",
      "Check API controller, service, and query behavior.",
      "Validate pagination, filters, joins, and response shape before optimizing."
    ]
  },
  {
    id: "quality-gate-release",
    title: "Quality Gate Decision",
    domain: "Delivery",
    difficulty: "advanced",
    prompt:
      "A release passes build but has automation failures and weak performance signals. What should happen?",
    metrics: ["build status", "automation result", "performance threshold", "risk level"],
    choices: [
      {
        id: "deploy-anyway",
        label: "Deploy because build passed",
        isPreferred: false,
        feedback:
          "Build success is useful, not enough. Quality and performance signals still matter."
      },
      {
        id: "block-and-diagnose",
        label: "Block release and diagnose failing signals",
        isPreferred: true,
        feedback: "Best path. Delivery confidence needs build, quality, and performance evidence."
      },
      {
        id: "delete-tests",
        label: "Delete failing checks from pipeline",
        isPreferred: false,
        feedback: "That removes evidence rather than reducing risk."
      }
    ],
    approach: [
      "Confirm failures are valid and reproducible.",
      "Classify product risk from automation and performance signals.",
      "Fix root cause or explicitly document release risk before promotion."
    ]
  },
  {
    id: "api-contract-change",
    title: "API Contract Change",
    domain: "Build + Quality",
    difficulty: "intermediate",
    prompt:
      "Backend response shape changes and frontend forms begin failing. How should a full-cycle engineer respond?",
    metrics: ["contract shape", "validation schema", "form errors", "test coverage"],
    choices: [
      {
        id: "patch-client-only",
        label: "Patch only the frontend",
        isPreferred: false,
        feedback: "May unblock UI, but contract and validation should be clarified too."
      },
      {
        id: "align-contract",
        label: "Align API, validation, UI state, and tests",
        isPreferred: true,
        feedback: "Best path. The failure crosses API, schema, UI, and quality layers."
      },
      {
        id: "ignore-validation",
        label: "Disable validation",
        isPreferred: false,
        feedback: "That hides invalid data and weakens reliability."
      }
    ],
    approach: [
      "Compare old and new API contract.",
      "Update schema validation and form mapping.",
      "Add a focused test for the changed workflow."
    ]
  }
];
