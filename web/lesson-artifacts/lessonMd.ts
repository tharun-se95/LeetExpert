/*
  lesson.md -> the page body and the lesson's data (spec 2026-09-26-lesson-content-as-data-design.md).
  The dialect is the course's own: YAML front matter and fenced directives, parsed with the
  gray-matter + remark the app ships. Fences the course also has keep its meaning and syntax
  (examples, constraint, key, warn, quiz); the rest exist because an artifact page has them and a
  course lesson does not.

  Pure: no filesystem, so the tests render fixtures directly. render-lesson.ts is the CLI build.py runs.
*/
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Code, Heading, Paragraph, PhrasingContent, Root, RootContent } from "mdast";

export interface QuizItem { q: string; opts: string[]; a: number; why: string }
export interface Variant { title: string; source: string; text: string }
export interface Reveal { label: string; html: string }

export interface LessonData {
  title: string;
  quiz: QuizItem[];
  variants: Variant[];
  reveals: Record<string, Reveal>;
}

export interface Rendered {
  html: string;
  data: LessonData;
  /** `html` fences used: counted so raw markup cannot quietly become the default */
  rawBlocks: number;
}

// The artifact kit styles these three; the course's brain/tip/goal/aside have no artifact look yet,
// so they fail the build rather than render unstyled (spec §2).
const CALLOUTS: Record<string, { label: string; icon: string }> = {
  key: { label: "Key idea", icon: "i-meet" },
  constraint: { label: "Constraint", icon: "i-warn" },
  warn: { label: "Watch out", icon: "i-warn" },
};

// `>` stays raw in text, as the hand-written pages had it: the quiz picks each answer's slot from a
// hash of the question's markup, so escaping it would reshuffle a question learners have seen.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const attr = (s: string) => esc(s).replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const parser = unified().use(remarkParse).use(remarkGfm);
const parse = (src: string): Root => parser.parse(src) as Root;

class LessonError extends Error {}
const fail = (msg: string): never => {
  throw new LessonError(msg);
};

/** Info-string attributes: `#id`, `"quoted label"`, `key="value"`, bare `flag` or class words. */
export function fenceAttrs(meta: string | null | undefined) {
  const out = { id: "", label: "", words: [] as string[], kv: {} as Record<string, string> };
  const re = /#([\w-]+)|(\w[\w-]*)="([^"]*)"|"([^"]*)"|([\w-]+)/g;
  for (const m of (meta ?? "").matchAll(re)) {
    if (m[1]) out.id = m[1];
    else if (m[2]) out.kv[m[2]] = m[3]!;
    else if (m[4] !== undefined) out.label = m[4];
    else if (m[5]) out.words.push(m[5]);
  }
  return out;
}

// `==window==` marks a key term: the word a paragraph turns on, set in the family's ink so the eye
// finds it again (owner, 2026-09-28, after The Grid Underneath's coloured headline word). Plain text
// only, and the marks hug the words, as in Markdown's own emphasis: a spaced `a == b` is prose about
// equality (a quiz says "built == num_courses"), while an opened `==word` never closed is a typo, so it
// fails the build instead of showing its marks.
function term(html: string): string {
  const out = html.replace(/==(\S(?:[^=\n]*?\S)?)==/g, '<span class="term">$1</span>');
  if (/==[^\s=]/.test(out)) fail(`unclosed ==term== in: ${html}`);
  return out;
}

function inline(nodes: PhrasingContent[]): string {
  return nodes
    .map((n) => {
      switch (n.type) {
        case "text":
          return term(esc(n.value));
        case "inlineCode":
          return `<code>${esc(n.value)}</code>`;
        case "strong":
          return `<b>${inline(n.children)}</b>`;
        case "emphasis":
          return `<em>${inline(n.children)}</em>`;
        case "link":
          return `<a href="${attr(n.url)}">${inline(n.children)}</a>`;
        case "html":
          return n.value;
        case "break":
          return "<br>";
        default:
          return fail(`unsupported inline markdown: ${n.type}`);
      }
    })
    .join("");
}

/** Inline markdown in a front-matter string or a table cell. */
export function inlineMd(src: string): string {
  const root = parse(src);
  if (root.children.length === 0) return "";
  const p = root.children[0];
  if (root.children.length > 1 || p?.type !== "paragraph") fail(`expected one line of inline markdown: ${src}`);
  return inline((p as Paragraph).children);
}

