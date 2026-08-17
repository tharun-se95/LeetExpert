# Problem Coach

**Date:** 2026-08-16  
**Status:** shipping  
**Surfaces:** Problem workspace (`/problems/[slug]` and course problem lessons) — desktop Coach rail, mobile Coach tab  
**Plan:** `docs/superpowers/plans` / Cursor plan `problem_coach_rail`

---

## Problem

Learners get stuck on sandboxed problems. The course already has progressive
hints, an Insight panel, and failed-test output, but nothing that _talks_
about the run they just made or answers a follow-up without dumping the
solution. A ChatGPT-style “here’s the code” button would undo the
solve-first product.

## Product

Socratic coach + fail diagnosis. Never write or complete the solution.

- Speaks when the learner asks, or when a run fails.
- Model context = statement + hint ladder + current code + last diagnosis.
  Solution tab and `web/tests/reference/**` never enter the prompt.
- Fail diagnosis is local and exact. The model runs only when they type.
- Course-paid server key. Daily turn cap (default 40). No accounts in this
  work; `CoachQuota.consume(visitorId)` is the seam for accounts later.
- Dedicated Coach rail (desktop) and Coach tab (mobile). Insight stays a
  schematic, not a messenger.

## Architecture

Two engines:

1. **Local diagnoser** — pure function on the main thread after
   `useRunner` has judged pass/fail. Workers stay raw-outcome-only.
2. **Chat** — `POST /api/coach/chat` looks up a build-time, server-only
   corpus by `sandboxId`, checks quota, streams a reply, then runs a leak
   filter.

The corpus is generated at prebuild because Vercel Root Directory is `web`
and serverless functions do not reliably include sibling `course/`.

Client holds hint **labels** only. Hint **bodies** live in the server corpus.

## Hint extraction

From `splitProblemTabs(afterSandbox).explanation`, every `reveal` fence
whose label matches `/^Hint\b/i`, in authored order. Solution / Alternative
/ Follow-up reveals are ignored. Every problem lesson must have ≥1 such
hint or CI fails — no allowlist.

## Leak wall

1. `CoachProblem` has no solution field. `buildModelMessages` cannot accept one.
2. System prompt forbids implementing the sandbox `fn` or pasting an algorithm.
3. `filterCoachReply` drops a reply that defines either `fn` name or ships a
   fenced `python` / `javascript` / `typescript` / `ts` block.

## Quota and configuration

- Diagnosis is unlimited and works with no keys.
- Chat requires a model backend plus quota. Backends: `COACH_PROVIDER=ollama`
  (`COACH_MODEL` default `gemma4:cloud`), or `ANTHROPIC_API_KEY` /
  `OPENAI_API_KEY`. Production also needs Upstash Redis. Missing config is
  a visible disabled composer (`coach_unconfigured`), not a silent no-op.
- Visitor: httpOnly `dsa-coach-id` cookie.

## Out of scope

Accounts, concept-lesson tutor, pair-programmer / insert-into-editor, live
execution tracing, third-party analytics, card-variant sandbox coach.
