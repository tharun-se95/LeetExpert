import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

/**
 * Executes a reference solution against a lesson's cases, in the real
 * runtimes, using the SAME code the browser runs.
 *
 * The point of this module is that CI must not prove a copy. The JavaScript
 * path loads `public/sandbox/structures.js` and `run-cases.js` — literally
 * the files the Worker imports — behind a `self` shim. The Python path
 * extracts the DRIVER string out of `py-runner.js` and feeds it to python3,
 * so the driver under test is the driver that ships.
 *
 * If either of those files changes, this test changes behaviour with it,
 * which is the property that makes the expectations trustworthy.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, "..", "public", "sandbox");

export interface RunRequest {
  source: string;
  fnName: string;
  cls: string | null;
  cases: unknown[];
  arg: number;
  check: string;
  shape: Record<string, string>;
  returns: string;
  /** `roundtrip` only: [encodeMethod, decodeMethod] for this language. */
  roundtrip?: string[];
}

export interface Outcome {
  index: number;
  ret: unknown;
  argAfter: unknown;
  logs: string[];
  error: string | null;
  opResults?: unknown[];
}

/* ------------------------------- JavaScript ------------------------------ */

let jsLoaded: { compile: (s: string, n: string) => unknown; runCases: (t: unknown, r: RunRequest) => Outcome[] } | null = null;

async function loadJsHarness() {
  if (jsLoaded) return jsLoaded;
  const g = globalThis as unknown as Record<string, unknown>;
  // The worker files address their host as `self`; Node has no such global.
  g.self = g.self ?? globalThis;
  await import(join(PUBLIC, "structures.js"));
  await import(join(PUBLIC, "run-cases.js"));
  jsLoaded = g.SANDBOX_RUN as typeof jsLoaded;
  if (!jsLoaded) throw new Error("run-cases.js did not attach SANDBOX_RUN");
  return jsLoaded;
}

export async function runJavaScript(req: RunRequest): Promise<Outcome[]> {
  const harness = await loadJsHarness();
  const exportName =
    req.check === "sequence" || req.check === "roundtrip" ? req.cls! : req.fnName;
  const target = harness.compile(req.source, exportName);
  if (typeof target !== "function") {
    throw new Error(`reference does not define \`${exportName}\``);
  }
  return harness.runCases(target, req);
}

/* --------------------------------- Python -------------------------------- */

/** Pulls the driver out of py-runner.js so CI runs the shipped one. */
function pythonDriver(): string {
  const src = readFileSync(join(PUBLIC, "py-runner.js"), "utf8");
  const start = src.indexOf("const DRIVER = String.raw`");
  const open = src.indexOf("`", start);
  const close = src.indexOf("\n`;", open);
  if (start === -1 || close === -1) {
    throw new Error("could not extract DRIVER from py-runner.js");
  }
  return src.slice(open + 1, close);
}

export function runPython(req: RunRequest): Outcome[] {
  const dir = mkdtempSync(join(tmpdir(), "dsa-ref-"));
  try {
    const payload = {
      source: req.source,
      exportName:
        req.check === "sequence" || req.check === "roundtrip" ? req.cls : req.fnName,
      cases: req.cases,
      arg: req.arg,
      check: req.check,
      shape: req.shape ?? {},
      returns: req.returns ?? "value",
      roundtrip: req.roundtrip ?? [],
    };
    writeFileSync(join(dir, "payload.json"), JSON.stringify(payload));
    writeFileSync(
      join(dir, "main.py"),
      `${pythonDriver()}

import json, sys
p = json.load(open(${JSON.stringify(join(dir, "payload.json"))}))
out = __run_cases(
    p["source"], p["exportName"], json.dumps(p["cases"]),
    p["arg"], p["check"], json.dumps(p["shape"]), p["returns"],
    json.dumps(p["roundtrip"]),
)
sys.stdout.write(out)
`,
    );
    const res = spawnSync("python3", [join(dir, "main.py")], {
      encoding: "utf8",
      timeout: 30000,
    });
    if (res.status !== 0) {
      throw new Error(`python3 failed: ${(res.stderr || "").slice(-400)}`);
    }
    const parsed = JSON.parse(res.stdout) as
      | { fatal: string }
      | { outcomes: Outcome[] };
    if ("fatal" in parsed) throw new Error(parsed.fatal);
    return parsed.outcomes;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function pythonAvailable(): boolean {
  return spawnSync("python3", ["--version"], { encoding: "utf8" }).status === 0;
}
