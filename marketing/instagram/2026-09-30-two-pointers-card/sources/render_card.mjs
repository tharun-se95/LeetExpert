// Screenshots card.html at 1080x1350 into ../card.png (the single-image post).
import { chromium } from "../../../../web/node_modules/playwright-core/index.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(here, "card.html")).href);
await page.evaluate(() => document.fonts.ready);
const box = await page.locator(".wrap").boundingBox();
if (box.y + box.height > 1350 - 90) throw new Error(`card overflows the page: bottom at ${box.y + box.height}`);
await page.screenshot({ path: join(here, "..", "card.png") });
await browser.close();
console.log("card.png written; card bottom at", Math.round(box.y + box.height));
