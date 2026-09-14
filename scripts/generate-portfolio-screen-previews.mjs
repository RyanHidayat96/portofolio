import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const previewDirectory = path.join(projectRoot, "public", "portfolio-screen-previews");
const manifestPath = path.join(
  projectRoot,
  "src",
  "features",
  "portfolio-3d",
  "embedded-screen-preview-manifest.ts"
);
const targetUrl = process.env.PORTFOLIO_PREVIEW_URL ?? "http://127.0.0.1:3000";
const forceRegenerate = process.argv.includes("--force");
const screenIds = [
  "pipeline",
  "automation",
  "performance",
  "backend",
  "terminal",
  "profile",
  "experience",
  "architecture",
  "contact"
];

const sharedDependencies = [
  "scripts/generate-portfolio-screen-previews.mjs",
  "src/app/globals.css",
  "src/features/portfolio-3d/components/ArcadeScreenSurface.tsx",
  "src/features/portfolio-3d/components/EmbeddedScreenLayer.tsx",
  "src/features/portfolio-3d/components/EmbeddedScreenSnapshot.ts",
  "src/features/portfolio-3d/components/PortfolioExperience.tsx",
  "src/features/portfolio-3d/hooks/useEmbeddedScreenScrollSession.ts"
];

const screenDependencies = {
  pipeline: [
    "src/features/portfolio-3d/components/ArcadePipelineScreen.tsx",
    "src/features/portfolio-3d/screen-content.ts",
    "src/data/portfolio-content.ts"
  ],
  automation: [
    "src/features/portfolio-3d/components/AutomationMonitorScreen.tsx",
    "src/features/portfolio-3d/screen-content.ts",
    "src/data/portfolio-content.ts"
  ],
  performance: [
    "src/features/portfolio-3d/components/PerformanceMonitorScreen.tsx",
    "src/features/portfolio-3d/screen-content.ts",
    "src/data/portfolio-content.ts"
  ],
  backend: [
    "src/features/portfolio-3d/components/ApiMonitorScreen.tsx",
    "src/features/portfolio-3d/screen-content.ts",
    "src/data/portfolio-content.ts"
  ],
  terminal: [
    "src/features/portfolio-3d/components/TerminalMonitorScreen.tsx",
    "src/features/terminal/components/TerminalPanel.tsx",
    "src/features/portfolio-3d/screen-content.ts",
    "src/data/portfolio-content.ts"
  ],
  profile: [
    "src/features/portfolio-3d/components/ProfileArtworkScreen.tsx",
    "src/features/workspace/components/ProfessionalContactActions.tsx",
    "src/features/workspace/components/TechnologyList.tsx",
    "src/data/profile.ts",
    "src/data/professional-summary.ts",
    "src/data/portfolio-content.ts"
  ],
  experience: [
    "src/features/portfolio-3d/components/ExperienceArtworkScreen.tsx",
    "src/features/workspace/components/ProfessionalContactActions.tsx",
    "src/features/workspace/components/TechnologyList.tsx",
    "src/data/professional-summary.ts",
    "src/data/portfolio-content.ts"
  ],
  architecture: [
    "src/features/architecture/components/ArchitectureExplorer.tsx",
    "src/data/architecture.ts",
    "src/data/portfolio-content.ts"
  ],
  contact: [
    "src/features/workspace/components/ContactPanel.tsx",
    "src/features/workspace/components/ProfessionalContactActions.tsx",
    "src/data/profile.ts",
    "src/data/portfolio-content.ts"
  ]
};

const existingManifest = await readExistingManifest();
const nextEntries = {};
const changedScreens = [];

await fs.mkdir(previewDirectory, { recursive: true });

for (const screenId of screenIds) {
  const publicPath = `/portfolio-screen-previews/${screenId}.webp`;
  const outputPath = path.join(previewDirectory, `${screenId}.webp`);
  const sourceHash = await hashDependencies([
    ...sharedDependencies,
    ...(screenDependencies[screenId] ?? [])
  ]);
  const previous = existingManifest[screenId];
  const outputExists = await pathExists(outputPath);
  const shouldCapture =
    forceRegenerate ||
    !outputExists ||
    !previous ||
    previous.publicPath !== publicPath ||
    previous.sourceHash !== sourceHash;

  nextEntries[screenId] = { publicPath, sourceHash };
  if (shouldCapture) changedScreens.push(screenId);
}

if (changedScreens.length === 0) {
  console.log("Static screen previews are already current.");
  process.exit(0);
}

console.log(`Generating ${changedScreens.length} static screen preview(s): ${changedScreens.join(", ")}`);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1
});

try {
  page.setDefaultTimeout(60000);
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".arcade-screen-document", { state: "attached" });
  await page.waitForFunction(
    (ids) => ids.every((id) => document.querySelector(`.arcade-screen-document--${id} .arcade-screen-content > *`)),
    screenIds
  );
  await page.evaluate(async () => {
    if ("fonts" in document) await document.fonts.ready;
  });
  await page.waitForTimeout(600);

  for (const screenId of changedScreens) {
    const outputPath = path.join(previewDirectory, `${screenId}.webp`);
    await prepareCaptureClone(page, screenId);
    await page
      .locator(`[data-portfolio-screen-preview-capture="${screenId}"] .arcade-screen-document--${screenId}`)
      .screenshot({
        path: outputPath,
        type: "webp",
        quality: 86,
        animations: "disabled"
      });
    await removeCaptureClone(page, screenId);
    console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
  }
} finally {
  await browser.close();
}

