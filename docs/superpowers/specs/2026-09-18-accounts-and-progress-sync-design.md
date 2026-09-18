# Accounts, sessions and progress sync — design

**Date:** 2026-09-18
**Status:** approved by the owner 2026-09-18, section by section in
brainstorming (stack: Better Auth + Postgres; GitHub + Google sign-in;
anonymous-first; sync visited, solved and sandbox drafts; local-first sync;
sign-out clears the device).
**Scope:** parts 1 (identity and sessions) and 2 (progress sync) of a four-part
plan. Part 3 (authorization and entitlements: free vs locked modules, gating on
the server, coach quota per account) and part 4 (billing) are **out of scope**
and get their own specs. Nothing here gates content.

---

## 1. Why

Everything a learner builds up lives in one browser's `localStorage`:
lessons visited and problems solved (`components/providers/progressStorage.ts`),
sandbox drafts (`dsa:sandbox:<id>:<lang>`, `Sandbox.tsx`), quiz answers,
scratchpads, coach threads. Switching laptops, clearing site data or using a
phone loses all of it. The only server-side identity is the coach's anonymous
visitor cookie (`lib/coach/visitor.ts`), which exists for a daily quota.

This spec adds accounts so that progress and code follow the learner, without
changing anything for learners who never sign in.

## 2. Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Auth stack | Better Auth inside the Next.js app; Postgres (Neon via the Vercel marketplace) through Drizzle | We own users and data, pay no per-user fee as the course grows, and build sign-in UI in our own design system |
| Sign-in methods | GitHub and Google OAuth | One click for the audience; no passwords to store and no email provider to run |
| Anonymous use | Anonymous-first: everything works signed out exactly as today | Keeps the free first lesson and SEO; signing in is an upgrade, not a wall |
| Synced data | Visited, solved, sandbox drafts | The data whose loss hurts most. Quiz answers, scratchpads, coach threads and the code-language preference stay per-device (§12) |
| Sync architecture | Local-first: `localStorage` stays the store the UI reads; a sync layer pulls, merges and pushes | Instant UI, signed-out mode unchanged, no network wait per keystroke |
| Sign-out | Clears this device's synced data | On a shared computer the next person must not see the last learner's code |

Rejected: Supabase (auth and data with one vendor, SSR cookie model), Clerk
(per-user pricing, prebuilt UI to re-theme), email magic link and password
(need an email provider; password adds reset and breach handling), server as
source of truth while signed in (a network wait on every write and two code
paths through every component), a sync engine such as Replicache (heavy for
three kinds of data).

## 3. Architecture

| Unit | Runs | Job |
| --- | --- | --- |
| `lib/auth/server.ts` | server only | The Better Auth instance: GitHub and Google providers, Drizzle adapter, session settings (§5) |
| `app/api/auth/[...all]/route.ts` | route | Better Auth's handler: OAuth start and callback, session, sign-out |
| `lib/auth/client.ts` | client | `useSession`, `signIn.social`, `signOut` |
| `lib/auth/configured.ts` | server, hook-free | `isAuthConfigured()`, mirroring `isCoachConfigured()` (§5.6) |
| `lib/db/schema.ts`, `lib/db/client.ts` | server only | Drizzle schema and Neon client; migrations in `web/drizzle/` |
| `app/api/progress/route.ts` | route | `GET` marks for a course, `POST` a batch of marks |
| `app/api/progress/drafts/[sandboxId]/route.ts` | route | `GET` both drafts for a sandbox, `PUT` one draft |
| `app/api/account/route.ts` | route | `DELETE` the account |
| `app/api/account/export/route.ts` | route | `GET` the learner's data as JSON |
| `lib/progress/merge.ts` | shared, pure | Set union, draft resolution (§6.3), owner cases (§7), tombstones. No I/O |
| `lib/progress/syncQueue.ts` | client | The persisted queue of pending writes, debounce, backoff, flush |
| `components/providers/SyncProvider.tsx` | client | Signed-in only: pull, run the queue, hold stashes, merge dialog |
| `components/auth/AccountControl.tsx` | client | Header control: Sign in link, avatar, account menu |
| `app/sign-in/page.tsx` | static page | The two sign-in buttons |

