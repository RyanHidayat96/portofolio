# 3D Portfolio Stage 0 Audit

Date: 2026-09-02
Scope: read-only audit for `CODEX_3D_PORTFOLIO_MASTER_PLAN.md` Stage 0. No UI, runtime, asset, dependency, test, lint, build, or server changes were made in this stage.

## Repository Baseline

- Actual repository root: `C:/Users/exery/Documents/MyProject/portofolio`.
- Applicable repo instruction files: no project-root `AGENTS.md` was found. A dependency-owned file exists at `node_modules/next/AGENTS.md` and is not applicable to project source work.
- Git baseline before Stage 0 docs: `main...origin/main [ahead 1]`; worktree was clean.
- Remote: `origin https://github.com/RyanHidayat96/portofolio.git`.
- Package manager: npm, confirmed by `package-lock.json`.
- Deployment baseline: README recommends Vercel or another Next-compatible host. GitHub Pages static hosting would need separate export/API handling because this app uses App Router API routes and no `output: "export"` is configured.

## Stack And Entry Points

- Framework: Next.js App Router, Next `16.3.0`.
- React: `react` and `react-dom` `19.2.8`.
- Language: TypeScript with strict config in `tsconfig.json`.
- Styling: Tailwind CSS v4 through `@tailwindcss/postcss`, global design tokens in `src/app/globals.css`, shared UI in `src/components/ui`.
- 3D dependencies already present: `three` `^0.185.1` and `@react-three/fiber` `^9.7.0`.
- Icon system: `lucide-react`.
- Root route: `src/app/page.tsx` renders `RyanOSApp` with `homeWorkspaceRoute`.
- Deep links: `src/app/[...slug]/page.tsx` uses static params from `getStaticWorkspacePaths()` and metadata from `getWorkspaceRouteMetadata()`.
- Main app shell: `src/features/workspace/components/RyanOSApp.tsx` is client-side and controls landing, boot, workspace state, dynamic panels, command palette, transitions, routing, and boot storage.
- Workspace shell: `src/features/workspace/components/WorkspaceShell.tsx` renders sidebar navigation, mobile select, Home link, section header, command palette button, and section content slot.

## Current Feature Map

- Landing and overview: `Landing`, `OverviewPanel`, `ScrollNarrative`, `EngineeringCore`, `EngineeringCore3D`, `FullCycleExperience`, `CareerEvolution`, `CapabilityMatrix`.
- Portfolio sections: Overview, Profile, Experience, Projects, Contact.
- Interactive proof sections: Architecture, API Lab, Automation, Performance, Pipeline, Terminal, Test Me.
- Current navigation is one combined workspace menu; internal route state still keeps `WorkspaceMode = "recruiter" | "engineer"` for compatibility.
- Existing workspace Home action is present in the top header and points to `/`.
- Terminal command surface lives under `src/features/terminal` with parser/routing/history/autocomplete domain code.
- Simulation/lab domain logic is separated under feature folders: automation lab, performance lab, pipeline, API playground, architecture, and challenges.

## Content And Data Sources

- Primary portfolio data source: `src/data/portfolio-content.ts`.
- Re-export adapters: `src/data/branding.ts`, `profile.ts`, `experience.ts`, `public-experience.ts`, `projects.ts`, `skills.ts`, `education.ts`, `capabilities.ts`, `architecture.ts`, `api-endpoints.ts`, `pipeline-metadata.ts`, `challenges.ts`.
- Types: `src/data/types.ts`.
- Site metadata: `src/config/site.ts` uses `NEXT_PUBLIC_SITE_URL` with localhost fallback.
- Structured data: `src/config/structured-data.ts` and `src/app/StructuredData.tsx`.
- SEO routes/assets: `src/app/sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`, `twitter-image.tsx`, `icon.tsx`, `apple-icon.tsx`.
- Public assets: `public/cv.pdf`, `public/favicon.svg`, `public/ryanos-mark.svg`.
- Environment baseline: `.env.example` only documents `NEXT_PUBLIC_SITE_URL`; most personal/portfolio content still lives in typed data files.
- Known content risk: some files show mojibake for punctuation such as em dash and multiplication sign (`â€”`, `Ã—`). Fix later, not in Stage 0.

## GLB Inventory

