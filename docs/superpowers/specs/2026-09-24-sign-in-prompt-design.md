# Sign-in prompt for signed-out visitors

Owner request 2026-09-24: "when user is not signed in, he could still see the course and read
through, instead they should be prompted to signin or signin later, update the links in landing
page aswell. if the user is not signed in we need to ask everytime he opens the app and choose to
signin or not." Decisions the same day (asked, answered): a dialog over the page, once per visit,
landing links through `/sign-in`.

## 1. Behaviour

- On every route except `/` (the landing) and `/sign-in`, a visitor the session check reports as
  **signed out** sees a modal dialog: the sign-in page's kicker, headline and sub-line, the same
  Google and GitHub buttons, and **Continue without signing in**.
- Choosing "Continue without signing in", Esc, or the backdrop defers the prompt **for this visit**:
  a `sessionStorage` flag, so navigating between lessons does not ask again, and a new tab or
  window (a new visit) asks again. Signing in returns to the page it was opened on (`next` = the
  current path).
- Signed-in visitors never see it, not even for a frame: it opens only once the session is known
  and empty. It never shows when sign-in is not configured (`authEnabled` false).
- Accounts stay optional (CLAUDE.md §5 "progress is local-first"): the course is fully usable
  after "Continue without signing in".

## 2. Why a dialog, not a redirect

Course pages are static and indexed (`seo/`). A redirect would make every page wait on a session
check and hide lessons from signed-out crawlers. The dialog is client-only, over a page that is
already rendered.

## 3. Landing links

When sign-in is configured (read at build time in the server `HomePage`), the hero's "Start
learning free" and "Explore the curriculum" and the outro's first-lesson link point at
`/sign-in?next=<target>`. `/sign-in` gains **Continue without signing in** to `next`; a signed-in
visitor is already forwarded to `next` by the existing `SignedIn` branch. Without sign-in the links
stay direct: `/sign-in` would only show "isn't available".

## 4. Code

- `lib/auth/signInPrompt.ts` (hook-free): the session-storage key, `promptDeferred()`,
  `deferPrompt()` (both tolerate storage that throws) and `viaSignIn(href)`.
- `components/auth/SignInPromptGate.tsx`: a plain client component in `AppShell`. It reads the flag
  and renders the prompt chunk through `authChunk` only when auth is on, the route allows it and the
  visit has not deferred. It never imports the auth client.
- `components/auth/SignInPrompt.tsx`: the chunk. `authClient.useSession()`, the shared `Dialog`, and
  `Providers` exported from `SignInButtons` (one set of buttons, busy states and errors).
- Tests: the flag and link helper; the gate (route, auth off, deferred); the prompt (opens only
  when signed out, defers on "Continue without", not while pending or signed in); `SignInButtons`
  "Continue without"; `HomePage` links with auth on and off; `authChunkBoundary` (the gate and
  the layout never import the client; the chunk is an allowed importer).
