# Agent setup: working on leetExpert from any account

For any agent picking up work here: a Claude Code session on another account, on another Mac,
in the cloud (claude.ai/code), or an Antigravity agent. Once set up, every agent works the same
way: from GitHub issues, on the **leetExpert roadmap** board, through pull requests the owner
merges.

The rules themselves live in [`CLAUDE.md`](../CLAUDE.md), which every session loads when it opens
the repo: §1–§6 set the standard of work, and §7 sets the issue workflow. This page covers the
setup that makes §7 work in your environment and the working rules that were not yet written down
anywhere in the repo. Where this page and CLAUDE.md disagree, CLAUDE.md wins.

---

## 1. One-time setup

### What every environment needs

| Need | Why | Check |
|---|---|---|
| `gh`, authenticated with write access to `tharun-se95/LeetExpert` | §7 runs on it: issues, comments, PRs, the board | `gh auth status` and `gh issue list --limit 1` |
| `gh` access to the roadmap project | moving cards (§7) | `gh project item-list 1 --owner tharun-se95 --limit 1` |
| Node 22 | what CI runs (`.github/workflows/ci.yml`) | `node -v` |
| Python 3.12 | tests execute reference solutions; the lesson-artifact build and ledger are Python | `python3 --version` |
| `npm ci` in `web/` | tests, typecheck, build | `cd web && npm test` |
| Google Chrome (for artifact work only) | `lesson-artifacts/browser-gate.mjs` launches `channel: "chrome"` | the gate starts |

### Desktop app, another account on the same Mac

Nothing to do. `gh` is logged in per macOS user, not per Claude account, so the existing login
works. `~/.claude` (memory, personal skills, hooks) is also shared, unless that account uses its
own `CLAUDE_CONFIG_DIR`.

### Desktop app, another Mac

1. Clone the repo, then `cd web && npm ci`.
2. `gh auth login` as the owner's GitHub account. To move board cards it also needs the `project`
   scope: `gh auth refresh -s project`.
3. Nothing from the first Mac's `~/.claude` comes along. Everything an agent must follow is in the
   repo (CLAUDE.md and this page), so nothing else is required.

### Cloud (claude.ai/code)

A cloud session clones the repo, so it reads CLAUDE.md and this page, but it has no `gh` login
and no `~/.claude`.

1. Create a GitHub token for the owner's account:
   - **Classic token** with the `repo` and `project` scopes, if cloud agents should move board cards.
     A fine-grained token cannot reach a Projects board owned by a personal account.
   - Fine-grained token scoped to `tharun-se95/LeetExpert`, with read/write on Contents, Issues and
     Pull requests, if cloud agents only need issues and PRs. Card moves then fail, and the agent
     should say so on the issue rather than skip it silently.
2. In the claude.ai/code environment settings for that account, add it as the environment variable
   `GH_TOKEN`. `gh` reads it without `gh auth login`.
3. In the environment's setup script, install dependencies: `cd web && npm ci`.
4. Artifact browser gates need Chrome, which a cloud image may not have. If it is missing, do not
   report a gate as passed; say it was not run and leave it for a desktop session.

Keep the token out of the repo, the chat and every file. It is a credential for the owner's
account.

---

## 2. The working loop

This is §7 in the order you meet it. Read §7 itself for the details and the card-move commands.

1. **Pick.** `gh issue list --state open`, or the board's Ready column in the agreed order.
   Skip anything blocked: `gh api repos/tharun-se95/LeetExpert/issues/N/dependencies/blocked_by`.
2. **Check for a claim.** `gh issue view N --comments`. If another agent claimed it and has not
   posted that it stopped, pick something else.
3. **Claim.** Post a one-line comment naming the work and the branch, and move the card to
   In progress. Name the branch after the issue: `feat/N-short-name`, `fix/N-…`, `docs/N-…`.