interface Ctx {
  reveals: Record<string, Reveal>;
  quiz: QuizItem[];
  variants: Variant[];
  rawBlocks: number;
  ids: Set<string>;
}

function claimId(ctx: Ctx, id: string, what: string) {
  if (!id) fail(`${what} needs an #id`);
  if (ctx.ids.has(id)) fail(`duplicate id #${id}`);
  ctx.ids.add(id);
}

function paragraphs(md: string, ctx: Ctx): string {
  return blocks(parse(md).children, ctx);
}

function callout(kind: string, body: string, ctx: Ctx): string {
  const c = CALLOUTS[kind] ?? fail(`callout "${kind}" has no artifact styling yet (spec §2)`);
  return `<div class="callout ${kind}"><div class="cl"><svg class="i"><use href="#${c.icon}"/></svg>${c.label}</div>${paragraphs(body, ctx)}</div>`;
}

function fence(node: Code, ctx: Ctx): string {
  const kind = node.lang ?? "";
  const a = fenceAttrs(node.meta);
  const body = node.value;
  switch (kind) {
    case "examples": {
      // the course's form: `input → output  (note)`
      const rows = body.split("\n").filter((l) => l.trim()).map((l) => {
        const at = l.indexOf("→");
        if (at < 0) fail(`examples line has no →: ${l}`);
        return `<div><span>${esc(l.slice(0, at).trim())}</span><em>→ ${esc(l.slice(at + 1).trim().replace(/\s{2,}/g, " "))}</em></div>`;
      });
      return `<div class="ex">${rows.join("")}</div>`;
    }
    case "constraint":
    case "key":
    case "warn":
    case "brain":
    case "tip":
    case "goal":
    case "aside":
      return callout(kind, body, ctx);
    case "rosetta": {
      const [head, ...rows] = body.split("\n").filter((l) => l.trim());
      const cells = (l: string) => {
        const i = l.indexOf(" | ");
        if (i < 0) fail(`rosetta line needs "left | right": ${l}`);
        return [l.slice(0, i).trim(), l.slice(i + 3).trim()];
      };
      const [hl, hr] = cells(head ?? fail("rosetta needs a heading line"));
      const out = rows.map((r) => {
        const [l, rr] = cells(r);
        // the left cell is code (`push_back`) or, where the row names a case, a bold label
        const left = l!.startsWith("`") ? inlineMd(l!) : `<b class="ro-k">${inlineMd(l!)}</b>`;
        return `<div class="ro">${left}<span>${inlineMd(rr!)}</span></div>`;
      });
      const label = a.label ? ` aria-label="${attr(a.label)}"` : "";
      return `<div class="rosetta"${label}><div class="ro-h"><span>${esc(hl!)}</span><span>${esc(hr!)}</span></div>${out.join("")}</div>`;
    }
    case "widget": {
      if (a.id) claimId(ctx, a.id, "widget");
      const cls = ["widget", "navy", ...a.words].join(" ");
      return `<div class="${cls}"${a.id ? ` id="${a.id}"` : ""}><div class="wl">${inlineMd(a.label)}</div>${body}</div>`;
    }
    case "mount": {
      claimId(ctx, a.id, "mount");
      const cls = a.words.length ? ` class="${a.words.join(" ")}"` : "";
      return `<div${cls} id="${a.id}">${body}</div>`;
    }
    case "code": {
      // the kit replaces this with codeBlock(CODE[name].py, CODE[name].ts, title)
      const name = a.words[0] ?? fail("code fence needs a code/ file name");
      return `<div data-code-file="${attr(name)}" data-title="${attr(a.label)}"></div>`;
    }
    case "notes":
      return `<div class="notes">${paragraphs(body, ctx)}</div>`;
    case "derivation":
      return `<div class="complexity"><div class="cx-h">Complexity, derived</div>${paragraphs(body, ctx)}</div>`;
    case "duo": {
      const cut = body.split(/\n---\n/);
      if (cut.length !== 2) fail("duo needs markdown, a --- line, then the scene");
      return `<div class="duo"><div class="duo-text">${paragraphs(cut[0]!, ctx)}</div><div class="duo-scene">${cut[1]}</div></div>`;
    }
    case "reveal": {
      claimId(ctx, a.id, "reveal");
      if (!a.label) fail(`reveal #${a.id} needs a "button label"`);
      // data, not DOM: the kit inserts it on click, so Ctrl+F cannot find a hidden solution
      ctx.reveals[a.id] = { label: a.label, html: paragraphs(body, ctx) };
      return `<div id="${a.id}"></div>`;
    }
    case "quiz": {
      claimId(ctx, "qlist", "quiz");
      const q = JSON.parse(body) as { questions: { question: string; options: string[]; answer: number; explanation: string }[] };
      q.questions.forEach((x, i) => {
        const n = `quiz ${i + 1}`;
        if (x.options.length < 3 || x.options.length > 5) fail(`${n}: needs 3-5 options, has ${x.options.length}`);
        if (!Number.isInteger(x.answer) || x.answer < 0 || x.answer >= x.options.length) fail(`${n}: answer ${x.answer} is not an option`);
        if (!x.explanation?.trim()) fail(`${n}: needs an explanation`);
        // the kit throws on this at page load (mountQuiz); checked here too so a lesson fails its build,
        // not its first browser visit. Length is the rendered text's, as the page measures it. An option
        // holding a {{fact}} has no length until the page fills it, so that question is left to the page.
        const plain = (h: string) => h.replace(/<[^>]+>/g, "").replace(/&(?:lt|gt|amp|quot|#39);/g, "x").length;
        const len = x.options.map((o) => plain(inlineMd(o)));
        if (!x.options.some((o) => o.includes("{{")) && len[x.answer]! > Math.max(...len.filter((_, k) => k !== x.answer)))
          fail(`${n}: the answer is longer than every other option (${len.join(", ")}), which gives it away`);
        ctx.quiz.push({ q: inlineMd(x.question), opts: x.options.map(inlineMd), a: x.answer, why: inlineMd(x.explanation) });
      });
      // the kit places each answer by a hash of its question's text (kit.js slotOf) and throws at page load
      // when they all land in one slot; the same hash here fails the build first. A question holding a
      // {{fact}} hashes its filled text, so it is left to the page.
      const slotOf = (text: string, n: number) => {
        let h = 2166136261;
        for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619) >>> 0;
        return h % n;
      };
      if (q.questions.length > 1 && !q.questions.some((x) => x.question.includes("{{"))) {
        const slots = q.questions.map((x) => slotOf(inlineMd(x.question), x.options.length));
        if (slots.every((v) => v === slots[0])) fail(`quiz: every answer sits in slot ${slots[0]}; reword a question to move one`);
      }
      return `<div id="qlist"></div>`;
    }
    case "variants": {
      claimId(ctx, "vlist", "variants");
      const list = JSON.parse(body) as Variant[];
      for (const v of list) ctx.variants.push({ title: inlineMd(v.title), source: inlineMd(v.source), text: inlineMd(v.text) });
      return `<div class="vgrid" id="vlist"></div>`;
    }
    case "html":
      ctx.rawBlocks++;
      return body;
    default:
      return fail(`unknown fence "${kind}"`);
  }
}

// A section's vignette (owner, 2026-09-28, after The Grid Underneath's `.vig` spot drawings): a small
// line drawing beside its heading, in the kit's .vig classes so it repaints with the theme. The markup
// is checked here rather than trusted: drawing elements only, and colour only through a class (an SVG
// presentation attribute is not CSS, so a fill= would survive a theme change; CLAUDE.md §4).
const VIG_TAGS = new Set(["g", "rect", "circle", "ellipse", "line", "path", "polyline", "polygon"]);
const VIG_ATTRS = new Set(["class", "x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "d", "points", "x1", "y1", "x2", "y2", "transform", "stroke-dasharray"]);
const VIG_CLASSES = new Set(["st", "sc", "fa", "fk", "fc", "fr", "fg", "fp"]);

function vignette(a: ReturnType<typeof fenceAttrs>, body: string): string {
  if (!a.label.trim()) fail("a vig fence needs a quoted description");
  const box = a.kv.viewBox ?? "0 0 240 112";
  if (!/^0 0 \d+ \d+$/.test(box)) fail(`vig viewBox must be "0 0 w h": ${box}`);
  const rest = body.replace(/<(\/?)([a-z]+)((?:\s+[\w-]+="[^"<>]*")*)\s*(\/?)>/g, (_, close: string, tag: string, attrs: string) => {
    if (!VIG_TAGS.has(tag)) fail(`vig: <${tag}> is not a drawing element`);
    if (close) return "";
    for (const [, k, v] of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) {
      if (!VIG_ATTRS.has(k!)) fail(`vig: attribute ${k} on <${tag}> (colour goes through a class)`);
      if (k === "class") for (const c of v!.split(/\s+/)) if (!VIG_CLASSES.has(c)) fail(`vig: class "${c}" is not a vignette class`);
    }
    return "";
  });
  if (rest.trim()) fail(`vig: text or markup outside drawing elements: ${rest.trim().slice(0, 60)}`);
  return `<svg class="vig" viewBox="${box}" role="img" aria-label="Illustration: ${attr(a.label)}">${body.trim()}</svg>`;
}

const isCallout = (html: string) => html.startsWith('<div class="callout ');

function blocks(nodes: RootContent[], ctx: Ctx): string {
  const out: string[] = [];
  for (const n of nodes) {
    let html: string;
    if (n.type === "paragraph") html = `<p>${inline(n.children)}</p>`;
    else if (n.type === "code") html = fence(n, ctx);
    else if (n.type === "list") {
      const tag = n.ordered ? "ol" : "ul";
      html = `<${tag}>${n.children.map((li) => `<li>${li.children.map((c) => (c.type === "paragraph" ? inline(c.children) : blocks([c], ctx))).join("")}</li>`).join("")}</${tag}>`;
    } else if (n.type === "blockquote") {
      // The course's plain `>`: a formula on its own line, never a claim (CLAUDE.md §3)
      const only = n.children[0];
      if (n.children.length !== 1 || only?.type !== "paragraph") fail("a > formula is one line of inline markdown");
      html = `<p class="formula">${inline((only as Paragraph).children)}</p>`;
    } else if (n.type === "html") html = fail(`raw HTML block outside an html fence: ${n.value.slice(0, 60)}`);
    else html = fail(`unsupported block: ${n.type}`);
    if (isCallout(html) && out.length && isCallout(out[out.length - 1]!)) fail("two callouts are adjacent (CLAUDE.md §3)");
    out.push(html);
  }
  return out.join("\n");
}

interface Section { id: string; toc: string; html: string }

/** `## Heading {#id toc="Short"}` */
function sectionHead(h: Heading) {
  const last = h.children[h.children.length - 1];
  const m = last?.type === "text" ? last.value.match(/\s*\{([^}]*)\}\s*$/) : null;
  if (!m) fail(`section heading needs {#id}: ${JSON.stringify(h.children)}`);
  const kids = [...h.children];
  kids[kids.length - 1] = { ...(last as { type: "text"; value: string }), value: (last as { value: string }).value.slice(0, m!.index) };
  const a = fenceAttrs(m![1]);
  // The animated banners were removed (owner, 2026-09-28, #63): drawn text in a scaled SVG, ~6px on a
  // phone, hidden from screen readers, and mostly repeating a widget beside them. What they said in a
  // line is a caption fence now; say so rather than dropping the flag silently.
  if (a.words.includes("banner")) fail(`#${a.id}: banners were removed (#63); put its one line in a caption fence`);
  return { id: a.id, toc: a.kv.toc, title: inline(kids as PhrasingContent[]) };
}

/* The fences that belong to a section's heading rather than its body: its one-line caption (the
   sentence the section concludes, as real text) and its vignette. Each at most once, straight after
   the heading, in either order. */
function headFences(id: string, nodes: RootContent[]) {
  const isHead = (n: RootContent | undefined): n is Code => n?.type === "code" && (n.lang === "caption" || n.lang === "vig");
  const lead: Code[] = [];
  while (isHead(nodes[0])) lead.push(nodes.shift() as Code);
  if (nodes.some(isHead)) fail(`#${id}: a caption or vig fence goes straight after the heading`);
  const one = (lang: string) => {
    const f = lead.filter((n) => n.lang === lang);
    if (f.length > 1) fail(`#${id}: one ${lang} fence per section`);
    return f[0];
  };
  const cap = one("caption"), vig = one("vig");
  if (cap && !cap.value.trim()) fail(`#${id}: an empty caption`);
  return {
    caption: cap ? `<p class="sec-sub">${inlineMd(cap.value.trim())}</p>` : "",
    vig: vig ? vignette(fenceAttrs(vig.meta), vig.value) : "",
  };
}

export function renderLesson(source: string): Rendered {
  const { data: fm, content } = matter(source);
  for (const k of ["title", "kicker", "headline", "lede", "hero"]) if (typeof fm[k] !== "string") fail(`front matter needs ${k}`);
  const ctx: Ctx = { reveals: {}, quiz: [], variants: [], rawBlocks: 0, ids: new Set() };
  const root = parse(content);
  const sections: Section[] = [];
  let open: { head: ReturnType<typeof sectionHead>; nodes: RootContent[] } | null = null;
  const close = () => {
    if (!open) return;
    const { head, nodes } = open;
    claimId(ctx, head.id, "section");
    const { caption, vig } = headFences(head.id, nodes);
    const plain = head.title.replace(/<[^>]+>/g, "");
    sections.push({ id: head.id, toc: head.toc ?? plain, html: `<section class="sec" id="${head.id}"><h2>${head.title}</h2>${caption}${vig}\n${blocks(nodes, ctx)}\n</section>` });
  };
  for (const n of root.children) {
    if (n.type === "heading" && n.depth === 2) {
      close();
      open = { head: sectionHead(n), nodes: [] };
    } else if (!open) fail(`content before the first ## section: ${n.type}`);
    else open.nodes.push(n);
  }
  close();

  const htmlOf = (s: string) => inlineMd(s);
  const chips = ((fm.chips ?? []) as string[]).map((c) => `<span>${htmlOf(c)}</span>`).join("");
  const toc = sections.map((s) => `<a href="#${s.id}">${esc(s.toc)}</a>`).join("");
  const html = [
    `<div class="wrap"><section class="hero2"><div class="hero-copy"><div class="kick">${htmlOf(fm.kicker)}</div>`,
    `<h1 id="h1">${htmlOf(fm.headline)}</h1>`,
    `<p class="lede">${htmlOf(fm.lede)}</p>`,
    `<div class="chips">${chips}</div></div>`,
    `${(fm.hero as string).trim()}</section></div>`,
    `<div class="wrap page">`,
    `<nav class="toc" aria-label="Lesson sections"><div class="kick">On this page</div>`,
    `${toc}</nav>`,
    `<article>`,
    sections.map((s) => s.html).join("\n\n"),
    `</article></div>`,
  ].join("\n");

  // FACTS are filled only where the page renders text at run time (reveals, quiz, variants); in the
  // body a {{name}} would reach the learner as written
  const stray = html.match(/\{\{(\w+)\}\}/);
  if (stray) fail(`{{${stray[1]}}} sits outside a reveal, quiz or variant, where nothing fills it: give the sentence a widget readout instead`);

  // Nothing renders TeX: a $n^2$ reaches the learner with its dollars and carets. Math is written in
  // Unicode (n², log₂ n, ≤), as the course does. A bare dollar amount ($40) is still allowed.
  const prose = [html, ...Object.values(ctx.reveals).map((r) => r.html), JSON.stringify(ctx.quiz), JSON.stringify(ctx.variants)]
    .join("\n")
    .replace(/<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>|<script[\s\S]*?<\/script>/g, "");
  // A span hugs its dollars ($n^2$); prices do not ("$5, $40", "$50 card when target is $100")
  const tex = prose.match(/\$\$[^$]+\$\$|\$(?=\S)[^$\n]*?[A-Za-z\\^_{}][^$\n]*?(?<=\S)\$(?!\d)|\\(?:frac|cdot|le|ge|log|times|text|implies)\b/);
  if (tex) fail(`TeX math "${tex[0]}" would print as written: write it in Unicode (n², log₂ n, ≤) instead`);

  const pairs = (s: string) => [(s.match(/class="c-py"/g) ?? []).length, (s.match(/class="c-ts"/g) ?? []).length];
  const [py, ts] = pairs(html + Object.values(ctx.reveals).map((r) => r.html).join(""));
  if (py !== ts) fail(`${py} c-py spans but ${ts} c-ts: a language pair is half written`);

  return { html, data: { title: fm.title, quiz: ctx.quiz, variants: ctx.variants, reveals: ctx.reveals }, rawBlocks: ctx.rawBlocks };
}
