import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const failures = [];
page.on("pageerror", (error) => failures.push(error.message));

try {
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  console.log(await page.evaluate(() => ({
    buttons: Array.from(document.querySelectorAll("button")).map((button) => button.textContent?.trim()),
    screens: Array.from(document.querySelectorAll("[class]")).map((element) => element.className).filter((name) => typeof name === "string" && name.includes("architecture"))
  })));
  await page.locator(".portfolio-3d-area-button").filter({ hasText: "Architecture" }).click();
  for (let tick = 0; tick < 12; tick += 1) {
    await page.waitForTimeout(250);
    console.log(tick, await page.evaluate(() => ({
      architecture: Boolean(document.querySelector(".architecture-poster-content")),
      back: Array.from(document.querySelectorAll("button")).some((button) => /back to room/i.test(button.textContent ?? "")),
      active: document.querySelector(".portfolio-3d-area-button[aria-current='page']")?.textContent?.trim() ?? null
    })));
  }
  await page.waitForSelector(".architecture-poster-content");

  const focusState = await page.evaluate(() => {
    const content = document.querySelector(".architecture-poster-content");
    if (!content) throw new Error("Architecture scroll container missing.");
    content.scrollTop = content.scrollHeight - content.clientHeight;
    content.dispatchEvent(new Event("scroll", { bubbles: true }));
    return { top: content.scrollTop, max: content.scrollHeight - content.clientHeight };
  });
  if (focusState.max < 1 || focusState.top !== focusState.max) {
    throw new Error(`Architecture did not reach bottom: ${JSON.stringify(focusState)}`);
  }

  await page.screenshot({ path: ".tmp/architecture-mobile-focused-bottom.png" });
  await page.getByRole("button", { name: /back to room/i }).click();
  await page.waitForFunction(() =>
    document.querySelector(".arcade-screen-document--architecture")?.getAttribute("data-mobile-room-preview") === "ready"
  );
  await page.waitForTimeout(250);
  await page.screenshot({ path: ".tmp/architecture-mobile-room-bottom.png" });

  const roomState = await page.evaluate(() => {
    const documentScreen = document.querySelector(".arcade-screen-document--architecture");
    const sourceScroll = document.querySelector(".architecture-poster-content");
    return {
      preview: documentScreen?.getAttribute("data-mobile-room-preview"),
      preservedScroll: sourceScroll?.scrollTop,
      sourceMaxScroll: sourceScroll ? sourceScroll.scrollHeight - sourceScroll.clientHeight : null,
      canvasKeys: Object.keys(document.querySelector("canvas") ?? {}).filter((key) => key.includes("r3") || key.includes("react"))
    };
  });
  console.log(JSON.stringify({ focusState, roomState, failures }, null, 2));
  if (roomState.preview !== "ready" || roomState.preservedScroll !== focusState.max) {
    throw new Error(`Room preview did not retain bottom scroll: ${JSON.stringify(roomState)}`);
  }
} finally {
  await browser.close();
}
