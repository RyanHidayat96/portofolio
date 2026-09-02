# 3D Asset Contract

Date: 2026-09-02
Stage: 1 - Architecture, data contracts, and integration plan

## Module Location

The 3D portfolio foundation lives in `src/features/portfolio-3d`.

This matches the existing feature-oriented layout under `src/features/*` and keeps 3D runtime contracts separate from current workspace UI, labs, terminal, and data modules.

## Files Added

- `src/features/portfolio-3d/types.ts` - shared asset, hotspot, section, camera, route, event, and alias types.
- `src/features/portfolio-3d/scene-manifest.ts` - typed inventory for all 15 GLB assets.
- `src/features/portfolio-3d/section-contracts.ts` - data-driven mapping from 3D sections to existing portfolio data.
- `src/features/portfolio-3d/camera-presets.ts` - centralized camera presets and transition timing.
- `src/features/portfolio-3d/route-map.ts` - section-to-route and query mapping.
- `src/features/portfolio-3d/interaction-events.ts` - interaction state and event constants.
- `src/features/portfolio-3d/node-aliases.ts` - proven node-name alias resolution and dev warning.
- `src/features/portfolio-3d/asset-url.ts` - base-path-safe asset URL helper.
- `src/features/portfolio-3d/index.ts` - public exports for later stages.

No canvas, loader, UI replacement, package install, asset move, test, lint, typecheck, build, preview, or server run happened in Stage 1.

## Asset Source And Runtime URL

Current source GLB files remain in repository root `assets/`.

The runtime public path contract is centralized as:

```text
/models/portfolio-3d/<file>.glb
```

`asset-url.ts` resolves that path through `NEXT_PUBLIC_BASE_PATH` when needed, so a deployment under a subpath such as GitHub Pages can resolve asset URLs through one helper instead of hardcoded strings.

Stage 1 did not move assets. A later stage must choose the serving strategy, such as copying or moving models into a public-served path, without duplicating hardcoded URLs.

## Coordinate System

- Source of truth: `room-shell.glb`.
- Coordinate basis: glTF convention, Y-up.
- Room bounds from Stage 0 audit: min `[-3.12, -0.098, -2.37]`, max `[3.12, 3.12, 2.25]`.
- Placement rule: use `Anchor_*` transforms from `room-shell.glb` when available.
- Fallback rule: every fallback transform lives in `scene-manifest.ts`; no per-component magic transforms.
- Runtime hidden rule: colliders, navmesh, anchors, and geometry hotspots may be used for logic but must not render as visible props.

## Loading Tiers

| Tier | Assets |
| --- | --- |
| critical | `room-shell` |
| near | `ceiling-lights`, `desk`, `chair`, `main-monitor`, `architecture-screen`, `laptop`, `server-rack`, `hologram-projector` |
| deferred | `pipeline-console`, `keyboard-mouse`, `storage-shelf`, `desk-lamp`, `desk-accessories`, `plants` |

Critical asset loads the authored room first. Anchored GLB props mount progressively after the room is usable, so the original asset style returns without blocking first render.

## Responsive Quality

Render quality is automatic. Public UI must not expose Low/Medium/High controls.

## Room Anchors

`room-shell.glb` provides:

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

## Dynamic Screens

| Screen Node | Asset | Content Source |
| --- | --- | --- |
| `Screen_Projects` | `main-monitor` | `@/data/projects` |
| `Screen_Architecture` | `architecture-screen` | `@/data/architecture` |
| `Screen_Fullstack` | `laptop` | `@/data/capabilities`, `@/data/projects` |
| `Screen_Backend` | `server-rack` | `@/data/api-endpoints`, `@/data/capabilities` |
| `Hologram_Surface` | `hologram-projector` | `@/features/performance-lab/domain` |
| `Phone_Display` | `desk-accessories` | `@/data/profile.contact` |

Main readable content must remain DOM-based. 3D screens should be lightweight previews only.

## Hotspot Contract

| Hotspot | Asset | Action |
| --- | --- | --- |
| `Hotspot_Profile` | `room-shell` | open Profile |
| `Hotspot_Projects` | `main-monitor` | open Projects |
| `Hotspot_Architecture` | `architecture-screen` | open Architecture |
| `Hotspot_Fullstack` | `laptop` | open Full Stack/Profile route |
| `Hotspot_Backend` | `server-rack` | open API/Backend route |
| `Hotspot_Performance` | `hologram-projector` | open Performance |
| `Hotspot_CICDPipeline` | `pipeline-console` | open Pipeline |
| `Hotspot_Terminal` | `keyboard-mouse` | open Terminal |
| `Hotspot_EngineeringLab` | `storage-shelf` | open Automation |
| `Hotspot_DeskAccessories` | `desk-accessories` | open Contact |
| `Hotspot_Plants` | `plants` | inspect prop |

## Node Alias

Only one proven alias exists from Stage 0:

| Requested | Actual | Asset |
| --- | --- | --- |
| `Hotspot_Pipeline` | `Hotspot_CICDPipeline` | `pipeline-console` |

The alias is centralized in `node-aliases.ts` and warns once in development.

## Lighting Contract

Imported lights exist in:

- `room-shell.glb`: `Cove_WallWash_1` through `Cove_WallWash_4`.
- `ceiling-lights.glb`: `Pendant_Light_01` through `Pendant_Light_04`, `Spot_01_Light` through `Spot_06_Light`.

Later stages must audit imported lights before adding any new lights. Not every imported light may cast shadows.

## Runtime Hidden Nodes

- `Room_Colliders`
- `Collider_Floor`
- `Collider_BackWall`
- `Collider_LeftWall_Back`
- `Collider_LeftWall_Front`
- `Collider_RightWall_Back`
- `Collider_Ceiling`
- `NavMesh_Room`
- Door, window, lamp, and render quality controls are intentionally not exposed in the public UI.

## Section Data Contract

3D sections point to existing source modules:

| 3D Section | Workspace Route | Data Source |
| --- | --- | --- |
| overview | `/` | branding, profile, capabilities |
| profile | `/profile` | profile, publicExperience, education |
| experience | `/experience` | publicExperience, profile |
| projects | `/projects` | projects |
| fullstack | `/profile?section=fullstack` concept | capabilities, projects |
| backend | `/labs/api?section=backend` concept | apiEndpoints, capabilities |
| architecture | `/labs/architecture` | architectureMap, architecturePresets |
| automation | `/labs/automation` | automation domain, capabilities |
| performance | `/labs/performance` | performance lab domain |
| pipeline | `/labs/pipeline` | pipeline metadata/domain |
| terminal | `/terminal` | terminal domain |
| contact | `/contact` | profile.contact |

No portfolio facts were copied into 3D content. Labels and strategies are structural UI contracts only.

## Route And State Contract

- Query param reserved for 3D section focus: `section`.
- Navigation states: `overview`, `focusing`, `section-open`, `returning`.
- Events: `hotspot.focus`, `hotspot.activate`, `camera.transition`, `route.sync`.
- Reduced motion is part of every camera preset.

## Stage 1 Validation

Validation was static/read-only only, per user instruction. I inspected the created files and git status, but did not run tests, linting, type checking, builds, previews, or a server.
