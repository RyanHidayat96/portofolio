# 3D Portfolio Progress

Authoritative plan: `CODEX_3D_PORTFOLIO_MASTER_PLAN.md`
Last updated: 2026-09-02

## Stage Tracker

- [x] Stage 0 - Audit repository, content, and assets
- [x] Stage 1 - Architecture, data contracts, and integration plan
- [x] Stage 2 - Foundation runtime 3D and progressive enhancement
- [x] Stage 3 - Room shell, overview camera, and base environment
- [x] Stage 4 - Asset loader, anchor placement, and loading tiers
- [x] Stage 5 - Workstation assembly and all props
- [x] Stage 6 - Lighting, material fidelity, and atmosphere
- [x] Stage 7 - Camera navigation and route synchronization
- [x] Stage 8 - Hotspot, pointer, keyboard, and room interactions
- [x] Stage 9 - Dynamic screens and portfolio content integration
- [x] Stage 10 - Responsive UI, accessibility, and non-WebGL fallback
- [x] Stage 11 - Performance, loading, and runtime hardening
- [x] Stage 12 - Final integration, regression, and handoff

## Stage 0 Completion Evidence

- Repository root confirmed: `C:/Users/exery/Documents/MyProject/portofolio`.
- Git baseline recorded: `main...origin/main [ahead 1]`; clean before Stage 0 documentation.
- Stack documented: Next.js App Router, React, TypeScript, Tailwind CSS, npm, Three/R3F dependencies.
- Entry routes documented: `src/app/page.tsx` and `src/app/[...slug]/page.tsx`.
- Main workspace architecture documented: the workspace app shell, `WorkspaceShell`, navigation, dynamic feature panels.
- Portfolio content sources documented: `src/data/portfolio-content.ts`, re-export files, site metadata, structured data, public assets.
- GLB inventory completed: 15 files in `assets/`, all readable as binary glTF v2, total `47,505,728` bytes.
- Important nodes, anchors, hotspots, screens, lights, bounding-box-level facts, and node contract differences documented in `docs/3d-portfolio-audit.md`.
- Core assets are available: `room-shell.glb`, `desk.glb`, `chair.glb`, `main-monitor.glb`.

## Stage 1 Completion Evidence

- 3D module location selected: `src/features/portfolio-3d`.
- Typed scene manifest created for all 15 GLB assets with source path, planned public path, byte size, root scene, root node, loading tier, quality visibility, placement, fallback transform, bbox, nodes, and extensions.
- Hotspot map created from actual audited node names.
- Section contracts created from existing portfolio data modules only; no CV/detail duplication added.
- Camera presets, route/query mapping, navigation states, interaction event constants, and default transition timings centralized.
- Node alias contract created for proven mismatch: `Hotspot_Pipeline` -> `Hotspot_CICDPipeline`.
- Base-path-safe asset URL helper added with `NEXT_PUBLIC_BASE_PATH` support.
- Asset contract documented in `docs/3d-asset-contract.md`.

## Stage 2 Completion Evidence

- Dependency audit completed from `package.json`; existing `three` and `@react-three/fiber` were used, no package added, npm lockfile preserved.
- Client-only entry created: `src/features/portfolio-3d/components/PortfolioExperience.tsx`.
- One foundation `Canvas` added inside the new 3D route only; no GLB loader or model import is active yet.
- Renderer config centralized in `src/features/portfolio-3d/renderer-config.ts` with adaptive DPR, tone mapping, color management, renderer options, and performance settings.
- `ExperienceShell` DOM created with skip link, canvas container, loading overlay, fallback slot, navigation slot, and section panel slot.
- WebGL support detection created in `hooks/useWebGLSupport.ts`; unsupported/fatal runtime falls back to the existing workspace portfolio.
- Minimal state/context and event API created in `state/Portfolio3dState.tsx`.
- Safe integration route added at `/portfolio-3d`; existing routes remain unchanged.

## Stage 3 Completion Evidence

