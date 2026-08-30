# Problem workspace — correctness, hierarchy, and surface language

**Date:** 2026-08-27
**Scope:** `/problems/[slug]` and the shared chrome it uses (Header, Sidebar, Sandbox, coach).
**Status:** proposed. P0 items are verified defects; the rest is design work with acceptance criteria.

---

## 1. Why this exists

Three inputs converged this session: a measured UI/UX + accessibility audit, the
owner's own reaction that "everything looks flat — nothing grabs attention", and a
set of external recommendations. They do not all agree. This spec resolves them
into one ordered plan and records **why** each call was made, including the ones
where a recommendation was rejected.

Every number below was measured from `getComputedStyle` on the running app, not
estimated. Where a claim turned out to be wrong on inspection, that is recorded
too — the wrong claims are as load-bearing as the right ones, because they were
about to become work.

---

## 2. The core finding

The workspace has **no focal hierarchy**, and it is measurable:

| Measure | Value |
| --- | --- |
| Type scale across the whole page | 10px → 20.2px = **2.02×** |
| Text in the 10–13px band | **103 of 163 elements (63%)** |
| Text at weight 400 | **121 of 163 (74%)** |
| Largest element in the coach panel (before this session's fix) | the input **placeholder** |
| Largest element in the Lessons nav | 14px "Lessons", for **79 items** |
| Internal type range, results rail | **10.4–12px** |
| Icons in the results rail | **1** |

Three of four regions have an internal type range ≤ 4px. Nothing anchors the eye,
so it settles nowhere.

**Root cause — two senses of "flat" were conflated.** `CLAUDE.md` §4 mandates a
flat rendering of depth: "ink, rules, and halftone — never blur or drop
shadows." That is a constraint on *how depth is drawn*, not a ban on
*hierarchy*. It has been treated as the latter. Editorial print earns hierarchy
through scale, weight and rule precisely **because** it cannot use shadows. The
project is paying the rendering constraint's cost without taking its benefit.

**Design principle for all work below:** hierarchy is bought with **scale, weight,
rule weight, and selective accent** — never with shadow, blur, or a chromatic
fill. That is the print language `CLAUDE.md` already specifies, spent properly.

---

## 3. Verdict on the external recommendations

| # | Recommendation | Verdict | Basis |
| --- | --- | --- | --- |
| 1 | Reduce callout vibrancy; make backgrounds near-identical to the pane | **Modify** | Right symptom, wrong cure. See §5.1. |
| 2 | Move "Attempt it first" / Tip into its own tab | **Reject the move, accept the compaction** | See §5.2. |
| 3 | Add status icons to case pills; increase spacing | **Accept, reframed** | Icons already exist. See §4.2 and §5.3. |
| 4 | Inline code has a "full white background" — soften it | **Modify — premise is factually wrong** | See §5.4. |
| 5 | Unify component backgrounds into one cohesive gray | **Reject** | Contradicts a measured, documented system. See §6.1. |

### Where the recommendations were strongest
Rec 3 and the compaction half of Rec 2 are correct and actionable. Rec 1's
*observation* ("these feel like floating boxes tacked onto the description") is
the sharpest thing in the set — it correctly identifies that the callouts do not
belong to the page. Only the proposed fix was wrong.

### Where they were weakest
Rec 4 and Rec 5 both assert facts about rendered output that measurement
contradicts. Rec 5 in particular would have destroyed a working system.

---

## 4. P0 — correctness. Nothing below this matters until these ship.

These are verified defects, reproduced directly, not style opinions.

### 4.1 ~~The code editor is a keyboard trap~~ — RETRACTED; real gap is advisement

**Both the original audit and this author's own re-check reported this as a
Level A keyboard trap. Neither claim survives a proper re-test, and the false
positive has a specific, findable cause.**

CodeMirror 6 (`@codemirror/view` 6.43.6, installed) has a built-in mechanism for
exactly this WCAG concern, unconditional and independent of app config: a real
`Escape` keypress arms a 2-second "tab focus mode" window
(`InputState.keydown`), during which a `Tab` keypress causes `handleEvent` to
return **before** the keymap facet ever runs — the editor's own Tab-indent
binding never executes, and the browser's native focus-move proceeds
untouched. This lives at `node_modules/@codemirror/view/dist/index.js`, in the
`keydown(event)` method of the input-state class, gated on
`event.keyCode == 27` / `== 9`.

That gate is exactly what broke the test. Verified directly: a `KeyboardEvent`
dispatched by the browser-automation tooling used for both audits — whether
via its `key` action or a bare `new KeyboardEvent(...)` — carries
**`keyCode: 0`**, never the real value. Forcing the same event's `keyCode` to
27 then 9 via `Object.defineProperty` and redispatching produces
`tabDefaultPrevented: false`: CodeMirror releases Tab cleanly. Real, physical
keypresses in real browsers populate `keyCode` correctly even today (retained
for compatibility on trusted native events), so a real keyboard-only learner
pressing Escape then Tab already leaves the editor. Both audits mistook a
testing-tool limitation for a product defect.

**What is still true, and still a real WCAG 2.1.2 gap.** The Escape-then-Tab
method is not the unmodified Tab key, so 2.1.2 requires the user be **advised**
of it. Right now nothing does — no visible hint, no `aria-describedby`. A
learner who has never met this CodeMirror convention and only tries plain Tab
still gets stuck in practice, not because the trap is real but because the
exit is undocumented.

**Change.** No keymap changes — the existing `indentWithTab` behaviour is
correct and matches what the Python-heavy course needs. Add: (a)
`aria-describedby` on the editor's content DOM pointing at a screen-reader-only
node stating the method, and (b) a small, muted hint that appears only while
the editor has focus (`group-focus-within`, the pattern already used in
`VideoPlayer.tsx:99`), so it costs nothing when the editor isn't in use.

**Acceptance.** A screen reader announces the exit method on focusing the
editor. A sighted keyboard user who tabs into the editor sees the hint appear.
No behavioural change to indentation.

### 4.2 The first failing run erases its own results

`IdeWithCoach.tsx` — the `!railOpen` branch returns a different element **type**
than the `<PanelSplit>` branch, so toggling remounts the whole `Sandbox` subtree
and discards `useRunner` state. `CoachProvider` auto-opens the rail on first
failure, so **this fires for every learner on their first attempt.**

Reproduced from clean state, twice:

| Surface | Says |
| --- | --- |
| Results panel | **"5 tests waiting"** |
| Coach diagnosis | `returned [1, 1, 2]; expected [1, 2]` |
| Fail banner | `failed — Coach has a diagnosis` |

The product shows a diagnosis for a run its own results panel says never
happened. Drafts survive only because they mirror to `localStorage`; results do
not.

**This is upstream of two "design" complaints.** The results rail looks dead
partly because it often *is* dead — and the case pills' status icons
(`Sandbox.tsx:810-826`, real code) never render on the common path, because
`results` is null by the time they paint. Confirmed: after a run, with a
diagnosis card on screen, the pills still had no icon and no status ring.

**Change.** Keep the tree shape constant — always render `<PanelSplit>` and drive
the secondary pane to zero width when `railOpen` is false — or lift runner state
into a provider above `IdeWithCoach`. This also fixes the identical loss when
crossing the `lg` breakpoint.

**Acceptance.** Run, then toggle the rail both ways: the status line, per-case
rings and Insight binding are unchanged. A test asserts results survive a
`railOpen` transition.

### 4.3 Focus is stolen from the editor into the coach composer

`CoachRail.tsx` focuses the composer on mount/`active`; combined with 4.2's
remount and the auto-open, a learner's caret jumps out of their solution
mid-typing and subsequent keystrokes go into the chat.

**Change.** Auto-focus only when the learner explicitly opened the coach
(`toggleCoach` / `openCoach`), never on the automatic first-failure open. Pass an
`autoFocus` prop rather than focusing unconditionally.

---

## 5. P1 — the systemic contrast gap

Five separate failures share one cause: **contrast is verified against one
representative surface instead of the worst case per theme.**

`uiAccent()` is documented as clearing 3:1 "against BOTH the light paper and the
dark paper", but only tests `#121214` (`--background`). In dark mode `--elevated`
is the **lightest** surface in the ladder, so it — not the paper — is the true
worst case, and it is never checked. In dark mode the reasoning inverts: light
ink on dark ground makes the *lightest* surface binding.

Measured consequences:

| Item | Measured | Needs |
| --- | --- | --- |
| Focus ring, `linear-traversal` family, on `--elevated` | **2.87:1** | 3.0 |
| Focus ring, `recursive-exploration` | **2.73:1** | 3.0 |
| `--bad` text on `--elevated` (rail verdict) | **4.01:1** | 4.5 |
| Tests count badge (`bg-on-pop/15`), both themes | **3.97:1** | 4.5 |
| Sidebar `text-muted/70` / `/60` | **2.63–3.90** | 4.5 |
| Editor gutter, light theme | **2.21:1** | 4.5 |

`linear-traversal` covers Arrays, Strings, Linked Lists, Stacks, Queues and
Matrix — most of the course.

**Change.** Add `--elevated` (both themes) to `uiAccent()`'s floor set, lighten
dark `--bad` to ≈`#f26060` (4.53:1 on `#26262a`), drop the `/70` and `/60` alpha
modifiers in favour of a real `--muted-2` token with a recorded ratio, and darken
the light gutter ink.

**Then close the class, not the instances.** Add a test walking
`{accent, muted, good, bad, info, warn} × {background, elevated, code, surface} ×
{light, dark} × 7 families`. That test *is* the "measured, not eyeballed"
guarantee `CLAUDE.md` §4 asks for, and it would have caught all six rows above.

**Acceptance.** The matrix test passes; every family's `accentUi` clears 3:1 on
all four surfaces in both themes.

---

## 6. P2 — hierarchy and surface language

### 6.1 Do NOT unify the surfaces (Rec 5, rejected)

The claim is that components are "all slightly different blacks/grays" and feel
fragmented. The ladder was measured and is **monotonic in both themes**, matching
the ratios `CLAUDE.md` itself records:

```
dark:  elevated 0.0197 > code 0.0099 > background 0.0061 > surface 0.0037
       elevated/background 1.240 · elevated/code 1.163 · code/background 1.067 · background/surface 1.045
light: #fff > #f1f4f9 > #e4e9f2 > #d8dde8   (no inversion)
```

Collapsing these would delete a designed, documented system and break the
"perceptible brightness ladder in BOTH themes" requirement.

**But there is a real kernel.** Steps of **1.045** and **1.067** are below the
threshold at which a difference reads as *intentional*. They look like accidental
variation, which is exactly what the recommendation was reacting to.

**Change.** Widen the two smallest steps so every rung is unambiguous; keep four
rungs and keep the order. Record the new ratios beside the tokens.

### 6.2 Callouts: change the carrier, not the volume (Rec 1, modified)

Goal / Constraints / Tip are the only chromatic elements in the reading column —
`--press-info-surface` `#cffafe`, `--press-good-surface` `#dcfce7`,
`--press-warn-surface` `#fef3c7`. **These are proper tokens** with contrast ratios
recorded in `globals.css:72-74`, not hardcoded Tailwind values; an earlier
suspicion that they violated §4 was checked against source and is withdrawn.

Measured, they sit at **1.10–1.12:1** against the white pane — nearly invisible in
*luminance* but loud in *hue*. On a base that `CLAUDE.md` defines as "Blueprint,
monochrome base — accent/pop/mark all steel", three saturated pastel fills are
the discordant note. That is why they read as tacked on.

**Change.** Move the signal from a chromatic **fill** to a **rule + label**: a
2px status rule, a small muted uppercase label naming the callout, prose in ink,
no fill. This is the treatment already applied to `DiagnosisCard` this session,
where it worked. Status stays stated in words, so nothing rides on colour.

**Rejected:** making the callout background near-identical to the pane. That
removes the last distinction and worsens the flatness this spec exists to fix.

**Acceptance.** Callouts are distinguishable without a chromatic fill; the
reading column carries no saturated pastel; label + prose clear AA on the pane.

### 6.3 "Attempt it first" stays in the flow (Rec 2, split)

**Rejected: moving it to a tab.** This section is a *pedagogical interrupt* — its
copy is literally "Genuinely try before opening anything", positioned before the
Solution tab. Burying it behind a tab defeats the one message designed to stop a
learner from skipping ahead. `CLAUDE.md`: "The content is the product."

**Accepted: compaction.** Drop the large icon, tighten the box to the rule+label
treatment from §6.2, and set the heading as a peer of "Problem" rather than a
competing block.

### 6.4 Type scale

Widen from **2.02× toward ~3.5×**. At these sizes a 1.25 step is invisible; steps
must be ≥1.4 to register. Region identities (Problem, Coach, nav group labels)
carry real size and weight; body copy stays put.

**Already landed this session** (reference implementation for the vocabulary):
the coach masthead — solid `bg-pop`/`text-on-pop` mark at 32px, name at
20.8px/700, one-line descriptor. Largest element in the panel moved from the
input placeholder to the panel's own name. The mark repeats at 24px beside each
reply and 48px in the empty state, so replies are visibly *from* the named thing.
Icon-on-fill measures 5.24:1, sidestepping the broken accent-on-elevated path in
§5.

Remaining:
- **Lessons nav** — group labels are weight 700 at **10px**, so they anchor
  nothing. Raise them. Give each module a family-accent marker; `familyTheme.ts`
  already holds the colours, so this is wayfinding for free across 24 modules.
- **Content tabs** — icons on Description / Explanation / Solution / Quiz.
- **Results rail** — an icon per tab, and let the pass/fail count read as the
  most information-dense glyph in the rail, because it is.

### 6.5 Inline code (Rec 4, premise corrected)

The recommendation says inline code has a "full white background". It does not.
Measured: a **7% alpha wash**, effective `rgb(237,237,237)`, **1.17:1** against
the pane — very subtle.

The real problem is **three simultaneous signals for one token**: a font change,
a tint, *and* a size drop to **11.16px**. That last is downstream of the prose
bug below.

**Change.** Drop the tint; keep the mono face and a small colour shift. One
signal, not three.

### 6.6 Reading size — the bug under §6.5

`globals.css:469` hardcodes `font-size: 0.875rem` for `.problem-prose
.handbook-prose`, overriding `--prose-size`, whose own comment at
`globals.css:245-250` states reading type is deliberately held near desktop size
so "the space comes out of chrome, not out of the two things the learner
actually reads."

| Viewport | Intended | Actual |
| --- | --- | --- |
| 1440×900 | 18px | **13.13px** |
| 1366×768 | 16.5px | **11.38px** |
| 375×812 | 16.5px | **11.38px** |

11.38px body copy at the most common laptop resolution, in a 288px column.

**Change.** `font-size: calc(var(--prose-size) * 0.86)` or a dedicated
`--prose-size-compact`, so the column stays proportional to the documented
reading size instead of tracking chrome.

### 6.7 Example blocks collapse at desktop width

`ExamplesBlock.tsx:69` switches to two columns at `sm:` — a **viewport** query —
but the pane is only ~244px because of the 30% split. Measured at 1366×768: the
Input cell computes to **6px wide** and renders `nums = [0,0,1,1,1,2,2,3,3,4]`
across **29 line boxes**.

**Change.** Make the switch container-driven (`@container (min-width: 26rem)`
with `container-type: inline-size`), or cap the Output column with
`minmax(0, max-content)` and let both wrap.

---

## 7. P3 — remaining accessibility

- **Live regions** (WCAG 4.1.3): the page has two `aria-live` regions, both
  empty. The run verdict, the fail banner, per-case results and the coach thread
  are all silent to a screen reader. Add a persistent `role="status"` for the
  verdict and a persistent `aria-live="polite"` wrapper for the thread — the
  current one is created at the moment it should announce, which is unreliable,
  and unmounts before the answer renders.
- **Skip link** (2.4.1): the first workspace control is **tab stop #60**; stops
  10–59 are the sidebar. Add a visually-hidden, focus-visible "Skip to problem".
- **Splitters** (2.1.1, 4.1.2, 2.5.8): focusable but keyboard-inoperable —
  Arrow/Home/End/Enter/Space all leave the pane at 30%. No `role="separator"`, no
  `aria-valuenow`. Hit target measures **3.8px**. Add the role, the values, arrow
  keys, and a ≥24px transparent hit area over the 4px rule.
- **Case tabs** (Rec 3): reuse the correct pattern already in
  `ProblemWorkspace.tsx:422-511` — roving tabindex, `id`/`aria-controls`/
  `aria-labelledby`, Arrow/Home/End with focus following selection. The Sandbox
  copy has none of it and gives all five pills `tabIndex: 0`.
  Then, visually: **the status icons already exist** (`Sandbox.tsx:810-826`) at
  **10px** with a **40%-alpha** ring — raise both, and widen the inter-pill gap
  from the measured **5.6px**. Fixing §4.2 is what makes them appear at all.

---

## 8. Carried over from the design exploration

Two ideas from the from-scratch design study are worth adopting; the rest of both
directions is not.

- **Reading-scale problem statement.** Setting the statement at a real reading
  size, with leading, made it comprehensible rather than skimmable. Reinforces
  §6.6.
- **The worked example drawn as indexed cells**, including a dashed slot past
  `k`. It teaches the "what's past them doesn't matter" rule visually, which the
  prose currently spends two sentences on. Subject-derived, so it survives the
  house style.

Not adopted: both explorations kept four competing panes or hid one under
another. Neither solved the real constraint — that problem, code, results and
coach genuinely compete for one screen. Worth a separate exploration: does the
problem collapse to a summary once typing starts, or can the coach and results
share one surface, given they are rarely needed in the same moment?

---

## 9. Order of work

1. **§4.2** run-result loss — hits 100% of learners on first attempt, and gates
   §7's case-pill work. The most severe confirmed defect in this spec.
2. **§4.3** focus steal — same fix area as §4.2
3. **§4.1** editor exit advisement — small, real 2.1.2 gap; no longer a trap
4. **§5** `uiAccent()` floor set + the contrast matrix test — one change closes
   five findings across every page
5. **§7** live regions, skip link, splitter keys — all Level A
6. **§6.6 + §6.7** reading size and example collapse — the default desktop
   reading experience
7. **§6.2, §6.3, §6.4** callout carrier, Attempt-it-first, hierarchy rollout
8. **§6.1, §6.5** ladder steps, inline code

---

## 10. Verification

Per `CLAUDE.md` §2, nothing here is done until it is run:

- Every contrast claim is a computed ratio, recorded beside its token.
- The §5 matrix test must be seen to fail before it passes — introduce a
  deliberate bad family value, watch it fail, restore.
- A11y changes are verified by real key events and by asserting
  `document.activeElement`, not by reading markup.
- §4.2 gets a test asserting results survive a `railOpen` transition.
- Both themes and 1440 / 768 / 375 checked in the browser before any item is
  called complete.
- `tsc`, `eslint`, `npm test` and `npm run build` all green.
