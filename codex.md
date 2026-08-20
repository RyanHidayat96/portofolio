# RyanOS Portfolio Revamp --- Codex Master Plan

## How Codex Must Use This File

This file is the **single source of truth** for the RyanOS portfolio
redesign.

There are multiple sequential steps in this one file. Do **not** create
a new planning Markdown file for each step.

### Execution protocol

When the user initially asks you to execute this file:

1.  Read this entire `codex.md` before editing code.
2.  Inspect the repository.
3.  Determine the current step from `## Progress Tracker`.
4.  Execute **ONLY the first incomplete step**.
5.  Complete all acceptance criteria and validation for that step.
6.  Update the Progress Tracker in this same file.
7.  Stop.

When the user's next message is exactly or essentially:

```text
next
```

you must:

1.  Re-read `codex.md`.
2.  Read the Progress Tracker.
3.  Review the code produced by previous steps.
4.  Execute **ONLY the next incomplete step**.
5.  Validate it.
6.  Update the Progress Tracker.
7.  Stop again.

Never interpret `next` as permission to execute every remaining step.

If a step is already complete, do not redo it unless its implementation
is broken.

If implementation reality conflicts with this plan, prefer a technically
sound implementation, document the reason in the Progress Tracker, and
preserve the intended product outcome.

---

# Progress Tracker

Codex owns this section while implementing the plan.

Use exactly these states:

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed
- `[!]` Blocked

Initial state:

- [x] STEP 1 --- Repository Audit & Engineering Foundation
- [x] STEP 2 --- RyanOS Shell, Boot Experience & New Hero
- [x] STEP 3 --- Recruiter Mode & Engineer Mode
- [x] STEP 4 --- Full-Cycle Engineering Experience
- [x] STEP 5 --- Career Evolution & Capability Matrix
- [x] STEP 6 --- Flagship Full Stack Case Study
- [x] STEP 7 --- Projects, Architecture Explorer & Engineering Labs
- [x] STEP 8 --- Terminal, Command Palette & RyanOS Interactions
- [x] STEP 9 --- Visual Polish, Motion, Responsive Design &
      Accessibility
- [x] STEP 10 --- SEO, Performance, Tests & Final Production QA

After completing a step, add a short log below this line:

```text
### Implementation Log

STEP X
Status:
Summary:
Important files changed:
Validation:
Notes for next step:
```

Do not delete previous log entries.

### Implementation Log