- `room-shell.glb` copied to `public/models/portfolio-3d/room-shell.glb` for browser-safe runtime loading while preserving the original asset in `assets/`.
- `RoomShellStage` created and connected to the single Stage 2 Canvas.
- Room shell loads as root environment through `GLTFLoader` and `getPortfolio3dAssetUrl('room-shell')`.
- Scene graph cache created for anchors, hotspots, colliders, navmesh, imported lights, and bounds.
- `Anchor_*`, `Hotspot_*`, `Room_Colliders`, `Collider_*`, and `NavMesh_Room` are hidden from render but remain in graph.
- Imported room-shell lights are cached with shadows off and visibility off; base Stage 3 lighting uses a small ambient/directional setup only.
- Overview camera rig uses centralized overview preset and room bounds fallback because room-shell has no authored camera node.
- Extra window/environment controls are no longer used; the GLB room remains the visual source of truth.
- Development-only missing-node warnings are guarded by a one-time warning set.

## Stage 4 Completion Evidence

- All 15 provided GLB assets are available from `public/models/portfolio-3d/` while originals remain untouched in `assets/`.
- Generic manifest-driven asset runtime added through `SceneAsset`; models load by `asset.id` and `getPortfolio3dAssetUrl`.
- Scene cloning and material cloning are explicit before runtime placement or node mapping, so shared cached GLTF scenes are not mutated.
- Root asset uses manifest root transform; anchored assets use `Anchor_*` from room-shell and fall back to manifest transform with one-time development warnings when anchors are missing.
- Runtime node mapping caches anchors, hotspots, dynamic screens, colliders, navmesh, lights, and bounds without enabling room-control UI.
- Per-asset `SceneAssetBoundary` isolates load/render errors and shows a lightweight wireframe placeholder only for loading/error states.
- Critical progress is wired from the scene into `ExperienceShell`; the loading overlay tracks only critical assets and does not wait for near/deferred assets.
- Critical room shell loads first; selected core assets mount behind independent Suspense boundaries, and heavier detail assets wait for relevant sections.
- Stage 3 `RoomShellStage` now aliases the reusable `PortfolioSceneStage` loader pipeline for continuity.

## Stage 5 Completion Evidence

- Scene rendering now uses all manifest assets, not only hardcoded critical assets.
- Critical path is room shell only; workstation props no longer block first usable render.
- Near assets are retained in the manifest but no longer block first paint.
- Anchored GLB assets render progressively after the room is usable, preserving original model fidelity without blocking first paint.
- Public Low/Medium/High render selection has been removed; runtime quality is automatic.
- High quality is the default 3D state for full Stage 5 composition; quality tier is now centralized in `Portfolio3dState`.
- Manifest now owns local placement offsets for desktop props and plants, keeping transform numbers out of scene components.
- Anchor placement applies local transform relative to the room `Anchor_*`; missing anchor fallback still uses manifest transform only.
- Non-critical loading placeholders no longer appear at origin; load/error isolation remains per asset.
- Runtime material clones are disposed on unmount without disposing shared geometry or cached GLTF textures.

## Stage 6 Completion Evidence

- KHR imported lights remain hidden by default in asset mapping, then only audited nodes are enabled: `Cove_WallWash_*`, `Pendant_Light_02`, `Pendant_Light_03`, `Spot_02_Light`, `Spot_04_Light`, and `Spot_05_Light`.
- Lighting roles are centralized as ambient/cove, key pendant, rail spots, screen accents, desk task light, and fallback fill.
- Shadow policy is centralized; only selected pendant, one high-tier rail spot, and high-tier desk task light can cast shadows.
- Shadow map size, bias, normal bias, radius, range, intensity, color, and tone-mapping exposure are configured from shared lighting/renderer config.
- Runtime mesh shadow receive/cast behavior preserves cloned glTF PBR materials while glass/hologram/display surfaces get safe render order/depth-write treatment.
- Lighting state keeps a fixed studio default for the public 3D scene.
- No bloom, neon/glitch, mass material replacement, GLB mutation, or extra dependency was added.

## Stage 7 Completion Evidence

