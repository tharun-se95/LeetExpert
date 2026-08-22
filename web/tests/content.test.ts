import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { propertyNames } from "../src/lib/sandbox/properties";
import { parseSandboxSpec } from "@/components/sandbox/parseSpec";
import { MEMORY_CELL_LABEL_MAX } from "../src/lib/insight/parseCaseMemory";
import { parseExampleRows } from "../src/lib/content/parseExamples";
import matter from "gray-matter";
import { extractSandboxFence } from "../src/lib/content/extractSandboxFence";
import { extractPracticeProblemsFence } from "../src/lib/content/parsePracticeProblems";
import { splitProblemTabs } from "../src/lib/content/splitProblemTabs";
import { extractHints } from "../src/lib/coach/extractHints";
import { MODULES } from "../src/lib/course/manifest";

/**
 * Content validation across every lesson.
 *
 * This exists because of how the content pipeline is shaped: `viz` and
 * `diagram` fences address components by a STRING id looked up in a registry,
 * and every `sandbox`, `quiz` and `complexity` fence is hand-authored JSON.
 * None of that is type-checked — a typo'd id or a trailing comma renders an
 * error card in production and nothing fails the build.
 *
 * These tests are the guard rail. They are deliberately dependency-free:
 * registry ids are read out of the registry source rather than imported,
 * because importing them would drag React, motion and CodeMirror into a
 * plain Node test run for no benefit.
 */

const COURSE_DIR = join(__dirname, "..", "..", "course");
const PROPERTY_NAMES = propertyNames();
const WEB_SRC = join(__dirname, "..", "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

const LESSONS = walk(COURSE_DIR).map((path) => ({
  path,
  rel: relative(COURSE_DIR, path),
  body: readFileSync(path, "utf8"),
}));

/** Pull the quoted keys out of a `Record<string, Component>` object literal. */
function registryIds(file: string): Set<string> {
  const src = readFileSync(join(WEB_SRC, file), "utf8");
  const body = src.slice(src.indexOf("{", src.indexOf("REGISTRY")));
  return new Set([...body.matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1]));
}

/** Every ```<lang> fence body in a document, with its 1-based line number. */
function fences(body: string, lang: string): { json: string; line: number }[] {
  const found: { json: string; line: number }[] = [];
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const open = new RegExp("^`{3,5}" + lang + "\\s*$");
    if (!open.test(lines[i])) continue;
    const fenceLen = lines[i].match(/^`+/)![0].length;
    const close = "`".repeat(fenceLen);
    const buf: string[] = [];
    let j = i + 1;
    for (; j < lines.length && lines[j].trimEnd() !== close; j++) buf.push(lines[j]);
    found.push({ json: buf.join("\n"), line: i + 1 });
    i = j;
  }
  return found;
}

describe("lessons", () => {
  it("finds the course content", () => {
    expect(LESSONS.length).toBeGreaterThan(100);
  });

  it("every lesson has title and type frontmatter", () => {
    const bad = LESSONS.filter((l) => {
      const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(l.body);
      return !fm || !/\ntitle:|^title:/m.test(fm[1]) || !/\ntype:|^type:/m.test(fm[1]);
    }).map((l) => l.rel);
    expect(bad).toEqual([]);
  });
});

describe("registry-addressed fences resolve", () => {
  const cases: [string, string][] = [
    ["viz", "components/viz/registry.ts"],
    ["diagram", "components/md/diagrams/registry.ts"],
  ];

  for (const [lang, file] of cases) {
    it(`every \`${lang}\` id is registered`, () => {
      const ids = registryIds(file);
      expect(ids.size).toBeGreaterThan(0);

      const broken: string[] = [];
      for (const lesson of LESSONS) {
        for (const f of fences(lesson.body, lang)) {
          let spec: { id?: unknown };
          try {
            spec = JSON.parse(f.json);
          } catch {
            broken.push(`${lesson.rel}:${f.line} — not valid JSON`);
            continue;
          }
          if (typeof spec.id !== "string") {
            broken.push(`${lesson.rel}:${f.line} — missing "id"`);
          } else if (!ids.has(spec.id)) {
            broken.push(`${lesson.rel}:${f.line} — unknown id "${spec.id}"`);
          }
        }
      }
      expect(broken).toEqual([]);
    });
  }
});

