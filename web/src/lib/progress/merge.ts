import type { LocalDraft, MarksSnapshot, ServerDraft } from "./types";

/** Drafts saved before sync shipped have no timestamp; they lose every tie-break. */
export const LEGACY_UPDATED_AT = "1970-01-01T00:00:00.000Z";

export function unionIds(a: Iterable<string>, b: Iterable<string>): string[] {
  return [...new Set([...a, ...b])].sort();
}

export type MountResolution =
  | "keep-local"
  | "take-server"
  | "adopt-rev"
  | "local-wins-stash-server"
  | "server-wins-stash-local";

function sameContent(a: LocalDraft, b: ServerDraft): boolean {
  return a.deleted === b.deleted && (a.deleted || a.code === b.code);
}

/**
 * `localDirty` = this device changed the draft since it last saw `baseRev`.
 * The rev says whether the server moved; only when both moved does the
 * client clock get a say, and then only to pick which copy goes in the
 * editor — the other is stashed, never dropped.
 */
export function resolveOnMount(
  local: LocalDraft | null,
  localDirty: boolean,
  server: ServerDraft | null,
  baseRev: number,
): MountResolution {
  if (!server || server.rev === baseRev) return "keep-local";
  if (!local || !localDirty) return "take-server";
  if (sameContent(local, server)) return "adopt-rev";
  const localAt = Date.parse(local.updatedAt ?? LEGACY_UPDATED_AT);
  const serverAt = Date.parse(server.updatedAt);
  return localAt >= serverAt ? "local-wins-stash-server" : "server-wins-stash-local";
}

/** Mid-edit, what is on screen always stays; only the server copy can move aside. */
export function resolveOn409(local: LocalDraft, server: ServerDraft): "adopt-rev" | "stash-server" {
  return sameContent(local, server) ? "adopt-rev" : "stash-server";
}

export type OwnerAction = "merge" | "resume" | "replace";

export function ownerAction(owner: string | null, userId: string): OwnerAction {
  if (owner === null) return "merge";
  return owner === userId ? "resume" : "replace";
}

export type MergeDecision = "pull-only" | "merge-silently" | "ask";

/**
 * A brand-new account is the one case where "this device's progress is
 * yours" is near-certain; an existing one may be signing in on someone
 * else's computer, so it is asked.
 */
export function mergeDecision(localHasData: boolean, server: MarksSnapshot): MergeDecision {
  if (!localHasData) return "pull-only";
  const serverHasData = server.visited.length > 0 || server.solved.length > 0 || server.hasDrafts;
  return serverHasData ? "ask" : "merge-silently";
}
