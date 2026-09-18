import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./helpers/testDb";
import { user } from "../src/lib/db/schema";
import type { Db } from "../src/lib/db/types";
import {
  handleAccountDelete, handleAccountExport, handleDraftPut, handleDraftsGet,
  handleMarksGet, handleMarksPost, type ProgressDeps,
} from "../src/lib/progress/handlers";
import { MemoryRateLimit } from "../src/lib/progress/rateLimit";
import { allLessonIds } from "../src/lib/course/manifest";

let db: Db;
let close: () => Promise<void>;
const LESSON = allLessonIds()[0]!;
const SANDBOX = "find-min-rotated";
const AT = "2026-09-18T10:00:00.000Z";

function deps(over: Partial<ProgressDeps> = {}): ProgressDeps {
  return { configured: true, sameOrigin: true, userId: "u1", db, limiter: new MemoryRateLimit(120), ...over };
}

beforeEach(async () => {
  ({ db, close } = await createTestDb());
  await db.insert(user).values([
    { id: "u1", name: "Ada", email: "ada@example.com", emailVerified: true },
    { id: "u2", name: "Bo", email: "bo@example.com", emailVerified: true },
  ]);
});
afterEach(async () => close());

describe("guards", () => {
  it("503 when auth is not configured, 401 without a session, 403 cross-origin writes", async () => {
    expect((await handleMarksGet("dsa", deps({ configured: false, db: null }))).status).toBe(503);
    expect((await handleMarksGet("dsa", deps({ userId: null }))).status).toBe(401);
    expect((await handleDraftsGet(SANDBOX, deps({ userId: null }))).status).toBe(401);
    expect((await handleAccountExport(deps({ userId: null }))).status).toBe(401);
    const post = { course: "dsa", marks: [{ kind: "visited", id: LESSON }] };
    expect((await handleMarksPost(post, deps({ sameOrigin: false }))).status).toBe(403);
  });

  it("429 once the per-minute write budget is spent", async () => {
    const limiter = new MemoryRateLimit(1);
    const post = { course: "dsa", marks: [{ kind: "visited", id: LESSON }] };
    expect((await handleMarksPost(post, deps({ limiter }))).status).toBe(204);
    expect((await handleMarksPost(post, deps({ limiter }))).status).toBe(429);
  });
});

describe("validation against the real registries", () => {
  it("rejects unknown lesson ids, unknown courses and unknown sandboxes", async () => {
    expect((await handleMarksPost({ course: "dsa", marks: [{ kind: "visited", id: "nope/nope" }] }, deps())).status).toBe(400);
    expect((await handleMarksPost({ course: "nextjs", marks: [{ kind: "visited", id: LESSON }] }, deps())).status).toBe(400);
    expect((await handleMarksGet("nextjs", deps())).status).toBe(400);
    const draft = { lang: "python", code: "x", updatedAt: AT, baseRev: 0, deleted: false };
    expect((await handleDraftPut("landing-find-pair", draft, deps())).status).toBe(400);
    expect((await handleDraftsGet("landing-find-pair", deps())).status).toBe(400);
    expect((await handleDraftPut(SANDBOX, { ...draft, code: "é".repeat(40000) }, deps())).status).toBe(400);
  });
});

describe("round trips", () => {
  it("marks post then get", async () => {
    await handleMarksPost({ course: "dsa", marks: [{ kind: "solved", id: LESSON }] }, deps());
    const got = await handleMarksGet("dsa", deps());
    expect(got).toEqual({ status: 200, body: { visited: [], solved: [LESSON], hasDrafts: false } });
  });

  it("draft put, conflict, get", async () => {
    const body = { lang: "python", code: "a", updatedAt: AT, baseRev: 0, deleted: false };
    expect(await handleDraftPut(SANDBOX, body, deps())).toEqual({ status: 200, body: { rev: 1 } });
    const conflict = await handleDraftPut(SANDBOX, { ...body, code: "b" }, deps());
    expect(conflict).toEqual({
      status: 409,
      body: { code: "conflict", server: { code: "a", updatedAt: AT, rev: 1, deleted: false } },
    });
    expect((await handleDraftsGet(SANDBOX, deps())).body).toEqual({
      python: { code: "a", updatedAt: AT, rev: 1, deleted: false },
    });
  });
});

describe("isolation: the user id only ever comes from the session", () => {
  it("user u2 cannot see or overwrite u1's rows, even naming u1 in the body", async () => {
    const body = { lang: "python", code: "mine", updatedAt: AT, baseRev: 0, deleted: false };
    await handleDraftPut(SANDBOX, body, deps());
    expect((await handleDraftsGet(SANDBOX, deps({ userId: "u2" }))).body).toEqual({});
    await handleDraftPut(SANDBOX, { ...body, code: "theirs", userId: "u1" }, deps({ userId: "u2" }));
    expect((await handleDraftsGet(SANDBOX, deps())).body).toEqual({
      python: { code: "mine", updatedAt: AT, rev: 1, deleted: false },
    });
  });
});

describe("account", () => {
  it("export then delete; the deleted session can no longer read", async () => {
    await handleMarksPost({ course: "dsa", marks: [{ kind: "visited", id: LESSON }] }, deps());
    const exported = await handleAccountExport(deps());
    expect(exported.status).toBe(200);
    expect(await handleAccountDelete(deps())).toEqual({ status: 204, body: null });
    expect((await handleAccountExport(deps())).body).toEqual({ user: null, marks: [], drafts: [] });
  });
});