describe("hand-authored JSON fences", () => {
  it("every `quiz` block is well formed", () => {
    const broken: string[] = [];
    for (const lesson of LESSONS) {
      for (const f of fences(lesson.body, "quiz")) {
        let data: unknown;
        try {
          data = JSON.parse(f.json);
        } catch {
          broken.push(`${lesson.rel}:${f.line} — not valid JSON`);
          continue;
        }
        // Mirrors Quiz.tsx's parseSpec, which accepts three shapes: a bare
        // array, { questions: [...] }, or a single question object.
        const rec = data as { questions?: unknown };
        const qs: unknown[] = Array.isArray(data)
          ? data
          : Array.isArray(rec.questions)
            ? rec.questions
            : [data];

        if (qs.length === 0) {
          broken.push(`${lesson.rel}:${f.line} — no questions`);
          continue;
        }
        qs.forEach((raw, qi) => {
          const q = raw as { question?: unknown; options?: unknown; answer?: unknown };
          const at = `${lesson.rel}:${f.line} q${qi}`;
          if (typeof q.question !== "string") broken.push(`${at} — missing "question"`);
          if (!Array.isArray(q.options) || q.options.length < 2) {
            broken.push(`${at} — needs 2+ options`);
            return;
          }
          if (
            typeof q.answer !== "number" ||
            q.answer < 0 ||
            q.answer >= q.options.length
          ) {
            broken.push(`${at} — answer out of range`);
          }
        });
      }
    }
    expect(broken).toEqual([]);
  });

  it("every `complexity` block is well formed", () => {
    const broken: string[] = [];
    for (const lesson of LESSONS) {
      for (const f of fences(lesson.body, "complexity")) {
        try {
          // Complexity.tsx accepts either a single { time, space, why } or a
          // table of { operations: [{ name, time }] }. Require one or other.
          const spec = JSON.parse(f.json) as {
            time?: unknown;
            operations?: { name?: unknown; time?: unknown }[];
          };
          const at = `${lesson.rel}:${f.line}`;
          if (Array.isArray(spec.operations)) {
            spec.operations.forEach((op, oi) => {
              if (typeof op.name !== "string" || typeof op.time !== "string") {
                broken.push(`${at} op ${oi} — needs "name" and "time"`);
              }
            });
          } else if (typeof spec.time !== "string") {
            broken.push(`${at} — needs "time" or "operations"`);
          }
        } catch {
          broken.push(`${lesson.rel}:${f.line} — not valid JSON`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it("every `sandbox` block matches the runner's contract", () => {
    const broken: string[] = [];
    for (const lesson of LESSONS) {
      for (const f of fences(lesson.body, "sandbox")) {
        let spec: Record<string, unknown>;
        try {
          spec = JSON.parse(f.json);
        } catch {
          broken.push(`${lesson.rel}:${f.line} — not valid JSON`);
          continue;
        }
        const at = `${lesson.rel}:${f.line}`;
        if (typeof spec.id !== "string") broken.push(`${at} — missing "id"`);

        for (const key of ["fn", "starter"]) {
          const rec = spec[key] as Record<string, unknown> | undefined;
          if (!rec || typeof rec.python !== "string" || typeof rec.javascript !== "string") {
            broken.push(`${at} — "${key}" needs both python and javascript`);
          }
        }

        if (
          spec.check !== undefined &&
          !["return", "mutate", "prefix", "sequence", "roundtrip"].includes(
            spec.check as string,
          )
        ) {
          broken.push(`${at} — unknown check mode "${String(spec.check)}"`);
        }

        if (spec.compare !== undefined && !["exact", "sorted", "set-of-sets"].includes(spec.compare as string)) {
          broken.push(`${at} — unknown compare mode "${String(spec.compare)}"`);
        }

        // Structural inputs: every declared shape must be one the runners
        // implement, or the argument silently arrives as raw JSON.
        if (spec.shape !== undefined) {
          const shape = spec.shape as Record<string, unknown>;
          if (typeof shape !== "object" || shape === null) {
            broken.push(`${at} — "shape" must be an object`);
          } else {
            for (const [k, v] of Object.entries(shape)) {
              if (!["value", "list", "list[]", "tree", "graph", "node"].includes(v as string)) {
                broken.push(`${at} — arg ${k} has unknown shape "${String(v)}"`);
              }
            }
          }
        }
        if (spec.returns !== undefined && !["value", "list", "tree", "graph"].includes(spec.returns as string)) {
          broken.push(`${at} — unknown returns shape "${String(spec.returns)}"`);
        }

        const cases = spec.cases;
        if (!Array.isArray(cases) || cases.length === 0) {
          broken.push(`${at} — no cases`);
          continue;
        }

        if (spec.check === "sequence") {
          // A sequence case is a script of calls, not args/expect. It also
          // needs the class name, since the runner constructs rather than calls.
          const cls = spec.class as Record<string, unknown> | undefined;
          if (!cls || typeof cls.python !== "string" || typeof cls.javascript !== "string") {
            broken.push(`${at} — sequence mode needs "class" for both languages`);
          }
          cases.forEach((raw, ci) => {
            const c = raw as Record<string, unknown>;
            if (!Array.isArray(c.ops) || c.ops.length === 0) {
              broken.push(`${at} case ${ci} — sequence case needs a non-empty "ops"`);
              return;
            }
            (c.ops as unknown[]).forEach((op, oi) => {
              if (!Array.isArray(op) || typeof op[0] !== "string" || !Array.isArray(op[1])) {
                broken.push(`${at} case ${ci} op ${oi} — expected [method, args, expected]`);
              }
            });
          });
        } else {
          // A `property` grades the answer's shape, not its equality to one
          // value, so those cases carry no `expect` — see lib/sandbox/properties.
          const graded = typeof spec.property === "string";
          if (graded && !PROPERTY_NAMES.includes(spec.property as string)) {
            broken.push(`${at} — unknown property "${String(spec.property)}"`);
          }
          cases.forEach((raw, ci) => {
            const c = raw as Record<string, unknown>;
            if (!Array.isArray(c.args)) broken.push(`${at} case ${ci} — "args" must be an array`);
            if (!graded && !("expect" in c)) {
              broken.push(`${at} case ${ci} — missing "expect"`);
            }
          });
        }

        // `prefix` compares args[arg][:k], so the argument it inspects has to
        // be an array in every case or the mode is meaningless.
        if (spec.check === "prefix") {
          const argIndex = typeof spec.arg === "number" ? spec.arg : 0;
          cases.forEach((raw, ci) => {
            const c = raw as { args?: unknown[] };
            if (Array.isArray(c.args) && !Array.isArray(c.args[argIndex])) {
              broken.push(`${at} case ${ci} — prefix check needs args[${argIndex}] to be an array`);
            }
          });
        }

        // Insight MemoryStrip cellLabel ellipsizes past MEMORY_CELL_LABEL_MAX.
        // Teaching cases must stay under that budget so the strip does not
        // lie about short string-array inputs (LCP flo…/fli… regression).
        cases.forEach((raw, ci) => {
          const c = raw as { args?: unknown[]; ops?: unknown[] };
          const values: unknown[] = [];
          if (Array.isArray(c.args)) values.push(...c.args);
          if (Array.isArray(c.ops)) {
            for (const op of c.ops) {
              if (Array.isArray(op) && Array.isArray(op[1])) values.push(...op[1]);
            }
          }
          for (const arg of values) {
            if (!Array.isArray(arg)) continue;
            for (const item of arg) {
              if (typeof item === "string" && item.length > MEMORY_CELL_LABEL_MAX) {
                broken.push(
                  `${at} case ${ci} — string cell "${item.slice(0, 12)}…" is ${item.length} chars; Insight truncates above ${MEMORY_CELL_LABEL_MAX}`,
                );
              }
              if (Array.isArray(item)) {
                for (const cell of item) {
                  if (typeof cell === "string" && cell.length > MEMORY_CELL_LABEL_MAX) {
                    broken.push(
                      `${at} case ${ci} — nested string cell "${cell.slice(0, 12)}…" is ${cell.length} chars; Insight truncates above ${MEMORY_CELL_LABEL_MAX}`,
                    );
                  }
                }
              }
            }
          }
        });
      }
    }
    expect(broken).toEqual([]);
  });
});

/**
 * The parser the browser actually uses, run over every authored fence.
 *
 * The checks above describe the contract; `parseSpec` enforces it at runtime
 * and returns null for anything it dislikes, which renders as "Invalid
 * sandbox block" on the page. Two validators will drift — this has already
 * happened once, when property-graded cases (no `expect`) passed every check
 * above and were rejected by the parser. Running the real thing closes it.
 */
describe("every sandbox fence survives the real parser", () => {
  it("parseSpec accepts all of them", () => {
    const rejected: string[] = [];
    for (const lesson of LESSONS) {
      for (const f of fences(lesson.body, "sandbox")) {
        // Fed the fence body verbatim, exactly as the page does.
        if (parseSandboxSpec(f.json) === null) {
          rejected.push(`${lesson.rel}:${f.line}`);
        }
      }
    }
    expect(rejected).toEqual([]);
  });
});

/**
 * The split-pane problem view hoists the sandbox fence out of the
 * markdown into its own pane by parsing at build time and slicing on
 * real AST offsets — see `lib/content/extractSandboxFence.ts`. That
 * extraction is only correct if three things hold about every lesson;
 * these tests make sure they hold forever, not just as of this writing.
 */
describe("the sandbox fence is safe to extract", () => {
  it("every problem lesson has exactly one sandbox fence", () => {
    const bad: string[] = [];
    for (const lesson of LESSONS) {
      const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(lesson.body);
      if (!fm?.[1].includes("type: problem")) continue;
      const count = fences(lesson.body, "sandbox").length;
      if (count !== 1) bad.push(`${lesson.rel} — found ${count}`);
    }
    expect(bad).toEqual([]);
  });

  it("no sandbox fence is nested inside a reveal/aside/tabs fence", () => {
    const bad: string[] = [];
    // Fence bodies here can carry a label after the lang word
    // ("````reveal Hint 1 — ..."), so `fences()`'s exact-match regex
    // can't be reused — this matches the same shape, tolerant of
    // trailing text on the opening line.
    const outer = /^(`{4,8})(?:reveal|aside|tabs)[^\n]*\n([\s\S]*?)^\1\s*$/gm;
    for (const lesson of LESSONS) {
      for (const m of lesson.body.matchAll(outer)) {
        if (/^```sandbox\s*$/m.test(m[2])) bad.push(lesson.rel);
      }
    }
    expect(bad).toEqual([]);
  });

  it(
    "no problem lesson has a heading duplicated across its sandbox split",
    () => {
      // beforeSandbox/afterSandbox render as two independent <Markdown>
      // instances, each running its own rehype-slug pass — a heading with
      // the same text on both sides would collide on the same DOM id.
      const heading = /^#{2,3}\s+(.+)$/gm;
      const bad: string[] = [];
      for (const lesson of LESSONS) {
        const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(lesson.body);
        if (!fm?.[1].includes("type: problem")) continue;

        const { content } = matter(lesson.body);
        const split = extractSandboxFence(content.trim());
        if (!split) continue;

        const before = new Set(
          [...split.beforeSandbox.matchAll(heading)].map((m) => m[1].trim()),
        );
        for (const m of split.afterSandbox.matchAll(heading)) {
          if (before.has(m[1].trim())) {
            bad.push(`${lesson.rel} — "${m[1].trim()}"`);
          }
        }
      }
      expect(bad).toEqual([]);
    },
    // Parses all 212 lesson files synchronously — under full-suite worker
    // contention (18 files running in parallel) this reliably exceeds the
    // 5000ms default even though it finishes in ~1s isolated.
    20000,
  );
});

/**
 * The coach cites the authored hint ladder. A problem without a Hint
 * reveal leaves it inventing advice or repeating nothing — so the gate
 * is hard: every problem lesson's Explanation slice has ≥1 `reveal`
 * whose label matches /^Hint\b/i. No allowlist.
 */
describe("every problem lesson has a coach hint ladder", () => {
  it(
    "Explanation contains at least one Hint reveal",
    () => {
      const missing: string[] = [];
      for (const lesson of LESSONS) {
        const { data, content } = matter(lesson.body);
        if (data.type !== "problem") continue;
        const split = extractSandboxFence(content.trim());
        if (!split) {
          missing.push(`${lesson.rel} — no sandbox`);
          continue;
        }
        const { explanation } = splitProblemTabs(split.afterSandbox);
        if (extractHints(explanation).length === 0) {
          missing.push(lesson.rel.replace(/\\/g, "/"));
        }
      }
      expect(missing).toEqual([]);
    },
    20000,
  );
});

/**
 * `/problems/[slug]` addresses a problem by slug alone, scanning every
 * module for a match (`findProblemBySlug`) — safe only because no two
 * problem lessons anywhere in the course share a slug. Verified true for
 * all 116 before this plan was written; this is what keeps it true.
 */
describe("Practice chapters", () => {
  it("every problem-bearing module has exactly one practice lesson, last", () => {
    const bad: string[] = [];
    for (const mod of MODULES) {
      const problems = mod.lessons.filter((l) => l.type === "problem");
      const practices = mod.lessons.filter((l) => l.type === "practice");
      if (problems.length === 0) {
        if (practices.length !== 0) {
          bad.push(`${mod.slug}: concept-only module has practice`);
        }
        continue;
      }
      if (practices.length !== 1) {
        bad.push(`${mod.slug}: expected 1 practice, found ${practices.length}`);
        continue;
      }
      const last = mod.lessons[mod.lessons.length - 1];
      if (last.type !== "practice" || last.slug !== "practice") {
        bad.push(`${mod.slug}: last lesson must be type/slug practice`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("every practice.md on disk has type: practice frontmatter", () => {
    const bad: string[] = [];
    for (const lesson of LESSONS) {
      if (!lesson.rel.replace(/\\/g, "/").endsWith("/practice.md")) continue;
      const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(lesson.body);
      if (!fm?.[1].includes("type: practice")) {
        bad.push(lesson.rel);
      }
    }
    expect(bad).toEqual([]);
  });

  it("practice-problems fence slugs are a subset of that module's problems", () => {
    const bad: string[] = [];
    const fence = /^(`{3,8})practice-problems\s*\n([\s\S]*?)^\1\s*$/gm;
    for (const lesson of LESSONS) {
      if (!lesson.rel.replace(/\\/g, "/").endsWith("/practice.md")) continue;
      const moduleSlug = lesson.rel.replace(/\\/g, "/").split("/")[0];
      const mod = MODULES.find((m) => m.slug === moduleSlug);
      if (!mod) {
        bad.push(`${lesson.rel}: unknown module`);
        continue;
      }
      const allowed = new Set(
        mod.lessons.filter((l) => l.type === "problem").map((l) => l.slug),
      );
      for (const m of lesson.body.matchAll(fence)) {
        const body = m[2];
        for (const sm of body.matchAll(/^\s*-\s+slug:\s*([^\s#]+)\s*$/gm)) {
          const slug = sm[1];
          if (!allowed.has(slug)) {
            bad.push(`${lesson.rel}: unknown slug "${slug}"`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("every practice.md carries a practice-problems fence", () => {
    const bad: string[] = [];
    for (const lesson of LESSONS) {
      if (!lesson.rel.replace(/\\/g, "/").endsWith("/practice.md")) continue;
      const { authored } = extractPracticeProblemsFence(lesson.body);
      if (!authored) {
        bad.push(`${lesson.rel}: missing practice-problems fence`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("problem slugs are globally unique", () => {
  it("no two problem lessons share a slug", () => {
    const seenAt = new Map<string, string>();
    const bad: string[] = [];
    for (const lesson of LESSONS) {
      const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(lesson.body);
      if (!fm?.[1].includes("type: problem")) continue;
      const slug = lesson.rel.replace(/\.md$/, "").split("/").pop()!;
      const existing = seenAt.get(slug);
      if (existing) {
        bad.push(`"${slug}" used by both ${existing} and ${lesson.rel}`);
      } else {
        seenAt.set(slug, lesson.rel);
      }
    }
    expect(bad).toEqual([]);
  });
});

/**
 * Sandbox coverage, as a hard gate.
 *
 * This was a ratchet against a checked-in backlog while 85 problem lessons
 * were still missing a sandbox. That migration is finished — every problem
 * lesson has one — so the scaffolding is gone and the rule is now absolute
 * (Rule 1: scaffolding that outlives its migration is debt pretending to be
 * process).
 *
 * There are no permitted exclusions. Every problem shape in the course is
 * expressible: structural inputs via `shape`, operation sequences via
 * `sequence`, encode/decode pairs via `roundtrip`, order-independent answers
 * via `compare`, and answers that are correct in more than one form via
 * `property`. A new problem lesson that does not fit means the runner needs
 * extending, not that the lesson is exempt.
 */
describe("sandbox coverage", () => {
  it("every problem lesson has a sandbox", () => {
    const missing = LESSONS.filter((l) => {
      const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(l.body);
      return fm?.[1].includes("type: problem") && !l.body.includes("```sandbox");
    })
      .map((l) => l.rel.replace(/\.md$/, ""))
      .sort();

    expect(missing).toEqual([]);
  });
});

/**
 * Problem intros must use the ExamplesBlock path — not a plain `text`
 * code surface. A ```text fence under **Examples** is the regression that
 * shipped find-the-index with a grey "text" label and cramped mono dump.
 */
describe("problem examples coverage", () => {
  function problemLessons() {
    return LESSONS.filter((l) => {
      const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(l.body);
      return fm?.[1].includes("type: problem");
    });
  }

  it("every problem lesson has an examples fence that parses into rows", () => {
    const bad: string[] = [];
    for (const lesson of problemLessons()) {
      const blocks = fences(lesson.body, "examples");
      if (blocks.length === 0) {
        bad.push(`${lesson.rel} — missing \`\`\`examples fence`);
        continue;
      }
      // The first examples fence is the problem intro; later ones (rare) must
      // also parse if present.
      for (const f of blocks) {
        const rows = parseExampleRows(f.json);
        if (!rows || rows.length === 0) {
          bad.push(`${lesson.rel}:${f.line} — examples fence produced no rows`);
          continue;
        }
        const lines = f.json
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        for (const line of lines) {
          if (!line.includes("→") && !line.includes("->")) {
            bad.push(
              `${lesson.rel}:${f.line} — non-arrow line inside examples ("${line.slice(0, 60)}")`,
            );
          }
          const arrow = line.includes("→") ? "→" : line.includes("->") ? "->" : null;
          if (arrow && !line.slice(0, line.indexOf(arrow)).trim()) {
            bad.push(
              `${lesson.rel}:${f.line} — arrow with empty input ("${line.slice(0, 60)}")`,
            );
          }
        }
        if (rows.length < lines.filter((l) => l.includes("→") || l.includes("->")).length) {
          bad.push(
            `${lesson.rel}:${f.line} — some arrow lines failed to parse into rows`,
          );
        }
        for (const row of rows) {
          const arrows =
            (row.input.match(/→/g) || []).length +
            (row.input.match(/->/g) || []).length +
            (row.output.match(/→/g) || []).length +
            (row.output.match(/->/g) || []).length;
          if (arrows > 0) {
            bad.push(
              `${lesson.rel}:${f.line} — arrow leaked into input/output ("${row.input}" → "${row.output}")`,
            );
          }
          if (row.input.includes("⇒") || row.output.includes("⇒")) {
            bad.push(
              `${lesson.rel}:${f.line} — use → not ⇒ as the result separator`,
            );
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("every problem lesson uses a constraint fence (not **Constraints:** prose)", () => {
    const bad = problemLessons()
      .filter(
        (l) =>
          fences(l.body, "constraint").length === 0 ||
          /\*\*Constraints:\*\*/.test(l.body),
      )
      .map((l) => l.rel)
      .sort();
    expect(bad).toEqual([]);
  });

  it("problem Examples sections do not fall back to a text fence", () => {
    const bad: string[] = [];
    for (const lesson of problemLessons()) {
      const exIdx = lesson.body.search(/\*\*Examples\*\*|## Examples/);
      if (exIdx < 0) continue;
      const after = lesson.body.slice(exIdx, exIdx + 800);
      const fence = after.match(/```(examples|text)\b/);
      if (fence?.[1] === "text") {
        bad.push(`${lesson.rel} — Examples still opens with \`\`\`text`);
      }
    }
    expect(bad).toEqual([]);
  });
});
