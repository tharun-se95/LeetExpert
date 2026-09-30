// Screenshots build/<name>/slideN.html at 1080x1350 into the package named in
// build/<name>/target (written by cheatsheet.py or reelslides.py) as slideN.png, and fails if
// any slide's content runs outside its frame or a face failed to load (a fallback face
// changes every line break the check just measured).
//   node render.mjs [name ...]
// Chromium: playwright-core's own download, or PW_CHROMIUM (the cloud image keeps it at
// /opt/pw-browsers/chromium-1194/chrome-linux/chrome).
import { chromium } from "../../../web/node_modules/playwright-core/index.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { readdirSync, readFileSync, rmSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const only = process.argv.slice(2);
const modules = readdirSync(join(here, "build")).filter((m) => !only.length || only.includes(m)).sort();
if (!modules.length) throw new Error("nothing to render: run cheatsheet.py or reelslides.py first");

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
const failures = [];
for (const mod of modules) {
  // a carousel that lost a slide must not keep the old last one
  const pkg = resolve(root, readFileSync(join(here, "build", mod, "target"), "utf8").trim());
  for (const old of readdirSync(pkg).filter((f) => /^slide\d+\.png$/.test(f))) rmSync(join(pkg, old));
  const slides = readdirSync(join(here, "build", mod)).filter((f) => /^slide\d+\.html$/.test(f))
    .sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)));
  for (const f of slides) {
    await page.goto(pathToFileURL(join(here, "build", mod, f)).href);
    // load every declared face, so a slide that sets no text (a reel cover) does not read as a failed font
    await page.evaluate(() => Promise.all([...document.fonts].map((f) => f.load())));
    const problems = await page.evaluate(() => {
      const out = [];
      for (const face of document.fonts) if (face.status !== "loaded" && face.status !== "unloaded") out.push(`font ${face.family} ${face.status}`);
      for (const fam of ['700 20px "Space Mono"', '400 20px "Space Grotesk"'])
        if (!document.fonts.check(fam)) out.push(`font not available: ${fam}`);
      const frame = document.querySelector(".content") || document.body; // a full-bleed slide (a reel cover) is its own frame
      const box = frame.getBoundingClientRect();
      if (frame.scrollHeight > frame.clientHeight + 1) out.push(`content is ${frame.scrollHeight - frame.clientHeight}px taller than its frame`);
      for (const el of frame.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        // unwrapped text can spill out of a box that itself stays in place
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== "inline")
          out.push(`<${el.tagName.toLowerCase()} class="${el.className}"> "${el.textContent.slice(0, 40)}" is ${el.scrollWidth - el.clientWidth}px wider than its box`);
        if (r.bottom > box.bottom + 1 || r.right > box.right + 1 || r.left < box.left - 1 || r.top < box.top - 1)
          out.push(`<${el.tagName.toLowerCase()} class="${el.className}"> "${el.textContent.slice(0, 40)}" outside the frame`);
      }
      // the free space under the content, so a near miss shows before it becomes an overflow
      const last = [...frame.querySelectorAll("*")].reduce((m, el) => Math.max(m, el.getBoundingClientRect().bottom), box.top);
      return { out, spare: Math.round(box.bottom - last) };
    });
    const png = join(pkg, f.replace(".html", ".png"));
    if (problems.out.length) failures.push(`${mod}/${f}: ${problems.out.join("; ")}`);
    else await page.screenshot({ path: png });
    console.log(`${mod}/${f}`, problems.out.length ? "OVERFLOW" : `ok, ${problems.spare}px spare`);
  }
}
await browser.close();
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
