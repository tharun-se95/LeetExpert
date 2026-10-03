# Instagram pipeline: handoff (2026-09-30)

Start here to pick up leetExpert's Instagram work from any account or session. The plan
and every open item live in **GitHub issues**: this page tells you where things are and how
they work, and it never copies an issue's state (read the issue for that).

Owner: Tharun. Product: leetexpert.com, "DSA for the age of AI", an interactive DSA course.
Account: @leetexpert (a second account, @10xtharun, is tracked in #113–#117).

## 1. Pick up the work

The epic is **#132, the October launch**. Read it and its comments first: they record the
owner's decisions (start Oct 1, three posts a day Oct 1–3 then one a day, carousels first,
stories on, schedule by hand in Meta Business Suite).

| Issue | Work | State of the code |
|---|---|---|
| #133 | Cheatsheet carousels, 13 gold modules | **Started**: `carousel/dump_sheets.ts`, `carousel/sheets.json`, build plan in `carousel/README.md` |
| #134 | Carousel versions of the 12 reels (step-by-step slides from their traces) | Not started |
| #135 | Spot-the-bug carousels, verified in Python and JavaScript | Six built: `spotbug/` (README there) |
| #136 | Big-O quiz singles, the answer in the first comment | Eight built: `bigoquiz/` (README there) |
| #136 | Big-O quiz singles, answer in the first comment | Not started |
| #137 | Daily story kit and highlight covers | Not started |

These are independent: several agents can take one each. Claim an issue with a comment
(CLAUDE.md §7) before starting, work on a `feat/N-…` branch from `main`, and add every
finished post to the posting kit (§4) with its date.

Open owner calls, not for an agent to decide: **#67** (a tutor cameo in post 3, or close it
under the Sep 30 direction), **#68** (the spoken brand line for posts 2 and 3), and whether the
gift-card reel (#119, closed) should gain a short code walkthrough (it has none; new narration
would be needed). Ask; record the answer on the issue.

## 2. Where everything lives

| What | Where |
|---|---|
| Post packages (post.md, reel.mp4 / slides, cover.png, sources) | `marketing/instagram/<date>-<slug>/` |
| Append-only post ledger | `marketing/LEDGER.md` |
| **Posting kit**: the page the owner schedules from | https://claude.ai/artifact/QBH6EjeE62vGexCuwpCwor, built from `posting-kit/` |
| **Ledger artifact**: the 30-post plan, statuses, notes, media library | https://claude.ai/artifact/B6QDfhoU9sC5dc7dujgXfV (db `posts` p01–p30 with `scheduledFor`, `media`, `meta`) |
| Reel engine | `reelkit/` (README there) |
| Carousel builder (in progress) | `carousel/` |
| Instagram specialist skill (voice, formats, hashtag rules) | `skill/` (`references/formats.md`) |
| Tutor poses, cleaning scripts | `tutor-poses/`, `stills-cleaning/` |
| Publishing to Instagram by API (posts at once, cannot schedule) | `marketing/scripts/prepare.mjs`, `publish.mjs` |

Keep the repo and the two artifacts in step: when a post is scheduled or posted, update its
`post.md` status line, its `LEDGER.md` row and the ledger artifact's `posts/pNN` status.

## 3. Content rules (every post)

1. **Verify every technical claim by running code**, in both Python and JavaScript
   (CLAUDE.md §2). The code on screen is the file the verifier runs; timings are "our test run".
2. **Stand alone for a cold viewer**: a hook a stranger understands in 1.5 s, "leetExpert, the
   interactive DSA course" said or shown, and the brand lockup at the end.
3. **Never** use the site's placeholder stats or testimonials. No invented learners.
4. **Five hashtags**, all specific: Instagram's hard limit since Dec 2025. The recipe (pattern,
   problem, language, angle, audience) is in `skill/references/formats.md`.
5. **Alt text** on every post.
6. **The tutor is a cue, not a presenter** (owner, 2026-09-30): the hook, one key reaction, the
   challenge, the brand. `reelkit` enforces at most 35% screen time.
