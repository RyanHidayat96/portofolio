# Portfolio Workspace

Interactive engineering portfolio for the configured portfolio owner.

The app is not a generic portfolio page. It is an operating-system-inspired engineering workspace where visitors can explore profile data, projects, simulations, API routes, pipeline gates, performance thresholds, architecture, and an interactive terminal.

## Architecture

- Next.js App Router with Server Components by default.
- Client components only for interactive workspace features.
- Centralized portfolio data in `src/data`.
- Feature-oriented modules under `src/features`.
- Domain logic separated from React UI for terminal commands, automation simulation, pipeline execution, and performance thresholds.
- Centralized site metadata in `src/config/site.ts`, with JSON-LD built from verified portfolio data only.

## Technology Stack

- Next.js, React, TypeScript, Tailwind CSS
- Lucide React icons
- Vitest, React Testing Library
- ESLint, Prettier

## Directory Structure

- `src/app` - routes, metadata, global styles, API handlers
- `src/data` - profile, skills, experience, projects, architecture, challenges
- `src/features/workspace` - landing, boot, shell, command palette
- `src/features/terminal` - command parser, command registry, terminal UI
- `src/features/automation-lab` - failure strategies and simulation engine
- `src/features/pipeline` - pipeline state simulation
- `src/features/performance-lab` - performance scenarios and threshold evaluation
- `tests` - unit and component tests
- `docs/architecture` - architecture decision records

## Engineering Decisions

- Verified portfolio data is loaded from environment variables through `src/data`.
- Optional owner data such as GitHub URL and CV path is hidden until configured.
- Simulations are explicitly labeled as demos and do not claim live infrastructure execution.
- Terminal commands use a command registry instead of a giant UI switch.
- Pipeline and performance behavior is deterministic so tests remain stable.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Testing

```bash
npm run format
npm run lint
npm run typecheck
npm test
npm run build
```

Current suite coverage:

- Unit tests cover portfolio data, route contracts, SEO metadata, terminal parsing/commands, automation scenarios, pipeline transitions, and performance thresholds.
- Component tests cover Terminal, Automation Lab, Pipeline, Performance Lab, API Playground, Architecture, Challenge, Command Palette, and workspace routing behavior.

## Environment Variables

- `NEXT_PUBLIC_SITE_URL` - production origin used for canonical URLs, sitemap, robots, OpenGraph, Twitter cards, and JSON-LD. Example: `https://portfolio.example.com`.
- `NEXT_PUBLIC_RYANOS_BRANDING_JSON` - public brand and landing hero text.
- `NEXT_PUBLIC_RYANOS_PROFILE_JSON` - public profile identity, headline, summary, focus areas, and contact links.
- `NEXT_PUBLIC_RYANOS_EDUCATION_JSON` - public education credentials.
- `NEXT_PUBLIC_RYANOS_EXPERIENCE_JSON` - public experience timeline.
- `NEXT_PUBLIC_RYANOS_PROJECTS_JSON` - public project case studies.
- `NEXT_PUBLIC_RYANOS_SKILLS_JSON` - public skill groups.
- `NEXT_PUBLIC_RYANOS_API_ENDPOINTS_JSON` - public API playground metadata.
- `NEXT_PUBLIC_RYANOS_PIPELINE_PANEL_JSON` - public pipeline panel copy and stack labels.
- `NEXT_PUBLIC_RYANOS_ARCHITECTURE_JSON` - public architecture map data.
- `NEXT_PUBLIC_RYANOS_CHALLENGES_JSON` - public challenge scenarios.

Local development falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is not set.

## Production Assets

- `public/favicon.svg` and `public/ryanos-mark.svg` provide static brand assets.
- `public/cv.pdf` provides the owner-approved CV download when `contact.cv.href` is configured.
- Next.js metadata routes generate `/icon`, `/apple-icon`, `/opengraph-image`, and `/twitter-image`.
- `src/app/robots.ts` and `src/app/sitemap.ts` use the centralized site URL configuration.

## Deployment

Target deployment is Vercel. Configure `NEXT_PUBLIC_SITE_URL` with the final domain before production launch.

Deployment checklist:

- Install dependencies with `npm install`.
- Set `NEXT_PUBLIC_SITE_URL` to the final production origin.
- Run `npm run format`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
- Verify generated metadata routes: `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, `/twitter-image`, `/icon`, and `/apple-icon`.
- Confirm owner-approved public links before launch.

## Owner Actions

- Keep `contact.cv` inside `NEXT_PUBLIC_RYANOS_PROFILE_JSON` pointed at `/cv.pdf` when the owner-approved CV should be downloadable.
- GitHub URL is not configured because no verified public profile URL exists in the repository.
- Final portfolio domain must be supplied through `NEXT_PUBLIC_SITE_URL`.
- Add confidential-safe project screenshots only after owner review.

## Performance

The app keeps interaction logic local, uses deterministic lightweight simulations, avoids heavyweight charting libraries, and keeps portfolio data static.

## Accessibility

The UI uses semantic controls, visible focus states, keyboard-accessible navigation, reduced-motion handling, labels for interactive inputs, and readable contrast.
