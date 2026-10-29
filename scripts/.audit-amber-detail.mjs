import { chromium } from "playwright";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const AMBER = [
  "rgb(255, 176, 0)", "rgb(255, 210, 77)", "rgb(255, 228, 163)", "rgb(229, 184, 94)",
  "rgb(181, 131, 50)", "rgb(255, 194, 74)", "rgb(255, 211, 110)", "rgb(255, 212, 96)",
  "rgb(255, 225, 160)", "rgb(249, 221, 160)", "rgb(246, 236, 214)", "rgb(255, 214, 96)",
  "rgb(255, 190, 60)"
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3100/overview", { waitUntil: "commit" });
  await sleep(2500);

  const hits = await page.evaluate((amber) => {
    const set = new Set(amber);
    const res = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      const vals = [cs.color, cs.borderTopColor, cs.borderLeftColor, cs.outlineColor, cs.backgroundColor, cs.fill];
      if (vals.some((v) => set.has(v))) {
        res.push({
          tag: el.tagName,
          id: el.id,
          cls: (el.className || "").toString().slice(0, 80),
          inStandard: !!el.closest(".standard-portfolio"),
          text: (el.textContent || "").trim().slice(0, 60),
          color: cs.color,
          bg: cs.backgroundColor,
          border: cs.borderTopColor,
          parentChain: (() => {
            const c = []; let p = el.parentElement; let i = 0;
            while (p && i < 4) { c.push(p.tagName + "." + (p.className || "").toString().slice(0, 30)); p = p.parentElement; i++; }
            return c;
          })()
        });
      }
    }
    return res;
  }, AMBER);

  console.log("TOTAL amber-bearing elements in /overview:", hits.length);
  for (const h of hits) {
    console.log(JSON.stringify(h, null, 2));
  }
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
