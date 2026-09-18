import type { Db } from "@/lib/db/types";
import { isKnownLessonId, isKnownSandboxId } from "./knownIds";
import type { RateLimiter } from "./rateLimit";
import { draftPutSchema, marksBatchSchema } from "./schemas";
import { addMarks, deleteAccount, exportAccount, getDrafts, getMarks, putDraft } from "./store";

export interface ProgressDeps {
  configured: boolean;
  sameOrigin: boolean;
  userId: string | null;
  db: Db | null;
  limiter: RateLimiter;
}

export interface HandlerResult {
  status: number;
  body: unknown;
}

const err = (status: number, code: string): HandlerResult => ({ status, body: { code } });

type Ready = { userId: string; db: Db };

/**
 * Every route passes through here. The user id comes only from the session:
 * no request field can name another learner.
 */
async function guard(deps: ProgressDeps, write: boolean): Promise<Ready | HandlerResult> {
  if (!deps.configured || !deps.db) return err(503, "auth_unavailable");
  if (!deps.userId) return err(401, "unauthorized");
  if (write && !deps.sameOrigin) return err(403, "cross_origin");
  if (write && !(await deps.limiter.hit(deps.userId))) return err(429, "rate_limited");
  return { userId: deps.userId, db: deps.db };
}

function isResult(x: Ready | HandlerResult): x is HandlerResult {
  return "status" in x;
}

export async function handleMarksGet(course: string | null, deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, false);
  if (isResult(ready)) return ready;
  if (course !== "dsa") return err(400, "bad_request");
  return { status: 200, body: await getMarks(ready.db, ready.userId, course) };
}

export async function handleMarksPost(body: unknown, deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, true);
  if (isResult(ready)) return ready;
  const parsed = marksBatchSchema.safeParse(body);
  if (!parsed.success) return err(400, "bad_request");
  const { course, marks } = parsed.data;
  if (!marks.every((m) => isKnownLessonId(course, m.id))) return err(400, "bad_request");
  await addMarks(ready.db, ready.userId, course, marks);
  return { status: 204, body: null };
}

export async function handleDraftsGet(sandboxId: string, deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, false);
  if (isResult(ready)) return ready;
  if (!isKnownSandboxId(sandboxId)) return err(400, "bad_request");
  return { status: 200, body: await getDrafts(ready.db, ready.userId, sandboxId) };
}

export async function handleDraftPut(sandboxId: string, body: unknown, deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, true);
  if (isResult(ready)) return ready;
  if (!isKnownSandboxId(sandboxId)) return err(400, "bad_request");
  const parsed = draftPutSchema.safeParse(body);
  if (!parsed.success) return err(400, "bad_request");
  const result = await putDraft(ready.db, ready.userId, sandboxId, parsed.data);
  return result.ok
    ? { status: 200, body: { rev: result.rev } }
    : { status: 409, body: { code: "conflict", server: result.server } };
}

export async function handleAccountDelete(deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, true);
  if (isResult(ready)) return ready;
  await deleteAccount(ready.db, ready.userId);
  return { status: 204, body: null };
}

export async function handleAccountExport(deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, false);
  if (isResult(ready)) return ready;
  return { status: 200, body: await exportAccount(ready.db, ready.userId) };
}
