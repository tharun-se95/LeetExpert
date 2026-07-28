import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

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
      const fm = /^---\n([\s\S]*?)\n---/.exec(l.body);
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
          cases.forEach((raw, ci) => {
            const c = raw as Record<string, unknown>;
            if (!Array.isArray(c.args)) broken.push(`${at} case ${ci} — "args" must be an array`);
            if (!("expect" in c)) broken.push(`${at} case ${ci} — missing "expect"`);
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
      }
    }
    expect(broken).toEqual([]);
  });
});

/**
 * Sandbox coverage, as a ratchet.
 *
 * 90 problem lessons still have no sandbox. Asserting "every problem has
 * one" would just fail CI forever and get skipped, so instead the backlog is
 * checked in and pinned: the set may only shrink. Add a sandbox and this
 * fails until you delete the entry; add a new problem lesson without one and
 * it fails until you make a deliberate choice.
 *
 * Some problems will stay on the list permanently and that is correct — the
 * runner calls a single function, so class-design problems (Min Stack, Range
 * Sum Query) do not fit it, and problems with order-independent answers
 * (3Sum, Group Anagrams) cannot be graded by equality without failing
 * correct solutions.
 */
describe("sandbox coverage", () => {
  it("matches the checked-in backlog exactly", () => {
    const backlog: string[] = JSON.parse(
      readFileSync(join(__dirname, "sandbox-backlog.json"), "utf8"),
    );
    const actual = LESSONS.filter((l) => {
      const fm = /^---\n([\s\S]*?)\n---/.exec(l.body);
      return fm?.[1].includes("type: problem") && !l.body.includes("```sandbox");
    })
      .map((l) => l.rel.replace(/\.md$/, ""))
      .sort();

    const added = actual.filter((x) => !backlog.includes(x));
    const done = backlog.filter((x) => !actual.includes(x));
    expect({ newlyMissing: added, nowCoveredRemoveFromBacklog: done }).toEqual({
      newlyMissing: [],
      nowCoveredRemoveFromBacklog: [],
    });
  });
});
