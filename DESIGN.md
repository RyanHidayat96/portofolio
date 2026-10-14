# RyanOS Amber CRT

RyanOS uses one visual language across standard portfolio and embedded room screens: a dark brown-black CRT with amber phosphor accents.

## Tokens

- Background: `#070502` and `#0b0703`
- Panels: `#181006`, `#211406`, `#241708`
- Primary phosphor: `#ffb000`
- Highlight phosphor: `#ffd24d`
- Text: `#ffe4a3`, `#e5b85e`, `#b58332`
- Status green: `#a6e22e`
- Borders: low-opacity amber, rectangular 2-3px corners

## Rules

- Use monospace for terminal labels, controls, headings, code, and metadata.
- Use amber for focus, links, diagrams, screen previews, and active navigation.
- Keep content readable: scanlines and vignette stay subtle and never block pointer input.
- Prefer solid panels and hard shadows. Avoid glassmorphism, blue/cyan neon, large gradients, and pill-heavy UI.
- Respect `prefers-reduced-motion`.
- Keep room GLB geometry, materials, textures, lighting, camera behavior, and object positions unchanged.
- Keep live embedded pages, snapshot capture, touch gestures, navigation, and all portfolio content unchanged.

## Scope

Global tokens live in `src/app/globals.css`. Embedded screen tokens are scoped under `.arcade-screen-document`. WebGL monitor preview accents live in `screen-content.ts` and mirror the amber palette.
