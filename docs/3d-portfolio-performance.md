# 3D Portfolio Performance Notes

Authoritative plan: `CODEX_3D_PORTFOLIO_MASTER_PLAN.md`
Stage: 11
Date: 2026-09-02

## Measurement Method

User requested no tests, linting, type checking, builds, previews, servers, or browser validation. This note records reproducible static measurements only.

Command-equivalent source: file sizes from `public/models/portfolio-3d` and loading tiers from `src/features/portfolio-3d/scene-manifest.ts`.

## Static Asset Baseline

Manifest-referenced GLB assets:

- Critical tier: 10,036,560 bytes, about 9.57 MiB.
- Near tier: 14,728,448 bytes, about 14.05 MiB.
- Deferred tier: 22,740,720 bytes, about 21.69 MiB.
- Total manifest-referenced GLB size: 47,505,728 bytes, about 45.31 MiB.

Public folder also contains `chair mntap.glb` at 3,181,376 bytes. It is not referenced by the Stage 11 manifest or runtime, so it should not transfer on the `/portfolio-3d` route unless linked separately. Keep or remove decision is left for final cleanup because Stage 11 forbids GLB rewriting and avoids asset deletion without explicit owner approval.

## Stage 10 Runtime Policy Before Hardening

- Canvas used the default React Three Fiber render loop.
- Critical tier preloaded immediately.
- Near tier preloaded after critical completion.
- Deferred tier preloaded on idle when device/network signals allowed.
- DPR was capped at 1.5 but not tied to selected quality tier.
- Pointer hover raycasting could run once per pointermove event.
- Hidden browser tabs had no explicit render-loop gate.

## Stage 11 Runtime Policy After Hardening

- Canvas uses `frameloop="demand"` while visible and `frameloop="never"` while the document is hidden.
- Camera transitions and door animation explicitly invalidate frames only while animation is active.
- Scene state changes explicitly invalidate frames for quality, lighting, environment, section, hover, focus, and asset-map changes.
- Render DPR now follows quality tier and runtime hints:
  - low: 0.75 to 1.0
  - medium: 1.0 to 1.25
  - high: 1.0 to 1.5, capped lower on constrained devices
- Narrow/coarse-pointer or lower-memory devices start at medium quality.
- Low quality keeps critical assets and active-section assets available without auto-loading near/deferred tiers.
- Medium quality allows near tier but does not idle-preload deferred tier.
- High quality idle-preloads deferred tier only on capable devices.
- Pointer hover hit-testing is throttled with `requestAnimationFrame` and reuses the raycaster intersection array.
- Dynamic screen textures remain update-on-data-change only and dispose generated texture maps on cleanup.
- GLB scenes remain cached by `useLoader`; cloned runtime materials are disposed on unmount without disposing shared cached textures.

## Runtime Metrics Not Claimed

Transfer timing, first render timing, frame behavior, draw calls, triangles, texture memory, long tasks, console errors, and memory behavior were not measured because no production build, server, preview, browser validation, or automated performance pass was run in this stage per user instruction.

## Next Validation Candidate

When allowed, Stage 12 should run one production build and one browser smoke pass for `/portfolio-3d`, then record real runtime metrics beside this static baseline.