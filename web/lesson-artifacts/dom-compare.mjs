/*
  The lossless proof for moving a lesson to lesson.md (spec 2026-09-26-lesson-content-as-data-design.md §4).

    node web/lesson-artifacts/dom-compare.mjs <old dist> <new dist> <module/slug>

  Serves both builds, opens the page in Chromium with reduced motion (every animation at its
  finished frame, as the browser gate's still check), opens every reveal, and compares the two
  documents after the scripts ran. Markup and moved data are covered together, because both end
  up in the same DOM. The canonical form sorts attributes and collapses whitespace, so only real
  differences remain. Exit 0 when identical; otherwise the differing lines are printed.
*/
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const [oldDist, newDist, page] = process.argv.slice(2);
if (!page) throw new Error("usage: dom-compare.mjs <old dist> <new dist> <module/slug>");

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" };
function serve(root) {
  return new Promise((ok) => {
    const s = createServer((req, res) => {
      const f = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
      if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream" });
      res.end(readFileSync(f));
    }).listen(0, () => ok(s));
  });
}

async function snapshot(browser, root) {
  const server = await serve(root);
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, colorScheme: "light", reducedMotion: "reduce" });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e.message)));
  await p.goto(`http://localhost:${server.address().port}/${page}.html`);
  await p.waitForFunction(() => !document.documentElement.classList.contains("fl"), null, { timeout: 5000 });
  for (const b of await p.$$(".reveal-btn")) await b.click();
  const lines = await p.evaluate(() => {
    const out = [];
    // open and close lines, no indentation: a wrapper added or dropped is two lines, not a
    // re-indented subtree
    const walk = (n) => {
      if (n.nodeType === 3) {
        const t = n.textContent.replace(/\s+/g, " ").trim();
        if (t) out.push(JSON.stringify(t));
        return;
      }
      if (n.nodeType !== 1 || n.tagName === "SCRIPT") return;
      // aria-current follows the scroll position (the contents rail), which the reveal clicks move
      const attrs = [...n.attributes].filter((a) => a.name !== "aria-current").map((a) => `${a.name}="${a.value.replace(/\s+/g, " ").trim()}"`).sort().join(" ");
      const tag = n.tagName.toLowerCase();
      out.push(`<${tag}${attrs ? " " + attrs : ""}>`);
      for (const c of n.childNodes) walk(c);
      out.push(`</${tag}>`);
    };
    walk(document.body);
    // ids made with Math.random (SVG markers) differ on every load, even of one build: number them
    // in order of appearance, in the ids and in every reference to them
    const seen = new Map();
    return out.map((l) => l.replace(/\b([a-z]+)(\d{5,})\b/g, (m, p) => {
      if (!seen.has(m)) seen.set(m, `${p}#${seen.size}`);
      return seen.get(m);
    }));
  });
  await ctx.close();
  server.close();
  return { lines, errors };
}

const browser = await chromium.launch({ channel: "chrome" }); // the installed Chrome, as the browser gate uses
const [a, b] = [await snapshot(browser, oldDist), await snapshot(browser, newDist)];
await browser.close();

for (const [name, s] of [["old", a], ["new", b]]) if (s.errors.length) console.log(`${name} page errors:\n  ` + s.errors.join("\n  "));
// a line-level diff by longest common subsequence, reported as hunks
const n = a.lines.length, m = b.lines.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a.lines[i] === b.lines[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
const diff = [];
for (let i = 0, j = 0; i < n || j < m; ) {
  if (i < n && j < m && a.lines[i] === b.lines[j]) { i++; j++; }
  else if (j < m && (i === n || L[i][j + 1] >= L[i + 1][j])) diff.push(`+ ${b.lines[j++]}`);
  else diff.push(`- ${a.lines[i++]}`);
}
console.log(`${page}: ${a.lines.length} nodes old, ${b.lines.length} new, ${diff.length} differing line(s)`);
if (diff.length) console.log(diff.slice(0, 80).join("\n"));
process.exit(diff.length || a.errors.length || b.errors.length ? 1 : 0);
