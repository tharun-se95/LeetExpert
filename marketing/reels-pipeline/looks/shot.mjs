// Captures the Big-O observatory from the running app at n = 1,000 for the screenshot post (#149),
// and fails unless the page itself shows the counts facts.json computed (O(n²) = 1.0M at n = 1.0K).
//   node shot.mjs [base url, default http://localhost:3002]
// The observatory is a navy instrument card in both themes (CLAUDE.md §4), so one capture serves
// either; it is taken in the light theme, the page most visitors land on.
import { chromium } from "../../../web/node_modules/playwright-core/index.mjs";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] || "http://localhost:3002";
const facts = JSON.parse(readFileSync(join(here, "facts.json"), "utf8")).bigo;
// into the post package, so the image the post crops is checked in beside it
const DPR = 3; // the post crops and enlarges regions, so capture above the 2× it could otherwise use
const out = join(here, "..", "..", "instagram", "2026-10-01-big-o-screenshot", "sources");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: DPR, colorScheme: "light" });
// the once-a-visit sign-in dialog would sit over the lesson (lib/auth/signInPrompt.ts)
await page.addInitScript(() => sessionStorage.setItem("leetexpert:sign-in-prompt", "later"));
await page.goto(`${base}/courses/dsa/big-o/common-complexity-classes`, { waitUntil: "networkidle" });
const lab = page.locator('section[aria-label="Big O observatory"]');
await lab.scrollIntoViewIfNeeded();
// React owns the slider's value: set it through the native setter so onChange fires
await page.locator('input[aria-label="Logarithmic scrubber for n"]').evaluate((el, v) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v));
  el.dispatchEvent(new Event("input", { bubbles: true }));
}, Math.log10(facts.n));
await page.waitForTimeout(600); // the meter's width eases for 0.35s
const shown = await lab.evaluate((el) => {
  const rows = Object.fromEntries([...el.querySelectorAll("li button")].map((b) => {
    const s = b.querySelectorAll("span");
    return [s[1].textContent.trim(), s[2].textContent.trim()];
  }));
  const n = [...el.querySelectorAll("label span span")].map((s) => s.textContent.trim())[1];
  return { n, rows };
});
const fail = [];
if (shown.n !== "1.0K") fail.push(`n shows ${shown.n}, not 1.0K`);
const million = `${(facts.n2 / 1e6).toFixed(1)}M`;
if (shown.rows["O(n²)"] !== million) fail.push(`O(n²) shows ${shown.rows["O(n²)"]}, not ${million}`);
if (shown.rows["O(n)"] !== "1.0K") fail.push(`O(n) shows ${shown.rows["O(n)"]}`);
await lab.screenshot({ path: join(out, "observatory.png") });
// crop boxes for looks.py, in the capture's device pixels (DPR per CSS pixel): the curves panel and the n scrubber
const regions = await lab.evaluate((el, dpr) => {
  const o = el.getBoundingClientRect();
  // [x, y, w, h] from a top node to a bottom node, padded so a crop never shaves a glyph
  // pads are [side, top, bottom]: small, since the rows' neighbours (a hint, the axis label) sit close
  const box = (node, [side, top, bottom]) => {
    const r = node.getBoundingClientRect();
    return [r.left - side - o.left, r.top - top - o.top, r.width + 2 * side, r.height + top + bottom].map((v) => Math.round(v * dpr));
  };
  const slider = el.querySelector('input[aria-label="Logarithmic scrubber for n"]').closest("label");
  // the five curve rows alone: not the panel's "click to toggle" hint under them
  return { size: [o.width * dpr, o.height * dpr].map(Math.round), curves: box(el.querySelector("ul"), [6, 6, 6]), slider: box(slider, [10, 6, 8]) };
}, DPR);
writeFileSync(join(out, "observatory.json"), JSON.stringify({ shown, regions }, null, 1) + "\n");
await browser.close();
console.log(JSON.stringify(shown));
if (fail.length) { console.error(fail.join("\n")); process.exit(1); }
