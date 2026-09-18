import { readSet, solvedKey, visitedKey } from "@/components/providers/progressStorage";
import type { DraftLang, LocalDraft, Mark, MarkKind, Stash } from "./types";

const DRAFT_PREFIX = "dsa:sandbox:";
const DRAFT_KEY = /^dsa:sandbox:(.+):(python|javascript)$/;

export function draftKey(id: string, lang: DraftLang): string {
  return `${DRAFT_PREFIX}${id}:${lang}`;
}

/** Sibling key, so drafts written before sync keep their bare-string format. */
export function draftAtKey(id: string, lang: DraftLang): string {
  return `${draftKey(id, lang)}:at`;
}

export function draftSlot(id: string, lang: DraftLang): string {
  return `${id}:${lang}`;
}

function attempt<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    // Private mode or a full quota: sync degrades, the page still works.
    return fallback;
  }
}

export function readLocalDraft(s: Storage, id: string, lang: DraftLang): LocalDraft | null {
  return attempt(() => {
    const code = s.getItem(draftKey(id, lang));
    if (code === null) return null;
    return { code, updatedAt: s.getItem(draftAtKey(id, lang)), deleted: false };
  }, null);
}

export function writeLocalDraft(s: Storage, id: string, lang: DraftLang, code: string, at: string): void {
  attempt(() => {
    s.setItem(draftKey(id, lang), code);
    s.setItem(draftAtKey(id, lang), at);
  }, undefined);
}

export function removeLocalDraft(s: Storage, id: string, lang: DraftLang): void {
  attempt(() => {
    s.removeItem(draftKey(id, lang));
    s.removeItem(draftAtKey(id, lang));
  }, undefined);
}

function keys(s: Storage): string[] {
  return attempt(() => Array.from({ length: s.length }, (_, i) => s.key(i)).filter((k): k is string => k !== null), []);
}

export function listLocalDrafts(
  s: Storage,
  isKnown: (id: string) => boolean,
): { sandboxId: string; lang: DraftLang; draft: LocalDraft }[] {
  const out: { sandboxId: string; lang: DraftLang; draft: LocalDraft }[] = [];
  for (const key of keys(s)) {
    const m = DRAFT_KEY.exec(key);
    if (!m) continue;
    const sandboxId = m[1]!;
    const lang = m[2] === "python" ? "python" : "javascript";
    if (!isKnown(sandboxId)) continue;
    const draft = readLocalDraft(s, sandboxId, lang);
    if (draft) out.push({ sandboxId, lang, draft });
  }
  return out.sort((a, b) => draftSlot(a.sandboxId, a.lang).localeCompare(draftSlot(b.sandboxId, b.lang)));
}

export const OWNER_KEY = "sync:owner";

export function readOwner(s: Storage): string | null {
  return attempt(() => s.getItem(OWNER_KEY), null);
}

export function writeOwner(s: Storage, userId: string): void {
  attempt(() => s.setItem(OWNER_KEY, userId), undefined);
}

export interface PendingDraft {
  code: string;
  updatedAt: string;
  deleted: boolean;
}

export interface SyncRecord {
  marks: Mark[];
  drafts: Record<string, PendingDraft>;
  baseRevs: Record<string, number>;
  stashes: Record<string, Stash>;
}

export function emptySyncRecord(): SyncRecord {
  return { marks: [], drafts: {}, baseRevs: {}, stashes: {} };
}

// Keyed by user so one account's queue can never be sent under another's session.
function syncRecordKey(userId: string): string {
  return `sync:v1:${userId}`;
}

/**
 * Hand-written guards, not zod: this module loads on every problem page via
 * Sandbox, and zod (used elsewhere for the API request schemas) must stay
 * out of that bundle. A corrupt or attacker-editable localStorage value
 * must never reach `JSON.parse`'s result typed as `SyncRecord` unchecked
 * (CLAUDE.md §5 — no unchecked casts), so every field is verified before use.
 */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isMarkKind(v: unknown): v is MarkKind {
  return v === "visited" || v === "solved";
}