- Camera preset resolution is centralized in `camera-navigation.ts` and maps active 3D section to existing route/camera contracts.
- Camera movement now uses guided `overview`, `focusing`, `section-open`, and `returning` states with input race protection in `Portfolio3dState`.
- `CameraNavigationRig` targets actual runtime screen/node maps when loaded and falls back to preset targets when assets are not ready.
- Camera position is clamped to room-safe bounds, with short eased transitions and reduced-motion timing from each preset.
- `/portfolio-3d` now syncs active section through `?section=...`, supports query/hash deep link, refresh, browser back/forward, and `Escape` back to overview.
- Section panel includes a `Back to overview` action without opening full detail content or final hotspot UI.

## Stage 8 Completion Evidence

- Dedicated interaction layer added for GLB hotspot hit targets; hotspot geometry stays runtime-only and invisible to the main camera.
- Hotspot definitions bind to audited named nodes from `portfolio3dHotspots`; no content-less hotspot was added.
- Small 3D ring/dot indicators added for bound hotspots with restrained cyan hover, focus, and active feedback.
- Pointer handling raycasts only against the bound hotspot target list and restores the previous raycaster layer mask after each hit-test.
- Pointer down/up tracking distinguishes click/tap from drag gestures before activation.
- DOM section navigation now uses the same hotspot activation path where a section hotspot exists, with keyboard focus feedback.
- Room controls are not exposed; door, window, ceiling, desk-lamp, and render toggles remain disabled for a cleaner portfolio UI.
- Interaction state now prioritizes portfolio section navigation and dismissible guidance; room-control state has been removed from public behavior.
- Short dismissible instruction hint added over the 3D canvas.

## Stage 9 Completion Evidence

- Dynamic screen content adapter added from existing portfolio data, public experience, architecture, API, performance, pipeline, skill, project, and profile modules.
- Lightweight `CanvasTexture` previews mapped to `Screen_Projects`, `Screen_Architecture`, `Screen_Fullstack`, `Screen_Backend`, `Hologram_Surface`, and `Phone_Display` when those meshes are present.
- Screen material replacement is effect-driven by runtime node/data availability and restores original materials on cleanup; no per-frame texture drawing was added.
- Runtime node maps now unmap on asset unmount so hidden assets do not leave stale screen or hotspot targets behind.
- Main readable detail remains in DOM panels, with concise content for Projects, Architecture, Full Stack, Backend, Performance/Quality, CI/CD & SDET, Skills, Profile, Experience, Overview, Automation, and Contact.
- Panel links are filtered to safe configured hrefs only; empty GitHub values and unconfigured links are excluded.
- Public employment detail stays intentionally brief, with CV link used for full resume information.

## Stage 10 Completion Evidence

- `ExperienceShell` now uses modern viewport sizing, safe-area padding, skip link, contact CTA, scrollable control/content panel, and non-noisy loading status.
- 3D canvas is treated as visual navigation only for assistive technology, while equivalent keyboard controls and readable section content remain in DOM.
- Navigation now has larger tap targets and responsive section controls without room toggles or public render-quality controls.
- Render quality is automatic from centralized state and renderer DPR caps while camera navigation remains guided.
- Section panel now restores focus to the active heading after section changes and keeps `Escape` back-to-overview behavior.
- Full HTML fallback added with all mapped portfolio sections, internal navigation, contact links, CV access, standard portfolio link, and Retry 3D recovery.
- Critical asset failure now surfaces a compact recovery banner with controls and HTML portfolio escape path.
- Route hash handling now ignores non-section hashes so skip links do not reset active section.
- Active button/focus/reduced-motion CSS added for the 3D shell without touching GLB geometry.

## Stage 11 Completion Evidence

- Static asset baseline documented in `docs/3d-portfolio-performance.md` with tiered GLB size totals and an explicit note for the unreferenced extra public GLB.
- Critical-first render policy is enforced: non-critical assets wait for critical completion, while active section assets remain available after the critical tier is complete.
- GLB mounting is progressive after the critical room shell, avoiding the previous all-at-once model parse bottleneck.
- Runtime capability helper centralizes network, device memory, CPU, pointer, viewport, DPR, and mobile/constrained defaults.
- Canvas render loop now runs on demand when visible and stops when the document is hidden.
- Camera transitions, scene state changes, dynamic screen updates, and pointer interactions explicitly invalidate frames only when needed.
- Pointer hover raycasting is throttled through `requestAnimationFrame` and reuses the intersection array to reduce repeated allocation.
- Dynamic screen material cleanup keeps original materials restored and disposes generated preview texture maps.
- GLB assets were not rewritten, compressed, renamed, or deleted.

