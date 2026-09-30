// Drives the real two-sum problem page and saves a still at each step of the reel,
// so every frame of the product in it is the product, not a mock-up.
//   (cd web && npm run dev -- -p 3100)   then, from this directory:   node capture.mjs
// No AI is involved: the coach's case diagnosis and hint pointer are deterministic
// (web/src/lib/coach/diagnose.ts). Chat is off on a local build; the reel never shows it.
import { chromium } from "../../../../web/node_modules/playwright-core/index.mjs";
const OUT = process.env.OUT || "screens";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 430, height: 340 }, deviceScaleFactor: 2.5, colorScheme: "dark" });
const shot = async (name) => { await page.waitForTimeout(250); await page.screenshot({ path: `${OUT}/${name}.png` }); console.log("shot", name); };
await page.goto("http://localhost:3100/courses/dsa/problems/two-sum", { waitUntil: "networkidle" });
await page.addStyleTag({ content: "nextjs-portal{display:none!important} *{caret-color:#5eead4}" });
await shot("00-description");
await page.getByRole("tab", { name: "Code" }).click();
await page.waitForTimeout(600);
await shot("01-starter");
await page.locator(".cm-content").first().click();
await page.keyboard.press("Control+A");
await page.keyboard.press("Delete");
const lines = ["def two_sum(nums, target):", "seen = {}", "for i, n in enumerate(nums):", "seen[n] = i", "if target - n in seen:", "return [seen[target - n], i]"];
for (let j = 0; j < lines.length; j++) {
  await page.keyboard.type((j ? "\n" : "") + lines[j], { delay: 3 });
  await shot(`02-type${j + 1}`);
}
await page.getByRole("button", { name: "Run" }).click();
await page.getByText(/tests passed/).waitFor({ timeout: 60000 });
await shot("03-run1");
await page.getByRole("tab", { name: "Coach" }).click();
await shot("04-coach1");
await page.getByRole("tab", { name: "Explanation" }).click();
const h1 = page.getByText("Hint 1 — which verb?").first();
await h1.scrollIntoViewIfNeeded(); await h1.click();
await page.waitForTimeout(400);
await page.evaluate(() => { const el = [...document.querySelectorAll("*")].find((e) => e.textContent?.startsWith("Hint 1 — which verb?") && e.children.length < 3); el?.scrollIntoView({ block: "start" }); });
await shot("05-hint1");
// a second, different wrong attempt: swap the pair. An identical re-run is not counted.
await page.getByRole("tab", { name: "Code" }).click();
await page.waitForTimeout(400);
await page.locator(".cm-line").nth(5).click();
await page.keyboard.press("End");
await page.keyboard.press("Shift+Home");
await page.keyboard.type("return [i, seen[target - n]]", { delay: 3 });
await shot("05b-attempt2");
await page.getByRole("button", { name: "Run" }).click();
await page.waitForTimeout(4000);
await shot("05c-run2");
await page.getByRole("tab", { name: "Coach" }).click();
await shot("06-coach2");
await page.getByRole("tab", { name: "Explanation" }).click();
const h2 = page.getByText("Hint 2 — one pass, check before insert").first();
await h2.scrollIntoViewIfNeeded(); await h2.click();
await page.waitForTimeout(400);
await page.evaluate(() => { const el = [...document.querySelectorAll("*")].find((e) => e.textContent?.startsWith("Hint 2 — one pass") && e.children.length < 3); el?.scrollIntoView({ block: "start" }); });
await shot("07-hint2");
await page.getByRole("tab", { name: "Code" }).click();
await page.waitForTimeout(400);
// undo the swap first, back to the draft's return line
await page.locator(".cm-line").nth(5).click();
await page.keyboard.press("End");
await page.keyboard.press("Shift+Home");
await page.keyboard.type("return [seen[target - n], i]", { delay: 3 });
await page.locator(".cm-line").nth(3).click();
await shot("08-fix0");
await page.keyboard.press("Alt+ArrowDown");
await shot("08-fix1");
await page.keyboard.press("Alt+ArrowDown");
await shot("08-fix2");
console.log(await page.locator(".cm-content").first().innerText());
await page.getByRole("button", { name: "Run" }).click();
await page.waitForTimeout(4000);
await shot("09-pass");
await page.getByRole("tab", { name: "Coach" }).click();
await shot("10-coach-pass");
await browser.close();
