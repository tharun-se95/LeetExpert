import { existsSync, readdirSync, readFileSync } from "node:fs";
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
const SHELLS = ["components/auth/AccountControl.tsx", "components/auth/AccountRuntime.tsx", "components/auth/SyncHint.tsx"];
// Everything that renders on every page: the shells' parents and the root
// layout. A static import from any of them (say, a header reaching for
// authClient) would bring the auth client back just as surely.
const ROOT_FILES = [
  ...SHELLS,
  "app/layout.tsx",
  "components/layout/AppShell.tsx",
  "components/layout/Header.tsx",
  "components/landing/LandingHeader.tsx",
];

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

  it("finds the headers and the layout too, so a static import from them is seen", () => {
    expect(rel).toEqual(expect.arrayContaining(["app/layout.tsx", "components/layout/Header.tsx", "components/landing/LandingHeader.tsx"]));
  });

  it("does load each of them through the fail-safe chunk helper", () => {
    for (const [file, target] of [
      ["components/auth/AccountControl.tsx", "SessionControl"],
      ["components/auth/AccountRuntime.tsx", "SessionSync"],
      ["components/auth/SyncHint.tsx", "SignedOutLine"],
    ] as const) {
      const source = readFileSync(join(SRC, file), "utf8");
      expect(source, file).toMatch(new RegExp(`authChunk\\(\\(\\) => import\\("@/components/auth/${target}"\\)`));
      // Not a bare next/dynamic: a chunk that fails to load must not throw.
      expect(source, file).not.toMatch(/from "next\/dynamic"/);
    }
  });
});

describe("who may import the auth client at all", () => {
  // Whatever the closure above misses (a new root component, say), every static
  // importer of the client (or of endSession, which imports it) in the app is
  // listed here: the sign-in page's own route, and the modules that are only
  // ever loaded through authChunk.
  const ALLOWED = new Set([
    "app/sign-in/SignInButtons.tsx",
    "components/auth/SessionControl.tsx",
    "components/auth/SessionSync.tsx",
    "components/auth/SignedOutLine.tsx",
    "lib/auth/endSession.ts",
    "lib/auth/client.ts",
  ]);

  function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full, out);
      else if (/\.tsx?$/.test(entry.name)) out.push(full);
    }
    return out;
  }

  it("is imported statically only by the sign-in page and the lazily loaded session modules", () => {
    const importers: string[] = [];
    for (const file of walk(SRC)) {
      const source = readFileSync(file, "utf8");
      const specs = [...source.matchAll(STATIC_IMPORT)].map((m) => m[1] ?? m[2]!);
      if (specs.some((s) => s === "@/lib/auth/client" || s === "@/lib/auth/endSession" || s === "better-auth/react" || s.startsWith("better-auth/client"))) {
        importers.push(file.slice(SRC.length + 1));
      }
    }
    expect(importers.filter((f) => !ALLOWED.has(f))).toEqual([]);
  });
});

describe("the sign-in page's story", () => {
  // SignInButtons is the route's one client module that needs the auth client;
  // the animation and the benefit list must stay light, so the closure is checked.
  const { files, packages } = closure(["app/sign-in/SignInStory.tsx"]);
  const rel = [...files].map((f) => f.slice(SRC.length + 1));

  it("finds the graph it is meant to walk", () => {
    expect(rel).toEqual(expect.arrayContaining(["app/sign-in/SignInStory.tsx", "components/landing/HeroFloor.tsx"]));
  });

  it("never reaches the auth client or its package", () => {
    expect(rel).not.toContain("lib/auth/client.ts");
    expect([...packages].filter((p) => p.startsWith("better-auth"))).toEqual([]);
  });
});