4. **Work in a worktree**, not in the main checkout (see §3 below).
5. **Verify** as CLAUDE.md §2 requires: `tsc`, `eslint`, `npm test` and `npm run build` all pass,
   behaviour is confirmed in a browser, and a test that passed first time is shown to fail.
6. **Report progress on the issue**: findings, decisions, what passed and what was not checked.
   Anything left for a later session goes there too, not in chat.
7. **Open the PR** with `Closes #N` (or `Part of #N` for one item of a larger issue), then move the
   card to In review.
8. **Stop at the PR.** The owner merges. Then take the next issue.

Sign every issue, comment and PR body with the provenance line from §7. In the cloud,
`CLAUDE_CODE_HOST_SESSION_ID` is empty: leave that part out, and keep the model, the transcript
id and the branch.

---

## 3. Working rules

The owner set these for every agent. Until now they lived only in one Mac's session memory.

**Autonomy (owner, 2026-09-28).** Work the roadmap autonomously. Once a design has been presented,
write its spec and build it without waiting for approval in chat, then move on to the next issue.
The owner reviews in the PR. Still stop for:

- `owner-decision` issues: lay out the options on the issue, ask, and record the answer. Never decide
  one yourself.
- merging, or enabling auto-merge: never.
- anything destructive or outward-facing beyond issues, comments, branches and PRs. That includes
  force-pushes, deleting branches, rewriting history on `main`, and any production deploy. Ask
  first.

**Several sessions share one checkout.** The main checkout often holds another session's
uncommitted work.

- Work in your own `git worktree`, branched from `origin/main` or from the PR you stack on. In a
  fresh worktree, run `npx next typegen` before `tsc` (it generates `LayoutProps`). For
  `npm run build`, copy `node_modules` in (`cp -c -R`) rather than symlinking: Turbopack rejects a
  symlinked `node_modules`.
- Stage only the files you meant to change. `git add <file>` takes the whole file, including another
  session's edits to it. Compare `git diff --stat origin/main..HEAD` with what you actually changed.
- Never use a bare `git stash` or `git stash pop`. The stash stack is shared across worktrees.
- Do not commit files you did not create, however they got there.

**Stacked PRs.** When your work builds on an open PR, branch from its head and say so in your PR
body, listing the chain in merge order. A kit or content change makes every artifact page's
recorded evidence stale. Re-record the ledger once, at the top of the stack
(`web/lesson-artifacts/ledger.py`), not on each PR.

**Browser gates run one at a time.** Two artifact gates running at once interfere. Wait for one to
finish before starting another, across all sessions on the machine.

**Subagents cost money.** Run at most two or three at once, and on a cheaper model than your own.
Work a subagent produced is unverified: read every changed hunk and rerun the checks yourself.
Agents defined in `.agents/agents/` (`dsa_check_runner`, `dsa_lesson_auditor`,
`design_system_reviewer`) are the preferred specialised runners for Antigravity's `agy`.

**Evidence has one home.** Lesson-artifact status comes from `web/lesson-artifacts/LEDGER.md` and
is never set by hand. Issues link the ledger and never copy its counts.

---

## 4. Handing over between sessions

The issue is the handover. Before you stop, leave a comment on each issue you touched with:

- what is done and verified
- what is done but unverified, and why
- the branch and its last commit
- the next concrete step

A new session, on any account, starts from `gh issue view N --comments` and has everything it needs.
A local handoff file (such as the `/handoff` skill on the owner's Mac) is a convenience on that
machine only; nothing another agent needs may live only there.

---

## 5. First-session checklist

```bash
gh auth status
gh issue list --state open --limit 20
gh project item-list 1 --owner tharun-se95 --limit 1
node -v
python3 --version
```

Also:

- Read CLAUDE.md §7, and every section your work touches.
- Read the issue and its comments, then post your claim.
- Create your worktree, run `npm ci` in `web/`, then `npm test`.

If any check fails, fix the setup before claiming work. An agent that cannot comment or open a PR
cannot follow the loop.