## Stage 12 Completion Evidence

- Final integration handoff documented in `docs/3d-portfolio-handoff.md`.
- README now documents root 3D entry, `/portfolio-3d`, `/workspace`, asset locations, scene manifest, adding sections/hotspots, quality tiers, fallback, deployment notes, final verification commands, and known limitations.
- `.gitignore` now allows `docs/3d-portfolio-performance.md` and `docs/3d-portfolio-handoff.md` so Stage 11/12 handoff notes are not accidentally excluded.
- Static temporary-code audit found no active debug statements, focused tests, todo markers, fake domains, or replacement markers in README, docs, or 3D route/source files.
- Local `AGENTS.md` was not present in this repository root; global/session rules and the 3D master plan were followed.
- Primary root route now renders the 3D portfolio; standard workspace fallback is preserved at `/workspace`, with legacy section routes still available.
- GLB files were not rewritten, compressed, renamed, deleted, committed, pushed, or deployed.

## Validation
- Stage 0: read-only file and GLB metadata inspection only.
- Stage 1: static/read-only file review only.
- Stage 2: static/read-only file review only. No tests, linting, type checking, builds, previews, servers, dependency installs, GLB browser loading, asset moves, or old route removal were run.
- Stage 3: static/read-only file review only per user speed constraint. No tests, linting, type checking, builds, previews, servers, browser smoke, furniture placement, full asset loading, or lighting activation were run.
- Stage 4: static/read-only file review only per user speed constraint. No tests, linting, type checking, builds, previews, servers, browser smoke, asset-failure smoke, or full performance audit were run.
- Stage 5: static/read-only file review only per user speed constraint. No tests, linting, type checking, builds, previews, servers, desktop smoke, mobile smoke, or console inspection were run.

- Stage 6: static/read-only file review only per user speed constraint. No tests, linting, type checking, builds, previews, servers, low/medium/high visual smoke, or console inspection were run.
- Stage 7: static/read-only file review only per user speed constraint. No tests, linting, type checking, builds, previews, servers, route smoke, browser back smoke, or reduced-motion smoke were run.
- Stage 8: static/read-only file review only per user speed constraint. No tests, linting, type checking, builds, previews, servers, pointer smoke, keyboard smoke, mobile smoke, Escape smoke, or drag-click smoke were run.
- Stage 9: static/read-only file review only per user speed constraint. No tests, linting, type checking, builds, previews, servers, content schema tests, link smoke, or screen readability browser checks were run.
- Stage 10: static/read-only source review only per user no-test instruction. No tests, linting, type checking, builds, previews, servers, browser keyboard test, reduced-motion test, zoom test, mobile viewport test, or forced WebGL failure test were run.
- Stage 11: static/read-only source and asset-size review only per user no-test instruction. No tests, linting, type checking, builds, previews, servers, production baseline, browser performance pass, console check, memory pass, or WebGL smoke were run.
- Stage 12: final verification commands documented but not executed per user no-test instruction. No formatter, lint, typecheck, tests, production build, server, browser smoke, accessibility audit, performance audit, console check, or deployment were run.

## Root route correction

- User review found localhost:3000 still displayed the standard workspace instead of the 3D experience.
- src/app/page.tsx now renders PortfolioExperience, so / shows the 3D portfolio.
- src/app/workspace/page.tsx preserves the standard workspace entry.
- 3D shell, fallback links, section overview route paths, sitemap, README, and handoff docs now point to /workspace for the non-3D view.
- No tests, linting, type checking, build, server restart, or browser validation were run per user speed instruction.

## Current Stop Point

Stage 12 is complete. All planned 3D portfolio stages are complete. No next stage remains.


## Runtime UX Cleanup

- Room controls removed from public UI; the room uses its default presentation state.
- Render quality selector removed from public UI; the runtime now uses an automatic high-quality lightweight scene with responsive layout constraints.
