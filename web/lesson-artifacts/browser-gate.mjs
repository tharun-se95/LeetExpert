/*
  The browser gate: one built lesson page, one theme, in real Chrome.
  Spec: docs/superpowers/specs/2026-09-24-lesson-artifacts-rollout-design.md §4.2.

    node lesson-artifacts/browser-gate.mjs <module/slug> <light|dark>     (run from web/)

  At 1366x900 and 375x812 it fails on: a console or page error (which includes the page's own
  load checks), layout shift while every widget plays, horizontal page overflow, text
  below WCAG AA against what is actually painted behind it, a color-scheme that does not match the
  theme (so native scrollbars paint the wrong theme, #107), a control or diagram without an
  accessible name, a revealed solution in the DOM before its reveal is opened, and, under reduced
  motion, anything still animating or autoplaying. It then drives every widget (reveals, quiz and predict
  answers, step players, walkthroughs, tabs, and every other widget button) and fails on a state the
  interaction should not leave (#24). Screenshots go to dist/_gate/. The last line of
  output is the one-line result ledger.py stores as evidence; exit 1 on any failure.
*/
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname } from "node:path";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
    // an inactive control is exempt from contrast (WCAG 1.4.3): coin-change dims the coins that no
    // longer fit to 40%, which the gate first saw once a text's own opacity counted
    if (el.closest(":disabled, [aria-disabled='true']")) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || Number(cs.opacity) === 0) continue;
    const ink = parse(el instanceof SVGElement ? cs.fill : cs.color);
    if (!ink) continue;
    // the text's own opacity is how it is styled, not a fade: it thins the ink at rest (a 45% name on a
    // grid's rectangle tag passed while the loop below skipped the element itself)
    ink.a *= Number(cs.opacity);
    const px = r.left + Math.min(r.width / 2, 6), py = r.top + r.height / 2;
    if (px < 0 || py < 0 || px >= innerWidth || py >= innerHeight) continue;
    const bg = paintedUnder(px, py, el);
    if (!bg) continue;
    const fg = ink.a < 1 ? over(ink, bg) : ink;
    const size = parseFloat(cs.fontSize), bold = Number(cs.fontWeight) >= 700;
    // opacity on an ancestor (a fading node, a dimmed removed node) is intended de-emphasis mid-animation
    let faded = false;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (Number(getComputedStyle(a).opacity) < 0.95) faded = true;
    if (faded) continue;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    const got = ratio(fg, bg);
    if (got < need - 0.05)
      out.contrast.push(`${got.toFixed(2)}:1 < ${need}:1 "${el.textContent.trim().slice(0, 40)}" (${el.tagName.toLowerCase()}.${String(el.getAttribute("class") || "").split(" ")[0]})`);
  }
  /* win's fill is about 1.1:1 off idle on the navy card, so a win cell reads only by its ring (#72).
     Each paint path marks it separately (the engine, strip, graphView), and a path that painted the
     fill but not the ring left course-schedule's ready course looking idle, so check the drawn cells. */
  for (const cell of document.querySelectorAll(".cell")) {
    const r = cell.getBoundingClientRect();
    if (r.width < 1 || r.bottom < 0 || r.top > innerHeight) continue;
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;background:var(--k-win)";
    cell.parentElement.appendChild(probe);
    const winFill = getComputedStyle(probe).backgroundColor;
    probe.remove();
    if (getComputedStyle(cell).backgroundColor === winFill && !cell.classList.contains("win"))
      out.contrast.push(`win fill without its ring "${cell.textContent.trim().slice(0, 20)}" (${cell.className})`);
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

/* Drive every widget the kit makes and assert the state it lands in (#24). Runs after the layout-shift
   reading, since opening a reveal or answering a question is meant to move what is below it. Each
   answered state is measured too: its good/bad colours were never on screen while the page only played.
   Lesson-specific playgrounds have no contract the gate can know, so their other buttons are each
   clicked once, and any page or console error they raise fails the gate through the listeners. */
async function drive(page, w, issues) {
  // the pointer rests where the last click was, so after a scroll it hovers whatever moved under it:
  // move it off the page, and measure a hover state only on purpose (see answer)
  const measure = async (loc, { keepPointer = false } = {}) => {
    if (!keepPointer) {
      await loc.evaluate((e) => e.scrollIntoView({ block: "center" }));
      await page.mouse.move(0, 0);
    }
    await page.waitForTimeout(250);
    const r = await page.evaluate(inPage);
    r.contrast.forEach((c) => issues.contrast.add(c));
    r.names.forEach((c) => issues.names.add(c));
  };
  const shown = async (loc) => (await loc.count()) > 0 && (await loc.isVisible());
  const fail = (what) => note(w, "drive: " + what);

  // reveals open with their content, and close empty again (Ctrl+F must not find a closed one)
  const reveals = page.locator(".reveal-btn");
  for (let i = 0; i < (await reveals.count()); i++) {
    const btn = reveals.nth(i), body = btn.locator("xpath=following-sibling::div[contains(@class,'reveal-body')][1]");
    if (!(await shown(btn))) continue;
    const label = (await btn.textContent()).trim().slice(0, 40);
    await btn.click();
    await page.waitForTimeout(300);
    const open = await body.evaluate((b) => ({ hidden: b.hidden, text: b.textContent.trim().length }));
    if ((await btn.getAttribute("aria-expanded")) !== "true" || open.hidden || !open.text) fail(`reveal "${label}" did not open with content`);
    else await measure(body);
    await btn.click();
    await page.waitForTimeout(200);
    const shut = await body.evaluate((b) => ({ hidden: b.hidden, html: b.innerHTML.trim().length }));
    if ((await btn.getAttribute("aria-expanded")) !== "false" || !shut.hidden || shut.html) fail(`reveal "${label}" did not close empty`);
  }

  // a quiz or predict answer: every option locks, exactly one is marked right, the pick is marked, and
  // the feedback agrees with it. Card k picks option k mod n, so a page exercises right and wrong picks
  // without the gate knowing the answers.
  const answer = async (cards, optSel, right, kind) => {
    for (let i = 0; i < (await cards.count()); i++) {
      const card = cards.nth(i), opts = card.locator(optSel), n = await opts.count();
      if (!n || !(await shown(card))) continue;
      const pick = opts.nth(i % n);
      await card.evaluate((e) => e.scrollIntoView({ block: "center" }));
      await pick.hover();  // an open option under the pointer: its hover colours are text too
      await measure(card, { keepPointer: true });
      await pick.click();
      await page.waitForTimeout(250);
      const st = await card.evaluate((c, sel) => {
        const o = [...c.querySelectorAll(sel)];
        return { locked: o.every((x) => x.disabled), good: o.filter((x) => x.classList.contains("good")).length,
          fb: (c.querySelector(".fb.on") || { textContent: "" }).textContent.trim() };
      }, optSel);
      const pickedGood = await pick.evaluate((x) => x.classList.contains("good")), pickedBad = await pick.evaluate((x) => x.classList.contains("bad"));
      const where = `${kind} ${i + 1}`;
      if (!st.locked) fail(`${where}: options still open after an answer`);
      if (st.good !== 1) fail(`${where}: ${st.good} options marked right after an answer`);
      if (pickedGood === pickedBad) fail(`${where}: the picked option is marked ${pickedGood ? "both right and wrong" : "neither right nor wrong"}`);
      // A lesson may write its own feedback (the diameter lesson names the exact slip behind each wrong
      // choice), so the words are not fixed. What is: an explanation, and never the kit's verdict for
      // the other side ("Correct." on a wrong pick, "Not quite." on a right one).
      const contradicts = pickedGood ? /^Not quite\b/.test(st.fb) : new RegExp(`^(${right.replace(".", "\\.")}|Correct\\.|Yes\\b)`).test(st.fb);
      if (contradicts || st.fb.length < 20) fail(`${where}: feedback "${st.fb.slice(0, 40)}" does not explain a ${pickedGood ? "right" : "wrong"} pick`);
      await measure(card);
    }
  };
  await answer(page.locator(".qcard"), ".qopt", "Correct.", "quiz question");
  await answer(page.locator(".pcard"), ".choice", "Yes.", "predict case");

  // a Scene walkthrough: previous pauses it, next moves one frame on, speed cycles
  const scenes = page.locator(".player");
  for (let i = 0; i < (await scenes.count()); i++) {
    const sc = scenes.nth(i);
    if (!(await shown(sc))) continue;
    await sc.evaluate((e) => e.scrollIntoView({ block: "center" }));
    await sc.locator(".pv").click();
    await page.waitForTimeout(300);
    const read = async () => (await sc.locator(".cnt").textContent()).split("/").map((x) => Number(x.trim()));
    const [a, n] = await read();
    await sc.locator(".nx").click();
    await page.waitForTimeout(400);
    const [b] = await read();
    if (b !== Math.min(n, a + 1)) fail(`walkthrough ${i + 1}: next from frame ${a} of ${n} shows frame ${b}`);
    const spd = sc.locator(".spd"), s0 = await spd.textContent();
    await spd.click();
    if ((await spd.textContent()) === s0) fail(`walkthrough ${i + 1}: speed stays ${s0} when pressed`);
    await spd.click(); await spd.click();  // back round to where it was
  }

  // tabs: the one pressed is the one shown pressed, and only it
  const groups = page.locator(".extabs");
  for (let g = 0; g < (await groups.count()); g++) {
    const tabs = groups.nth(g).locator("button");
    if (!(await shown(groups.nth(g)))) continue;
    for (let t = 0; t < (await tabs.count()); t++) {
      await tabs.nth(t).click();
      await page.waitForTimeout(200);
      const pressed = await tabs.evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-pressed")));
      if (pressed.some((v, k) => (v === "true") !== (k === t))) fail(`tab group ${g + 1}: pressing tab ${t + 1} leaves [${pressed.join(", ")}]`);
    }
    await tabs.first().click();
  }

  // everything else in a widget: each button once, in page order; the error listeners do the asserting
  const KNOWN = ".reveal-btn, .qopt, .choice, .lp-btn, .lp-seg, .player button, .extabs button";
  const widgets = page.locator(".widget");
  for (let i = 0; i < (await widgets.count()); i++) {
    const wd = widgets.nth(i);
    // Handles to the buttons there on arrival, not a live nth(k): a statement widget (the reverse lesson's)
    // adds a step per press ahead of its buttons, so a re-counted index kept landing on another statement
    // button and the loop never ended.
    const rest = await wd.locator("button, [role=button]").elementHandles();
    let clicked = 0;
    for (const b of rest) {
      if ((await b.evaluate((x, sel) => x.matches(sel) || x.disabled, KNOWN)) || !(await b.isVisible())) continue;
      await b.click();
      await page.waitForTimeout(150);
      clicked++;
    }
    if (clicked) await measure(wd);
  }
}

/* Served over HTTP, as a page really is: over file:// Chrome can refuse the self-hosted fonts as
   cross-origin, and the gate would measure a page nobody sees. */
const TYPES = { ".html": "text/html", ".css": "text/css", ".woff2": "font/woff2", ".js": "text/javascript", ".png": "image/png" };
const server = createServer((req, res) => {
  /* Chrome asks any HTTP origin for /favicon.ico (never over file://). The host that publishes a page
     serves its own icon, so a 404 here is this server's, not the page's: answer it empty. */
  if (req.url === "/favicon.ico") { res.writeHead(204); res.end(); return; }
  const file = join(HERE, "dist", decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(join(HERE, "dist")) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const URL_ = `http://127.0.0.1:${server.address().port}/${id}.html`;
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
    await page.goto(URL_, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    // Both theme paths: the system preference this context emulates, then the toggle's data-theme
    // forcing the other theme. A navy card is dark on either page.
    const schemes = await page.evaluate((t) => {
      const root = document.documentElement, other = t === "dark" ? "light" : "dark";
      const read = () => [getComputedStyle(root).colorScheme,
        ...[...document.querySelectorAll(".navy")].map((e) => getComputedStyle(e).colorScheme)];
      const sys = read(), prev = root.getAttribute("data-theme");
      root.setAttribute("data-theme", other);
      const forced = read();
      prev === null ? root.removeAttribute("data-theme") : root.setAttribute("data-theme", prev);
      return { other, sys, forced };
    }, theme);
    for (const [want, got, how] of [[theme, schemes.sys, "system"], [schemes.other, schemes.forced, "data-theme"]]) {
      if (got[0] !== want) note(w, `color-scheme is "${got[0]}" on the ${want} page (${how} path)`);
      const light = got.slice(1).filter((c) => c !== "dark").length;
      if (light) note(w, `${light} navy card(s) not color-scheme dark on the ${want} page (${how} path)`);
    }
    const before = await page.evaluate(() => document.querySelectorAll(".reveal-body").length &&
      [...document.querySelectorAll(".reveal-body")].filter((b) => b.innerHTML.trim()).length);
    if (before) note(w, `${before} reveal(s) have content before being opened`);
    // play the page: stop at every widget so its animation runs in view
    const stops = await page.evaluate(() => [...document.querySelectorAll(".hero2, .widget, .callout, .code, .vgrid, .qcard")].map((e) => e.getBoundingClientRect().top + scrollY));
    const issues = { contrast: new Set(), names: new Set() };
    for (const y of stops) {
      await page.evaluate((top) => { document.documentElement.style.scrollBehavior = "auto"; scrollTo(0, Math.max(0, top - 80)); }, y);
      await page.waitForTimeout(1600);
      const r = await page.evaluate(inPage);
      r.contrast.forEach((c) => issues.contrast.add(c));
      r.names.forEach((c) => issues.names.add(c));
      if (r.overflow > 0) note(w, `page scrolls sideways by ${r.overflow}px`);
    }
    // Every step of every step player (kit/player.js), each tab, settled. The stop above samples a
    // player once, on its first step, which is mostly the empty structure: the text of every later
    // step (a stack's values, a frame's locals, a list's names) was never measured.
    const players = page.locator(".lp");
    for (let p = 0; p < (await players.count()); p++) {
      const lp = players.nth(p), tabs = lp.locator("xpath=ancestor::div[contains(@class,'widget')][1]").locator(".extabs button");
      const nTabs = (await lp.locator("xpath=ancestor::div[contains(@class,'widget')][1]").count()) ? await tabs.count() : 0;
      for (let t = 0; t < Math.max(1, nTabs); t++) {
        if (nTabs) await tabs.nth(t).click();
        const segs = lp.locator(".lp-seg");
        for (let k = 0; k < (await segs.count()); k++) {
          await segs.nth(k).click();  // a real pointer: it marks the player touched, so autoplay stays off
          await lp.evaluate((e) => e.scrollIntoView({ block: "center" }));
          await page.waitForTimeout(800);  // the 720 ms tween, settled
          const n = await segs.count(), at = await lp.evaluate((e) => ({
            count: e.querySelector(".lp-count").textContent,
            current: [...e.querySelectorAll(".lp-seg")].findIndex((b) => b.getAttribute("aria-current") === "step"),
          }));
          if (at.count !== `${k + 1} / ${n}` || at.current !== k)
            note(w, `step player ${p + 1}${nTabs ? `, tab ${t + 1}` : ""}: step ${k + 1} of ${n} clicked, but it shows "${at.count}" with step ${at.current + 1} current`);
          const r = await page.evaluate(inPage);
          r.contrast.forEach((c) => issues.contrast.add(c));
          r.names.forEach((c) => issues.names.add(c));
        }
      }
    }
    await page.screenshot({ path: join(shots, `${id.replace("/", "--")}-${theme}-${w}.png`) });
    const cls = await page.evaluate(() => window.__cls);
    shifted = Math.max(shifted, cls);
    // Chrome reports sub-pixel text re-layout as tiny shifts whose rects do not move; 0.001 is that floor
    if (cls >= 0.001) note(w, `layout shift ${cls.toFixed(4)}: ` + (await page.evaluate(() => window.__shifts.slice(0, 6).join(" | "))));
    await drive(page, w, issues);
    issues.contrast.forEach((c) => note(w, "contrast " + c));
    issues.names.forEach((c) => note(w, "no accessible name: " + c));
    await ctx.close();

    // reduced motion: nothing autoplays, and the hero holds its finished frame
    const rctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme, reducedMotion: "reduce" });
    const rp = await rctx.newPage();
    rp.on("pageerror", (e) => note(w, "reduced-motion page error: " + String(e.message).slice(0, 160)));
    await rp.goto(URL_, { waitUntil: "load" });
    await rp.waitForTimeout(800);
    const snap = () => rp.evaluate(() => [...document.querySelectorAll(".hero-art svg, .lp-count, .cnt")].map((e) => e.innerHTML || e.textContent).join("|"));
    const a = await snap();
    await rp.evaluate(() => [...document.querySelectorAll(".widget")].forEach((e) => e.scrollIntoView()));
    await rp.waitForTimeout(3000);
    const b = await snap();
    if (a !== b) note(w, "reduced motion: something still animates or autoplays");
    await rctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  const uniq = [...new Set(failures)];
  uniq.slice(0, 40).forEach((f) => console.log("FAIL " + f));
  if (uniq.length > 40) console.log(`… and ${uniq.length - 40} more`);
  console.log(`${theme}: FAILED ${uniq.length} check(s) on ${id}`);
  process.exit(1);
}
console.log(`${theme}: ok at ${WIDTHS.map((x) => x[0]).join("px and ")}px · layout shift ${shifted.toFixed(4)} · contrast AA · names · reveals hidden · reduced motion still · widgets driven`);
