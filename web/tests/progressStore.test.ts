import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./helpers/testDb";
import { user } from "../src/lib/db/schema";
import type { Db } from "../src/lib/db/types";
import {
  addMarks, deleteAccount, exportAccount, getDrafts, getMarks, putDraft,
} from "../src/lib/progress/store";

let db: Db;
let close: () => Promise<void>;
const AT = "2026-09-18T10:00:00.000Z";

beforeEach(async () => {
  ({ db, close } = await createTestDb());
  await db.insert(user).values([
    { id: "u1", name: "Ada", email: "ada@example.com", emailVerified: true },
    { id: "u2", name: "Bo", email: "bo@example.com", emailVerified: true },
  ]);
});
afterEach(async () => close());

describe("marks", () => {
  it("a repeated batch inserts once and is scoped to its user", async () => {
    const batch = [{ kind: "visited" as const, id: "arrays/intro" }, { kind: "solved" as const, id: "hash-tables/two-sum" }];
    await addMarks(db, "u1", "dsa", batch);
    await addMarks(db, "u1", "dsa", batch);
    expect(await getMarks(db, "u1", "dsa")).toEqual({
      visited: ["arrays/intro"], solved: ["hash-tables/two-sum"], hasDrafts: false,
    });
    expect(await getMarks(db, "u2", "dsa")).toEqual({ visited: [], solved: [], hasDrafts: false });
  });
});

describe("drafts", () => {
  const body = { lang: "python" as const, code: "a", updatedAt: AT, baseRev: 0, deleted: false };

  it("creates at rev 1, then advances only from the current rev", async () => {
    expect(await putDraft(db, "u1", "two-sum", body)).toEqual({ ok: true, rev: 1 });
    expect(await putDraft(db, "u1", "two-sum", { ...body, code: "b", baseRev: 1 })).toEqual({ ok: true, rev: 2 });
    const stale = await putDraft(db, "u1", "two-sum", { ...body, code: "c", baseRev: 1 });
    expect(stale).toEqual({ ok: false, server: { code: "b", updatedAt: AT, rev: 2, deleted: false } });
  });

  it("a baseRev-0 write over an existing row is a conflict, not an overwrite", async () => {
    await putDraft(db, "u1", "two-sum", body);
    const second = await putDraft(db, "u1", "two-sum", { ...body, code: "other" });
    expect(second.ok).toBe(false);
  });

  it("a tombstone is kept and a stale device cannot revive it", async () => {
    await putDraft(db, "u1", "two-sum", body);
    await putDraft(db, "u1", "two-sum", { ...body, code: "", deleted: true, baseRev: 1 });
    const stale = await putDraft(db, "u1", "two-sum", { ...body, code: "old", baseRev: 1 });
    expect(stale).toEqual({ ok: false, server: { code: "", updatedAt: AT, rev: 2, deleted: true } });
    expect((await getDrafts(db, "u1", "two-sum")).python?.deleted).toBe(true);
  });

  it("drafts are invisible to other users and reported by hasDrafts", async () => {
    await putDraft(db, "u1", "two-sum", body);
    expect(await getDrafts(db, "u2", "two-sum")).toEqual({});
    expect((await getMarks(db, "u1", "dsa")).hasDrafts).toBe(true);
  });
});

describe("account", () => {
  it("export holds the user's data; delete leaves nothing", async () => {
    await addMarks(db, "u1", "dsa", [{ kind: "visited", id: "arrays/intro" }]);
    await putDraft(db, "u1", "two-sum", { lang: "python", code: "a", updatedAt: AT, baseRev: 0, deleted: false });
    const data = await exportAccount(db, "u1");
    expect(data.user?.email).toBe("ada@example.com");
    expect(data.marks.map((m) => m.id)).toEqual(["arrays/intro"]);
    expect(data.drafts).toHaveLength(1);
    await deleteAccount(db, "u1");
    const after = await exportAccount(db, "u1");
    expect(after).toEqual({ user: null, marks: [], drafts: [] });
  });
});
