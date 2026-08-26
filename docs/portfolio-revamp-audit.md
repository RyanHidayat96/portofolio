# Portfolio Revamp Audit

## Architecture

- Framework: Next.js 16.3.0 with App Router under `src/app`.
- Routing: root page plus catch-all workspace routes in `src/app/[...slug]/page.tsx`.
- API surface: App Router GET route handlers for profile, skills, projects, experience, and contact.
- UI: feature-oriented React components under `src/features`, with RyanOS workspace shell, landing, panels, and labs.
- Styling: Tailwind CSS through global tokens in `src/app/globals.css`; dark RyanOS visual identity already present.
- Fonts: local Geist sans and mono loaded through `next/font/local`.
- State: local React state for workspace routing, terminal, simulations, selected projects, architecture nodes, and panels.
- Tests: Vitest unit/component tests cover data, API contracts, terminal, workspace routing, simulations, panels, SEO, and interactions.
- Data: public portfolio content is centralized in typed TypeScript modules under `src/data`.
- Environment: `NEXT_PUBLIC_SITE_URL` remains environment-specific. Public static portfolio data is no longer treated as env CMS content.

## RyanOS Feature Inventory

- Hero / Landing: KEEP+EVOLVE. Full Stack x SDET positioning and single `Open Portfolio` CTA exist; later stages should improve system awakening and visual depth.
- Workspace Shell: KEEP. OS-style shell and unified menu are useful foundations.
- Unified workspace: EVOLVE. Old Recruiter/Engineer buttons are removed; keep fast hiring scan and deeper technical proof in one menu.
- Terminal: KEEP+EVOLVE. Command registry already covers career, build, quality, CV, navigation, and labs; later stages should polish presentation.
- Command Palette: KEEP. Keyboard navigation value is real.
- Architecture Explorer: KEEP+EVOLVE. Preset graph covers Build, Quality, and Ship; later stages should improve depth and transition quality.
- API Playground: KEEP. Actual route handlers make it stronger than decorative UI.
- Pipeline Simulator: EVOLVE. Should represent delivery lifecycle, not only QA gate behavior.
- Performance Lab: KEEP. Good proof of performance reasoning.
- Automation Lab: KEEP. Quality engineering evidence should remain, but not dominate identity.
- Challenge Panel: EVOLVE. Should include build, API, data, and delivery reasoning, not only test scenarios.
- Profile / Experience / Projects: REFACTOR. Content now uses typed canonical data; later steps should improve presentation.
- SEO / Metadata: KEEP. Central metadata, sitemap, robots, OpenGraph, Twitter image, and JSON-LD exist.
- Footer: REMOVE/DEFER. No dedicated footer found in the current workspace; not needed for Step 1.

## SDET-Only Positioning Audit

Searched visible and non-visible content for:

- `SDET`
- `QA Automation`
- `Software Quality Assurance`
- `Test Engineer`
- `SQA`

Findings:

- Local `.env` previously held primary identity as SDET / QA Automation. Step 1 no longer reads this data for public static content.
- `src/data/branding.ts` previously fell back to generic workspace copy and env-driven SDET data. Step 1 now re-exports typed canonical branding.
- `src/data/profile.ts` previously depended on `NEXT_PUBLIC_RYANOS_PROFILE_JSON`. Step 1 now uses `Full Stack Engineer × SDET` and `Full Stack Developer`.
- `src/features/workspace/components/OverviewPanel.tsx` included "Try QA and SDET reasoning scenarios." Step 1 changed this to full-cycle engineering reasoning.
- Historical SDET references remain valid in the career timeline.

Incorrect current-identity risk after Step 1:

- Remaining SDET text is historical or part of the combined identity, not the sole current identity.
- Current role is modeled as `Full Stack Developer`.

## Technical Debt Relevant to Redesign

- Some panels still lead with quality/automation interaction priority. Later steps should rebalance hierarchy without deleting RyanOS features.
- Routing still keeps internal `recruiter`/`engineer` route state for legacy `/overview` and `/labs`; future UI should treat this as compatibility, not user-facing modes.
- Architecture Explorer still renders one graph. Step 7 should add presets rather than overloading one topology.
- Terminal commands are useful and already support the new story; later work should improve interaction polish rather than add noisy commands.
- Project filtering already supports Build / Quality / DevOps; Stage 7 should focus on richer project-world interaction, not basic filtering.
- `next build` can rewrite `next-env.d.ts` generated imports. Keep generated churn out of intentional changes.
- GitHub Pages deployment needs static export and base path decisions if it remains the target host.

## Verified Full Stack Project Evidence

Source inspected:

- `Ryan_Hidayat_CV_Updated_Full_Stack_Portfolio.pdf`
- Current repository implementation and package manifest

Verified current role:

- PT Jasa Marga (Persero) Tbk
- Full Stack Developer
- Mar 2026 - Present

Public-safe project name:

- Enterprise Audit Monitoring Platform

Verified technologies from the supplied CV:

- Frontend: Next.js, React, TypeScript, Tailwind CSS, TanStack React Query/Table, React Hook Form, Zod
- Backend: Node.js, Express.js, Sequelize, PostgreSQL/MySQL, authentication, role-based access, audit logging
- Storage and reporting: MinIO, ExcelJS
- Delivery: GitLab CI/CD, Docker
- Earlier backend foundation: Java, Spring Boot, ZK Framework, REST API, Microservices, Oracle, SQL, SSIS

Evidence limitation:

- The full-stack platform source code is not present in this repository. Claims are therefore based on the supplied CV and are kept public-safe.

## Canonical Data Foundation

Step 1 established typed public data in:

- `src/data/portfolio-content.ts`
- `src/data/capabilities.ts`
- `src/data/types.ts`

Canonical assertions now modeled and tested:

- Primary identity: `Full Stack Engineer × SDET`
- Current role: `Full Stack Developer`
- Jasa Marga SDET: `Jul 2025 - Feb 2026`
- Jasa Marga Full Stack Developer: `Mar 2026 - Present`
- Engineering domains: Build, Quality, Data, Delivery
- Full-cycle nodes: Idea, Frontend, API, Backend, Data, Quality, CI/CD, Production

## Public Safety Review

- No credentials, API keys, database credentials, internal URLs, private endpoints, employee/customer data, audit findings, or company source code were added.
- Current full-stack work is represented as `Enterprise Audit Monitoring Platform`.
- Internal business logic and confidential workflow names are intentionally omitted.
