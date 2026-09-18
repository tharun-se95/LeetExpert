// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PutOutcome, Transport } from "../src/lib/progress/api";
import { SyncQueue } from "../src/lib/progress/syncQueue";
import {
  beginSignIn, completeMerge, prepareDevice, type FlowDeps,
} from "../src/lib/progress/signInFlow";
import { emptySyncRecord, readLocalDraft, readOwner, readSyncRecord, writeLocalDraft, writeOwner } from "../src/lib/progress/localStore";
import { readSet, solvedKey, visitedKey } from "../src/components/providers/progressStorage";
import type { MarksSnapshot } from "../src/lib/progress/types";

const EMPTY: MarksSnapshot = { visited: [], solved: [], hasDrafts: false };

function transport(server: MarksSnapshot, over: Partial<Transport> = {}): Transport {
  return {
    getMarks: vi.fn(async () => server),
    postMarks: vi.fn(async () => 204),
    getDrafts: vi.fn(async () => ({})),
    putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "ok", rev: 1 })),
    ...over,
  };
}

function deps(t: Transport, userId = "u1"): FlowDeps {
  const queue = new SyncQueue({ storage: localStorage, userId, transport: t });
  return { storage: localStorage, userId, course: "dsa", transport: t, queue, isKnownSandbox: (id) => id === "two-sum" };
}

function seedAnonymous() {
  localStorage.setItem(visitedKey("dsa"), JSON.stringify(["arrays/intro"]));
  localStorage.setItem(solvedKey("dsa"), JSON.stringify(["hash-tables/two-sum"]));
  writeLocalDraft(localStorage, "two-sum", "python", "mine", "2026-09-18T11:00:00.000Z");
}

// Every queue a test builds is disposed: an offline flush arms a real backoff timer.
const queues: SyncQueue[] = [];
function tracked(t: Transport, userId = "u1"): FlowDeps {
  const d = deps(t, userId);
  queues.push(d.queue);
  return d;
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  for (const q of queues.splice(0)) q.dispose();
});

describe("owner cases", () => {
  it("replace clears the other account's data before anything else", () => {
    writeOwner(localStorage, "u2");
    seedAnonymous();
    expect(prepareDevice(localStorage, "u1")).toBe("replace");
    expect(readSet(visitedKey("dsa")).size).toBe(0);
    expect(readOwner(localStorage)).toBeNull();
  });

  it("resume pulls and unions without uploading", async () => {
    writeOwner(localStorage, "u1");
    localStorage.setItem(visitedKey("dsa"), JSON.stringify(["a/local"]));
    const t = transport({ ...EMPTY, visited: ["a/server"] });
    expect(await beginSignIn(tracked(t), prepareDevice(localStorage, "u1"))).toEqual({ kind: "ready" });
    expect([...readSet(visitedKey("dsa"))].sort()).toEqual(["a/local", "a/server"]);
    // Queued for the queue's own debounce, not sent inside the flow.
    expect(t.postMarks).not.toHaveBeenCalled();
  });

  it("resume queues a local mark the server lacks (made before the runtime registered)", async () => {
    writeOwner(localStorage, "u1");
    localStorage.setItem(visitedKey("dsa"), JSON.stringify(["a/local", "a/both"]));
    localStorage.setItem(solvedKey("dsa"), JSON.stringify(["p/solved"]));
    const t = transport({ ...EMPTY, visited: ["a/both", "a/server"], solved: [] });
    const d = tracked(t);
    await beginSignIn(d, prepareDevice(localStorage, "u1"));
    expect(d.queue.pendingCount()).toBe(2);
    await d.queue.flush();
    const sent = vi.mocked(t.postMarks).mock.calls.flatMap(([, marks]) => marks);
    expect(sent).toHaveLength(2);
    expect(sent).toEqual(expect.arrayContaining([
      { kind: "visited", id: "a/local" },
      { kind: "solved", id: "p/solved" },
    ]));
  });

  it("resume queues nothing when the server already has every local mark", async () => {
    writeOwner(localStorage, "u1");
    localStorage.setItem(visitedKey("dsa"), JSON.stringify(["a/one"]));
    localStorage.setItem(solvedKey("dsa"), JSON.stringify(["p/one"]));
    const t = transport({ ...EMPTY, visited: ["a/one", "a/two"], solved: ["p/one"] });
    const d = tracked(t);
    await beginSignIn(d, prepareDevice(localStorage, "u1"));
    expect(d.queue.pendingCount()).toBe(0);
  });
});

