# Portfolio Workspace

Interactive engineering portfolio for Ryan Hidayat.

The project now has three entry paths:

- `/` - the primary progressive 3D studio portfolio built with Three.js and React Three Fiber.
- `/portfolio-3d` - the same 3D experience kept as an explicit route.
- `/workspace` - the standard RyanOS engineering workspace fallback.

All experiences use the same verified portfolio data. Detailed personal, employment, and resume information stays in the owner-approved CV.

## Technology Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Three.js and React Three Fiber for the 3D portfolio route
- Lucide React icons
- Vitest, React Testing Library
- ESLint, Prettier

## Architecture

- `src/app/page.tsx` - primary 3D portfolio route
- `src/app/portfolio-3d` - explicit 3D portfolio route
- `src/app/workspace` - standard RyanOS workspace fallback route
- `src/app` - routes, metadata, global styles, API handlers
- `src/data` - profile, skills, experience, projects, architecture, challenges
- `src/features/workspace` - standard RyanOS workspace shell and panels
- `src/features/portfolio-3d` - 3D runtime, scene manifest, routing, camera, lighting, interaction, fallback, and panel content adapters
- `src/features/terminal` - command parser, registry, and terminal UI
- `src/features/automation-lab` - failure strategies and simulation engine
- `src/features/pipeline` - pipeline state simulation
- `src/features/performance-lab` - performance scenarios and threshold evaluation
- `docs` - architecture notes, 3D audit, asset contract, progress tracker, performance notes, and handoff notes
- `public/models/portfolio-3d` - browser-served GLB assets for the 3D experience

## 3D Portfolio Runtime

The 3D experience is data-driven:

- Asset inventory and placement live in `src/features/portfolio-3d/scene-manifest.ts`.
- Section-to-content mapping lives in `src/features/portfolio-3d/section-contracts.ts`.
- Camera presets live in `src/features/portfolio-3d/camera-presets.ts`.
- Route/query mapping lives in `src/features/portfolio-3d/route-map.ts`.
- Lighting policy lives in `src/features/portfolio-3d/lighting-config.ts`.
- Runtime capability and DPR policy live in `src/features/portfolio-3d/runtime-capabilities.ts`.

`room-shell.glb` is the coordinate source for anchors, colliders, navmesh, door pivot, and room hotspots. Other models attach to `Anchor_*` nodes when available and fall back to centralized manifest transforms only.

## Adding a 3D Section or Hotspot

1. Add or verify the GLB and named node in the asset audit.
2. Add the asset entry or node reference in `scene-manifest.ts`.
3. Add the section contract in `section-contracts.ts` using existing portfolio data only.
4. Add or update the camera preset in `camera-presets.ts`.
5. Add screen preview content in `screen-content.ts` only when a matching screen mesh exists.
6. Keep the main readable content in DOM panels, not only in WebGL textures.

Do not rename or rewrite GLB files without owner approval.

## Quality Tiers

The 3D route supports `low`, `medium`, and `high` quality tiers.

- `low` keeps critical assets and active section assets available.
- `medium` allows critical plus near assets.
- `high` can idle-load deferred props on capable devices.

DPR, preload behavior, shadows, and prop visibility are controlled centrally so the experience remains usable on slower devices.

## Fallback and Accessibility

The 3D canvas is visual navigation. Equivalent DOM navigation and readable content are always present.

The route includes:

- keyboard-accessible section navigation;
- `Escape` back to overview;
- reduced-motion handling;
- critical asset progress messaging;
- per-asset error isolation;
- full HTML fallback when WebGL is unavailable or the 3D runtime fails.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the 3D portfolio.

Open `http://localhost:3000/workspace` for the standard RyanOS workspace fallback.

On Windows, `star.bat` can start the local portfolio server. If port `3000` is already in use, stop the existing process or configure another port before running Next.js.

## Environment Variables

- `NEXT_PUBLIC_SITE_URL` - production origin used for canonical URLs, sitemap, robots, OpenGraph, Twitter cards, and JSON-LD.
- `NEXT_PUBLIC_BASE_PATH` - optional subpath prefix for asset and internal links when deploying under a repository path such as GitHub Pages.

Local development falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is not set.

## Production Assets

- `public/favicon.svg` and `public/ryanos-mark.svg` provide static brand assets.
- `public/cv.pdf` provides the owner-approved CV download when `contact.cv.href` is configured.
- `public/models/portfolio-3d/*.glb` provides runtime 3D models.
- Next.js metadata routes generate `/manifest.webmanifest`, `/icon`, `/apple-icon`, `/opengraph-image`, and `/twitter-image`.
- `src/app/robots.ts` and `src/app/sitemap.ts` use centralized site URL configuration.

## Final Verification Commands

Run these only when full validation is allowed:

```bash
npm run format
npm run lint
npm run typecheck
npm test
npm run build
```

Manual smoke targets after build:

- `/` primary 3D portfolio overview and every section
- `/portfolio-3d` explicit 3D portfolio route
- `/workspace` standard portfolio workspace fallback
- `/?section=projects`, `/portfolio-3d?section=projects`, and another deep link
- browser back/forward between sections
- desktop and mobile viewport
- keyboard-only navigation and `Escape`
- reduced-motion mode
- WebGL failure fallback
- critical asset failure recovery
- console errors

## Deployment

Recommended deployment is Vercel or another Next.js-compatible host that supports App Router route handlers, dynamic metadata image routes, and API routes.

GitHub Pages static hosting needs a static-export workflow and may not serve portfolio API routes without additional changes. If deploying under a GitHub Pages repository subpath, configure `NEXT_PUBLIC_BASE_PATH` consistently with the deployment path before building.

Deployment checklist:

- Install dependencies with `npm install`.
- Set `NEXT_PUBLIC_SITE_URL` to the final production origin.
- Set `NEXT_PUBLIC_BASE_PATH` only when the site is served from a subpath.
- Run the final verification commands after implementation work is complete.
- Verify generated metadata routes: `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image`, `/twitter-image`, `/icon`, and `/apple-icon`.
- Confirm owner-approved public links before launch.

## Known Limitations

- Runtime performance metrics were not captured because the owner requested no test, lint, typecheck, build, preview, server, or browser validation during staged implementation.
- `public/models/portfolio-3d/chair mntap.glb` is currently unreferenced by the scene manifest. It should remain untouched unless the owner approves deletion or use.
- Real performance, accessibility, WebGL fallback, and memory behavior still need one final browser pass when validation is allowed.

## Owner Actions

- Keep the owner-approved CV file at `public/cv.pdf` when the CV should be downloadable.
- Set the final production domain through `NEXT_PUBLIC_SITE_URL`.
- Add confidential-safe project screenshots only after owner review.