function isMark(v: unknown): v is Mark {
  return isRecord(v) && typeof v.course === "string" && isMarkKind(v.kind) && typeof v.id === "string";
}

function isPendingDraft(v: unknown): v is PendingDraft {
  return isRecord(v) && typeof v.code === "string" && typeof v.updatedAt === "string" && typeof v.deleted === "boolean";
}

function isStash(v: unknown): v is Stash {
  return (
    isRecord(v) &&
    typeof v.code === "string" &&
    (v.updatedAt === null || typeof v.updatedAt === "string") &&
    typeof v.deleted === "boolean" &&
    (v.displaced === undefined || v.displaced === true)
  );
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** A record whose every value passes `test` — used for `drafts`/`baseRevs`/`stashes`. */
function isRecordOf<T>(v: unknown, test: (item: unknown) => item is T): v is Record<string, T> {
  return isRecord(v) && Object.values(v).every(test);
}

/**
 * Validates an already-parsed JSON value field by field. A missing field
 * defaults to `emptySyncRecord()`'s value; a present-but-wrong-shaped field
 * fails the whole record, so a merge queue is never built on a partially
 * trusted read — the same field could otherwise sync a `baseRev` string
 * where a number is assumed downstream.
 */
function parseSyncRecord(value: unknown): SyncRecord | null {
  if (!isRecord(value)) return null;
  const empty = emptySyncRecord();

  const marks = value.marks === undefined ? empty.marks : Array.isArray(value.marks) && value.marks.every(isMark) ? value.marks : null;
  if (marks === null) return null;

  const drafts = value.drafts === undefined ? empty.drafts : isRecordOf(value.drafts, isPendingDraft) ? value.drafts : null;
  if (drafts === null) return null;

  const baseRevs = value.baseRevs === undefined ? empty.baseRevs : isRecordOf(value.baseRevs, isFiniteNumber) ? value.baseRevs : null;
  if (baseRevs === null) return null;

  const stashes = value.stashes === undefined ? empty.stashes : isRecordOf(value.stashes, isStash) ? value.stashes : null;
  if (stashes === null) return null;

  return { marks, drafts, baseRevs, stashes };
}

export function readSyncRecord(s: Storage, userId: string): SyncRecord {
  return attempt(() => {
    const raw = s.getItem(syncRecordKey(userId));
    if (!raw) return emptySyncRecord();
    const parsed: unknown = JSON.parse(raw);
    return parseSyncRecord(parsed) ?? emptySyncRecord();
  }, emptySyncRecord());
}

export function writeSyncRecord(s: Storage, userId: string, record: SyncRecord): void {
  attempt(() => s.setItem(syncRecordKey(userId), JSON.stringify(record)), undefined);
}

export interface AnonymousSummary {
  visited: number;
  solved: number;
  drafts: number;
}

export function anonymousSummary(s: Storage, course: string, isKnown: (id: string) => boolean): AnonymousSummary {
  return {
    visited: readSet(visitedKey(course)).size,
    solved: readSet(solvedKey(course)).size,
    drafts: listLocalDrafts(s, isKnown).length,
  };
}

export function hasAnyData(sum: AnonymousSummary): boolean {
  return sum.visited + sum.solved + sum.drafts > 0;
}

/**
 * Everything that belongs to a learner; preferences stay. The legacy flat
 * keys go too: migrateLegacyProgress copies them into a missing namespaced
 * key, so leaving them would restore the last learner's older progress.
 */
const SYNCED = [/^course-progress:/, /^course-solved:/, /^dsa-course-progress$/, /^dsa-course-solved$/, /^dsa:sandbox:/, /^sync:/];

export function clearSyncedData(s: Storage): void {
  for (const key of keys(s)) {
    if (SYNCED.some((re) => re.test(key))) attempt(() => s.removeItem(key), undefined);
  }
}
