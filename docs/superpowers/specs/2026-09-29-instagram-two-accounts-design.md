# Two Instagram accounts: @leetexpert and @10xtharun

Owner decisions, 2026-09-29 (issue #113). This spec is the source of truth for
what each account is, how the two relate, and how a post is made and tracked.

## 1. What each account is

| | @leetexpert (the brand) | @10xtharun (the creator) |
| --- | --- | --- |
| Job | Teach DSA one checkable idea at a time, and show the product doing it. | A digital creator who builds things that run themselves: AI agents and automation. Each project is a case study. |
| Projects | leetExpert only. | leetExpert (a DSA course built with AI agents), Goosefuks (an automated, fully animated YouTube channel, https://www.youtube.com/@goosefuks; Instagram page to come), and any later project. |
| Voice | "We", the course. The anime tutor hosts with Hope narration. Rules in `marketing/reels-pipeline/skill/references/brand.md`, unchanged. | "I", Tharun, on camera, casual, phone-shot. Calm and specific, like the brand, in the first person. |
| Tone | Direct, calm, specific, dry wit. | Honest builder: real numbers, real failures, credit to the agents including when they are wrong. The "10x" handle is a wink, never a claim. |
| Formats | Reels of 60–120 s, animated carousels, tracer screen recordings. | 30–60 s talking clips; narrated screen recordings of agents, PRs, apps and pipelines; occasional build-log carousels. |
| Content | The four pillars of `marketing/CONTENT_ROADMAP.md`. | Build logs per project; how the automation works (the agents behind leetExpert, the Goosefuks pipeline from topic to upload); decisions and why; what broke and how it was caught; milestones. |
| Ends with | Brand lockup: "Try leetExpert free → link in bio". | A pointer to the project the post is about. |
| Cadence | 3 a week (Mon/Wed/Fri). | 2 a week (one face clip, one screen or build log), rotating across projects. |

### Hard rules, @10xtharun

- Every number comes from a real source: the repo, the roadmap board, YouTube
  Studio or the public channel page, Instagram insights. Never an estimate.
- No income or "passive money" claims unless they are real and the owner
  chooses to publish them.
- No hustle or fear-of-AI framing; the brand's banned words ("crush",
  "grind", "hack", "secret trick") apply here too, except the handle itself.
- Never uses the landing page's placeholder social proof.

### Profiles

- **@leetexpert**: Name `leetExpert · DSA course` (the Name field is searched;
  it was empty). Bio unchanged: "DSA you can explain, not just pass. / 24
  modules · 220 lessons · runnable in Python & TypeScript / Free in early
  access ↓". Link www.leetexpert.com.
- **@10xtharun**: Name `Tharun Shivkumar`; category **Digital creator**.
  Bio (144 characters, limit 150):

  ```
  Digital creator · I build things that run themselves
  ● @leetexpert: DSA you can explain, not just pass
  ● Goosefuks: history's blunders, animated
  ```

  Links in order: www.leetexpert.com, https://www.youtube.com/@goosefuks.

## 2. How the accounts relate

Separate feeds. Launches and standout pieces go out as Instagram **Collab
posts**: one post shown on both feeds with shared likes and comments.
@10xtharun collabs with @leetexpert for course moments and with the Goosefuks
Instagram once it exists.

## 3. How a post is made and tracked

1. **One package folder** for both accounts: `marketing/instagram/<date>-<slug>/`.
   Each `post.md` carries an `**Account:**` line. `publish.mjs` refuses a run
   whose `--account` does not match it, so a package goes only to the account
   it was written for (on top of the required `--account` flag and the
   username check that shipped in #114).
2. **One ledger**, `marketing/LEDGER.md`, with an Account column (#114). A
   package posted to both accounts is two rows, or one Collab post.
3. **Two voice references, one agent.** `brand.md` stays @leetexpert's voice;
   a new `marketing/reels-pipeline/skill/references/10xtharun.md` holds §1's
   @10xtharun column and hard rules. `leetexpert-social-artist` reads the one
   matching the account.
4. **Roles on a @10xtharun post**

   | Step | Who |
   | --- | --- |
   | Topic, from real activity (merged PRs, closed issues, Goosefuks uploads and stats) | Agent proposes, owner picks |
   | Script: hook, 3–5 beats, one sourced number, project pointer | Agent drafts, owner edits |
   | Film the face clip on a phone, drop it in the package's `raw/` | Owner only |
   | Edit: cut, captions, screen-recording inserts (HyperFrames caption and graphics workflows) | Agent |
   | Verify every number against its source, check limits, dry run | Agent |
   | Publish | Agent, only on the owner's go-ahead for that post |

5. **Goosefuks facts** come from its public channel page or YouTube Studio
   exports the owner supplies. How its automation works comes from the owner
   or its code; that code is not in this repo.
6. **Collab posting**: `publish.mjs --collab <handle>` sends Meta's
   `collaborators` field; the invited account accepts in the app.
7. **The Goosefuks Instagram**, when it exists, gets what @10xtharun got on
   2026-09-29: a place in a business portfolio, its own Page, an `ACCOUNTS`
   entry in `marketing/scripts/lib.mjs`, and its own voice reference.

## 4. Setup already done (2026-09-29)

- @10xtharun (IG 17841473404840826) added to the LeetExpert portfolio; the
  owner's Facebook login given full access; connected to a new Page
  "10xtharun" (Digital creator, 1386456864542771). IDs are in the git-ignored
  `marketing/.env.local` as `TENX_*`.
- `publish.mjs --account` required, with a username check before posting (#114).

## 5. Follow-up work (tracked as issues)

- `post.md` Account line and the `--account` mismatch check (§3.1).
- The @10xtharun voice reference and the social-artist agent reading it (§3.3).
- `--collab` in `publish.mjs` (§3.6).
- Owner: reissue the token with the 10xtharun Page ticked before the first
  @10xtharun post (#113 item 1).