7. **Every code walkthrough has a data-structure stage beside it** (owner, 2026-09-30), built
   from the shown code's own run (`reelkit/viz.py`).

## 4. Production

### Reels (`reelkit/`)

Script → verify → narrate → generate → check → render. Commands are in `reelkit/README.md`.

- **Narration:** `reelkit/narrate.py`, ElevenLabs `eleven_v3`, voice Hope (`WZlYpi1yf6zJhNWXih74`),
  one take, levelled to −15 LUFS; Scribe word timings, then `respell.py` restores the script's
  spelling ("leetExpert", "hash map", "lo"). Read respell's report: a *different* word (not a
  homophone) can mean the take said the wrong word. Cut that span, transcribe it alone, and
  re-record if so (post 12 needed this).
- **Key:** `ELEVENLABS_API_KEY` in the environment (it is set in the owner's cloud environment;
  the key lacks `user_read`, so it cannot report remaining quota). Never write it to a file.
- **Stages:** `viz.py` `ArrayViz` / `MapViz` / `StackViz`, with states from `trace()` (Python,
  per-frame and recursion-safe), `calls()` (recursive calls and returns) or `js_reads()` (runs a
  `.js` in Node through a Proxy). A stage fails the build if it reaches the caption zone.
- **Check:** `npx hyperframes@0.8.77 check` must report 0 errors. Look at stills
  (`hyperframes snapshot --at …`) before rendering.
- **Render:** about 4–5 minutes per reel on 4 cores; run in the background. Re-encode to
  crf 23 (7–9 MB). The container needs `ffmpeg` (`apt-get install -y ffmpeg`).
- **Cover:** `reelkit/cover.py "<hook with *key* words>" "<topic>" <still>` puts the hook inside
  the grid's crop (y 285–1635).

### Carousels and singles

1080×1350. Build from real product content where it exists (the cheatsheets in
`web/src/lib/course/cheatsheets`), render with Playwright (`web/node_modules/playwright-core`,
Chromium at `/opt/pw-browsers`), and fail on overflow. The two-pointers card
(`instagram/2026-09-30-two-pointers-card/sources/card.py`, `render_card.mjs`) is the working
example.

### Posting kit (`posting-kit/`)

`october.json` lists the posts in order with date, time slot, caption, hashtags, alt text and
hook (taken from each `post.md`). `build.py` writes the page; the media are assets of the kit
artifact, mapped in `build.py`'s `MEDIA`. To add a post: upload its media to the kit artifact
(copy assets server-side from the ledger artifact where they already are), add it to `MEDIA`
and `october.json`, rebuild, republish to the same URL, and set its `scheduledFor` in the
ledger artifact.

## 5. Known blockers

- **GitHub Actions has run no job since 2026-09-29 21:49 UTC**: every job fails in about 3 s
  with no runner, `main` included; most likely the account's Actions minutes or spending limit
  (owner to check Settings → Billing and plans). Until it runs, check locally before any PR.
- **Board cards:** cloud sessions reach GitHub through a connector with no Projects support,
  so they cannot move roadmap cards. Say so on the issue; the owner, or a Mac session with
  `gh` and the `project` scope, moves them. Suggested fix: the project's "Auto-add to project"
  workflow.
- **Scheduling is manual:** `publish.mjs` posts immediately and needs `marketing/.env.local`
  (not in cloud sessions). The owner schedules from the posting kit in Meta Business Suite.
- **Alt text for posts 7–18** predates the Sep 30 redesign: accurate, but it does not describe
  the new data-structure stages.

## 6. Gotchas

- Render in the background; a foreground tool call is cut off after 10 minutes.
- Never `pkill -f <pattern>`: it can kill your own shell.
- A reel's `sources/` has git-ignored render inputs (stills, fonts, GSAP, `hyperframes.json`,
  `index.html`); `reelkit/prep.sh` restores them.
- `PYTHONDONTWRITEBYTECODE=1` when planting a fault to prove a verifier fails (a stale
  `__pycache__` can outlive the restore).
- Posts 1 and 6 are the only ones posted (2026-09-29). Keep-the-streak (post 5) is held under #30.
