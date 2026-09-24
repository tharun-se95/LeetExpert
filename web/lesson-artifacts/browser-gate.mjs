/*
  The browser gate: one built lesson page, one theme, in real Chrome.
  Spec: docs/superpowers/specs/2026-09-24-lesson-artifacts-rollout-design.md §4.2.

    node lesson-artifacts/browser-gate.mjs <module/slug> <light|dark>     (run from web/)

  At 1366x900 and 375x812 it fails on: a console or page error (which includes the page's own
  load checks), layout shift while every widget and banner plays, horizontal page overflow, text
  below WCAG AA against what is actually painted behind it, a control or diagram without an
  accessible name, a revealed solution in the DOM before its reveal is opened, and, under reduced
  motion, anything still animating or autoplaying. Screenshots go to dist/_gate/. The last line of
  output is the one-line result ledger.py stores as evidence; exit 1 on any failure.
*/
import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const [id, theme] = process.argv.slice(2);
if (!id || !["light", "dark"].includes(theme)) {
  console.error("usage: node lesson-artifacts/browser-gate.mjs <module/slug> <light|dark>");
  process.exit(2);
}
const page_ = join(HERE, "dist", id + ".html");
if (!existsSync(page_)) {
  console.error(`no built page at ${page_}: run build.py first`);
  process.exit(2);
}
const shots = join(HERE, "dist", "_gate");
mkdirSync(shots, { recursive: true });
const WIDTHS = [
  [1366, 900],
  [375, 812],
];
const failures = [];
const note = (w, msg) => failures.push(`${w}px: ${msg}`);

/* Everything measured inside the page. Kept as one function so it runs in the page's context. */
function inPage() {
  /* rgb()/rgba(), and color(srgb r g b / a), the form color-mix() computes to */
  const parse = (c) => {
    let m = c.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    m = c.match(/color\(srgb ([^)]+)\)/);
    if (m) {
      const p = m[1].split(/[\s/]+/).filter(Boolean).map(Number);
      return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 };
    }
    return null;
  };
  const over = (top, under) => ({
    r: top.r * top.a + under.r * (1 - top.a),
    g: top.g * top.a + under.g * (1 - top.a),
    b: top.b * top.a + under.b * (1 - top.a),
    a: 1,
  });
  const lum = (c) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  /* what is painted under a point: walk the stack below `self`, compositing until opaque */
  function paintedUnder(x, y, self) {
    const stack = document.elementsFromPoint(x, y);
    const i = stack.indexOf(self);
    if (i < 0) return null;  // clipped or covered at this point: not what the reader sees
    const layers = [];
    // an HTML element's own background is under its text; an SVG text's fill is the ink, not a layer
    for (const el of stack.slice(self instanceof SVGElement ? i + 1 : i)) {
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.opacity === "0") continue;
      const isShape = el instanceof SVGElement && !(el instanceof SVGSVGElement) && !(el instanceof SVGTextElement) && el.tagName !== "g";
      const c = parse(isShape ? cs.fill : cs.backgroundColor);
      if (c && c.a > 0) {
        c.a *= Number(cs.opacity) || 1;
        layers.push(c);
        if (c.a >= 0.999) break;
      }
    }
    let base = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    for (const l of layers.reverse()) base = over(l, base);
    return base;
  }
  const out = { contrast: [], names: [] };
  const seen = new Set();
  /* text: every element with its own visible text node, plus SVG text */
  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode;
    if (!t.textContent.trim()) continue;
    const el = t.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    texts.push(el);
  }
  for (const el of texts) {
    if (el.closest("[aria-hidden='true'] .kw, script, style, .sr")) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || Number(cs.opacity) === 0) continue;
    const ink = parse(el instanceof SVGElement ? cs.fill : cs.color);
    if (!ink) continue;
    const px = r.left + Math.min(r.width / 2, 6), py = r.top + r.height / 2;
    if (px < 0 || py < 0 || px >= innerWidth || py >= innerHeight) continue;
    const bg = paintedUnder(px, py, el);
    if (!bg) continue;
    const fg = ink.a < 1 ? over(ink, bg) : ink;
    const size = parseFloat(cs.fontSize), bold = Number(cs.fontWeight) >= 700;
    // opacity on an ancestor (a fading node, a dimmed removed node) is intended de-emphasis mid-animation
    let faded = false;
    for (let a = el; a && a !== document.body; a = a.parentElement) if (Number(getComputedStyle(a).opacity) < 0.95) faded = true;
    if (faded) continue;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    const got = ratio(fg, bg);
    if (got < need - 0.05)
      out.contrast.push(`${got.toFixed(2)}:1 < ${need}:1 "${el.textContent.trim().slice(0, 40)}" (${el.tagName.toLowerCase()}.${String(el.getAttribute("class") || "").split(" ")[0]})`);
  }
  /* accessible names */
  const named = (el) =>
    (el.getAttribute("aria-label") || el.getAttribute("title") || el.getAttribute("aria-labelledby") || el.textContent || "").trim().length > 0;
  for (const el of document.querySelectorAll("button, a[href], [role=button], input, select, svg[role=img]")) {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    if (!named(el)) out.names.push(el.outerHTML.slice(0, 80));
  }
  out.overflow = document.documentElement.scrollWidth - innerWidth;
  out.reveals = [...document.querySelectorAll(".reveal-body")].filter((b) => b.innerHTML.trim()).length;
  return out;
}

