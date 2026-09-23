# Sign-in page: from an empty card to a page that explains the sign-in

Owner request 2026-09-19: "enhance sign in page, it is very empty. make it rich."
Layout and content chosen by the owner the same day: the immersive layout (the
landing's animated data structure beside the card) with a pitch, three benefits
and a privacy strip. Builds on `2026-09-18-accounts-and-progress-sync-design.md`
§5.1 and §8; nothing in the sync design changes.

## 1. Problem

`/sign-in` is a 28rem card (heading, one sentence, two buttons, one data line)
on an empty desk. A learner who lands there from the header does not learn what
signing in gives them, and the page looks unfinished next to the landing page.

## 2. Design

### 2.1 Layout

- From `lg`: two columns in a centred `max-w-5xl` column with the landing's
  `px-6 md:px-16` gutters. Left: the structure, the `h1`, the sub-line and the
  three benefit rows. Right: the sign-in card, vertically centred against the left
  column. Below `lg`: `h1` and sub-line, the card, then the structure and the
  benefits, so the buttons stay above the fold on a phone (a CSS `order`, one DOM
  order for screen readers: headline, card, structure, benefits).
- Auth unavailable (`isAuthConfigured()` false): unchanged small card. Making a
  page that cannot sign anyone in richer would mislead.

### 2.2 Copy (each claim maps to a shipped feature)

- `h1`: "Pick up where you left off, on any device."
- Sub-line: "The course works signed out too. Sign in only to sync." (true: signed out
  the app is the localStorage app, spec §3.)
- Benefits, each a title and one sentence:
  1. **Your place is saved.** "Lessons you have visited and problems you have
     solved follow your account." (Only visited, solved and problem-sandbox drafts
     sync: spec §5.)
  2. **Your code follows you.** "Your sandbox code syncs per problem. If two
     devices disagree, both versions are kept and you choose." (Drafts carry a
     server `rev`; a conflict stashes, never overwrites: spec §6.3.)
  3. **Yours to take or delete.** "Export your data as a file, or delete the
     account and everything in it." (`/api/account/export`, `DELETE /api/account`.)
- Card: `h2` "Sign in", `SignInButtons` unchanged, and the existing sentence "We
  store your name, email, avatar, lesson progress and sandbox code." unchanged.
  It does not say "nothing else": session rows may hold more than that sentence
  names, and no privacy page exists yet (spec §11).
- No invented social proof, no counts, no comparison with other products
  (CLAUDE.md §4, landing rules).

### 2.3 The animation

`EvolvingStructure` is reused as is (a controlled `{stage, className}` SVG).
`SignInStory` steps `stage` 0, 1, 2, 3 once on arrival, `STAGE_MS = 1100` apart
(the landing hero's cadence, longer than the 0.9 s morph), and rests on the graph.
Not a loop: on a page where the learner is choosing a provider, motion that never
stops competes with the buttons. `prefers-reduced-motion` shows the graph
with no timers, set in the first client effect: server render and first client
render both show the array, so the jump is not a hydration mismatch. The SVG keeps its own per-stage `aria-label`
(`describeStage`) and there is no visible caption under it, so the accessible name
is not read twice.

### 2.4 Structure of the code

- `app/sign-in/page.tsx` stays a static server component. It composes
  `SignInStory` (left), the card (right) and the unavailable variant.
- `app/sign-in/SignInStory.tsx`: client component; owns only the stage timer and
  renders the structure and the benefit list. **It never imports the auth client**:
  `SignInButtons` remains the only client module on the route that does.
- `lib/auth/signInCopy.ts`: the headline, sub-line and benefit strings as data, so
  tests assert them and the page renders from one source.
- Icons: existing `@phosphor-icons/react`, monochrome, `aria-hidden`.

### 2.5 Design-system rules honoured

Colour only through tokens; Space Mono for `h1`/`h2`/benefit titles (regular or
`font-bold`, never `font-semibold`), Space Grotesk for body; the lamp stays the
logo's alone; the card is `--elevated` with `.shadow-elevation`; the page sits on
the app's one grain desk (no second grain layer). The `h1` is `text-3xl lg:text-4xl`
so its longest line fits the left column (measured, not assumed: see tests).

## 3. Performance

The page stays static (`○` in the `next build` route table). `motion/react` is
already in the shared chunk (course nav); the addition is `EvolvingStructure`,
`structureLayouts` and a few hundred bytes of copy, on this route only. Landing
components that pull server-only data are not imported.

## 4. Testing

`tests/signIn.test.tsx` keeps every existing `safeNext`, button, alert, focus and
busy test. New: exactly one `h1` and it is the headline; the three benefits render
from `signInCopy`; the `h2` is "Sign in"; the stage advances 0→3 with fake timers
and rests on the graph; reduced motion is on the graph at first render with no
timer scheduled; the unavailable state is byte-for-byte the current card;
`authChunkBoundary.test.ts` gains an assertion that `SignInStory`'s import closure
does not contain `lib/auth/client`. Then `tsc`, `eslint`, the full suite and
`npm run build` (route still `○`), and a browser pass in light and dark, at 375 px
and 1280 px, with auth on and off, and with `?error=oauth`.

## 5. Out of scope

A live "two devices" demo (offered, not chosen); any change to the sync design,
the buttons' behaviour, `safeNext` or the API; a privacy page (spec §11).

## 6. Revision 2026-09-24: follow the redesigned landing

The branch sat unmerged while the landing was redesigned twice, and
`EvolvingStructure` (§2.3) was deleted with its backdrop in `7b67b69`, so the
page no longer compiled. Owner decisions the same day:

- **Art:** the landing's 3D `HeroFloor` replaces the evolving structure, above
  the benefits. It is markup and CSS, so `SignInStory` is now a server component
  with no stage timer (§2.3's timer and its tests are gone). The scene is drawn
  for a ~1200px hero; in a 15rem band it cropped to a few oversized blocks, so it
  is laid out at 160% and scaled by 1/1.6 from its top centre, and the band fades
  its bottom edge as the landing fades the floor's top.
- **Landing idiom:** a kicker ("Optional account") above the `h1`; the `h1` is a
  `MarkedHeading` (`as="h1"`) with "any device" underlined by hand; the benefit
  icons sit in the landing's `landing-icon` tiles; the page content takes the
  landing hero's family colour (`linear-traversal`) for the mark and tiles only.
- **Buttons:** the provider buttons are outlined pills (`rounded-full`), still
  unfilled so neither provider reads as preferred.
- **Chrome:** no lessons drawer, floating opener, lessons menu or progress bar on
  `/sign-in` (`isSignInPath` in `AppShell`): it is not a course page, and the
  drawer, open by default since 2026-09-23, took 320px beside the card.
- §2.5's "grain desk" is history: the desk is flat paper since 2026-09-21.
