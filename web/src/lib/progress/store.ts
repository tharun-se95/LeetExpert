import { and, eq, sql } from "drizzle-orm";
import { progressMark, sandboxDraft, user } from "@/lib/db/schema";
import type { Db } from "@/lib/db/types";
import type { DraftPutBody } from "./schemas";
import type { DraftLang, MarkKind, MarksSnapshot, ServerDraft, ServerDrafts } from "./types";

export async function getMarks(db: Db, userId: string, course: string): Promise<MarksSnapshot> {
  const rows = await db
    .select({ kind: progressMark.kind, id: progressMark.itemId })
    .from(progressMark)
    .where(and(eq(progressMark.userId, userId), eq(progressMark.courseSlug, course)));
  const draft = await db
    .select({ one: sql<number>`1` })
    .from(sandboxDraft)
    .where(eq(sandboxDraft.userId, userId))
    .limit(1);
  return {
    visited: rows.filter((r) => r.kind === "visited").map((r) => r.id).sort(),
    solved: rows.filter((r) => r.kind === "solved").map((r) => r.id).sort(),
    hasDrafts: draft.length > 0,
  };
}

export async function addMarks(
  db: Db,
  userId: string,
  course: string,
  marks: { kind: MarkKind; id: string }[],
): Promise<void> {
  if (marks.length === 0) return;
  await db
    .insert(progressMark)
    .values(marks.map((m) => ({ userId, courseSlug: course, kind: m.kind, itemId: m.id })))
    .onConflictDoNothing();
}

function toServerDraft(row: { code: string; updatedAt: Date; rev: number; deleted: boolean }): ServerDraft {
  return { code: row.code, updatedAt: row.updatedAt.toISOString(), rev: row.rev, deleted: row.deleted };
}

export async function getDrafts(db: Db, userId: string, sandboxId: string): Promise<ServerDrafts> {
  const rows = await db
    .select()
    .from(sandboxDraft)
    .where(and(eq(sandboxDraft.userId, userId), eq(sandboxDraft.sandboxId, sandboxId)));
  const out: ServerDrafts = {};
  for (const row of rows) out[row.lang] = toServerDraft(row);
  return out;
}

export type PutDraftResult = { ok: true; rev: number } | { ok: false; server: ServerDraft };

/**
 * Optimistic concurrency: the write lands only if the row is still at the
 * rev this device last saw (0 = "I have never seen a server copy"). A
 * mismatch returns the server's copy so the client can stash, not overwrite.
 */
export async function putDraft(
  db: Db,
  userId: string,
  sandboxId: string,
  body: DraftPutBody,
): Promise<PutDraftResult> {
  const values = { code: body.code, updatedAt: new Date(body.updatedAt), deleted: body.deleted };
  const key = and(
    eq(sandboxDraft.userId, userId),
    eq(sandboxDraft.sandboxId, sandboxId),
    eq(sandboxDraft.lang, body.lang),
  );
  const written =
    body.baseRev === 0
      ? await db
          .insert(sandboxDraft)
          .values({ userId, sandboxId, lang: body.lang, rev: 1, ...values })
          .onConflictDoNothing()
          .returning({ rev: sandboxDraft.rev })
      : await db
          .update(sandboxDraft)
          .set({ ...values, rev: sql`${sandboxDraft.rev} + 1` })
          .where(and(key, eq(sandboxDraft.rev, body.baseRev)))
          .returning({ rev: sandboxDraft.rev });
  if (written[0]) return { ok: true, rev: written[0].rev };

  const current = (await getDrafts(db, userId, sandboxId))[body.lang];
  // The row this device based its edit on no longer exists (the account
  // was reset elsewhere): start it afresh rather than fail forever.
  if (!current) return putDraft(db, userId, sandboxId, { ...body, baseRev: 0 });
  return { ok: false, server: current };
}

export async function deleteAccount(db: Db, userId: string): Promise<void> {
  // Sessions, accounts, marks and drafts all cascade from the user row.
  await db.delete(user).where(eq(user.id, userId));
}

export interface AccountExport {
  user: { name: string; email: string; createdAt: string } | null;
  marks: { course: string; kind: MarkKind; id: string; firstAt: string }[];
  drafts: ({ sandboxId: string; lang: DraftLang } & ServerDraft)[];
}

export async function exportAccount(db: Db, userId: string): Promise<AccountExport> {
  const [person] = await db.select().from(user).where(eq(user.id, userId));
  const marks = await db.select().from(progressMark).where(eq(progressMark.userId, userId));
  const drafts = await db.select().from(sandboxDraft).where(eq(sandboxDraft.userId, userId));
  return {
    user: person ? { name: person.name, email: person.email, createdAt: person.createdAt.toISOString() } : null,
    marks: marks.map((m) => ({ course: m.courseSlug, kind: m.kind, id: m.itemId, firstAt: m.firstAt.toISOString() })),
    drafts: drafts.map((d) => ({ sandboxId: d.sandboxId, lang: d.lang, ...toServerDraft(d) })),
  };
}