`ProgressProvider` and `Sandbox` keep writing `localStorage` exactly as now and
report each change through one `onLocalChange` callback that `SyncProvider`
supplies. Signed out, nobody listens and behaviour is unchanged.

Modules the root layout imports stay hook-free (the §4 code-language rule:
reaching `useSyncExternalStore` from the layout 500'd every route, and neither
`tsc` nor vitest can see that boundary). `lib/db` and `lib/auth/server.ts`
import `server-only`.

## 4. Data model

Better Auth owns `user`, `session`, `account` and `verification`. Added:

```
progress_mark
  user_id      text  → user.id ON DELETE CASCADE
  course_slug  text
  kind         text  CHECK (kind IN ('visited', 'solved'))
  item_id      text
  first_at     timestamptz DEFAULT now()
  PRIMARY KEY (user_id, course_slug, kind, item_id)

sandbox_draft
  user_id      text  → user.id ON DELETE CASCADE
  sandbox_id   text
  lang         text  CHECK (lang IN ('python', 'javascript'))
  code         text  CHECK (octet_length(code) <= 65536)
  updated_at   timestamptz   -- client clock: decides which edit is newer
  rev          integer       -- server counter: detects conflicts
  deleted      boolean DEFAULT false   -- tombstone for "reset"
  PRIMARY KEY (user_id, sandbox_id, lang)
```

- `progress_mark` is **insert-only** (`ON CONFLICT DO NOTHING`). Nothing in the
  app un-marks a lesson, so visited and solved are grow-only sets and merging
  is set union. That makes the merge a property of the database, not a
  convention.
- **Two clocks, two jobs.** `updated_at` (client) orders edits; `rev` (server)
  detects that someone else wrote. Client clocks drift, so they never detect
  conflicts; the server counter cannot say which edit the learner made last.
- **Tombstones.** The sandbox's reset deletes the local draft. Syncing that as
  a row with `deleted = true` stops another device's pull from bringing the
  code back.
- Every learner table cascades from `user`, so account deletion is one
  `DELETE`.

## 5. Authentication and sessions

### 5.1 Sign-in

