import { existsSync, readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// The header, the runtime host and the hub hint are in every page's initial
// JS. The auth client (better-auth, ~12 KB gzip), the account menu and its
// dialogs must reach a page only through next/dynamic, and only where auth is
// enabled. A static import anywhere in these files' closure puts them back in
// the shared chunk of all 450+ pages; neither tsc nor a unit test of the
// components sees that, so the import graph is checked here. `npm run build`
// is the final word (the initial <script> list of a prerendered page).

const SRC = join(__dirname, "..", "src");
const ROOT_FILES = ["components/auth/AccountControl.tsx", "components/auth/AccountRuntime.tsx", "components/auth/SyncHint.tsx"];

// Static edges only: `import type` is erased, and import("...") is the dynamic
// boundary this test exists to keep.
const STATIC_IMPORT = /^\s*(?:import|export)\s+(?!type\b)[^"'`;]*?\sfrom\s+["']([^"']+)["']|^\s*import\s+["']([^"']+)["']/gm;

function resolveModule(from: string, spec: string): string | null {
  const base = spec.startsWith("@/") ? join(SRC, spec.slice(2)) : spec.startsWith(".") ? resolve(dirname(from), spec) : null;
  if (!base) return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    if (existsSync(candidate) && /\.(tsx?|json)$/.test(candidate)) return candidate;
  }
  return null;
}

function closure(entries: string[]): { files: Set<string>; packages: Set<string> } {
  const files = new Set<string>();
  const packages = new Set<string>();
  const queue = entries.map((e) => join(SRC, e));
  for (let file = queue.pop(); file !== undefined; file = queue.pop()) {
    if (files.has(file)) continue;
    files.add(file);
    if (file.endsWith(".json")) continue;
    const source = readFileSync(file, "utf8");
    for (const m of source.matchAll(STATIC_IMPORT)) {
      const spec = m[1] ?? m[2]!;
      const target = resolveModule(file, spec);
      if (target) queue.push(target);
      else if (!spec.startsWith(".") && !spec.startsWith("@/")) packages.add(spec);
    }
  }
  return { files, packages };
}

describe("what the always-loaded auth components pull in statically", () => {
  const { files, packages } = closure(ROOT_FILES);
  const rel = [...files].map((f) => f.slice(SRC.length + 1));

  it("finds the graph it is meant to walk", () => {
    expect(rel).toEqual(expect.arrayContaining([...ROOT_FILES, "components/providers/SyncBridge.tsx"]));
    expect(packages.has("next/dynamic")).toBe(true);
  });

  it("does not reach the auth client, its package, or the session modules", () => {
    expect(rel).not.toContain("lib/auth/client.ts");
    expect([...packages].filter((p) => p.startsWith("better-auth"))).toEqual([]);
    for (const heavy of [
      "components/auth/SessionControl.tsx",
      "components/auth/SessionSync.tsx",
      "components/auth/SignedOutLine.tsx",
      "components/providers/SyncProvider.tsx",
      "lib/auth/signOutDevice.ts",
      "lib/auth/endSession.ts",
      "lib/sandbox/sandboxIds.generated.json",
    ]) {
      expect(rel, heavy).not.toContain(heavy);
    }
  });

  it("does load each of them through a dynamic import", () => {
    for (const [file, target] of [
      ["components/auth/AccountControl.tsx", "SessionControl"],
      ["components/auth/AccountRuntime.tsx", "SessionSync"],
      ["components/auth/SyncHint.tsx", "SignedOutLine"],
    ] as const) {
      expect(readFileSync(join(SRC, file), "utf8"), file).toMatch(new RegExp(`dynamic\\(\\(\\) => import\\("@/components/auth/${target}"\\)`));
    }
  });
});