describe("merge flow (spec §7)", () => {
  it("empty device: pull only and take ownership", async () => {
    const t = transport({ ...EMPTY, solved: ["x/y"] });
    expect(await beginSignIn(deps(t), "merge")).toEqual({ kind: "ready" });
    expect([...readSet(solvedKey("dsa"))]).toEqual(["x/y"]);
    expect(readOwner(localStorage)).toBe("u1");
  });

  it("empty account: merges silently", async () => {
    seedAnonymous();
    const t = transport(EMPTY);
    expect(await beginSignIn(deps(t), "merge")).toEqual({ kind: "ready" });
    expect(t.postMarks).toHaveBeenCalled();
    expect(t.putDraft).toHaveBeenCalledWith(
      "two-sum",
      { lang: "python", code: "mine", updatedAt: "2026-09-18T11:00:00.000Z", deleted: false, baseRev: 0 },
      undefined,
    );
    expect(readOwner(localStorage)).toBe("u1");
  });

  it("existing account: asks, with counts from the local sets", async () => {
    seedAnonymous();
    const result = await beginSignIn(deps(transport({ ...EMPTY, visited: ["z/z"] })), "merge");
    expect(result).toEqual({ kind: "ask", summary: { visited: 1, solved: 1, drafts: 1 } });
    expect(readOwner(localStorage)).toBeNull();
  });

  it("Don't add: clears the anonymous data, then pulls", async () => {
    seedAnonymous();
    const t = transport({ ...EMPTY, visited: ["z/z"] });
    await completeMerge(deps(t), "discard");
    expect([...readSet(visitedKey("dsa"))]).toEqual(["z/z"]);
    expect(readLocalDraft(localStorage, "two-sum", "python")).toBeNull();
    expect(t.postMarks).not.toHaveBeenCalled();
    expect(readOwner(localStorage)).toBe("u1");
  });

  it("a conflicting draft: the newer copy stays, the other is stashed", async () => {
    seedAnonymous();
    const older = { code: "theirs", updatedAt: "2026-09-18T09:00:00.000Z", rev: 4, deleted: false };
    const putDraft = vi.fn<Transport["putDraft"]>()
      .mockResolvedValueOnce({ kind: "conflict", server: older })
      .mockResolvedValue({ kind: "ok", rev: 5 });
    const d = deps(transport(EMPTY, { putDraft }));
    await completeMerge(d, "add");
    expect(readLocalDraft(localStorage, "two-sum", "python")?.code).toBe("mine");
    expect(d.queue.stash("two-sum", "python")?.code).toBe("theirs");
  });

  it("a legacy draft loses to the server copy and is stashed, not lost", async () => {
    localStorage.setItem("dsa:sandbox:two-sum:python", "legacy");
    const server = { code: "theirs", updatedAt: "2026-09-18T09:00:00.000Z", rev: 4, deleted: false };
    const d = deps(transport(EMPTY, { putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "conflict", server })) }));
    await completeMerge(d, "add");
    expect(readLocalDraft(localStorage, "two-sum", "python")?.code).toBe("theirs");
    expect(d.queue.stash("two-sum", "python")?.code).toBe("legacy");
  });

  it("offline mid-merge: throws and does not take ownership, so it reruns", async () => {
    seedAnonymous();
    const t = transport(EMPTY, { postMarks: vi.fn(async () => 0) });
    await expect(completeMerge(deps(t), "add")).rejects.toThrow();
    expect(readOwner(localStorage)).toBeNull();
  });

  it("Don't add after a failed Add: the reloaded queue drops the anonymous writes it inherited", async () => {
    seedAnonymous();
    // First attempt: "Add" enqueues every mark, the flush fails, owner stays unwritten.
    const offline = tracked(transport(EMPTY, { postMarks: vi.fn(async () => 0) }));
    await expect(completeMerge(offline, "add")).rejects.toThrow();
    expect(readSyncRecord(localStorage, "u1").marks.length).toBeGreaterThan(0);
    offline.queue.dispose();

    // Reload: the persisted queue is read back, the server is now non-empty, so the learner is asked.
    const t = transport({ ...EMPTY, visited: ["z/z"] });
    const d = tracked(t);
    d.queue.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: "2026-09-18T11:00:00.000Z", deleted: false });
    expect(d.queue.pendingCount()).toBeGreaterThan(0);
    expect((await beginSignIn(d, "merge")).kind).toBe("ask");

    await completeMerge(d, "discard");
    await d.queue.flush();
    expect(t.postMarks).not.toHaveBeenCalled();
    expect(t.putDraft).not.toHaveBeenCalled();
    expect(d.queue.pendingCount()).toBe(0);
    expect(readSyncRecord(localStorage, "u1")).toEqual(emptySyncRecord());
    expect(readOwner(localStorage)).toBe("u1");
  });
});
