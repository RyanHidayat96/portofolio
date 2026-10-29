# RyanOS Visual Boundaries

RyanOS has two deliberately separate visual systems. They share content and
navigation contracts, but never share visual tokens, typography, effects, or
component overrides.

## 3D Room And Embedded Monitors

The room is an amber CRT environment.

- Owner CSS: `src/app/globals.css`
- Root selectors: `.portfolio-3d-shell` and `.arcade-screen-document`
- Fonts: `--font-portfolio-sans`, `--font-portfolio-mono`, and
  `--font-crt-mono`
- Characteristics: amber phosphor, CRT scanlines, screen curvature, monitor
  materials, room controls, and room-only overlays.
- Immutable boundary: GLB geometry, materials, textures, lighting, cameras,
  object positions, touch controls, snapshots, and screen interactions remain
  room concerns.

Embedded documents intentionally use `.arcade-screen-document` so they retain
monitor-specific rendering without inheriting standard portfolio design.

## Standard Portfolio

The standard portfolio is a Linear-inspired dark product workspace.

- Owner CSS: `src/app/linear-workspace.css`
- Root selector: `.standard-portfolio`
- Fonts: `--font-linear-sans` and `--font-linear-mono`
- Palette: near-black surfaces, `#5e6ad2` lavender for primary interaction,
  green only for successful status, and red only for errors.
- Characteristics: clean sans-serif hierarchy, 1px hairlines, 8px controls,
  12px panels, restrained shadows, no scanlines, no CRT glow, no amber theme,
  and no retro monitor curvature.

`PortfolioApp` owns `.standard-portfolio` around landing, boot, workspace, and
command palette. Every selector in `linear-workspace.css` stays below that
boundary. Never add Linear rules to `globals.css` or use unscoped
`.workspace-*` selectors in a new stylesheet.

## Shared Rules

- Data, routes, keyboard support, reduced-motion behavior, and accessibility
  remain shared behavior, not design ownership.
- Keep presentation colors behind their owning scope. Do not use global color
  overrides to make one mode resemble the other.
- New 3D styling starts with `.portfolio-3d-shell` or
  `.arcade-screen-document`.
- New standard styling starts with `.standard-portfolio`.
- Shared components may use semantic CSS variables. Their values come from
  closest owning root and must not be hard-coded globally.

## Verification

For every visual change, check independently:

1. `/` retains amber CRT room controls and embedded monitor styling.
2. `/overview`, `/profile`, `/experience`, `/projects`, `/contact`, and every
   `/labs/*` route retain Linear typography, lavender interaction, and dark
   product surfaces.
3. No Linear stylesheet selector matches an element outside
   `.standard-portfolio`.
4. No room selector changes standard workspace layout, colors, or fonts.
