import { chromium } from "playwright";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3100/overview", { waitUntil: "commit" });
  await sleep(2500);

  const d = await page.evaluate(() => {
    const body = document.body;
    const cs = getComputedStyle(body);
    const divs = [...document.querySelectorAll("body > div")].map((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        cls: (el.className || "").toString(),
        w: Math.round(r.width), h: Math.round(r.height),
        color: s.color, borderTop: s.borderTopWidth + " " + s.borderTopColor,
        visible: r.width > 0 && r.height > 0,
        isStandard: !!el.closest(".standard-portfolio")
      };
    });
    const std = document.querySelector(".standard-portfolio");
    return {
      bodyColor: cs.color,
      bodyBg: cs.backgroundColor,
      bodyFont: cs.fontFamily.slice(0, 70),
      bodyChildren: divs,
      standardColor: std ? getComputedStyle(std).color : null,
      standardBg: std ? getComputedStyle(std).backgroundColor : null
    };
  });
  console.log(JSON.stringify(d, null, 2));
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
