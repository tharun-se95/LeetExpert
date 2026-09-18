import { describe, expect, it } from "vitest";
import {
  mergeDecision, ownerAction, resolveOn409, resolveOnMount, unionIds,
} from "../src/lib/progress/merge";
import type { LocalDraft, ServerDraft } from "../src/lib/progress/types";

const server = (over: Partial<ServerDraft> = {}): ServerDraft => ({
  code: "server", updatedAt: "2026-09-18T10:00:00.000Z", rev: 3, deleted: false, ...over,
});
const local = (over: Partial<LocalDraft> = {}): LocalDraft => ({
  code: "local", updatedAt: "2026-09-18T11:00:00.000Z", deleted: false, ...over,
});

describe("unionIds", () => {
  it("is order-independent and deduplicated", () => {
    expect(unionIds(["b", "a"], ["c", "a"])).toEqual(["a", "b", "c"]);
    expect(unionIds(["c", "a"], ["b", "a"])).toEqual(unionIds(["b", "a"], ["c", "a"]));
  });
});

describe("resolveOnMount (spec §6.3)", () => {
  it("no server copy: keep local", () => {
    expect(resolveOnMount(local(), true, null, 0)).toBe("keep-local");
  });
  it("server unchanged since baseRev: keep local", () => {
    expect(resolveOnMount(local(), true, server({ rev: 3 }), 3)).toBe("keep-local");
  });
  it("a server copy older than baseRev is a stale answer: keep local, whether or not local is dirty", () => {
    // The GET can be answered from a state older than a PUT this device has
    // since had accepted; taking it would replace the freshly saved draft.
    expect(resolveOnMount(local(), false, server({ rev: 2 }), 3)).toBe("keep-local");
    expect(resolveOnMount(local(), true, server({ rev: 2 }), 3)).toBe("keep-local");
    expect(resolveOnMount(null, false, server({ rev: 2 }), 3)).toBe("keep-local");
  });
  it("server changed, local clean: take server", () => {
    expect(resolveOnMount(local(), false, server(), 2)).toBe("take-server");
    expect(resolveOnMount(null, false, server(), 0)).toBe("take-server");
  });
  it("both changed to identical code: adopt rev", () => {
    expect(resolveOnMount(local({ code: "same" }), true, server({ code: "same" }), 2)).toBe("adopt-rev");
  });
  it("both changed: newer updatedAt goes in the editor, the other is stashed", () => {
    expect(resolveOnMount(local(), true, server(), 2)).toBe("local-wins-stash-server");
    expect(
      resolveOnMount(local({ updatedAt: "2026-09-18T09:00:00.000Z" }), true, server(), 2),
    ).toBe("server-wins-stash-local");
  });
  it("a legacy draft without a timestamp loses to the server and is stashed", () => {
    expect(resolveOnMount(local({ updatedAt: null }), true, server(), 0)).toBe("server-wins-stash-local");
  });
});

describe("resolveOn409", () => {
  it("identical code adopts the rev; anything else stashes the server copy", () => {
    expect(resolveOn409(local({ code: "x" }), server({ code: "x" }))).toBe("adopt-rev");
    expect(resolveOn409(local(), server())).toBe("stash-server");
  });
});

describe("ownerAction (spec §7)", () => {
  it("covers the three cases", () => {
    expect(ownerAction(null, "u1")).toBe("merge");
    expect(ownerAction("u1", "u1")).toBe("resume");
    expect(ownerAction("u2", "u1")).toBe("replace");
  });
});

describe("mergeDecision (spec §7)", () => {
  const empty = { visited: [], solved: [], hasDrafts: false };
  it("nothing local: pull only", () => {
    expect(mergeDecision(false, { ...empty, visited: ["a/b"] })).toBe("pull-only");
  });
  it("empty account: merge silently", () => {
    expect(mergeDecision(true, empty)).toBe("merge-silently");
  });
  it("account with marks or only drafts: ask", () => {
    expect(mergeDecision(true, { ...empty, solved: ["a/b"] })).toBe("ask");
    expect(mergeDecision(true, { ...empty, hasDrafts: true })).toBe("ask");
  });
});
