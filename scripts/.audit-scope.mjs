/**
 * Precise two-way scope audit.
 * Rule: linear-workspace.css must be 100% scoped under `.standard-portfolio`.
 *       globals.css must contain ZERO selectors that target `.standard-portfolio`.
 */
import fs from "node:fs";

function selectors(css) {
  const s = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  let depth = 0, buf = "", kf = 0;
  for (const c of s) {
    if (c === "{") {
      const p = buf.trim(); buf = ""; depth++;
      if (/@(keyframes|media|supports|layer|container|font-face)/.test(p)) {
        if (/@keyframes/.test(p)) kf = depth;
        continue;
      }
      if (kf) continue;
      if (p) out.push(p.replace(/\s+/g, " ").trim());
    } else if (c === "}") {
      if (kf && depth === kf) kf = 0;
      depth--; buf = "";
    } else if (c === ";") buf = "";
    else buf += c;
  }
  return out;
}

const linear = fs.readFileSync("src/app/linear-workspace.css", "utf8");
const globals = fs.readFileSync("src/app/globals.css", "utf8");

const L = selectors(linear);
const G = selectors(globals);

// ---- 1. linear-workspace.css: every compound selector must contain .standard-portfolio
const lUnscoped = [];
for (const sel of L) {
  for (const part of sel.split(",")) {
    const p = part.trim();
    if (!p) continue;
    if (!p.includes(".standard-portfolio")) lUnscoped.push(p);
  }
}
console.log("### 1. linear-workspace.css");
console.log("   total selector blocks:", L.length);
console.log("   unscoped compound selectors:", lUnscoped.length);
if (lUnscoped.length) console.log("   >>>", lUnscoped);

// ---- 2. globals.css: must NOT mention .standard-portfolio at all
const gMentionsStd = G.filter((s) => s.includes("standard-portfolio"));
console.log("\n### 2. globals.css");
console.log("   total selector blocks:", G.length);
console.log("   selectors mentioning .standard-portfolio:", gMentionsStd.length);
if (gMentionsStd.length) console.log("   >>>", gMentionsStd);

// ---- 3. globals.css: unscoped global selectors (html/body/:root/*) that BOTH trees inherit
const GLOBAL_ROOTS = /^(html|body|:root|\*|html\s|body\s)/;
const gGlobal = G.filter((s) => GLOBAL_ROOTS.test(s.trim()));
console.log("\n   globally-inherited selectors in globals.css:", gGlobal.length);
console.log("   >>>", gGlobal.slice(0, 25));

// ---- 4. globals.css: selectors that could reach .standard-portfolio children
//     i.e. NOT scoped to a room-only namespace
const ROOM_NS = [".arcade-screen-document", ".portfolio-3d", ".arcade-", ".system-awakening-shell"];
const STD_NS = [".workspace-root", ".workspace-", ".landing-", ".hero-core", ".professional-", ".standard-portfolio"];
const leaky = [];
for (const sel of G) {
  for (const part of sel.split(",")) {
    const p = part.trim().toLowerCase();
    if (!p) continue;
    if (ROOM_NS.some((m) => p.includes(m))) continue;   // room-only: safe
    if (GLOBAL_ROOTS.test(p)) continue;                 // global base: intentional
    if (STD_NS.some((m) => p.includes(m))) continue;    // standard-scoped: intended
    leaky.push(part.trim());
  }
}
console.log("\n### 3. globals.css selectors with NO namespace (could hit any tree)");
console.log("   count:", leaky.length);
console.log(leaky.slice(0, 80));

fs.writeFileSync(
  "C:/Users/exery/AppData/Local/Temp/leak-static.json",
  JSON.stringify({ lUnscoped, gMentionsStd, gGlobal, leaky }, null, 2)
);
console.log("\nwrote leak-static.json");
