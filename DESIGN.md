# RyanOS Amber CRT

RyanOS uses one visual language across standard portfolio and embedded room screens: a dark brown-black CRT with amber phosphor accents.

## Tokens

- Background: `#070502` and `#0b0703`
- Panels: `#181006`, `#211406`, `#241708`
- Primary phosphor: `#ffb000`
- Highlight phosphor: `#ffd24d`
- Text: `#ffe4a3`, `#e5b85e`, `#b58332`
- Status: `#ffc24a` amber
- Borders: low-opacity amber, rectangular 2-3px corners

## CRT effect tokens

Defined in `:root` and used by the `.workspace-root` / `.landing-shell` / `.system-awakening-shell` / `.arcade-screen-document` overlays:

- `--crt-scanlines`: dark 1px line every 4px (`rgba(0, 0, 0, 0.34)`) — a real inter-line gap, not an amber tint.
- `--crt-vignette`: radial falloff toward the glass edges.
- `--crt-scanline-opacity` (`0.22`) and `--crt-vignette-opacity` (`0.42`) keep the two overlays separately tunable and legible.
- `--crt-text-glow` / `--crt-text-glow-strong`: amber phosphor bloom, applied to text-bearing elements only (`.mono`, headings, buttons, badges, terminal) so media and panels stay sharp.
- `--crt-surface-bow`: perspective transform applied to `.workspace-content` and the sticky header row so the scrolling plane bows with the glass while the overlays stay flat.
- `--terminal-caret-color` + `@keyframes terminal-caret-blink`: the blinking block caret on the terminal prompt.

All overlays are `pointer-events: none` and sit at `z-index: 30` (scanlines) / `31` (vignette); the vignette also carries the faint 8s refresh ripple. Under `prefers-reduced-motion` the ripple, the bow, and all text glow switch off and the overlays dim.

## Rules

- Use monospace for terminal labels, controls, headings, code, and metadata.
- Use amber for focus, links, diagrams, screen previews, and active navigation.
- Keep content readable: scanlines and vignette stay subtle and never block pointer input.
- Prefer solid panels and hard shadows. Avoid glassmorphism, blue/cyan neon, large gradients, and pill-heavy UI.
- Respect `prefers-reduced-motion`.
- Keep room GLB geometry, materials, textures, lighting, camera behavior, and object positions unchanged.
- Keep live embedded pages, snapshot capture, touch gestures, navigation, and all portfolio content unchanged.

## Routes

- `/` — 3D room.
- `/workspace` — standard portfolio landing phase (BootSequence on initialize).
- `/overview`, `/profile`, `/experience`, `/projects`, `/terminal`, `/challenge`, `/contact` — workspace sections.
- `/labs`, `/labs/<automation|pipeline|performance|api|architecture>` — engineer-mode sections.
- `/hire` — recruiter-mode alias for the overview.

`getStaticWorkspacePaths()` covers every path above except `/workspace`, which is served by `src/app/workspace/page.tsx`; both `src/proxy.ts` and `src/app/sitemap.ts` include it explicitly through `workspaceEntryPath`.

## Scope

Global tokens live in `src/app/globals.css`. Embedded screen tokens are scoped under `.arcade-screen-document`. WebGL monitor preview accents live in `screen-content.ts` and mirror the amber palette.

Components consume design tokens (`var(--text-muted)`, `var(--surface-raised)`, …) rather than raw colour literals; `tests/unit/retro-language.test.ts` guards that rule, the CRT tokens, reduced-motion handling, and the route wiring.