STEP 1
Status: Completed
Summary: Audited the RyanOS architecture, replaced env-backed public portfolio CMS data with typed canonical modules, corrected the Full Stack Developer / SDET chronology, and added engineering domains plus full-cycle nodes.
Important files changed: docs/portfolio-revamp-audit.md; src/data/portfolio-content.ts; src/data/capabilities.ts; src/data/types.ts; src/data/*.ts; tests/unit/portfolio-data.test.ts; tests/unit/workspace-routing.test.ts; README.md; .env.example; public/cv.pdf
Validation: npm run format; npm run lint; npm run typecheck; npm test; npm run build
Notes for next step: Step 2 should evolve hero/boot copy and first-screen hierarchy using canonical data, without reintroducing env CMS content. User requested future steps avoid test runs unless explicitly requested.

STEP 2
Status: Completed
Summary: Reworked first-screen RyanOS positioning around Full-Cycle Engineering Workspace, Ryan Hidayat, Full Stack Engineer × SDET, stable Explore RyanOS CTA, Recruiter Mode entry, CV/LinkedIn links, compact CLI identity, and faster full-cycle boot sequence.
Important files changed: src/features/workspace/components/Landing.tsx; src/features/workspace/components/BootSequence.tsx; src/features/workspace/components/RyanOSApp.tsx; src/features/workspace/navigation.ts; src/data/portfolio-content.ts; tests/component/ryanos-app-mode.test.tsx; tests/component/command-palette.test.tsx
Validation: Not run per owner request to skip tests/slow validation for future steps. Performed lightweight source scan and targeted formatting only.
Notes for next step: Step 3 should build true Recruiter Mode and Engineer Mode paths on top of the new hero entry points without changing the verified career data.

STEP 3
Status: Completed
Summary: Created distinct Recruiter Mode and Engineer Mode paths. Recruiter Mode now gives a 60-second scan with identity, current role, career evolution, featured work, core capabilities, and contact. Engineer Mode now opens a deeper RyanOS workbench with full-cycle preview, architecture, projects, API, quality, performance, delivery, terminal, and challenge entry points.
Important files changed: src/features/workspace/components/OverviewPanel.tsx; src/features/workspace/components/WorkspaceShell.tsx; src/features/workspace/components/RyanOSApp.tsx; src/features/workspace/navigation.ts; tests/component/ryanos-app-mode.test.tsx; tests/component/command-palette.test.tsx
Validation: Not run per owner request to skip tests/slow validation. Performed targeted formatting, source scan, and git diff whitespace check only.
Notes for next step: Step 4 should turn the full-cycle preview data into the signature interactive lifecycle with Build / Quality / Full Cycle switching.

STEP 4
Status: Completed
Summary: Added the signature Full-Cycle Engineering experience with Build / Quality / Full Cycle mode tabs, keyboard-accessible node selection, desktop graph, mobile vertical lifecycle, active evidence panel, verified technologies, related roles, related projects, and reduced-motion-safe data-flow styling.
Important files changed: src/features/workspace/components/FullCycleExperience.tsx; src/features/workspace/components/OverviewPanel.tsx; src/app/globals.css
Validation: Not run per owner request to skip tests/slow validation. Performed targeted formatting, source scan, and git diff whitespace check only.
Notes for next step: Step 5 should turn the verified career timeline into a stronger evolution story and capability matrix without changing the canonical dates.

STEP 5
Status: Completed
Summary: Added a career evolution timeline, grounded cross-domain story, explicit Jasa Marga SDET-to-Full-Stack role evolution, progressive role evidence, and an Engineering Capability Matrix for Build, Quality, Data, and Delivery using canonical data.
Important files changed: src/features/workspace/components/CareerEvolution.tsx; src/features/workspace/components/CapabilityMatrix.tsx; src/features/workspace/components/ExperiencePanel.tsx; src/features/workspace/components/ProfilePanel.tsx; src/features/workspace/navigation.ts
Validation: Not run per owner request to skip tests/slow validation. Performed targeted formatting, source scan, ASCII scan, and git diff whitespace check only.
Notes for next step: Step 6 should build the Enterprise Audit Monitoring Platform flagship case study using only public-safe and verified details.

STEP 6
Status: Completed
Summary: Built the Enterprise Audit Monitoring Platform as the flagship full-stack case study with public-safe overview, problem, role, key capabilities, interactive architecture layers, verified branches, engineering decisions, quality strategy, tech stack, outcome, lessons, and an Explore Architecture action.
Important files changed: src/data/types.ts; src/data/portfolio-content.ts; src/features/workspace/components/FlagshipCaseStudy.tsx; src/features/workspace/components/ProjectsPanel.tsx; src/features/workspace/components/RyanOSApp.tsx; src/features/workspace/components/OverviewPanel.tsx
Validation: Not run per owner request to skip tests/slow validation. Performed targeted formatting, package script inspection, source scan, public-safety keyword scan, verified-stack scan, and git diff whitespace check only.
Notes for next step: Step 7 should balance the Projects, Architecture Explorer, API Playground, Pipeline Simulator, and labs around Build, Quality, and Delivery taxonomy.

STEP 7
Status: Completed
Summary: Balanced projects around Build, Quality, and DevOps taxonomy; added public-safe quality/delivery projects; evolved Architecture Explorer into Full Stack Application, Quality Engineering, and CI/CD Delivery presets; added safe /api/architecture and /api/career route handlers; repositioned API Playground, Pipeline Simulator, Automation Lab, and Performance Lab around full-cycle engineering evidence.
Important files changed: src/data/types.ts; src/data/portfolio-content.ts; src/data/capabilities.ts; src/data/architecture.ts; src/app/api/architecture/route.ts; src/app/api/career/route.ts; src/features/workspace/components/ProjectsPanel.tsx; src/features/architecture/components/ArchitectureExplorer.tsx; src/features/api-playground/components/ApiPlayground.tsx; src/features/pipeline/domain/pipeline.ts; src/features/pipeline/components/PipelineSimulatorPanel.tsx; src/features/performance-lab/components/PerformanceLab.tsx; src/features/automation-lab/components/AutomationLab.tsx
Validation: Not run per owner request to skip tests/slow validation. Performed targeted formatting, package script inspection, project category scan, route/preset scan, stale-label scan, public-safety keyword scan, and git diff whitespace check only.
Notes for next step: Step 8 should wire Terminal and Command Palette to the updated canonical project, career, architecture, CV, contact, build, and quality data without duplicating stale strings.

STEP 8
Status: Completed
Summary: Reworked RyanOS Terminal into useful navigation/storytelling commands with whoami, career, experience, projects, stack, build, quality, architecture, contact, cv, clear, help, history, and existing lab commands. Command Palette now supports quick actions for Recruiter Mode, Engineer Mode, Full Cycle, current role, flagship project, architecture, terminal, CV, LinkedIn, and contact, with action-level navigation, project deep linking, mode switching, and safe link opening.
Important files changed: src/features/terminal/domain/types.ts; src/features/terminal/domain/commands.ts; src/features/terminal/components/TerminalPanel.tsx; src/features/workspace/navigation.ts; src/features/workspace/components/CommandPalette.tsx; src/features/workspace/components/RyanOSApp.tsx; tests/unit/terminal.test.ts; tests/component/terminal-panel.test.tsx; tests/component/command-palette.test.tsx; tests/unit/simulation.test.ts
Validation: Not run per owner request to skip tests/slow validation. Performed targeted formatting, package script inspection, terminal command scan, palette action scan, stale-string scan, and git diff whitespace check only.
Notes for next step: Step 9 should polish visual system, motion, responsive behavior, and accessibility around the now-functional terminal and command palette interactions.

STEP 9
Status: Completed
Summary: Added semantic visual tokens for radius, shadows, focus, touch targets, text surfaces, and deep backgrounds; normalized Button, Badge, and Panel primitives; added skip link and stronger focus treatment; improved mobile shell controls, command palette sheet behavior, terminal height/wrapping, architecture mobile fallback, architecture preset keyboard navigation, and reduced-motion-safe palette animation.
Important files changed: src/app/globals.css; src/components/ui/Button.tsx; src/components/ui/Badge.tsx; src/components/ui/Panel.tsx; src/features/workspace/components/WorkspaceShell.tsx; src/features/workspace/components/CommandPalette.tsx; src/features/terminal/components/TerminalPanel.tsx; src/features/architecture/components/ArchitectureExplorer.tsx; src/features/workspace/components/FullCycleExperience.tsx; src/features/workspace/components/ProjectsPanel.tsx; src/features/workspace/components/BootSequence.tsx; src/features/workspace/components/Landing.tsx
Validation: Not run per owner request to skip tests/slow validation. Performed targeted formatting, package script inspection, arbitrary-class risk scan, focus/reduced-motion scan, ARIA role scan, mobile-layout scan, stale-string scan, and git diff whitespace check only.
Notes for next step: Step 10 should finish SEO, performance, tests, content QA, public-safety QA, and production validation if owner permits running the slow commands.

STEP 10
Status: Completed
Summary: Finalized canonical Full Stack Engineer × SDET SEO metadata, added a web manifest route, aligned OpenGraph/Twitter/JSON-LD around verified current-role data, kept sitemap/robots centralized through NEXT_PUBLIC_SITE_URL, reduced repeated project-filter work, clarified production deployment guidance, and expanded source test coverage for SEO assets plus architecture/career API contracts.
Important files changed: src/data/portfolio-content.ts; src/config/site.ts; src/app/layout.tsx; src/app/manifest.ts; src/config/structured-data.ts; src/features/workspace/components/ProjectsPanel.tsx; README.md; tests/unit/seo-assets.test.ts; tests/unit/api-contracts.test.ts
Validation: Not run per owner request to skip tests/slow validation. Performed targeted formatting; Next manifest type source-read; SEO canonical scan; stale-positioning scan; public-safety scan; and git diff whitespace check only.
Notes for next step: Portfolio revamp plan complete. Before production launch, owner can run npm run typecheck, npm run lint, npm run test, and npm run build when ready.

---

# Product Vision

The current portfolio has a strong interactive **RyanOS** identity, but
its positioning is too heavily centered on SDET / QA Automation.

The redesigned portfolio must position:

```text
RYAN HIDAYAT
FULL STACK ENGINEER × SDET
```

RyanOS should evolve from:

```text
SDET Workspace
```

into:

```text
Full-Cycle Engineering Workspace
```

The portfolio should communicate a rare combination:

```text
BUILD SOFTWARE
      ×
ENGINEER SOFTWARE QUALITY
```

The visitor should understand that Ryan has professional experience
across:

```text
Software Engineering
        ↓
SQA Manual & Automation
        ↓
SDET
        ↓
Full Stack Development
```

The intended recruiter reaction is:

1.  "This person is not only a tester."
2.  "He understands how software is built."
3.  "He understands how software fails."
4.  "He understands delivery and quality."
5.  "I want to interview him."

Do this through evidence, architecture, projects, interactions, and
career progression---not exaggerated claims.

---

# Canonical Professional Information

## Identity

```text
Ryan Hidayat
Full Stack Engineer × SDET
Jakarta, Indonesia
```

Primary headline:

```text
I build systems.
I engineer confidence.
```

Supporting line:

```text
Engineering the product.
Engineering the confidence behind it.
```

Portfolio:

```text
https://ryanhidayat.vercel.app/
```

Use existing verified email, LinkedIn, and CV contact information from
the repository/CV.

---

# Canonical Career Timeline

## PT Adira Finance

```text
Software Engineer
Aug 2021 – Nov 2022
Jakarta, Indonesia
```

Core themes:

- Java
- Spring Boot
- ZK Framework
- REST API
- microservices
- Oracle
- SQL
- SSIS
- enterprise financial applications
- production support
- troubleshooting
- backend development

## PT Astra International Tbk

```text
SQA Manual & Automation
Dec 2022 – Jun 2025
Jakarta, Indonesia
```

Core themes:

- manual testing
- WebDriverIO
- Playwright
- Postman
- Jest
- K6
- Jira
- MySQL
- SAP S/4HANA
- SIT
- smoke testing
- regression
- UAT

## PT Jasa Marga (Persero) Tbk --- SDET

```text
Software Development Engineer in Test (SDET)
Jul 2025 – Feb 2026
Jakarta, Indonesia
```

Core themes:

- Playwright
- WebDriverIO
- Appium
- TypeScript
- AWS Device Farm
- Docker
- GitLab Runner
- GitLab CI/CD
- Allure
- K6
- quality gates
- automation architecture
- SMTP testing

The SDET role MUST end in February 2026.

## PT Jasa Marga (Persero) Tbk --- Full Stack

```text
Full Stack Developer
Mar 2026 – Present
Jakarta, Indonesia
```

Represent this as a role evolution within the same company where the
design permits:

```text
PT JASA MARGA (PERSERO) TBK

Jul 2025 ───────── Feb 2026
SDET

           ROLE EVOLUTION
                 ↓

Mar 2026 ───────── Present
Full Stack Developer
```

Do not imply both roles are simultaneously current.

---

# Public Portfolio Safety Rules

This is a public website.

Never expose:

- credentials
- API keys
- secrets
- internal URLs
- private endpoints
- database credentials
- production hostnames
- employee/customer information
- actual audit findings
- internal documents
- proprietary business logic
- confidential workflow names
- company source code
- sensitive screenshots
- non-public infrastructure details

Internal projects must be converted into safe engineering abstractions.

When describing the current full-stack project, use the public-safe
name:

```text
Enterprise Audit Monitoring Platform
```

Do not expose confidential internal naming unless it is already
explicitly approved for public use.

---

# Global Engineering Rules

Apply these rules throughout all steps.

## Preserve RyanOS

Do not replace the website with a generic portfolio template.

Keep and evolve useful concepts such as:

- OS/workspace shell
- Terminal
- Command Palette
- API Playground
- Architecture Explorer
- Pipeline Simulator
- Performance Lab
- engineering challenges
- system/status interactions

## Avoid Generic Portfolio Design

Do not build:

- generic gradient landing pages
- giant technology-logo clouds
- arbitrary skill percentages
- excessive glassmorphism
- endless generic cards
- meaningless animations
- Matrix rain
- excessive cyberpunk decoration
- huge glowing blobs
- animation that slows recruiters down

## Visual Philosophy

Aim for:

```text
Premium Engineering Workstation
×
Modern Operating System
×
Observability Dashboard
```

Dark RyanOS identity.

Use a restrained visual system:

- very dark navy/black foundation
- subtle cyan primary accent
- restrained violet secondary accent
- green primarily for success/status
- clean sans-serif for reading
- monospace for CLI/system information
- subtle grids and system lines
- controlled glow
- strong information hierarchy

Do not sacrifice readability for style.

## Engineering Quality

Prefer:

- reusable components
- strong TypeScript
- semantic HTML
- accessible interactions
- minimal dependencies
- server/client boundaries appropriate for Next.js
- good performance
- maintainable content architecture

Do not introduce large libraries for effects that CSS/SVG can handle.

## Validation

At the end of every step inspect `package.json` and run the applicable
equivalents of:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Fix failures introduced by the current step.

Do not delete tests to make validation pass.

If a failure existed before the step and is unrelated, document it.

---

# STEP 1 --- Repository Audit & Engineering Foundation

## Goal

Understand the current RyanOS implementation and establish clean,
verified data architecture before the major UI redesign.

Do not perform the major visual redesign in this step.

## 1.1 Audit the Repository

Inspect:

- Next.js version and routing architecture
- layouts
- pages
- component hierarchy
- styles
- fonts
- state management
- animation dependencies
- portfolio data
- `.env` usage
- metadata
- tests
- API routes
- interactive RyanOS components

Find the implementation for:

- Hero
- Terminal
- Command Palette
- Architecture Explorer
- API Playground
- Pipeline Simulator
- Performance Lab
- Skills
- Experience
- Projects
- navigation
- footer
- SEO

## 1.2 Create Audit Documentation

Create:

```text
docs/portfolio-revamp-audit.md
```

Document:

### Architecture

Current framework and component/data architecture.

### RyanOS Feature Inventory

For every major feature classify:

```text
KEEP
EVOLVE
REFACTOR
REMOVE
```

Explain why.

### SDET-Only Positioning Audit

Search all visible and non-visible content for:

```text
SDET
QA Automation
Software Quality Assurance
Test Engineer
```

Identify locations that incorrectly make SDET the only primary identity.

### Technical Debt Relevant to Redesign

Document problems that could make future steps fragile.

## 1.3 Establish Canonical Typed Data

If static portfolio content is stored as giant JSON strings in `.env`,
move appropriate public static content into typed TypeScript modules.

Prefer a structure compatible with the repository, conceptually:

```text
data/
  profile.ts
  experience.ts
  skills.ts
  projects.ts
  capabilities.ts
  architecture.ts
```

Do not force this exact folder if the project has a better convention.

Environment variables should be used for environment-specific values,
not as a CMS for large public static content.

## 1.4 Create/Improve Types

Useful concepts:

```ts
type EngineeringDomain = "build" | "quality" | "data" | "delivery";

type PortfolioMode = "build" | "quality" | "full-cycle";
```

Model:

- Profile
- Company
- ExperienceRole
- Project
- Skill
- Capability
- ArchitectureNode
- PortfolioMode

Do not over-engineer.

## 1.5 Correct Professional Data

Apply the Canonical Career Timeline from this file.

Critical assertions:

```text
Jasa Marga SDET:
Jul 2025 – Feb 2026

Jasa Marga Full Stack Developer:
Mar 2026 – Present
```

Primary identity:

```text
Full Stack Engineer × SDET
```

## 1.6 Engineering Domains

Create reusable domain data:

### BUILD

Next.js, React, TypeScript, JavaScript, Node.js, Express, Java, Spring
Boot, REST API, Microservices.

### QUALITY

Playwright, WebDriverIO, Appium, Selenium, Jest, Postman, K6, JMeter,
Allure.

### DATA

MySQL, PostgreSQL, Oracle, SQL, Sequelize, MongoDB, SSIS---only where
verified.

### DELIVERY

GitLab CI/CD, Docker, GitLab Runner, AWS Device Farm, GitLab Pages.

No skill percentages.

## 1.7 Verify Current Full Stack Project

Inspect the supplied/current repository evidence and verify actual
technologies used for the Enterprise Audit Monitoring Platform.

Potential technologies to verify, not assume:

Frontend: - Next.js - React - TypeScript - TanStack Query - TanStack
Table - Zustand - React Hook Form - Zod - Radix UI - Recharts

Backend: - Node.js - Express - Sequelize - MySQL/PostgreSQL -
MongoDB/Mongoose - MinIO - ExcelJS - JWT - Jest - Supertest

Record verified findings in the audit document.

## 1.8 Prepare Full-Cycle Data

Prepare reusable nodes for:

```text
IDEA
FRONTEND
API
BACKEND
DATA
QUALITY
CI/CD
PRODUCTION
```

Each should be able to expose:

- description
- technologies
- related experience
- related projects
- engineering domain

Do not build the final graph yet.

## 1.9 Tests

Update/add tests for canonical career data and primary positioning.

At minimum verify:

- current role is Full Stack Developer
- SDET ends Feb 2026
- Full Stack starts Mar 2026
- primary identity includes Full Stack Engineer × SDET

## Step 1 Acceptance Criteria

- repository audit exists
- career timeline is correct
- canonical typed data exists
- static content architecture is maintainable
- full-stack stack has been verified from actual source
- no confidential content introduced
- tests/build remain healthy
- no major redesign has been performed yet

Stop after Step 1.

---

# STEP 2 --- RyanOS Shell, Boot Experience & New Hero

## Goal

Transform the first impression from "SDET portfolio" into "Full-Cycle
Engineering Workspace" without losing RyanOS.

## 2.1 RyanOS Branding

Change primary workspace language from SDET-specific wording to
engineering-wide wording.

Preferred:

```text
RyanOS
Full-Cycle Engineering Workspace
```

Do not remove SDET from Ryan's identity.

Use:

```text
Ryan Hidayat
Full Stack Engineer × SDET
```

## 2.2 Boot Sequence

Create a fast, optional RyanOS boot experience.

Example:

```text
Initializing RyanOS...

[✓] Frontend Systems
[✓] Backend Services
[✓] Data Layer
[✓] Quality Engineering
[✓] Performance Engineering
[✓] CI/CD

SYSTEM READY

FULL STACK × QUALITY ENGINEERING
```

Requirements:

- fast
- skippable immediately
- no long fake loading
- only once per sensible session where appropriate
- respect `prefers-reduced-motion`
- mobile friendly

The boot sequence should feel premium, not like a hacker cliché.

## 2.3 Hero

Primary copy:

```text
RYAN HIDAYAT

FULL STACK ENGINEER × SDET

I build systems.
I engineer confidence.
```

Supporting copy should summarize:

- enterprise application development
- frontend/backend
- APIs
- databases
- test automation
- performance engineering
- CI/CD

Create strong CTAs:

```text
Explore RyanOS
Recruiter Mode
Download CV
LinkedIn
```

Use existing valid links.

## 2.4 CLI Identity

Add a restrained system/CLI identity element.

Concept:

```text
ryan@portfolio:~$ whoami

Ryan Hidayat
Full Stack Engineer × SDET
Jakarta, Indonesia

> building enterprise applications
> engineering APIs & data flows
> automating quality at scale
> shipping through CI/CD

status: available_for_opportunities
```

Do not make the terminal consume the entire hero.

## 2.5 First-Screen Information Hierarchy

Within seconds a visitor should understand:

1.  name
2.  current engineering identity
3.  Full Stack + SDET differentiator
4.  current role
5.  how to explore
6.  how to contact/download CV

Do not overload above-the-fold content with every technology.

## Step 2 Acceptance Criteria

- RyanOS is no longer branded as only an SDET workspace
- hero clearly positions Full Stack Engineer × SDET
- boot is fast/skippable/accessibility-aware
- hero works well without animation
- CTAs are functional
- mobile hero is polished
- no generic template appearance

Stop after Step 2.

---

# STEP 3 --- Recruiter Mode & Engineer Mode

## Goal

Solve the tension between a highly interactive engineering portfolio and
a recruiter who may spend only 30--60 seconds reviewing it.

Create two intentional exploration paths:

```text
RECRUITER MODE
ENGINEER MODE
```

## 3.1 Recruiter Mode

Recruiter Mode must be concise and easy to scan.

Recommended flow:

```text
01 WHO I AM
02 CURRENT ROLE
03 CAREER EVOLUTION
04 FEATURED ENGINEERING WORK
05 CORE CAPABILITIES
06 CONTACT
```

Target comprehension time:

```text
30–60 seconds
```

Recruiter Mode should not require using a terminal, command palette, or
architecture explorer.

## 3.2 Engineer Mode

Engineer Mode exposes the full RyanOS workspace.

It should lead to:

- Full-Cycle Engineering
- Architecture Explorer
- Projects
- API Playground
- Quality Engineering
- Performance Lab
- Pipeline/Delivery
- Terminal

## 3.3 Mode Selector

Design a clear but elegant selector.

Possible concept:

```text
Choose your interface

[ Recruiter — 60 sec overview ]
[ Engineer — Explore RyanOS ]
```

Do not make it an annoying modal that blocks the site indefinitely.

Users should be able to switch later.

Persist the selection for the current browsing session if useful.

## 3.4 Recruiter Summary

The current role must be unmistakable:

```text
Full Stack Developer
PT Jasa Marga (Persero) Tbk
Mar 2026 – Present
```

Also show:

```text
Previously:
SDET — PT Jasa Marga
SQA Manual & Automation — PT Astra International
Software Engineer — PT Adira Finance
```

## 3.5 Progressive Disclosure

Recruiter Mode = outcomes and evidence first.

Engineer Mode = technical depth.

Do not duplicate huge amounts of DOM/content unnecessarily. Reuse
canonical data and components.

## Step 3 Acceptance Criteria

- both modes exist and are understandable
- Recruiter Mode can communicate Ryan's profile within \~60 seconds
- Engineer Mode preserves technical depth
- user can switch modes
- navigation remains accessible
- current Full Stack role is visually obvious

Stop after Step 3.

---

# STEP 4 --- Full-Cycle Engineering Experience

## Goal

Create the signature visual/interactive experience of the new portfolio.

This should be the most memorable proof of the Full Stack × SDET
positioning.

## 4.1 Signature Lifecycle

Create an interactive system representing:

```text
IDEA
  ↓
FRONTEND
  ↓
API
  ↓
BACKEND
  ↓
DATA
  ↓
QUALITY
  ↓
CI/CD
  ↓
PRODUCTION
```

Desktop may use a system graph.

Mobile should use a vertical or otherwise touch-friendly layout.

## 4.2 Interactive Nodes

Each node should reveal useful context.

### FRONTEND

Possible verified technologies:

- Next.js
- React
- TypeScript
- TanStack Query
- Zustand

### API / BACKEND

- Node.js
- Express
- Java Spring Boot
- REST API
- Microservices

### DATA

- MySQL
- PostgreSQL
- Oracle
- Sequelize
- SQL

### QUALITY

- Playwright
- WebDriverIO
- Appium
- Jest
- Postman

### PERFORMANCE

- K6
- JMeter

### DELIVERY

- Docker
- GitLab CI/CD
- GitLab Runner
- AWS Device Farm
- GitLab Pages

Only display technologies supported by canonical verified data.

## 4.3 Meaningful Interaction

Clicking/focusing a node should explain:

```text
What this layer does
What Ryan has done here
Technologies
Related role
Related project
```

This is more valuable than skill bars.

## 4.4 Data Flow Animation

Use subtle purposeful animation to suggest data moving through the
system.

Requirements:

- restrained
- performant
- reduced-motion alternative
- no constant distracting motion

## 4.5 Engineering Mode Switch

Implement:

```text
[ BUILD ] [ QUALITY ] [ FULL CYCLE ]
```

BUILD emphasizes:

- frontend
- backend
- API
- data
- architecture

QUALITY emphasizes:

- automation
- API testing
- mobile
- performance
- quality gates

FULL CYCLE shows how both sides connect.

Switching should not reload the page.

Use accessible tabs/buttons.

## Step 4 Acceptance Criteria

- signature lifecycle is implemented
- Build/Quality/Full Cycle switching works
- node interactions contain real evidence
- mobile adaptation works
- keyboard navigation works
- reduced motion works
- no fake proficiency metrics

Stop after Step 4.

---

# STEP 5 --- Career Evolution & Capability Matrix

## Goal

Turn Ryan's unusual career path into a strong engineering story.

## 5.1 Career Evolution Timeline

Design a timeline around:

```text
2021
Software Engineer
PT Adira Finance

↓

2022
SQA Manual & Automation
PT Astra International

↓

2025
SDET
PT Jasa Marga

↓

2026
Full Stack Developer
PT Jasa Marga
```

The visual should communicate increasing breadth, not random job
changes.

## 5.2 Jasa Marga Role Evolution

Jasa Marga should preferably appear as one company journey with two
sequential roles.

Emphasize:

```text
SDET
Jul 2025 – Feb 2026

ROLE EVOLUTION

Full Stack Developer
Mar 2026 – Present
```

## 5.3 Experience Detail

Each role should communicate:

- engineering context
- responsibility
- representative impact
- relevant technologies

Avoid walls of CV bullets.

Use progressive disclosure where useful.

## 5.4 Capability Matrix

Replace generic skill bars with:

```text
ENGINEERING CAPABILITY MATRIX
```

Domains:

```text
BUILD
QUALITY
DATA
DELIVERY
```

Skills can expose:

- used for
- related experience
- related project

Do not rate technologies with arbitrary percentages or stars.

## 5.5 Cross-Domain Story

Add a concise section that communicates the advantage of the journey.

Concept:

```text
Building software taught me how systems are constructed.
Quality engineering taught me where systems fail.
```

Keep the tone grounded and professional.

## Step 5 Acceptance Criteria

- career evolution is immediately understandable
- Jasa Marga roles have correct dates
- Full Stack is clearly current
- capability matrix replaces fake skill scoring
- experience remains readable on mobile
- content comes from canonical data

Stop after Step 5.

---

# STEP 6 --- Flagship Full Stack Case Study

## Goal

Make the current Full Stack work the strongest evidence that Ryan
genuinely builds enterprise applications.

Use public-safe abstraction.

## 6.1 Case Study

Title:

```text
Enterprise Audit Monitoring Platform
```

Label:

```text
Full Stack Enterprise Application
```

Role:

```text
Full Stack Developer
```

## 6.2 Story Structure

Build the case study around:

```text
OVERVIEW
PROBLEM
MY ROLE
SYSTEM ARCHITECTURE
KEY CAPABILITIES
ENGINEERING DECISIONS
QUALITY STRATEGY
TECH STACK
WHAT I LEARNED
```

Do not fabricate business outcomes or metrics.

## 6.3 Safe Overview

Use a version of:

```text
An enterprise monitoring platform designed to support
structured audit workflows, role-based access, data management,
reporting, document handling, and operational visibility.
```

Adjust only when repository evidence supports a more accurate
abstraction.

## 6.4 Architecture

Create a portfolio-safe architecture visualization.

Concept:

```text
Users
  │
  ▼
Next.js / React / TypeScript
  │
  │ REST API
  ▼
Node.js / Express
  │
  ▼
Business / Service Layer
  │
  ▼
Sequelize
  │
  ▼
Relational Database
```

Optional verified branches:

```text
MinIO
→ document/file storage

ExcelJS/XLSX
→ import/export/reporting

GitLab CI/CD + Docker
→ delivery

Jest/Supertest
→ backend quality
```

Only include verified technologies.

## 6.5 Engineering Decisions

Explain decisions rather than merely listing libraries.

Examples, only if supported:

- server state handling
- schema validation
- reusable form architecture
- table/data workflows
- API separation
- ORM/data access
- file storage
- reporting/export
- authentication/authorization
- testability

Do not expose proprietary logic.

## 6.6 Project Interaction

Add:

```text
Explore Architecture
```

The visitor should be able to inspect layers without seeing internal
company code.

## Step 6 Acceptance Criteria

- flagship case study exists
- it clearly demonstrates Full Stack work
- architecture is technically coherent
- all claims are supported by repository/professional evidence
- no confidential content is exposed
- no fake metrics are invented
- mobile architecture is readable

Stop after Step 6.

---

# STEP 7 --- Projects, Architecture Explorer & Engineering Labs

## Goal

Evolve existing SDET-heavy interactive features into evidence of
full-cycle engineering.

## 7.1 Project Taxonomy

Create filters:

```text
ALL
BUILD
QUALITY
DEVOPS
```

Suggested portfolio items, where supported:

### BUILD

- Enterprise Audit Monitoring Platform
- Enterprise Backend Development
- RyanOS Portfolio

### QUALITY

- Enterprise Web Automation Ecosystem
- Cross-Platform Mobile Automation
- Performance & Load Testing
- SMTP Bulk Testing Solution

### DEVOPS / DELIVERY

- CI/CD Quality Gates
- Dockerized Automation Execution

Do not invent projects that cannot be supported.

## 7.2 Project Card Philosophy

Lead with:

```text
Problem
Role
What I engineered
```

Then technologies.

Do not lead with 20 badges.

## 7.3 Architecture Explorer

Evolve the existing explorer into presets.

### FULL STACK APPLICATION

```text
Browser
→ Next.js
→ REST API
→ Express
→ Service Layer
→ Sequelize
→ Database
```

### QUALITY ENGINEERING

```text
Web / Mobile / API
→ Automation Layer
→ Test Execution
→ Results
→ Allure
→ Quality Gate
```

### CI/CD DELIVERY

```text
GitLab
→ Build
→ Docker
→ Automated Tests
→ Performance
→ Quality Gate
→ Deploy
```

Nodes should explain Ryan's relationship to that layer.

## 7.4 API Playground

Keep and improve it.

Safe endpoints may include:

```text
GET /api/ryan
GET /api/skills
GET /api/projects
GET /api/experience
GET /api/architecture
GET /api/career
```

Example `/api/career` concept:

```json
{
  "journey": ["Software Engineer", "SQA Manual & Automation", "SDET", "Full Stack Developer"],
  "currentRole": "Full Stack Developer",
  "engineeringProfile": "Full Stack × Quality Engineering"
}
```

Do not expose private APIs.

## 7.5 Pipeline Simulator

Keep it, but position it as software delivery rather than only QA.

Possible stages:

```text
COMMIT
BUILD
UNIT TEST
INTEGRATION
E2E
PERFORMANCE
QUALITY GATE
DEPLOY
```

Use existing capabilities and avoid pretending this is a real company
production pipeline.

## 7.6 Performance Lab

Keep it as proof of performance engineering knowledge.

Make the content understandable to both recruiters and engineers.

## Step 7 Acceptance Criteria

- projects are balanced between Build and Quality
- architecture explorer includes Full Stack
- API Playground reflects new positioning
- Pipeline Simulator represents delivery lifecycle
- existing RyanOS features feel evolved rather than bolted on
- interactions remain performant

Stop after Step 7.

---

# STEP 8 --- Terminal, Command Palette & RyanOS Interactions

## Goal

Turn the existing RyanOS interactions into useful navigation and
storytelling rather than decorative gimmicks.

## 8.1 Terminal Commands

Support useful commands such as:

```text
help
whoami
career
experience
projects
stack
build
quality
architecture
contact
cv
clear
```

Example:

```text
$ career

2021 → Software Engineer
2022 → SQA Manual & Automation
2025 → SDET
2026 → Full Stack Developer

Current:
Full Stack Developer @ PT Jasa Marga (Persero) Tbk
```

## 8.2 whoami

Example:

```text
$ whoami

Ryan Hidayat
Full Stack Engineer × SDET

Current focus:
Building enterprise applications
while applying quality engineering
across the delivery lifecycle.
```

Keep claims grounded.

## 8.3 build

Should surface:

- frontend
- backend
- APIs
- data
- Full Stack project

## 8.4 quality

Should surface:

- web automation
- mobile automation
- API testing
- performance
- quality gates

## 8.5 Command Palette

Use it as fast RyanOS navigation.

Potential actions:

```text
Open Recruiter Mode
Explore Full Cycle
View Current Role
Open Flagship Project
Explore Architecture
Open Terminal
Download CV
Open LinkedIn
Contact Ryan
```

Keyboard shortcut can be retained/improved if accessible.

## 8.6 Deep Linking

Where practical, terminal/palette actions should navigate/focus real
portfolio sections rather than only print text.

## 8.7 Easter Eggs

A small number of tasteful engineering easter eggs are acceptable.

Do not let easter eggs become the product.

## Step 8 Acceptance Criteria

- terminal reflects Full Stack × SDET identity
- commands are useful
- command palette improves navigation
- interactions work with keyboard
- commands reuse canonical data
- no duplicated stale career information

Stop after Step 8.

---

# STEP 9 --- Visual Polish, Motion, Responsive Design & Accessibility

## Goal

Make the complete experience feel premium and memorable without becoming
visually exhausting.

## 9.1 Design System

Audit and normalize:

- background surfaces
- borders
- typography
- spacing
- radii
- shadows/glow
- status colors
- interaction states

Create/reuse tokens rather than arbitrary values everywhere.

## 9.2 Typography

Use clean hierarchy.

Sans-serif:

- headings
- body
- recruiter content

Monospace:

- terminal
- status
- commands
- system metadata
- architecture labels where appropriate

Do not use monospace for every paragraph.

## 9.3 Motion

Motion should explain:

- boot
- system state
- data flow
- timeline progression
- pipeline execution
- focused architecture nodes

Avoid motion that exists only to show off.

Respect:

```css
prefers-reduced-motion
```

## 9.4 Microinteractions

Polish:

- hover
- focus
- active
- selected modes
- terminal cursor
- pipeline state
- architecture selection
- project filtering
- CTA feedback

## 9.5 Mobile

Perform a dedicated mobile pass.

Verify at common narrow widths.

Requirements:

- no horizontal overflow
- terminal usable
- architecture readable
- mode selector usable
- recruiter flow excellent
- timeline readable
- touch targets large enough
- no tiny technical labels
- dialogs/sheets usable

## 9.6 Accessibility

Audit:

- semantic landmarks
- heading order
- keyboard navigation
- focus visibility
- ARIA
- dialogs
- tabs
- contrast
- reduced motion
- icon labels
- screen-reader names

Do not use inaccessible custom div buttons.

## 9.7 Empty/Error States

Interactive tools should fail gracefully.

Do not leave blank panels if an interaction has no data.

## Step 9 Acceptance Criteria

- visual system is cohesive
- animations are purposeful
- mobile feels designed, not compressed
- keyboard navigation works
- reduced-motion experience is good
- accessibility issues introduced by redesign are resolved

Stop after Step 9.

---

# STEP 10 --- SEO, Performance, Tests & Final Production QA

## Goal

Finish the redesign as a production-quality portfolio.

Do not add major new features in this step unless required to fix a
critical gap.

## 10.1 Metadata

Canonical title:

```text
Ryan Hidayat — Full Stack Engineer × SDET
```

Canonical description:

```text
Full Stack Engineer and SDET experienced in enterprise application
development, Next.js, React, Node.js, Java Spring Boot, APIs,
databases, test automation, performance engineering, Docker,
and GitLab CI/CD.
```

Update as applicable:

- Next.js metadata
- OpenGraph
- Twitter/X cards
- structured data
- schema.org Person data
- sitemap
- robots
- manifest

Remove metadata that positions Ryan exclusively as QA/SDET.

## 10.2 Structured Data

Use accurate professional information.

Do not add unverifiable awards, employers, credentials, or ratings.

## 10.3 Performance Audit

Look for:

- unnecessary client components
- excessive JavaScript
- large animation libraries
- unoptimized assets
- layout shifts
- repeated data
- unnecessary rerenders
- expensive effects
- non-lazy heavy sections

Optimize where meaningful.

## 10.4 Image and Font Performance

Use framework-native optimization where appropriate.

Avoid loading unnecessary font weights.

## 10.5 Test Coverage

Ensure tests cover critical redesign behavior:

- primary identity
- current Full Stack role
- SDET end date
- Full Stack start date
- Recruiter Mode
- Engineer Mode
- Build/Quality/Full Cycle mode
- career timeline
- flagship case study
- project filters
- terminal `career`
- terminal `whoami`
- architecture presets
- important navigation

Do not chase meaningless 100% coverage.

## 10.6 Production Validation

Run the repository's applicable commands, ideally:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Then manually inspect important routes and interactions.

Check browser console for:

- hydration errors
- React warnings
- failed requests
- accessibility warnings where tooling exists
- obvious runtime errors

## 10.7 Content QA

Search the entire repository for stale primary-positioning language.

Ensure no incorrect public text remains such as:

```text
SDET | QA Automation Engineer
```

when used as the main current identity.

Historical SDET references are correct and must remain.

Confirm:

```text
Current:
Full Stack Developer

Professional identity:
Full Stack Engineer × SDET
```

## 10.8 Security / Public Safety QA

Search for accidental exposure of:

- secrets
- internal URLs
- company source details
- database credentials
- private API paths
- confidential names
- sensitive project data

Do not print secret values into logs or reports.

## 10.9 Final Recruiter Test

Evaluate the site as if you are a recruiter with 60 seconds.

Can you answer immediately:

- Who is Ryan?
- What does he do now?
- Is he genuinely Full Stack?
- What is his SDET advantage?
- What did he build?
- What technologies does he use?
- How did his career evolve?
- How can I contact him?
- Where is his CV?

Fix information hierarchy if any answer is difficult to find.

## 10.10 Final Engineer Test

Evaluate as a technical interviewer.

Can you find evidence of:

- frontend
- backend
- APIs
- data
- architecture
- testing
- performance
- CI/CD
- engineering reasoning

The portfolio should reward deeper exploration.

## Step 10 Acceptance Criteria

- production build passes
- critical tests pass
- no introduced TypeScript/lint errors
- SEO reflects Full Stack × SDET
- current career data is correct
- no obvious confidential data is exposed
- mobile and desktop are production-ready
- recruiter path is fast
- engineer path is technically rich
- RyanOS remains unique and recognizable

After Step 10, update the Progress Tracker and produce a final
implementation report.

Do not start an unrequested redesign cycle after Step 10.

---

# Final Target Experience

RyanOS should feel like a personal engineering system rather than a
resume placed inside a website.

A recruiter should be able to skim it quickly.

A technical interviewer should be able to explore deeply.

The central story must remain consistent everywhere:

```text
Ryan Hidayat
Full Stack Engineer × SDET

I build systems.
I engineer confidence.
```

Ryan's differentiator is not merely knowing many tools.

It is understanding the software lifecycle from multiple sides:

```text
BUILD
  +
DATA
  +
QUALITY
  +
DELIVERY
```

That idea should be visible in the content, architecture, interactions,
and design of the final RyanOS.
