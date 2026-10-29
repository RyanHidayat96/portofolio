import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT = "C:/Users/exery/AppData/Local/Temp/portofolio-audit/final";
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  // ROOM: overview + each screen
  for (const [label, re] of [
    ["overview", null],
    ["pipeline", /pipeline/i],
    ["terminal", /terminal/i],
    ["automation", /automation/i],
    ["performance", /performance/i],
    ["backend", /backend|api/i],
    ["profile", /profile/i],
    ["experience", /experience/i],
    ["contact", /contact/i],
    ["architecture", /architecture/i]
  ]) {
    await page.goto("http://localhost:3100/", { waitUntil: "commit" });
    await sleep(5500);
    if (re) {
      await page.evaluate((src) => {
        const r = new RegExp(src, "i");
        const b = Array.from(document.querySelectorAll("button")).find((x) => r.test(x.textContent || ""));
        b?.click();
      }, re.source);
      await sleep(4200);
    }
    await page.screenshot({ path: path.join(OUT, `ROOM-${label}.png`), timeout: 90000, animations: "disabled" });
    console.log("ROOM", label);
  }

  // STANDARD
  for (const slug of ["overview", "profile", "experience", "projects", "contact", "workspace"]) {
    await page.goto(`http://localhost:3100/${slug}`, { waitUntil: "commit" });
    await sleep(2400);
    await page.screenshot({ path: path.join(OUT, `STD-${slug}.png`), timeout: 90000, animations: "disabled" });
    console.log("STD", slug);
  }

  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
