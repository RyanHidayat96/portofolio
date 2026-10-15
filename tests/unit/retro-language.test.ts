import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const read = (relativePath: string): string => readFileSync(path.join(root, relativePath), "utf8");

const globalsCss = read("src/app/globals.css");

const sourceFiles = [
  "src/features/performance-lab/components/PerformanceLab.tsx",
  "src/features/pipeline/components/PipelineSimulatorPanel.tsx",
  "src/features/automation-lab/components/AutomationLab.tsx",
  "src/features/api-playground/components/ApiPlayground.tsx",
  "src/features/challenges/components/ChallengePanel.tsx",
  "src/features/terminal/components/TerminalPanel.tsx",
  "src/features/workspace/components/FullCycleExperience.tsx",
  "src/features/workspace/components/WorkspaceShell.tsx",
  "src/features/workspace/components/CommandPalette.tsx",
  "src/features/portfolio-3d/components/PortfolioExperience.tsx",
  "src/features/portfolio-3d/components/ExperienceShell.tsx"
];

/** Colour literals that mean "cool/neutral" and must not survive the amber CRT language. */
const coolLiterals = [
  "#8a96a8",
  "#556174",
  "#6d788a",
  "#eef5ff",
  "#0b0f16",
  "#111722",
  "#10141d",
  "#293241",
  "#080d14",
  "#0b1018",
  "#03060a",
  "#63798b",
  "#05070b",
  "#04060a",
  "#06090e",
  "#dce8ff",
  "#c9dcff",
  "#cfe3ff",
  "#d8e6ff",
  "#dce9ff",
  "#101923",
  "#0b121b",
  "#152234",
  "#8ccfff",
  "#7fbef1",
  "#b8d7ff",
  "#9bd7ff",
  "#cdefff",
  "#bfe8ff",
  "#48d5ff",
  "#5edcff",
  "#63dfff",
  "#59d7ff",
  "#72ffd5",
  "#52d9ff",
  "#49d8ff",
  "#95d9ff",
  "#9feaff",
  "#4bd8ff",
  "#66f2ff",
  "#46dfff",
  "#8fb5c3",
  "#ffffff"
];

describe("amber CRT language", () => {
  it("keeps the design tokens on the amber palette", () => {
    expect(globalsCss).toContain("--accent: #ffb000");
    expect(globalsCss).toContain("--background: #070502");
    expect(globalsCss).toContain("--radius-panel: 3px");
    expect(globalsCss).toContain("--radius-control: 2px");
  });

  it("defines the CRT overlay tokens instead of hard-coding opacity", () => {
    expect(globalsCss).toContain("--crt-scanlines:");
    expect(globalsCss).toContain("--crt-vignette:");
    expect(globalsCss).toContain("--crt-scanline-opacity:");
    expect(globalsCss).toContain("--crt-vignette-opacity:");
    expect(globalsCss).toContain("--crt-text-glow:");
    expect(globalsCss).toContain("--crt-surface-bow:");
  });

  it("uses dark inter-line scanlines rather than an amber tint", () => {
    const scanlineBlock = globalsCss.slice(
      globalsCss.indexOf("--crt-scanlines:"),
      globalsCss.indexOf("--crt-vignette:")
    );
    expect(scanlineBlock).toContain("rgba(0, 0, 0,");
    expect(scanlineBlock).not.toContain("rgba(255, 176, 0,");
  });

  it("keeps CRT overlays out of the pointer path", () => {
    expect(globalsCss).toContain("pointer-events: none;");
    expect(globalsCss).toMatch(/\.workspace-root::before,[\s\S]{0,200}?z-index: 30;/);
    expect(globalsCss).toMatch(/\.workspace-root::after,[\s\S]{0,200}?z-index: 31;/);
  });

  it("disables CRT motion and glow under prefers-reduced-motion", () => {
    const reduceBlock = globalsCss.slice(
      globalsCss.lastIndexOf("@media (prefers-reduced-motion: reduce)")
    );
    expect(reduceBlock).toContain("animation: none;");
    expect(reduceBlock).toContain("text-shadow: none;");
    expect(reduceBlock).toContain("transform: none;");
  });

  it("defines every shadow token that components consume", () => {
    for (const token of [
      "--shadow-panel:",
      "--shadow-panel-soft:",
      "--shadow-soft:",
      "--shadow-focus:"
    ]) {
      expect(globalsCss).toContain(token);
    }
  });

  it("ships a blinking block caret for the terminal", () => {
    expect(globalsCss).toContain(".terminal-caret {");
    expect(globalsCss).toContain("@keyframes terminal-caret-blink");
    expect(read("src/features/terminal/components/TerminalPanel.tsx")).toContain(
      'className="terminal-caret"'
    );
  });

  it("keeps the standard portfolio entry route reachable", () => {
    const routing = read("src/features/workspace/routing.ts");
    const proxy = read("src/proxy.ts");
    expect(routing).toContain('export const workspaceEntryPath = "/workspace"');
    expect(routing).toContain("firstSegment === workspaceEntrySegment");
    expect(proxy).toContain("workspaceEntryPath");
    expect(read("src/app/workspace/page.tsx")).toContain("PortfolioApp");
  });

  it.each(sourceFiles)("leaves no cool colour literal in %s", (file) => {
    const source = read(file);
    const found = coolLiterals.filter((literal) => source.includes(literal));
    expect(found).toEqual([]);
  });

  it("keeps the room lighting rig on the amber family", () => {
    const lighting = read("src/features/portfolio-3d/lighting-config.ts");
    for (const coolLight of [
      "#48d5ff",
      "#5edcff",
      "#63dfff",
      "#59d7ff",
      "#72ffd5",
      "#52d9ff",
      "#49d8ff",
      "#8ccfff",
      "#7fbef1",
      "#b8d7ff",
      "#9bd7ff",
      "#cdefff",
      "#bfe8ff"
    ]) {
      expect(lighting).not.toContain(coolLight);
    }
    expect(lighting).toMatch(/color: ["']#ffb000["']/);
  });

  it("keeps embedded scrollbars amber", () => {
    const steelScrollbars = globalsCss.match(/scrollbar-color: #63798b/g) ?? [];
    expect(steelScrollbars).toEqual([]);
  });
});
