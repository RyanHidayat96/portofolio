/**
 * Two-way leak audit (runtime, real browser):
 *  A) Does Linear styling reach the 3D room?
 *  B) Does CRT/amber styling reach the standard portfolio?
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT = "C:/Users/exery/AppData/Local/Temp/portofolio-audit/leak";
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const probe = () => {
  const root = document.querySelector(".standard-portfolio");
  const room = document.querySelector(".portfolio-3d-shell") || document.querySelector("canvas");
  const sheets = [...document.styleSheets].map((s) => s.href || "(inline)");

  const firstWith = (sel) => document.querySelector(sel);
  const cs = (el, prop) => (el ? (getComputedStyle(el).getPropertyValue(prop) || "∅") : null);
  const css = (el, prop) => (el ? getComputedStyle(el).getPropertyValue(prop) || "∅" : "∅");

  const arcadeDoc = firstWith(".arcade-screen-document");
  const workspaceRoot = firstWith(".workspace-root");
  const card = firstWith(".professional-highlights article, .panel-surface");
  const nav = firstWith(".workspace-nav-button");
  const btn = firstWith(".button-primary");
  const h1 = firstWith("h1");

  // scanline overlay check: does ::before have a repeating gradient?
  const pseudoBg = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el, "::before");
    return { display: s.display, backgroundImage: s.backgroundImage.slice(0, 60), opacity: s.opacity };
  };

  return {
    hasStandardWrapper: !!root,
    hasRoomShell: !!room,
    hasArcadeDoc: !!arcadeDoc,
    linearSheetLoaded: sheets.some((h) => h.includes("linear-workspace")),
    cssSheetCount: sheets.length,

    room: arcadeDoc
      ? {
          font: css(arcadeDoc, "font-family").slice(0, 60),
          radius: cs(arcadeDoc, "border-radius"),
          bg: cs(arcadeDoc, "background-color"),
          monoToken: css(arcadeDoc, "--font-portfolio-mono").slice(0, 50)
        }
      : null,

    standard: {
      rootBg: cs(root, "background-color"),
      rootFont: css(root, "font-family").slice(0, 50),
      workspaceRootBg: cs(workspaceRoot, "background-color"),
      workspaceRootBefore: pseudoBg(workspaceRoot),
      navRadius: cs(nav, "border-radius"),
      navBg: cs(nav, "background-color"),
      cardRadius: cs(card, "border-radius"),
      cardBg: cs(card, "background-color"),
      cardBorder: cs(card, "border-color"),
      primaryBtnBg: cs(btn, "background-color"),
      h1Font: css(h1, "font-family").slice(0, 50),
      h1Tracking: cs(h1, "letter-spacing"),
      accentToken: cs(root, "--accent")
    }
  };
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  const results = {};

  // ---------- ROOM ----------
  await page.goto("http://localhost:3100/", { waitUntil: "commit" });
  await sleep(6000);
  results.roomOverview = await page.evaluate(probe);
  await page.screenshot({ path: path.join(OUT, "A1-room-overview.png") });

  for (const [label, re] of [
    ["pipeline", /pipeline/i],
    ["terminal", /terminal/i],
    ["automation", /automation/i],
    ["performance", /performance/i],
    ["backend", /backend|api/i]
  ]) {
    await page.goto("http://localhost:3100/", { waitUntil: "commit" });
    await sleep(5000);
    const ok = await page.evaluate((src) => {
      const r = new RegExp(src, "i");
      const b = Array.from(document.querySelectorAll("button")).find((x) => r.test(x.textContent || ""));
      if (b) { b.click(); return true; }
      return false;
    }, re.source);
    await sleep(4500);
    results["room_" + label] = await page.evaluate(probe);
    results["room_" + label].clicked = ok;
    await page.screenshot({ path: path.join(OUT, `A2-room-${label}.png`) });
  }

  // ---------- STANDARD ----------
  for (const slug of ["overview", "profile", "experience", "projects", "contact"]) {
    await page.goto(`http://localhost:3100/${slug}`, { waitUntil: "commit" });
    await sleep(2200);
    results["std_" + slug] = await page.evaluate(probe);
    await page.screenshot({ path: path.join(OUT, `B1-std-${slug}.png`) });
  }

  await page.goto("http://localhost:3100/workspace", { waitUntil: "commit" });
  await sleep(2200);
  results.std_landing = await page.evaluate(probe);
  await page.screenshot({ path: path.join(OUT, "B2-std-landing.png") });

  // command palette (portal may escape the wrapper -> check)
  await page.goto("http://localhost:3100/overview", { waitUntil: "commit" });
  await sleep(2000);
  await page.keyboard.press("Control+k");
  await sleep(900);
  results.std_palette = await page.evaluate(() => {
    const dlg = document.querySelector(".palette-dialog");
    const inside = dlg ? !!dlg.closest(".standard-portfolio") : null;
    const bg = dlg ? getComputedStyle(dlg).backgroundColor : null;
    const radius = dlg ? getComputedStyle(dlg).borderRadius : null;
    const font = dlg ? getComputedStyle(dlg).fontFamily.slice(0, 50) : null;
    return { paletteExists: !!dlg, insideStandardWrapper: inside, bg, radius, font };
  });
  await page.screenshot({ path: path.join(OUT, "B3-std-palette.png") });

  await browser.close();
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