`/sign-in` is a static page with "Continue with GitHub" and "Continue with
Google". Better Auth runs the OAuth round trip and returns to `next`. `next` is
accepted only as a same-origin relative path: it must start with a single `/`
and must not start with `//` or `/\`. Anything else falls back to
`/courses/dsa`, so the page cannot become an open redirect.

An OAuth error (including a cancelled consent) returns as `?error=`, shown as
one line in `--bad-ink` with the buttons still available.

### 5.2 Account linking

The same **verified** email arriving from GitHub and Google links to one user.
GitHub often hides the address, so the GitHub provider requests `user:email`
and uses the primary verified address. An unverified address never links:
otherwise anyone could claim an account by setting a matching address on the
other provider.

### 5.3 Sessions

Better Auth database sessions:

- Cookie: `httpOnly`, `Secure`, `SameSite=Lax`, `__Secure-` prefix in
  production.
- A session lives 30 days and slides: it is refreshed at most once a day
  while in use.
- A signed cookie cache (5 minutes) avoids a database read on every session
  check.
- Revocation deletes the row. **Sign out everywhere** deletes all the user's
  sessions.

**Pages stay static.** No page reads the session on the server. The header
control is a client component using `useSession`; until the session resolves
it renders a fixed-size placeholder the size of the avatar, so the header does
not shift. The session is read on the server only in `/api/*` routes.

### 5.4 Sign-out

1. Flush the pending-write queue, capped at 3 s.
2. End the session.
3. Clear this device's synced keys: `course-progress:*`, `course-solved:*`,
   every `dsa:sandbox:<id>:<lang>` draft and its `:at` timestamp, the stashes,
   `sync:owner` and `sync:v1:<userId>`. Preferences (panel layout, results
   tab, code language, coach column) are kept. The legacy flat keys
   `dsa-course-progress` and `dsa-course-solved` are cleared too:
   `migrateLegacyProgress` copies them into an absent namespaced key, so
   leaving them would restore the last learner's older progress on the next
   load.
4. Post `signed-out` on a `BroadcastChannel("leetexpert-auth")` so other open
   tabs clear their in-memory state and re-render.

If the 3 s cap ran out with writes still queued, the menu says so before
closing: "Some recent changes hadn't synced and were not saved." The learner is
signed out regardless: sign-out must work on a dead network.

### 5.5 Account menu

Name and email; sync status (*Synced* · *Syncing…* · *Offline, will retry* ·
*Signed out, sign in to keep syncing*); Sign out; Sign out everywhere; Download
my data (JSON of marks and drafts, `GET /api/account/export`); Delete account
(confirm dialog naming what is erased, confirmed by typing `delete`; then
`DELETE /api/account`, then the §5.4 local clear).

### 5.6 When auth is not configured

If any of `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`,
`GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` is
missing, `isAuthConfigured()` is false. The sign-in control does not render,
`/sign-in` says sign-in is not available here, the API routes answer 503, and
the app runs exactly as today. This covers local development without secrets
and Vercel preview deployments, whose per-deploy URLs cannot be registered as
OAuth callbacks. Previews stay anonymous by design.

### 5.7 Unchanged

The coach's visitor cookie and daily quota are untouched. Moving the quota to
accounts belongs to part 3.

## 6. Sync protocol

`SyncProvider` keeps a per-user record in `localStorage` under
`sync:v1:<userId>`: the queue of pending writes and, per draft, the last `rev`
this device saw (`baseRev`). Keying by user id means one account's queue can
never be sent under another account's session.

### 6.1 Marks

- **Pull:** on load, `GET /api/progress?course=<slug>` returns
  `{ visited: string[], solved: string[] }`. The result is unioned into
  `localStorage` and `ProgressProvider` re-renders. Marks are a few kilobytes
  even for a finished course, so they are pulled in full.
- **Push:** each new mark is queued. The queue flushes after 2 s idle, and on
  `visibilitychange → hidden` with `fetch(…, { keepalive: true })`, so closing
  the tab does not drop the last lesson. Batches hold at most 500 marks. The
  server inserts with `ON CONFLICT DO NOTHING`, so a retried batch is harmless.

### 6.2 Drafts

- **Pull, lazily:** 116 problems × 2 languages × up to 64 KB is too much to
  fetch per page load. When a `Sandbox` mounts signed in, it fetches only its
  own two drafts: `GET /api/progress/drafts/:sandboxId` returns
  `{ python?: Draft, javascript?: Draft }` with
  `Draft = { code, updatedAt, rev, deleted }`.
- **Push:** 1.5 s after the last keystroke, and on hide, the sandbox sends
  `PUT /api/progress/drafts/:sandboxId` with
  `{ lang, code, updatedAt, baseRev, deleted }`. The server runs
  `UPDATE … SET …, rev = rev + 1 WHERE … AND rev = $baseRev` (or inserts when
  `baseRev` is 0 and no row exists) and returns the new `rev`. If the row's
  `rev` differs, it answers **409** with its own copy.
- Every local draft save also writes `dsa:sandbox:<id>:<lang>:at`, the ISO
  time of the edit, which becomes `updatedAt`.

### 6.3 Conflicts

| When | Local changed since `baseRev`? | Server changed since `baseRev`? | Result |
| --- | --- | --- | --- |
| Sandbox mounts | no | yes | Take the server copy |
| Sandbox mounts | yes | yes | The newer `updatedAt` goes in the editor; the other is stashed |
| While editing (409) | yes | yes | The editor keeps what is on screen; the server copy is stashed; local is pushed with `baseRev` = the server's `rev` |
| Any | code identical | code identical | Adopt the server's `rev`; no stash |

A stash is one per sandbox and language, stored on this device
(`sync:v1:<userId>` record). It shows as one row above the editor: "A
different version of this draft was saved on another device. **Compare** ·
**Use that version** · **Dismiss**." Compare opens a read-only side-by-side of
the two versions. **Use that version** swaps it into the editor and stashes
what was there, so even that choice is reversible until Dismiss.

Invariant: **code is never replaced under the cursor, and never dropped
without the learner choosing to.**

### 6.4 Failure handling

- **Offline or 5xx:** the queue persists; retries back off exponentially from
  2 s to a 60 s cap; an `online` event retries at once. The menu shows
  *Offline, will retry*.
- **401 (expired or revoked session):** syncing stops and the queue is kept.
  The menu shows *Signed out, sign in to keep syncing*. The same user signing
  back in resumes the queue; a different user's sign-in discards it unsent
  (§7).
- **409:** handled by §6.3.
- **400:** the change is dropped from the queue and reported to the console;
  it can only come from a bug, and retrying it forever would block the queue.

A `--warn` dot appears on the avatar only for a persistent failure: a 401, or
writes pending while offline for more than 5 minutes. Sync that works is not
shown outside the menu.

### 6.5 Server validation

Every body is parsed with zod. `course_slug` and `item_id` must exist in the
course manifest; `sandbox_id` must exist in the sandbox registry (the §5 rule:
a typo'd id fails loudly, here at the API); `lang` is `python` or
`javascript`; code is at most 64 KB; a batch is at most 500 marks. The user id
**always** comes from the session, never from the request, so no request can
read or write another learner's rows. Writes are rate-limited per user
(120 a minute) through the Upstash Redis the coach already uses, with the same
in-memory fallback as `MemoryQuota` when Redis is not configured. Mutating
routes run the same-origin check from `lib/coach/origin.ts`.

### 6.6 Known limit: "solved" is self-reported

The client reports that a problem passed; the server cannot re-run the tests.
That is acceptable while a solve only drives a sidebar tick. Part 3 must
revisit it before a solve unlocks anything paid.

## 7. First sign-in and account switches

Because sign-out clears the device, whatever synced data sits in
`localStorage` at sign-in is either anonymous or belongs to the account named
in `sync:owner`. `sync:owner` is written when a device's data becomes an
account's and removed on sign-out.

| `sync:owner` at sign-in | Meaning | Action |
| --- | --- | --- |
| absent | Anonymous progress on this device | Merge flow (below) |
| this user | Same learner after an expired session | Resume: flush the kept queue, pull |
| another user | A session expired and someone else signed in | Clear the synced keys (§5.4 step 3), discard the old queue unsent, pull |

**Merge flow.** If the device holds no visited, solved or draft data: pull and
finish. Otherwise:

- **The account is empty on the server:** merge without asking. Progress made
  just before signing up is the learner's own.
- **The account already has progress:** ask once, since on a shared computer
  the local progress may be someone else's:

  > **This device has progress from before you signed in.**
  > {v} lessons visited · {s} problems solved · {d} drafts
  > **Add to my account** · **Don't add**

  The counts are computed from the local sets. **Don't add** clears the
  anonymous data from this device, then pulls.

**Merge steps**, each idempotent:

1. Upload local visited and solved ids in batches of 500.
2. Upload each local draft with `baseRev: 0`. No server row: created. A server
   row with different code: the §6.3 mount rule decides which goes in the
   editor, and the other is stashed.
3. Write `sync:owner` **last**. It is the commit marker: an interrupted merge
   leaves the device anonymous and reruns on the next load, which is safe
   because every step above is idempotent.

**Legacy drafts** saved before this ships have no `:at` timestamp. They count
as older than any server copy: the server version goes in the editor and the
local one is stashed, never lost.

## 8. UI

- **Header** (app `Header` and `LandingHeader`, classes from
  `headerChrome.ts`): the account control sits at the right end, after Search
  and the theme toggle. Signed out: a **Sign in** link in `NAV_LINK`; on the
  landing page it sits beside the existing CTA, which is unchanged. Signed in:
  a round avatar button in `ROUND_CONTROL` (provider picture, or initials on
  `--surface`), `aria-label` "Account menu, signed in as {name}", opening the
  §5.5 menu, portalled to `<body>` like `CodeLangMenu`. Loading: a placeholder
  the size of the avatar. Below `md`: the avatar, or a person icon for Sign in,
  as Search collapses today.
- **`/sign-in`:** static; a solid card on the desk grain; heading in Space
  Mono; two full-width buttons with phosphor brand glyphs in `currentColor` (no
  brand colours: the lamp stays the only non-steel colour in chrome, §4); one
  sentence on what syncs; one on what is stored ("your name, email, avatar,
  lesson progress and sandbox code").
- **Course hub:** one line under the progress count, signed out only:
  "Progress is saved on this device. Sign in to keep it everywhere." No other
  nudges: no banners on lessons.
- **Sandbox stash row:** §6.3; on `--elevated`, text in `--info-ink`; Compare
  uses the existing CodeMirror theme (one code-colour source, §4).
- **Merge and delete-account dialogs:** the dialog surface `SearchDialog`
  uses: focus trapped, Esc closes, focus returns to the account control.
- All colour through tokens; both themes; visible focus; every action
  reachable by keyboard.

## 9. Performance

Signed-out visitors load only `lib/auth/client.ts`'s session check and
`AccountControl`. `SyncProvider`, the stash row, the merge dialog and the
account-menu dialogs are `next/dynamic` chunks loaded only once a session
exists. No page renders on the server per request because of auth: the
`next build` route table is compared before and after, and no route may turn
dynamic.

## 10. Testing and verification

**Unit (vitest, no I/O):**
- `merge.ts`: union is order-independent; every row of the §6.3 table; the §7
  owner cases; a legacy draft without a timestamp loses to the server and is
  stashed; "Use that version" stashes the displaced code.
- `syncQueue.ts` with a fake clock and fake fetch: debounce, backoff to the
  cap, 401 keeps the queue and stops, 400 drops the change, a different user's
  queue is discarded, keepalive flush on hide.
- Sign-out clears exactly the §5.4 keys and keeps the preferences; after it,
  a fresh `ProgressProvider` mount restores nothing (the legacy-key
  migration must not revive progress).
- `next=` validation rejects `https://evil.example`, `//evil.example`,
  `/\evil.example` and accepts `/courses/dsa/arrays`.

**API (vitest against PGlite: real Postgres in-process, with the real Drizzle
migrations):**
- A repeated mark batch inserts once.
- A `baseRev` mismatch returns 409 with the server copy.
- A tombstone is not revived by a stale device.
- Account deletion cascades to zero learner rows.
- Every route returns 401 without a session and 503 when auth is not
  configured.
- Unknown lesson or sandbox ids return 400, checked against the real manifest
  and sandbox registry.
- User A's session can neither read nor write user B's rows.

Per §2 of CLAUDE.md, each suite is shown to fail with a planted fault
(remove the `rev` check; remove the cascade; take the user id from the body)
and then restored.

**Browser (Playwright, two browser contexts as two devices):**
- Real OAuth needs registered apps, so a test-only sign-in exists **only**
  when `NODE_ENV !== "production"` and `AUTH_TEST_LOGIN=1`. A test builds for
  production and asserts that route answers 404.
- Scenarios: sign in on A, solve, B shows the tick; edit one draft on both, the
  stash row appears and both versions are recoverable; the merge prompt, both
  answers; sign out on A, A's `localStorage` holds no synced keys; edit offline,
  reconnect, the edit arrives; sign-out in one tab clears another tab.
- Both themes, keyboard-only through the account menu and dialogs, a mobile
  width.
- Real GitHub and Google sign-in, checked by hand on localhost with
  development OAuth apps. The report says which checks were manual.

`tsc`, `eslint`, `npm test` and `npm run build` pass before anything is
reported done.

## 11. Rollout

1. **Owner:** create the Neon database (Vercel marketplace); GitHub and Google
   OAuth apps for development and production; set `BETTER_AUTH_SECRET` and the
   §5.6 variables in Vercel.
2. Migrations run with `drizzle-kit migrate` as a deploy step, never at request
   time.
3. **Launch prerequisite:** a privacy policy page. The app starts storing
   names, emails and learner code; the footer has no legal links until those
   pages exist, and this feature is what makes one necessary. Sign-in is not
   enabled in production until it is published. Writing it is the owner's (and
   legal review's), tracked outside this build.

## 12. Out of scope

- Authorization, entitlements, locked modules, server-side content gating, the
  coach quota per account (part 3); billing (part 4).
- Syncing quiz answers, scratchpads, coach threads and the code-language
  preference. They stay per-device; adding them later is a new mark kind or
  table plus a merge rule, with no change to this design.
- Email sign-in. **Known limit:** a learner who loses access to both their
  GitHub and Google accounts cannot recover theirs.
- Sign-in on the disabled Next.js course, which 404s every route.
