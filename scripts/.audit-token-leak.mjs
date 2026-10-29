/**
 * Token-leak scanner.
 * ROOM must contain: zero lavender (#5e6ad2 / 94,106,210), zero Geist.
 * STANDARD must contain: zero amber (#ffb000 / 255,176,0 family), zero VT323.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT = "C:/Users/exery/AppData/Local/Temp/portofolio-audit/leak";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const scan = ({ amberList, lavenderList }) => {
  const amber = new Set(amberList);
  const lavender = new Set(lavenderList);
  const amberHits = {};
  const lavenderHits = {};
  const vt323Hits = [];
  const geistHits = [];

  const els = document.querySelectorAll("body *");
  for (const el of els) {
    const cs = getComputedStyle(el);
    const props = {
      color: cs.color,
      bg: cs.backgroundColor,
      borderTop: cs.borderTopColor,
      borderLeft: cs.borderLeftColor,
      outline: cs.outlineColor,
      fill: cs.fill,
      stroke: cs.stroke
    };
    for (const [k, v] of Object.entries(props)) {
      if (!v || v === "none") continue;
      if (amber.has(v)) (amberHits[k] ??= []).push(el.tagName + "." + (el.className || "").toString().slice(0, 40));
      if (lavender.has(v)) (lavenderHits[k] ??= []).push(el.tagName + "." + (el.className || "").toString().slice(0, 40));
    }
    const ff = cs.fontFamily || "";
    if (/vt323|crtFont/i.test(ff)) vt323Hits.push(el.tagName + "." + (el.className || "").toString().slice(0, 40));
    if (/linearSans|Geist/i.test(ff)) geistHits.push(el.tagName + "." + (el.className || "").toString().slice(0, 40));
  }
  const summarize = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { n: v.length, sample: v.slice(0, 4) }]));
  return {
    amber: summarize(amberHits),
    lavender: summarize(lavenderHits),
    vt323Count: vt323Hits.length,
    vt323Sample: vt323Hits.slice(0, 5),
    geistCount: geistHits.length,
    geistSample: geistHits.slice(0, 5),
    totalEls: els.length
  };
};

const AMBER = [
  "rgb(255, 176, 0)", "rgb(255, 210, 77)", "rgb(255, 228, 163)", "rgb(229, 184, 94)",
  "rgb(181, 131, 50)", "rgb(255, 194, 74)", "rgb(255, 194, 74)", "rgb(255, 211, 110)",
  "rgb(255, 212, 96)", "rgb(255, 225, 160)", "rgb(249, 221, 160)", "rgb(246, 236, 214)",
  "rgb(255, 214, 96)", "rgb(255, 190, 60)"
];
const LAVENDER = ["rgb(94, 106, 210)", "rgb(111, 123, 224)", "rgb(130, 143, 245)", "rgb(76, 183, 130)"];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const out = {};

  // ROOM screens
  for (const [label, re] of [
    ["overview", null],
    ["pipeline", /pipeline/i],
    ["terminal", /terminal/i],
    ["automation", /automation/i],
    ["performance", /performance/i],
    ["backend", /backend|api/i]
  ]) {
    await page.goto("http://localhost:3100/", { waitUntil: "commit" });
    await sleep(5500);
    if (re) {
      await page.evaluate((src) => {
        const r = new RegExp(src, "i");
        const b = Array.from(document.querySelectorAll("button")).find((x) => r.test(x.textContent || ""));
        b?.click();
      }, re.source);
      await sleep(4500);
    }
    out["room_" + label] = await page.evaluate(scan, { amberList: AMBER, lavenderList: LAVENDER });
  }

  // STANDARD pages
  for (const slug of ["overview", "profile", "experience", "projects", "contact", "workspace"]) {
    await page.goto(`http://localhost:3100/${slug}`, { waitUntil: "commit" });
    await sleep(2400);
    out["std_" + slug] = await page.evaluate(scan, { amberList: AMBER, lavenderList: LAVENDER });
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, "token-scan.json"), JSON.stringify(out, null, 2));

  console.log("========== ROOM ==========");
  for (const k of Object.keys(out).filter((k) => k.startsWith("room_"))) {
    const v = out[k];
    console.log(`${k}: amber=${Object.keys(v.amber).length} lavender=${Object.keys(v.lavender).length} vt323=${v.vt323Count} geist=${v.geistCount} els=${v.totalEls}`);
    if (Object.keys(v.lavender).length) console.log("   LAVENDER LEAK:", JSON.stringify(v.lavender));
    if (v.geistCount) console.log("   GEIST LEAK:", v.geistSample);
  }
  console.log("\n========== STANDARD ==========");
  for (const k of Object.keys(out).filter((k) => k.startsWith("std_"))) {
    const v = out[k];
    console.log(`${k}: amber=${Object.keys(v.amber).length} lavender=${Object.keys(v.lavender).length} vt323=${v.vt323Count} geist=${v.geistCount} els=${v.totalEls}`);
    if (Object.keys(v.amber).length) console.log("   AMBER LEAK:", JSON.stringify(v.amber));
    if (v.vt323Count) console.log("   VT323 LEAK:", v.vt323Sample);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
