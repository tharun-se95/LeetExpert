import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import { createTestDb } from "./helpers/testDb";
import { progressMark, sandboxDraft, user } from "../src/lib/db/schema";
import type { Db } from "../src/lib/db/types";

let db: Db;
let close: () => Promise<void>;

beforeEach(async () => {
  ({ db, close } = await createTestDb());
  await db.insert(user).values({ id: "u1", name: "Ada", email: "ada@example.com", emailVerified: true });
});
afterEach(async () => close());

describe("database schema", () => {
  it("progress_mark is a set: a repeated insert is a no-op", async () => {
    const row = { userId: "u1", courseSlug: "dsa", kind: "visited" as const, itemId: "arrays/intro" };
    await db.insert(progressMark).values(row).onConflictDoNothing();
    await db.insert(progressMark).values(row).onConflictDoNothing();
    const rows = await db.select().from(progressMark);
    expect(rows).toHaveLength(1);
  });

  it("rejects a mark kind outside visited/solved", async () => {
    await expect(
      db.execute(sql`insert into progress_mark (user_id, course_slug, kind, item_id) values ('u1','dsa','liked','x')`),
    ).rejects.toThrow();
  });

  it("rejects a draft over 64 KB", async () => {
    await expect(
      db.insert(sandboxDraft).values({
        userId: "u1", sandboxId: "two-sum", lang: "python",
        code: "x".repeat(65537), updatedAt: new Date(), rev: 1,
      }),
    ).rejects.toThrow();
  });

  it("deleting a user cascades to marks and drafts", async () => {
    await db.insert(progressMark).values({ userId: "u1", courseSlug: "dsa", kind: "solved", itemId: "hash-tables/two-sum" });
    await db.insert(sandboxDraft).values({
      userId: "u1", sandboxId: "two-sum", lang: "python", code: "pass", updatedAt: new Date(), rev: 1,
    });
    await db.delete(user).where(eq(user.id, "u1"));
    expect(await db.select().from(progressMark)).toHaveLength(0);
    expect(await db.select().from(sandboxDraft)).toHaveLength(0);
  });
});