All discovered GLB files are under `assets/`. All files read as binary glTF (`magic glTF`, version 2) and declared length matches file size. Total size: `47,505,728` bytes, about `45.3 MiB`. No asset contains animation clips, cameras, or skins.

| Asset | Bytes | Scene / Root | Key Runtime Nodes |
| --- | ---: | --- | --- |
| `architecture-screen.glb` | 1,274,148 | `RyanOS_ArchitectureScreen` / `ArchitectureScreen_Root` | `Screen_Architecture`, `Screen_ProtectiveGlass`, `Hotspot_Architecture`, `Anchor_DisplayCenter`, `Anchor_CameraFocus` |
| `ceiling-lights.glb` | 3,294,500 | `Ceiling_Lights_Scene` / `Ceiling_Lights_Root` | `Hotspot_CeilingLights`, `Hotspot_Pendant`, `Hotspot_Spot_01` through `Hotspot_Spot_06`, 10 punctual spot lights |
| `chair.glb` | 2,765,540 | `RyanOS_Chair` / `Chair_Root` | no anchors, hotspots, screens, lights, or cameras |
| `desk-accessories.glb` | 2,680,564 | `RyanOS_DeskAccessories` / `DeskAccessories_Root` | `Phone_Display`, `Hotspot_DeskAccessories`, `Anchor_Mug`, `Anchor_Phone`, `Anchor_Notebook` |
| `desk-lamp.glb` | 2,492,032 | `RyanOS_DeskLamp` / `DeskLamp_Root` | `Hotspot_DeskLamp`, `Anchor_LampBase`, `Anchor_SpotLight`, `Anchor_LightTarget`; no glTF light nodes |
| `desk.glb` | 1,049,196 | `RyanOS_Desk` / `Desk_Root` | no anchors, hotspots, screens, lights, or cameras |
| `hologram-projector.glb` | 2,512,136 | `RyanOS_HologramProjector` / `HologramProjector_Root` | `Hologram_Surface`, `Hotspot_Performance`, `Anchor_HologramCenter`, `Anchor_CameraFocus` |
| `keyboard-mouse.glb` | 5,074,116 | `RyanOS_KeyboardMouse` / `KeyboardMouse_Root` | `Hotspot_Terminal`, `Anchor_KeyboardCenter`, `Anchor_MouseCenter` |
| `laptop.glb` | 2,727,076 | `RyanOS_Laptop` / `Laptop_Root` | `Screen_Fullstack`, `Screen_DisplayGlass`, `Hotspot_Fullstack`, `Anchor_DisplayCenter`, `Anchor_CameraFocus` |
| `main-monitor.glb` | 2,310,888 | `RyanOS_MainMonitor` / `MainMonitor_Root` | `Screen_Projects`, `Screen_AntiGlareGlass`, `Hotspot_Projects`, `Anchor_DisplayCenter`, `Anchor_CameraFocus` |
| `pipeline-console.glb` | 3,015,672 | `RyanOS_PipelineConsole` / `PipelineConsole_Root` | `Hotspot_CICDPipeline`, `Anchor_PipelineConsole`, `Anchor_DisplayCenter` |
| `plants.glb` | 5,341,308 | `RyanOS_Plants` / `Plants_Root` | `Hotspot_Plants`, `Anchor_TallPlant`, `Anchor_DeskPlant`, `Anchor_PothosPlant` |
| `room-shell.glb` | 3,910,936 | `Room_Shell_Scene` / `Room_Shell_Root` | room anchors, colliders, navmesh, `Door_Pivot`, `Hotspot_Profile`, `Hotspot_Window`, `Hotspot_Door`, `Hotspot_RoomLighting`, 4 cove spot lights |
| `server-rack.glb` | 4,920,588 | `RyanOS_ServerRack` / `ServerRack_Root` | `Screen_Backend`, `Screen_BackendGlass`, `Hotspot_Backend`, `Anchor_DisplayCenter`, `Anchor_CameraFocus` |
| `storage-shelf.glb` | 4,137,028 | `RyanOS_StorageShelf` / `StorageShelf_Root` | `Hotspot_EngineeringLab`, `Anchor_StorageShelf`, `Anchor_ShelfLighting` |

## Room Shell Anchors And Runtime Nodes

`room-shell.glb` contains the expected primary anchors:

- `Anchor_Desk`
- `Anchor_Chair`
- `Anchor_MainMonitor`
- `Anchor_ArchitectureScreen`
- `Anchor_ServerRack`
- `Anchor_HologramProjector`
- `Anchor_StorageShelf`
- `Anchor_PipelineConsole`
- `Anchor_CeilingLights`
- `Anchor_WindowBackdrop`

Runtime-only/support nodes found:

- `Room_Colliders`
- `Collider_Floor`
- `Collider_BackWall`
- `Collider_LeftWall_Back`
- `Collider_LeftWall_Front`
- `Collider_RightWall_Back`
- `Collider_Ceiling`
- `NavMesh_Room`
- `Door_Pivot`

## Node Contract Differences

- `pipeline-console.glb`: plan expects `Hotspot_Pipeline`; actual node is `Hotspot_CICDPipeline`. Stage 1 should define an alias instead of renaming model data.
- `storage-shelf.glb`: plan leaves local hotspot open-ended; actual useful hotspot is `Hotspot_EngineeringLab`.
- `desk.glb` and `chair.glb`: plan mentions main/local anchors if available; actual assets have no named anchors or hotspots.
- `desk-lamp.glb`: plan allows light/switch if available; actual asset has anchors and hotspot but no imported glTF light.
- `ceiling-lights.glb`: actual file has KHR punctual lights and extra control hotspots; future runtime must avoid duplicating lights blindly.
- All GLB files have zero camera and animation clips; camera navigation and motion must be implemented in app code.

## Preserve

- Keep App Router/deep-link routes and metadata architecture.
- Keep typed data modules as source of truth; do not duplicate portfolio facts in 3D modules.
- Keep existing public CV and contact integration.
- Keep deterministic domain logic in labs; transform it into overlays/screens/hotspots rather than rewriting logic.
- Keep shared UI primitives and CSS tokens where they support the new premium interface.
- Keep non-3D/fallback portfolio path available for accessibility and low-device support.

## Redesign Or Integrate Later

- Replace the current decorative engineering core/map with the real 3D workstation experience once the staged runtime is ready.
- Integrate existing sections into 3D hotspots: Projects -> main monitor, Full Stack/Profile -> laptop, Architecture -> architecture screen, Backend/API -> server rack, Performance -> hologram projector, Pipeline/Automation -> pipeline console, Terminal -> keyboard/mouse, Contact/Profile -> room interaction or DOM panel.
- Simplify public biography/work history panels to stay portfolio-safe and CV-first.
- Collapse or remove internal `recruiter/engineer` mode language if it no longer serves the single-menu UX.
- Move or expose GLB assets through a deployment-safe asset URL strategy; current `assets/` path is not browser-public by default.

## Technical Risks

- Asset weight is large for first load; critical tier must not wait for all `45.3 MiB` of GLB files.
- GLB files live outside `public/`; GLTFLoader cannot fetch them by URL unless Stage 1/2 creates a safe serving/import strategy.
- Next 16 + React 19 + R3F version compatibility must be respected; no unnecessary dependency churn.
- Imported KHR lights can create overdraw/shadow cost if duplicated or all set to cast shadows.
- No authored cameras/animations means app-side camera presets, collision limits, and reduced-motion paths are mandatory.
- Current custom cursor and scroll-selected states have prior UX complaints; pointer/tap handling must be deliberate in Stage 8.
- GitHub Pages hosting may break dynamic/API features unless deployment strategy remains Next-compatible or export constraints are handled separately.
- Content encoding issues may degrade professionalism and should be corrected in a later content/stability stage.

## Adaptation Decisions

- Treat `room-shell.glb` as the coordinate and anchor source of truth.
- Use actual node names from audit; do not rename or edit GLB files in the staged implementation.
- Add alias only for proven mismatch: `Hotspot_Pipeline` -> `Hotspot_CICDPipeline`.
- Use progressive loading tiers from the master plan: critical, near, deferred.
- Build 3D contract/manifest first, then runtime, then room shell, then asset placement.
- Keep all user-sensitive or overly detailed career facts out of the visual surface unless already intended for public portfolio display; detailed history belongs in CV.

## Final Stage 0 Validation

Read-only inspection matched the repository files, source tree, git state, package metadata, route files, data files, public assets, and GLB binary metadata. No tests, linting, type checking, build, preview, server, package install, asset move, or UI implementation was run.