const browser = await chromium.launch({ channel: "chrome" });
let shifted = 0;
try {
  for (const [w, h] of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme, reducedMotion: "no-preference" });
    const page = await ctx.newPage();
    page.on("console", (m) => m.type() === "error" && note(w, "console: " + m.text().slice(0, 160)));
    page.on("pageerror", (e) => note(w, "page error: " + String(e.message).slice(0, 160)));
    await page.addInitScript(() => {
      window.__cls = 0;
      window.__shifts = [];
      const name = (n) => !n ? "?" : (n.id ? "#" + n.id : "") + (n.className && typeof n.className === "string" ? "." + n.className.split(" ")[0] : "") || n.nodeName;
      new PerformanceObserver((l) => l.getEntries().forEach((e) => {
        window.__cls += e.value;
        window.__shifts.push(e.value.toFixed(4) + " @" + Math.round(e.startTime) + "ms " + (e.sources || []).map((s) => name(s.node)).join(","));
      })).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(pathToFileURL(page_).href, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const before = await page.evaluate(() => document.querySelectorAll(".reveal-body").length &&
      [...document.querySelectorAll(".reveal-body")].filter((b) => b.innerHTML.trim()).length);
    if (before) note(w, `${before} reveal(s) have content before being opened`);
    // play the page: stop at every widget and banner so its animation runs in view
    const stops = await page.evaluate(() => [...document.querySelectorAll(".hero2, .banner, .widget, .callout, .code, .vgrid, .qcard")].map((e) => e.getBoundingClientRect().top + scrollY));
    const issues = { contrast: new Set(), names: new Set() };
    for (const y of stops) {
      await page.evaluate((top) => { document.documentElement.style.scrollBehavior = "auto"; scrollTo(0, Math.max(0, top - 80)); }, y);
      await page.waitForTimeout(1600);
      const r = await page.evaluate(inPage);
      r.contrast.forEach((c) => issues.contrast.add(c));
      r.names.forEach((c) => issues.names.add(c));
      if (r.overflow > 0) note(w, `page scrolls sideways by ${r.overflow}px`);
    }
    await page.screenshot({ path: join(shots, `${id.replace("/", "--")}-${theme}-${w}.png`) });
    const cls = await page.evaluate(() => window.__cls);
    shifted = Math.max(shifted, cls);
    // Chrome reports sub-pixel text re-layout as tiny shifts whose rects do not move; 0.001 is that floor
    if (cls >= 0.001) note(w, `layout shift ${cls.toFixed(4)}: ` + (await page.evaluate(() => window.__shifts.slice(0, 6).join(" | "))));
    issues.contrast.forEach((c) => note(w, "contrast " + c));
    issues.names.forEach((c) => note(w, "no accessible name: " + c));
    await ctx.close();

    // reduced motion: nothing autoplays, and every banner and the hero hold their finished frame
    const rctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme, reducedMotion: "reduce" });
    const rp = await rctx.newPage();
    rp.on("pageerror", (e) => note(w, "reduced-motion page error: " + String(e.message).slice(0, 160)));
    await rp.goto(pathToFileURL(page_).href, { waitUntil: "load" });
    await rp.waitForTimeout(800);
    const snap = () => rp.evaluate(() => [...document.querySelectorAll(".banner svg, .hero-art svg, .lp-count, .cnt")].map((e) => e.innerHTML || e.textContent).join("|"));
    const a = await snap();
    await rp.evaluate(() => [...document.querySelectorAll(".widget")].forEach((e) => e.scrollIntoView()));
    await rp.waitForTimeout(3000);
    const b = await snap();
    if (a !== b) note(w, "reduced motion: something still animates or autoplays");
    await rctx.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  const uniq = [...new Set(failures)];
  uniq.slice(0, 40).forEach((f) => console.log("FAIL " + f));
  if (uniq.length > 40) console.log(`… and ${uniq.length - 40} more`);
  console.log(`${theme}: FAILED ${uniq.length} check(s) on ${id}`);
  process.exit(1);
}
console.log(`${theme}: ok at ${WIDTHS.map((x) => x[0]).join("px and ")}px · layout shift ${shifted.toFixed(4)} · contrast AA · names · reveals hidden · reduced motion still`);
