/*
  The code gate for a problem lesson: every code file the page shows is executed, not trusted.
  Spec: docs/superpowers/specs/2026-09-24-lesson-artifacts-rollout-design.md §4.1.

    node_modules/.bin/tsx lesson-artifacts/code-gate.ts <module/slug>     (run from web/)

  Each `code/<name>.py` and `.ts` runs in the real runtimes, through the same harness as
  tests/reference.test.ts, against the cases of the lesson's own sandbox fence, and is held to
  what its name claims:
    solution*, naive*, alt*   correct: pass every case
    slow*                     correct but exponential by design: pass the first five cases
    mistake*                  a shown mistake: must fail at least one case
  The built page must embed exactly those files, so a stale build cannot show code nobody ran.
  This replaces the parked lessonArtifactSolutions test, which needed the app's Lesson tab.
  The last line is the result ledger.py stores; exit 1 on any failure.
*/
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { judge, localiseOps, request, sandboxFences } from "../tests/helpers/sandboxCases";
import { pythonAvailable, runJavaScript, runPython } from "../tests/referenceRunner";

const RULES: [RegExp, "all" | "few" | "fail"][] = [
  [/^(solution|naive|alt)/, "all"],
  [/^slow/, "few"],
  [/^mistake/, "fail"],
];

async function main(): Promise<void> {
  const id = process.argv[2];
  if (!id || !id.includes("/")) throw new Error("usage: tsx lesson-artifacts/code-gate.ts <module/slug>");
  if (!pythonAvailable()) throw new Error("python3 is not available");
  const slug = id.split("/")[1]!;
  const dir = join(__dirname, slug, "code");
  const fence = sandboxFences().find((f) => f.lesson === id);
  if (!fence) throw new Error(`no sandbox fence in courses/dsa/${id}.md`);
  if (!existsSync(join(dir, "solution.py")) || !existsSync(join(dir, "solution.ts")))
    throw new Error(`${slug}/code needs solution.py and solution.ts`);

  const names = [...new Set(readdirSync(dir).map((f) => f.replace(/\.(py|ts)$/, "")))].sort();
  const unnamed = names.filter((n) => !RULES.some(([re]) => re.test(n)));
  if (unnamed.length) throw new Error(`unclassified code files: ${unnamed.join(", ")} (name them solution*, naive*, alt*, slow* or mistake*)`);

  const fn = fence.spec.fn as Record<string, string>;
  const failures: string[] = [];
  let runs = 0;
  for (const name of names) {
    const rule = RULES.find(([re]) => re.test(name))![1];
    const keep = <T,>(cases: T[]) => (rule === "few" ? cases.slice(0, 5) : cases);
    const py = request(fence, readFileSync(join(dir, `${name}.py`), "utf8"));
    py.fnName = fn.python;
    py.cls = null;
    py.cases = keep(localiseOps(fence, "python"));
    const js = request(
      fence,
      ts.transpileModule(readFileSync(join(dir, `${name}.ts`), "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None },
      }).outputText,
    );
    js.cases = keep(localiseOps(fence, "javascript"));
    const judged = { ...fence, spec: { ...fence.spec, cases: keep(fence.spec.cases as unknown[]) } };
    for (const [lang, outcome] of [["python", runPython(py)], ["typescript", await runJavaScript(js)]] as const) {
      const bad = judge(judged, outcome);
      runs++;
      if (rule === "fail" && bad.length === 0) failures.push(`${name} (${lang}) passes every case, so the page's warning is not true`);
      if (rule !== "fail" && bad.length > 0) failures.push(`${name} (${lang}) fails ${bad.length} case(s): ${JSON.stringify(bad[0]).slice(0, 160)}`);
    }
  }

  const built = join(__dirname, "dist", `${id}.html`);
  if (!existsSync(built)) failures.push(`no built page at dist/${id}.html (run build.py)`);
  else {
    // parse the page's CODE bundle rather than search the HTML: Python's json.dumps and JSON.stringify
    // escape non-ASCII differently, so a text search would call "→" in a comment stale
    const m = readFileSync(built, "utf8").match(/\nvar CODE=(\{.*\});\n/);
    const bundle = (m ? JSON.parse(m[1]!) : {}) as Record<string, { py: string; ts: string }>;
    for (const name of names)
      for (const lang of ["py", "ts"] as const) {
        const text = readFileSync(join(dir, `${name}.${lang}`), "utf8").replace(/\n+$/, "");
        if (bundle[name]?.[lang] !== text) failures.push(`built page is stale: ${name}.${lang} differs from what was tested`);
      }
  }

  if (failures.length) {
    failures.forEach((f) => console.log("FAIL " + f));
    console.log(`code: FAILED ${failures.length} check(s) on ${id}`);
    process.exit(1);
  }
  console.log(`code: ${names.length} file(s) × 2 runtimes (${runs} runs) held to their names against ${(fence.spec.cases as unknown[]).length} sandbox cases`);
}

main().catch((e) => {
  console.log("FAIL " + (e instanceof Error ? e.message : String(e)));
  console.log("code: FAILED on " + (process.argv[2] ?? "?"));
  process.exit(1);
});
