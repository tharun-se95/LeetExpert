# App Header and Paper Grain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The app header takes the landing header's look at `h-14`, and the landing page's grain becomes the desk on every route, covering the header, the lessons drawer and its tabs and fillets, the mobile sheet, and the problem sub-header.

**Architecture:**
- `.paper-grain` (the existing `::before` layer) stays the one transparent desk wrapper inside `<main>`, unified for every route.
- A new `.grain-paper` class paints grain on opaque surfaces as background layers: the paper at `1 − opacity` over the tile. It matches `.paper-grain` within 1/255.
- The drawer fillets use the same layers cut by a mask.
- Header class sets are shared with `LandingHeader` through `headerChrome.ts`.

**Tech Stack:** Next.js 16.2 App Router (Turbopack), React 19.2, Tailwind v4, Vitest 4, Playwright MCP for browser checks.

**Spec:** `docs/superpowers/specs/2026-09-14-app-header-and-grain-design.md`

## Global Constraints

- The app header stays `h-14`; `sidebarChrome.test.ts` derives the opener offset and the rail paper from it.
- `.paper-grain` has exactly one use (AppShell's desk wrapper). `.grain-paper` is used exactly in Header, Sidebar, FloatingLessonsButton and MobileLessonsSheet.
- `--grain-veil` is declared on the selectors that use it, never on `:root`.
- Solid and unchanged: `.reading-page`, cards and wells, code, the IDE, `SearchDialog`.
- No hex outside allowlists. Focus stays the global `:focus-visible` outline.
- Every text ink ≥ 4.5:1 over the worst grain pixel, both themes.
- Every new or changed assertion is seen failing before it passes.
- Builds on another session's **uncommitted** landing work in the main checkout: `LandingHeader.tsx`, `landingHeader.test.tsx`, `grain.png`, the `--grain-opacity` token and `.paper-grain`, plus AppShell's landing branch.
  - **No per-task commits.** A commit of only this work would leave `main` referencing untracked files.
  - Commit scope is settled with the owner at the end (Task 5).
  - Never `git stash`; never revert or reformat foreign hunks.
- Do not run Prettier. Re-read a file before editing it; another session may have touched it.
- Gate: `npx tsc --noEmit`, `npm run lint` (0 errors), `npx vitest run`, `npm run build`, plus browser verification.

---

## File Structure

| File | Change |
| --- | --- |
| `web/src/app/globals.css` | `.grain-paper` + `--grain-veil`; fillets use veil + tile + mask; `.sidebar-rail` paper `--background`; print rule; comments |
| `web/src/components/layout/headerChrome.ts` (create) | `LOGO_CHIP`, `WORDMARK`, `NAV_LINK`, `NAV_LINK_ACTIVE`, `ROUND_CONTROL` |
| `web/src/components/layout/Header.tsx` | landing look, `grain-paper`, `bg-background`, `aria-current` |
| `web/src/components/landing/LandingHeader.tsx` | uses `headerChrome` (no visual change) |
| `web/src/components/layout/AppShell.tsx` | one desk wrapper for every route |
| `web/src/components/layout/Sidebar.tsx` | rail + close tab `grain-paper` |
| `web/src/components/layout/FloatingLessonsButton.tsx` | `grain-paper` |
| `web/src/components/layout/MobileLessonsSheet.tsx` | `bg-background grain-paper` |
| `web/src/components/problems/ProblemWorkspace.tsx` | root and sub-header transparent |
| `web/tests/paperGrain.test.ts` | `.grain-paper` rule, fillets, allowlist |
| `web/tests/grainContrast.test.ts` (create) | worst-pixel contrast from tokens |
| `web/tests/appHeader.test.tsx` (create) | shared parts, paper, `aria-current` |
| `web/tests/landingHeader.test.tsx` | unified wrapper; Header/Sidebar outside it |
| `CLAUDE.md` | doctrine §4 |

---

### Task 1: The `.grain-paper` paint, fillets and contrast guard

**Files:** Modify `web/src/app/globals.css`. Test `web/tests/paperGrain.test.ts`; create `web/tests/grainContrast.test.ts`.

**Interfaces:** Produces the CSS class `.grain-paper` and the custom properties `--grain-paper` (input, default `var(--background)`) and `--grain-veil`.

- [ ] **Step 1: Failing tests.** Append to `web/tests/paperGrain.test.ts`:

```ts
describe("grain on opaque surfaces", () => {
  const body = (selector: string) => {
    const at = globals.indexOf(`\n${selector} {`);
    expect(at, `missing rule: ${selector}`).toBeGreaterThanOrEqual(0);
    return globals.slice(at, globals.indexOf("\n}", at));
  };

  it("veils the paper over the tile, so it composites like .paper-grain's opacity", () => {
    const veil = body(".grain-paper,\n.drawer-tab::before,\n.drawer-tab::after");
    expect(veil).toMatch(
      /--grain-veil:\s*color-mix\(\s*in srgb,\s*var\(--grain-paper, var\(--background\)\) calc\(\(1 - var\(--grain-opacity\)\) \* 100%\),\s*transparent\s*\)/,
    );
    const paint = body(".grain-paper");
    expect(paint).toContain("linear-gradient(var(--grain-veil), var(--grain-veil))");
    expect(paint).toContain(`url("/textures/grain.png")`);
    expect(paint).toContain(`${GRAIN.size / 2}px ${GRAIN.size / 2}px`);
  });

  it("gives the drawer tab fillets the grain, cut by a mask", () => {
    for (const pseudo of [".drawer-tab::before", ".drawer-tab::after"]) {
      const rule = body(pseudo);
      expect(rule).toContain("linear-gradient(var(--grain-veil), var(--grain-veil))");
      expect(rule).toContain(`url("/textures/grain.png")`);
      expect(rule).toMatch(/--grain-paper:\s*var\(--rail-surface\)/);
      expect(rule).toMatch(/\bmask:\s*radial-gradient\(/);
    }
  });

  it("prints without grain", () => {
    expect(globals).toMatch(/@media print\s*\{[^}]*\.grain-paper[^{]*\{\s*background-image:\s*none/);
  });
});
```

Create `web/tests/grainContrast.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
const split = css.indexOf("\n.dark {");
const tokens = (block: string) =>
  Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const light = tokens(css.slice(0, split));
const dark = { ...light, ...tokens(css.slice(split, css.indexOf("\n}", split))) };

function resolve(t: Record<string, string>, name: string, depth = 0): string {
  const v = t[name];
  expect(v, `--${name}`).toBeDefined();
  const ref = v.match(/^var\(--([a-z0-9-]+)\)$/);
  return ref && depth < 10 ? resolve(t, ref[1], depth + 1) : v;
}
function rgb(v: string): [number, number, number] {
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
  }
  const fn = v.match(/^rgba?\(([^)]*)\)$/);
  expect(fn, `colour ${v}`).not.toBeNull();
  return fn![1].split(/[\s,/]+/).slice(0, 3).map(Number) as [number, number, number];
}
const lum = (c: number[]) =>
  c.map((x) => (x /= 255) <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
    .reduce((s, x, i) => s + x * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a: number[], b: number[]) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("text over the desk grain", () => {
  for (const [theme, t] of [["light", light], ["dark", dark]] as const) {
    it(`clears AA at the worst grain pixel in ${theme}`, () => {
      const paper = rgb(resolve(t, "background"));
      const opacity = Number(resolve(t, "grain-opacity"));
      expect(opacity).toBeGreaterThan(0);
      for (const ink of ["foreground", "muted", "mark", "accent", "good", "bad", "warn", "info"]) {
        const c = rgb(resolve(t, ink));
        // The worst pixel pushes the paper toward the ink: black under dark ink, white under light.
        const grey = lum(c) < lum(paper) ? 0 : 255;
        const worst = paper.map((p) => p * (1 - opacity) + grey * opacity);
        expect(ratio(c, worst), `${theme} --${ink}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
```

- [ ] **Step 2: Run.** `npx vitest run tests/paperGrain.test.ts tests/grainContrast.test.ts`.
  - Expected: the three `grain on opaque surfaces` tests FAIL.
  - `grainContrast` PASSES (4.89 and 4.75 are the floors). Prove it can fail: temporarily set `--grain-opacity: 0.2` in `:root`, run it and see FAIL, then restore.

- [ ] **Step 3: Implement** in `web/src/app/globals.css`.

  Directly after the `.paper-grain` `@media print` block, add:

```css
/*
  Grain on an opaque surface (the app header, the lessons drawer and its tabs,
  the mobile lessons sheet): background layers instead of .paper-grain's
  ::before, which those surfaces cannot spare (the tabs' fillets use both
  pseudo-elements) or do not need (they paint their own paper). The paper at
  (1 - opacity) over the opaque tile composites to exactly the tile at
  opacity over the paper — measured against .paper-grain on --background,
  max channel difference 1/255 in both themes. --grain-paper names the
  surface's paper; background-color still comes from its own bg-* class.
  --grain-veil is declared on the elements that use it: a custom property
  resolves var() where it is declared, so on :root it would freeze
  --grain-paper at :root's value. Spec:
  docs/superpowers/specs/2026-09-14-app-header-and-grain-design.md
*/
.grain-paper,
.drawer-tab::before,
.drawer-tab::after {
  --grain-veil: color-mix(
    in srgb,
    var(--grain-paper, var(--background)) calc((1 - var(--grain-opacity)) * 100%),
    transparent
  );
}

.grain-paper {
  background-image:
    linear-gradient(var(--grain-veil), var(--grain-veil)),
    url("/textures/grain.png");
  background-size: auto, 200px 200px;
  background-repeat: no-repeat, repeat;
}

@media print {
  .grain-paper,
  .drawer-tab::before,
  .drawer-tab::after {
    background-image: none;
  }
}
```

  Replace the `.drawer-tab::before { … }` and `.drawer-tab::after { … }` rules with:

```css
.drawer-tab::before {
  bottom: 100%;
  --grain-paper: var(--rail-surface);
  background:
    radial-gradient(
      circle at 100% 0,
      transparent calc(var(--radius-md) - 1.25px),
      var(--border) calc(var(--radius-md) - 0.75px),
      var(--border) calc(var(--radius-md) - 0.25px),
      transparent calc(var(--radius-md) + 0.25px)
    ),
    linear-gradient(var(--grain-veil), var(--grain-veil)),
    url("/textures/grain.png") 0 0 / 200px 200px;
  mask: radial-gradient(
    circle at 100% 0,
    transparent calc(var(--radius-md) - 1.25px),
    #000 calc(var(--radius-md) - 0.75px)
  );
}

.drawer-tab::after {
  top: 100%;
  --grain-paper: var(--rail-surface);
  background:
    radial-gradient(
      circle at 100% 100%,
      transparent calc(var(--radius-md) - 1.25px),
      var(--border) calc(var(--radius-md) - 0.75px),
      var(--border) calc(var(--radius-md) - 0.25px),
      transparent calc(var(--radius-md) + 0.25px)
    ),
    linear-gradient(var(--grain-veil), var(--grain-veil)),
    url("/textures/grain.png") 0 0 / 200px 200px;
  mask: radial-gradient(
    circle at 100% 100%,
    transparent calc(var(--radius-md) - 1.25px),
    #000 calc(var(--radius-md) - 0.75px)
  );
}
```

  In the `.drawer-tab` comment, replace "`--rail-surface outside the circle, a 1px --border ring on it, transparent inside`" with "`the rail's grainy paper outside the circle (veil over tile, cut by a mask of the circle, so the fillets carry the same grain as the tab and rail), a 1px --border ring on it, transparent inside`".

  `#000` in a mask is an alpha stop, not a colour. If `design-tokens.test.ts` flags it, use `black` instead.

- [ ] **Step 4: Run.** `npx vitest run tests/paperGrain.test.ts tests/grainContrast.test.ts tests/sidebarChrome.test.ts tests/design-tokens.test.ts`. Expected: PASS.

---

### Task 2: Surfaces onto the grain (header paper, drawer, sheet, problem page, desk wrapper)

**Files:**
- Modify: `globals.css` (`.sidebar-rail`), `Header.tsx:59` (the `<header>` class only), `Sidebar.tsx:134,171`, `FloatingLessonsButton.tsx:33`, `MobileLessonsSheet.tsx:104`, `ProblemWorkspace.tsx:178,187`, `AppShell.tsx:376-397`.
- Tests: `paperGrain.test.ts`, `landingHeader.test.tsx`.

**Interfaces:** Consumes `.grain-paper` (Task 1).

- [ ] **Step 1: Failing tests.** Append to `web/tests/paperGrain.test.ts`, adding `readdirSync` to the `node:fs` import:

```ts
describe("where the grain goes", () => {
  const src = join(web, "src");
  const files: Record<string, string> = {};
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith(".tsx")) files[p.slice(src.length + 1)] = readFileSync(p, "utf8");
    }
  };
  walk(src);
  const count = (text: string, cls: string) => (text.match(new RegExp(`["\\s]${cls}\\b`, "g")) ?? []).length;

  it("paints opaque surfaces with .grain-paper, and only these", () => {
    const uses = Object.fromEntries(
      Object.entries(files).map(([f, t]) => [f, count(t, "grain-paper")]).filter(([, n]) => n),
    );
    expect(uses).toEqual({
      "components/layout/Header.tsx": 1,
      "components/layout/Sidebar.tsx": 2,
      "components/layout/FloatingLessonsButton.tsx": 1,
      "components/layout/MobileLessonsSheet.tsx": 1,
    });
  });

  it("tells the drawer's surfaces their paper is the rail's", () => {
    expect(files["components/layout/Sidebar.tsx"]).toContain("[--grain-paper:var(--rail-surface)]");
    expect(files["components/layout/FloatingLessonsButton.tsx"]).toContain("[--grain-paper:var(--rail-surface)]");
  });

  it("paints the drawer in the header's paper", () => {
    expect(globals).toMatch(/\.sidebar-rail\s*\{\s*--rail-surface:\s*var\(--background\);/);
  });

  it("lets the desk show through the problem page's root and sub-header", () => {
    const ws = files["components/problems/ProblemWorkspace.tsx"];
    expect(ws).not.toMatch(/overflow-hidden bg-background/);
    expect(ws.match(/<header className="([^"]*)"/)![1]).not.toMatch(/\bbg-/);
  });

  it("puts the mobile lessons sheet on grainy page paper", () => {
    const sheet = files["components/layout/MobileLessonsSheet.tsx"];
    expect(sheet).toMatch(/className="absolute inset-0 flex flex-col bg-background grain-paper/);
  });
});
```

In `web/tests/landingHeader.test.tsx`, replace the test `"renders LandingHeader inside <main>, in the grain wrapper, above the page"` with:

```tsx
  it("renders one grain wrapper inside <main> for every route, LandingHeader inside it on /", () => {
    const wrapper = main.indexOf(`"paper-grain relative`);
    const header = main.indexOf("<LandingHeader");
    const page = main.indexOf("<PageEnter", wrapper);
    expect(wrapper, "paper-grain wrapper inside <main>").toBeGreaterThan(0);
    expect(header).toBeGreaterThan(wrapper);
    expect(page).toBeGreaterThan(header);
    expect(main.match(/<PageEnter/g)).toHaveLength(1);
    expect(main).toMatch(/<LandingHeader\s+onOpenSearch=\{\(\) => setSearchOpen\(true\)\}/);
  });

  it("keeps the app Header and the drawer outside the desk wrapper", () => {
    // Both paint their own grain (.grain-paper); inside the wrapper it would sit on top of the desk's.
    expect(shell.indexOf("<Header")).toBeLessThan(shell.indexOf("<main"));
    expect(shell.indexOf("<Sidebar")).toBeLessThan(shell.indexOf("<main"));
  });
```

  In `"tells the header it is scrolled…"`, change `main.indexOf('className="paper-grain')` to `main.indexOf('"paper-grain relative')`.

- [ ] **Step 2: Run.** `npx vitest run tests/paperGrain.test.ts tests/landingHeader.test.tsx`. Expected: the new tests FAIL; the rest pass.

- [ ] **Step 3: Implement.**
  1. `globals.css`, `.sidebar-rail`: `--rail-surface: var(--background);`. Rewrite the comment's first paragraph:

```css
/*
  Lessons rail: the app header's own paper, --background with the desk grain
  (owner, 2026-09-13 "match the header"; 2026-09-14 grain app-wide), so the
  header, the drawer and its tabs read as one grainy sheet. It used to carry
  a 4%/10% topic wash, then --elevated; both are gone. No per-theme rule: the
  token flips with the theme exactly as the header's bg-background does.

  Painted through --rail-surface rather than bg-background directly because
  the drawer tabs' fillets (.drawer-tab below) must name this exact paper for
  their grain veil. Rows inside keep hovering to --surface.
*/
```

  2. `Header.tsx` `<header>`: replace `print:hidden shadow-edge-bottom sticky` with `print:hidden grain-paper sticky`, and `bg-elevated` with `bg-background`. (Task 3 restyles the contents.)
  3. `Sidebar.tsx:134`: prepend `sidebar-rail grain-paper [--grain-paper:var(--rail-surface)] print:hidden …` (keep the rest). `Sidebar.tsx:171`: `sidebar-rail grain-paper drawer-tab absolute …`. The close tab inherits `--grain-paper` from the rail.
  4. `FloatingLessonsButton.tsx:33`: `sidebar-rail grain-paper [--grain-paper:var(--rail-surface)] drawer-tab fixed …`.
  5. `MobileLessonsSheet.tsx:104`: `absolute inset-0 flex flex-col bg-background grain-paper before:…` (was `bg-elevated`).
  6. `ProblemWorkspace.tsx:178`: drop `bg-background`. `:187`: drop `bg-elevated`. Extend the comment above the header with: `No paper of its own: the root and this band are transparent over the app's grain desk, so the app header, this band and the drawer read as one sheet (the IDE below stays solid).`
  7. `AppShell.tsx`: replace the `{landing ? ( … ) : ( … )}` block inside `<main>` with:

```tsx
                {/*
                  The app's desk: the page grain, inside the scroller so it
                  moves with the content, once per page (a second transparent
                  grain layer inside it would double the strength). The app
                  Header and the drawer sit outside <main> and paint their own
                  (.grain-paper). On / the landing header lives in here, above
                  the page and outside PageEnter so it does not replay the rise.
                */}
                <div
                  className={cn(
                    "paper-grain relative",
                    fillMain ? "flex min-h-0 flex-1 flex-col" : "min-h-full",
                    landing && "snap-start",
                  )}
                >
                  {landing ? (
                    <>
                      <div
                        ref={landingTop}
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-px"
                      />
                      <LandingHeader
                        onOpenSearch={() => setSearchOpen(true)}
                        scrolled={landingScrolled}
                      />
                    </>
                  ) : null}
                  <PageEnter fill={fillMain}>{children}</PageEnter>
                </div>
```

  The landing test regex `"paper-grain relative` matches the `cn(` string literal.

- [ ] **Step 4: Run.** `npx vitest run tests/paperGrain.test.ts tests/landingHeader.test.tsx tests/sidebarChrome.test.ts tests/design-tokens.test.ts tests/layoutContainment.test.ts && npx tsc --noEmit`. Expected: PASS.

- [ ] **Step 5: Browser check.**
  - With `web-dev` on 3002, curl the served CSS for `.grain-paper`. If it's stale: stop, `rm -rf web/.next/dev`, restart.
  - Pages: a lesson (drawer open and closed), `/courses/dsa/arrays`, `/courses/dsa/problems/valid-anagram`, `/`. Both themes, 1280px.
  - Grain on the header, rail, tabs, desk and problem sub-header. No doubled patch. The IDE and reading sheet stay solid.
  - `/` unchanged.

---

### Task 3: Header look, shared with the landing header

**Files:** Create `web/src/components/layout/headerChrome.ts` and `web/tests/appHeader.test.tsx`. Modify `Header.tsx`, `LandingHeader.tsx`.

**Interfaces:** Produces `LOGO_CHIP`, `WORDMARK`, `NAV_LINK`, `NAV_LINK_ACTIVE`, `ROUND_CONTROL` (all `string`).

- [ ] **Step 1: Failing test.** Create `web/tests/appHeader.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";

let pathname = "/courses/dsa/arrays";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("@/components/providers/ProgressProvider", () => ({
  useProgress: () => ({ visitedCount: 3, totalCount: 104 }),
}));

import { Header } from "@/components/layout/Header";
import { NAV_LINK_ACTIVE } from "@/components/layout/headerChrome";

const read = (...p: string[]) => readFileSync(join(__dirname, "..", "src", ...p), "utf8");
const header = read("components", "layout", "Header.tsx");

const nav = (path: string) => {
  pathname = path;
  const html = renderToStaticMarkup(<Header onOpenSearch={() => {}} showLessonsMenu showProgress />);
  return {
    lessons: html.match(/<a[^>]*href="\/courses\/dsa"[^>]*>/)![0],
    practice: html.match(/<a[^>]*href="\/courses\/dsa\/problems"[^>]*>/)![0],
  };
};

describe("app header", () => {
  it("shares its parts with the landing header", () => {
    for (const file of [header, read("components", "landing", "LandingHeader.tsx")]) {
      expect(file).toMatch(/from "@\/components\/layout\/headerChrome"/);
      for (const name of ["LOGO_CHIP", "WORDMARK", "NAV_LINK", "ROUND_CONTROL"]) expect(file).toContain(name);
    }
  });

  it("is a hairline on the grainy desk, not a lifted bar", () => {
    const cls = header.match(/<header[^>]*className="([^"]*)"/)![1];
    for (const c of ["grain-paper", "bg-background", "border-b", "h-14"]) expect(cls.split(/\s+/)).toContain(c);
    expect(cls).not.toMatch(/shadow-|bg-elevated/);
  });

  it("marks the active mode for assistive tech and with a steady underline", () => {
    const active = NAV_LINK_ACTIVE.split(" ");
    for (const [path, on, off] of [
      ["/courses/dsa/arrays", "lessons", "practice"],
      ["/courses/dsa/problems", "practice", "lessons"],
    ] as const) {
      const links = nav(path);
      expect(links[on], `${path} ${on}`).toContain('aria-current="page"');
      for (const c of active) expect(links[on]).toContain(c);
      expect(links[off]).not.toContain("aria-current");
      expect(links[off]).not.toContain("decoration-2");
    }
  });

  it("drops the filled pill", () => {
    expect(header).not.toMatch(/bg-pop font-semibold text-on-pop/);
  });
});
```

- [ ] **Step 2: Run.** `npx vitest run tests/appHeader.test.tsx`. Expected: FAIL (cannot resolve `headerChrome`). If the render fails on an unmocked import, mock only that module and note why.

- [ ] **Step 3: Implement.** Create `web/src/components/layout/headerChrome.ts`:

```ts
/**
 * The class sets the app header and the landing header share, so the two
 * cannot drift (spec: docs/superpowers/specs/2026-09-14-app-header-and-grain-design.md).
 * Focus is the global :focus-visible outline — it is unlayered, so a ring
 * utility here would sit under it unseen.
 */
export const LOGO_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] bg-pop font-mono text-sm font-bold text-on-pop";

export const WORDMARK = "truncate text-base font-semibold tracking-tight";

/** Full ink, no pill; a 1px underline on hover. */
export const NAV_LINK =
  "inline-flex min-h-11 items-center rounded-[length:var(--radius-xs)] text-base font-normal text-foreground decoration-border underline-offset-4 transition-colors hover:underline hover:decoration-foreground md:min-h-10";

/** The current mode: a steady 2px ink underline, so hover never reads as selection. */
export const NAV_LINK_ACTIVE = "underline decoration-foreground decoration-2";

export const ROUND_CONTROL =
  "inline-flex shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent/50 hover:text-foreground";
```

  `Header.tsx`:
  - Import `{ LOGO_CHIP, NAV_LINK, NAV_LINK_ACTIVE, ROUND_CONTROL, WORDMARK }`.
  - Replace `modeLinkClass` with `const modeLinkClass = (active: boolean) => cn(NAV_LINK, active && NAV_LINK_ACTIVE);`.
  - Add `aria-current={x ? "page" : undefined}` on the three nav links.
  - Nav wrapper: `flex shrink-0 items-center gap-5 justify-self-center sm:gap-8`.
  - Menu button: `cn(ROUND_CONTROL, "h-11 w-11 lg:hidden")`.
  - Chip `className={LOGO_CHIP}`; wordmark `cn(WORDMARK, showLessonsMenu && "max-sm:hidden")`.
  - Search: `cn(ROUND_CONTROL, "h-11 w-11 md:h-10 md:w-auto md:gap-2 md:px-3.5 md:text-sm")` with icon `h-4 w-4`, kbd `text-[11px]`.
  - Progress chip: `flex h-10 items-center gap-2 rounded-full border border-border px-3 text-[11px] text-muted`.
  - `<ThemeToggle className="h-11 w-11 rounded-full md:h-10 md:w-10" />`.

  `LandingHeader.tsx`:
  - Chip → `LOGO_CHIP`; wordmark `cn(WORDMARK, "max-sm:sr-only")`.
  - Nav links → `NAV_LINK`.
  - Search → `cn(ROUND_CONTROL, "h-11 w-11 md:h-10 md:w-auto md:gap-2 md:px-3.5 md:text-sm")`.

- [ ] **Step 4: Run.** `npx vitest run tests/appHeader.test.tsx tests/landingHeader.test.tsx tests/sidebarChrome.test.ts && npx tsc --noEmit && npm run lint`. Expected: PASS, lint 0 errors.

---

### Task 4: Doctrine

**Files:** Modify `CLAUDE.md` §4.

- [ ] **Step 1: Edits.**
  - **Drawer bullet:** `--rail-surface` token — `--elevated`, the app header's own paper → `--rail-surface` token — `--background` with the desk grain, the app header's own paper.
  - **Landing bullet:**
    - Its heading becomes "The landing page (`/`) has its own header and a scroll-typed story; no other route does."
    - Replace "in a `.paper-grain` wrapper around header and page" with "inside the app's one `.paper-grain` desk wrapper".
    - Replace "`Header.tsx` is untouched because the drawer geometry above reads it." with "The app `Header` shares its class sets with it through `layout/headerChrome.ts` and keeps its own `h-14`, which the drawer geometry above reads."
    - Replace "Exactly one `.paper-grain` may exist (a second doubles the strength)." with "See the grain bullet below."
  - **New bullet after the landing bullet:**

```markdown
- **The grain is the app's desk, on every route** (owner, 2026-09-14; spec
  `docs/superpowers/specs/2026-09-14-app-header-and-grain-design.md`). Two
  paints, one strength: `.paper-grain` (a `::before` at `--grain-opacity`) on
  the ONE transparent desk wrapper inside `<main>` — a second transparent
  layer inside it would double the strength — and `.grain-paper` (the paper
  at `1 − opacity` over the tile, measured within 1/255 of `.paper-grain`) on
  opaque surfaces: the app header (`bg-background`, a hairline, no shadow,
  like the landing header), the lessons drawer rail, both drawer tabs and
  their mask-cut fillets, and the mobile lessons sheet. `--grain-paper`
  names the surface's paper and `--grain-veil` is declared where it is used,
  never on `:root`. The problem page's root and sub-header are transparent
  over the desk. The reading sheet, cards, code, the IDE and dialogs stay
  solid and cover it. Every text ink clears AA at the worst grain pixel
  (`grainContrast.test.ts`); call sites are allowlisted in
  `paperGrain.test.ts`.
```

  - **Shadow lists (lines ~229 and ~246):** remove "the sticky header". In the second list, also remove "the sticky header," from the `.shadow-edge-bottom` examples, and add after the list: "The app header carries no shadow: it is a hairline on the desk."

- [ ] **Step 2: Verify.** `grep -n "sticky header" CLAUDE.md` finds nothing in the shadow lists.

---

### Task 5: Verification and handoff

- [ ] **Step 1: Gate.** From `web/`: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`. Record the results and any pre-existing failures (compare with the baseline taken before Task 1).
- [ ] **Step 2: Browser checks** (Playwright, both themes). Spec §6, items 1–8:
  - header widths 320/375/640/768/1024 with no overlap or overflow;
  - grain continuity;
  - drawer tab fillets at 8x, open and closed;
  - mobile sheet at 375;
  - the problem page;
  - `/` against a pre-change capture;
  - lesson scroll;
  - print emulation (`page.emulateMedia({ media: "print" })`: no grain on any of the three paints).

  Take a before capture of `/` **before Task 1**.
- [ ] **Step 3: Cleanup.** Move any `.playwright-mcp/` out of the repo.
- [ ] **Step 4: Report and settle commits with the owner.**
  - List the files changed and which of them carry the other session's uncommitted work.
  - Offer: commit this together with the landing work, or wait for the landing session to commit first and then commit this on top.
