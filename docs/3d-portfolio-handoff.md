# 3D Portfolio Handoff

Authoritative plan: `CODEX_3D_PORTFOLIO_MASTER_PLAN.md`
Date: 2026-09-02
Status: Stage 12 handoff prepared without deployment.

## Implemented Scope

- Promoted the progressive 3D portfolio to `/`, kept `/portfolio-3d` as an explicit 3D route, and moved the standard workspace fallback to `/workspace`.
- Added manifest-driven GLB loading, placement, hotspot mapping, camera presets, lighting policy, section routing, and DOM content panels.
- Kept portfolio facts sourced from existing data modules and avoided adding private employment detail beyond the CV-first public summary.
- Added full HTML fallback for unsupported WebGL or fatal 3D runtime failure.
- Added runtime hardening for critical-first loading, tiered preload behavior, adaptive DPR, demand-based rendering, hidden-tab pause, and explicit invalidation.

## Files to Know

- `src/app/page.tsx` - primary 3D route entry.
- `src/app/portfolio-3d/page.tsx` - explicit 3D route entry.
- `src/app/workspace/page.tsx` - standard workspace fallback entry.
- `src/features/portfolio-3d/scene-manifest.ts` - asset, node, tier, placement, and fallback transform source of truth.
- `src/features/portfolio-3d/section-contracts.ts` - section-to-content and section-to-route mapping.
- `src/features/portfolio-3d/camera-presets.ts` - guided camera presets.
- `src/features/portfolio-3d/screen-content.ts` - lightweight 3D screen preview content from existing data.
- `src/features/portfolio-3d/components/PortfolioExperience.tsx` - top-level client runtime.
- `src/features/portfolio-3d/components/Portfolio3dHtmlFallback.tsx` - complete no-WebGL fallback.
- `public/models/portfolio-3d` - browser-served GLB files.
- `docs/3d-asset-contract.md` - asset contract and node expectations.
- `docs/3d-portfolio-performance.md` - static size baseline and performance policy notes.

## Static Definition of Done Review

- Existing stack, App Router, Tailwind, npm lockfile, and standard workspace fallback are preserved.
- Asset and section behavior is centralized in manifest/data files.
- Main portfolio content remains available in DOM through panels and fallback.
- Hotspots have DOM-equivalent navigation controls.
- WebGL failure and per-asset failure have recovery/fallback paths.
- Critical loading does not intentionally wait for near/deferred asset tiers.
- Runtime helper controls quality tier, DPR, preload limits, and hidden-tab frame behavior.
- GLB source assets were not modified, rewritten, compressed, renamed, or deleted.
- No commit, push, or deployment was performed.

## Validation Not Run

The owner requested no tests, linting, type checking, builds, previews, servers, or browser validation during staged implementation. Because of that, the following remain unverified at runtime:

- production build success;
- TypeScript and lint success;
- route smoke on `/`, `/portfolio-3d`, and `/workspace`;
- desktop and mobile visual framing;
- keyboard and reduced-motion behavior in browser;
- WebGL failure fallback in browser;
- asset failure path in browser;
- console errors;
- memory growth and real frame behavior.

## Final Validation Commands When Allowed

```bash
npm run format
npm run lint
npm run typecheck
npm test
npm run build
```

After build, perform one browser smoke pass for `/`, `/portfolio-3d`, `/workspace`, section deep links, browser back/forward, mobile viewport, keyboard-only navigation, reduced motion, WebGL failure fallback, asset failure recovery, and console errors.

## Known Limitations

- `public/models/portfolio-3d/chair mntap.glb` is present but not referenced by `scene-manifest.ts`; it should stay untouched until the owner approves deletion or use.
- Static asset totals are documented, but runtime performance metrics are not claimed.
- GitHub Pages deployment under a subpath needs consistent `NEXT_PUBLIC_BASE_PATH` configuration and may need static export work for API-route compatibility.