await writeManifest(nextEntries);

async function prepareCaptureClone(page, screenId) {
  await page.evaluate((id) => {
    document.querySelector(`[data-portfolio-screen-preview-capture="${id}"]`)?.remove();

    const source = document.querySelector(`.arcade-screen-document--${id}`);
    if (!(source instanceof HTMLElement)) {
      throw new Error(`Unable to find embedded screen document for ${id}.`);
    }

    const width = parseLength(source.style.width) || source.offsetWidth || 1000;
    const height = parseLength(source.style.height) || source.offsetHeight || 600;
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-portfolio-screen-preview-capture", id);
    Object.assign(wrapper.style, {
      position: "fixed",
      inset: "0 auto auto 0",
      zIndex: "2147483647",
      width: `${width}px`,
      height: `${height}px`,
      overflow: "hidden",
      background: "#0f1b29",
      pointerEvents: "none"
    });

    const clone = source.cloneNode(true);
    if (!(clone instanceof HTMLElement)) {
      throw new Error(`Unable to clone embedded screen document for ${id}.`);
    }

    clone.removeAttribute("aria-hidden");
    clone.inert = false;
    Object.assign(clone.style, {
      position: "relative",
      top: "0",
      left: "0",
      display: "block",
      visibility: "visible",
      opacity: "1",
      width: `${width}px`,
      height: `${height}px`,
      transform: "none",
      transformOrigin: "top left",
      pointerEvents: "none"
    });

    for (const element of clone.querySelectorAll("[aria-hidden='true']")) {
      element.removeAttribute("aria-hidden");
    }
    for (const element of clone.querySelectorAll("[inert]")) {
      element.inert = false;
    }

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    appendCaptureScrollIndicators(clone);

    function parseLength(value) {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    function appendCaptureScrollIndicators(root) {
      for (const element of [root, ...root.querySelectorAll("*")]) {
        if (!(element instanceof HTMLElement)) continue;
        const metrics = getScrollableMetrics(element);
        if (!metrics) continue;

        if (!element.style.position || element.style.position === "static") {
          element.style.position = "relative";
        }

        appendVerticalScrollIndicator(element, metrics);
        appendHorizontalScrollIndicator(element, metrics);
      }
    }

    function getScrollableMetrics(element) {
      const style = window.getComputedStyle(element);
      const hasVerticalScroll =
        isScrollableOverflow(style.overflowY || style.overflow) &&
        element.scrollHeight > element.clientHeight + 1;
      const hasHorizontalScroll =
        isScrollableOverflow(style.overflowX || style.overflow) &&
        element.scrollWidth > element.clientWidth + 1;

      if (!hasVerticalScroll && !hasHorizontalScroll) return undefined;

      return {
        top: Math.round(element.scrollTop),
        left: Math.round(element.scrollLeft),
        clientWidth: Math.round(element.clientWidth),
        clientHeight: Math.round(element.clientHeight),
        scrollWidth: Math.round(element.scrollWidth),
        scrollHeight: Math.round(element.scrollHeight)
      };
    }

    function appendVerticalScrollIndicator(element, metrics) {
      if (metrics.scrollHeight <= metrics.clientHeight + 1 || metrics.clientHeight < 16) return;
      const inset = 7;
      const thickness = 8;
      const trackLength = Math.max(1, metrics.clientHeight - inset * 2);
      const thumbLength = clamp(
        Math.round((metrics.clientHeight / metrics.scrollHeight) * trackLength),
        Math.min(28, trackLength),
        trackLength
      );
      const maxScroll = Math.max(1, metrics.scrollHeight - metrics.clientHeight);
      const maxTravel = Math.max(0, trackLength - thumbLength);
      const thumbOffset = Math.round((clamp(metrics.top, 0, maxScroll) / maxScroll) * maxTravel);
      const track = createCaptureIndicatorElement(
        "embedded-screen-snapshot-scrollbar embedded-screen-snapshot-scrollbar--vertical",
        [
          "position:absolute",
          `top:${inset}px`,
          "right:4px",
          `width:${thickness}px`,
          `height:${trackLength}px`,
          "border-radius:999px",
          "background:rgba(8,14,20,0.82)",
          "box-shadow:0 0 0 1px rgba(85,215,255,0.38),0 0 9px rgba(85,215,255,0.32)",
          "pointer-events:none",
          "z-index:2147483647"
        ]
      );
      const thumb = createCaptureIndicatorElement(
        "embedded-screen-snapshot-scrollbar-thumb embedded-screen-snapshot-scrollbar-thumb--vertical",
        [
          "position:absolute",
          "left:1px",
          `top:${thumbOffset}px`,
          `width:${thickness - 2}px`,
          `height:${thumbLength}px`,
          "border-radius:999px",
          "background:#66ddff",
          "box-shadow:0 0 9px rgba(102,221,255,0.88)"
        ]
      );
      track.appendChild(thumb);
      element.appendChild(track);
    }

    function appendHorizontalScrollIndicator(element, metrics) {
      if (metrics.scrollWidth <= metrics.clientWidth + 1 || metrics.clientWidth < 16) return;
      const inset = 7;
      const thickness = 8;
      const trackLength = Math.max(1, metrics.clientWidth - inset * 2);
      const thumbLength = clamp(
        Math.round((metrics.clientWidth / metrics.scrollWidth) * trackLength),
        Math.min(28, trackLength),
        trackLength
      );
      const maxScroll = Math.max(1, metrics.scrollWidth - metrics.clientWidth);
      const maxTravel = Math.max(0, trackLength - thumbLength);
      const thumbOffset = Math.round((clamp(metrics.left, 0, maxScroll) / maxScroll) * maxTravel);
      const track = createCaptureIndicatorElement(
        "embedded-screen-snapshot-scrollbar embedded-screen-snapshot-scrollbar--horizontal",
        [
          "position:absolute",
          "left:7px",
          "bottom:4px",
          `width:${trackLength}px`,
          `height:${thickness}px`,
          "border-radius:999px",
          "background:rgba(8,14,20,0.82)",
          "box-shadow:0 0 0 1px rgba(85,215,255,0.38),0 0 9px rgba(85,215,255,0.32)",
          "pointer-events:none",
          "z-index:2147483647"
        ]
      );
      const thumb = createCaptureIndicatorElement(
        "embedded-screen-snapshot-scrollbar-thumb embedded-screen-snapshot-scrollbar-thumb--horizontal",
        [
          "position:absolute",
          `left:${thumbOffset}px`,
          "top:1px",
          `width:${thumbLength}px`,
          `height:${thickness - 2}px`,
          "border-radius:999px",
          "background:#66ddff",
          "box-shadow:0 0 9px rgba(102,221,255,0.88)"
        ]
      );
      track.appendChild(thumb);
      element.appendChild(track);
    }

    function createCaptureIndicatorElement(className, declarations) {
      const element = document.createElement("div");
      element.className = className;
      element.setAttribute("aria-hidden", "true");
      element.setAttribute("style", declarations.join(";"));
      return element;
    }

    function isScrollableOverflow(value) {
      return value === "auto" || value === "scroll" || value === "overlay";
    }

    function clamp(value, minimum, maximum) {
      return Math.min(Math.max(value, minimum), maximum);
    }
  }, screenId);
}

async function removeCaptureClone(page, screenId) {
  await page.evaluate((id) => {
    document.querySelector(`[data-portfolio-screen-preview-capture="${id}"]`)?.remove();
  }, screenId);
}

async function hashDependencies(relativePaths) {
  const hash = crypto.createHash("sha256");
  for (const relativePath of relativePaths) {
    const absolutePath = path.join(projectRoot, relativePath);
    if (!(await pathExists(absolutePath))) {
      throw new Error(`Missing preview source dependency: ${relativePath}`);
    }
    hash.update(relativePath);
    hash.update("\0");
    hash.update(await fs.readFile(absolutePath));
    hash.update("\0");
  }
  return hash.digest("hex").slice(0, 16);
}

async function pathExists(absolutePath) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function readExistingManifest() {
  if (!(await pathExists(manifestPath))) return {};
  const contents = await fs.readFile(manifestPath, "utf8");
  const entries = {};
  for (const screenId of screenIds) {
    const pattern = new RegExp(
      `${screenId}:\\s*\\{\\s*publicPath:\\s*['"]([^'"]+)['"],\\s*sourceHash:\\s*['"]([^'"]*)['"]\\s*\\}`,
      "u"
    );
    const match = contents.match(pattern);
    if (match) {
      entries[screenId] = { publicPath: match[1], sourceHash: match[2] };
    }
  }
  return entries;
}

async function writeManifest(entries) {
  const generatedAt = new Date().toISOString();
  const lines = [
    "import type { EmbeddedScreenId } from './arcade-screen';",
    "",
    "export interface EmbeddedScreenPreviewEntry {",
    "  readonly publicPath: string;",
    "  readonly sourceHash: string;",
    "}",
    "",
    "export const embeddedScreenPreviewGeneratedAt =",
    `  '${generatedAt}';`,
    "",
    "export const embeddedScreenPreviewManifest = {"
  ];

  for (const screenId of screenIds) {
    const entry = entries[screenId];
    lines.push(
      `  ${screenId}: { publicPath: '${entry.publicPath}', sourceHash: '${entry.sourceHash}' },`
    );
  }

  lines.push(
    "} as const satisfies Record<EmbeddedScreenId, EmbeddedScreenPreviewEntry>;",
    "",
    "export function getEmbeddedScreenStaticPreview(",
    "  screenId: EmbeddedScreenId",
    "): EmbeddedScreenPreviewEntry | undefined {",
    "  return embeddedScreenPreviewManifest[screenId];",
    "}",
    ""
  );

  await fs.writeFile(manifestPath, lines.join("\n"));
}
