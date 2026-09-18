export type MarkKind = "visited" | "solved";
export type DraftLang = "python" | "javascript";
export const DRAFT_LANGS: readonly DraftLang[] = ["python", "javascript"];
export interface Mark { course: string; kind: MarkKind; id: string }
/** A draft as the server holds it. `updatedAt` is ISO 8601. */
export interface ServerDraft { code: string; updatedAt: string; rev: number; deleted: boolean }
export type ServerDrafts = Partial<Record<DraftLang, ServerDraft>>;
export interface MarksSnapshot { visited: string[]; solved: string[]; hasDrafts: boolean }
/** A version kept aside so a conflict never drops code. */
export interface Stash { code: string; updatedAt: string | null; deleted: boolean }
export interface LocalDraft { code: string; updatedAt: string | null; deleted: boolean }
/** Lives here, not in schemas.ts, so the client queue does not pull zod and the registries. */
export const MARK_BATCH_MAX = 500;
/** BroadcastChannel name; here so the header can post to it without importing the sync chunk. */
export const AUTH_CHANNEL = "leetexpert-auth";

/** The only course that syncs; the Next.js course is disabled. */
export const SYNCED_COURSE = "dsa";
