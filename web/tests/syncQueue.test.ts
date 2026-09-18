// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import type { PutOutcome, Transport } from "../src/lib/progress/api";
import { emptySyncRecord, readSyncRecord } from "../src/lib/progress/localStore";
import { BACKOFF_START_MS, SyncQueue } from "../src/lib/progress/syncQueue";
import type { ServerDraft } from "../src/lib/progress/types";

const AT = "2026-09-18T10:00:00.000Z";

// `Partial<Mocked<Transport>>`, not `Partial<Transport>`: every override passed
// in is a `vi.fn()` result, and typing `over` by the plain interface makes the
// merged object's property type a union with the bare function signature,
// which has no `.mock` — the assertions below need it.
function fakeTransport(over: Partial<Mocked<Transport>> = {}) {
  const t = {
    getMarks: vi.fn(async () => ({ visited: [], solved: [], hasDrafts: false })),
    postMarks: vi.fn(async () => 204),
    getDrafts: vi.fn(async () => ({})),
    putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "ok", rev: 1 })),
    ...over,
  };
  return t;
}

function queue(transport: Transport, userId = "u1") {
  return new SyncQueue({ storage: localStorage, userId, transport, now: () => Date.now() });
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("marks", () => {
  it("debounces 2 s after the last change", async () => {
    const t = fakeTransport();
    const q = queue(t);
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await vi.advanceTimersByTimeAsync(1999);
    expect(t.postMarks).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(t.postMarks).toHaveBeenCalledWith("dsa", [{ kind: "visited", id: "a/b" }], undefined);
    expect(q.pendingCount()).toBe(0);
    expect(q.status()).toBe("synced");
  });

  it("sends at most 500 marks per request", async () => {
    const t = fakeTransport();
    const q = queue(t);
    for (let i = 0; i < 1200; i++) q.enqueueMark({ course: "dsa", kind: "visited", id: `m/${i}` });
    await q.flush();
    expect(t.postMarks.mock.calls.map((c) => c[1].length)).toEqual([500, 500, 200]);
  });

  it("backs off from 2 s doubling to a 60 s cap while the server fails", async () => {
    const t = fakeTransport({ postMarks: vi.fn(async () => 503) });
    const q = queue(t);
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await q.flush();
    expect(q.status()).toBe("offline");
    const gaps = [2000, 4000, 8000, 16000, 32000, 60000, 60000];
    for (const gap of gaps) {
      const before = t.postMarks.mock.calls.length;
      await vi.advanceTimersByTimeAsync(gap - 1);
      expect(t.postMarks.mock.calls.length).toBe(before);
      await vi.advanceTimersByTimeAsync(1);
      expect(t.postMarks.mock.calls.length).toBe(before + 1);
    }
  });

  it("401 stops syncing and keeps the queue", async () => {
    const t = fakeTransport({ postMarks: vi.fn(async () => 401) });
    const q = queue(t);
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await q.flush();
    await vi.advanceTimersByTimeAsync(300000);
    expect(t.postMarks).toHaveBeenCalledTimes(1);
    expect(q.status()).toBe("unauthorized");
    expect(q.pendingCount()).toBe(1);
  });

  it("400 drops the change instead of blocking the queue", async () => {
    const t = fakeTransport({ postMarks: vi.fn(async () => 400) });
    const q = queue(t);
    vi.spyOn(console, "error").mockImplementation(() => {});
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await q.flush();
    expect(q.pendingCount()).toBe(0);
  });

  it("persists across reloads and is scoped to the user", async () => {
    const q = queue(fakeTransport({ postMarks: vi.fn(async () => 0) }));
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    q.dispose();
    expect(queue(fakeTransport()).pendingCount()).toBe(1);
    expect(queue(fakeTransport(), "u2").pendingCount()).toBe(0);
  });

  it("passes keepalive through for the hide flush", async () => {
    const t = fakeTransport();
    const q = queue(t);
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await q.flush({ keepalive: true });
    expect(t.postMarks).toHaveBeenCalledWith("dsa", [{ kind: "visited", id: "a/b" }], { keepalive: true });
  });
});

describe("drafts", () => {
  const server = (over: Partial<ServerDraft> = {}): ServerDraft => ({
    code: "theirs", updatedAt: AT, rev: 5, deleted: false, ...over,
  });

  it("debounces 1.5 s, sends the base rev, then records the new rev", async () => {
    const t = fakeTransport({ putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "ok", rev: 4 })) });
    const q = queue(t);
    q.setBaseRev("two-sum", "python", 3);
    q.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: AT, deleted: false });
    await vi.advanceTimersByTimeAsync(1500);
    expect(t.putDraft).toHaveBeenCalledWith(
      "two-sum", { lang: "python", code: "mine", updatedAt: AT, deleted: false, baseRev: 3 }, undefined,
    );
    expect(q.baseRev("two-sum", "python")).toBe(4);
    expect(q.hasPendingDraft("two-sum", "python")).toBe(false);
  });

  it("409 with different code: stash the server copy, keep what is on screen, re-send on top", async () => {
    const putDraft = vi
      .fn<Transport["putDraft"]>()
      .mockResolvedValueOnce({ kind: "conflict", server: server() })
      .mockResolvedValueOnce({ kind: "ok", rev: 6 });
    const q = queue(fakeTransport({ putDraft }));
    q.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: AT, deleted: false });
    await q.flush();
    expect(putDraft.mock.calls[1]![1].baseRev).toBe(5);
    expect(putDraft.mock.calls[1]![1].code).toBe("mine");
    expect(q.stash("two-sum", "python")).toEqual({ code: "theirs", updatedAt: AT, deleted: false });
    expect(q.baseRev("two-sum", "python")).toBe(6);
  });

  it("409 with identical code adopts the rev without a stash or a re-send", async () => {
    const putDraft = vi.fn<Transport["putDraft"]>().mockResolvedValueOnce({ kind: "conflict", server: server({ code: "same" }) });
    const q = queue(fakeTransport({ putDraft }));
    q.enqueueDraft("two-sum", "python", { code: "same", updatedAt: AT, deleted: false });
    await q.flush();
    expect(putDraft).toHaveBeenCalledTimes(1);
    expect(q.stash("two-sum", "python")).toBeNull();
    expect(q.baseRev("two-sum", "python")).toBe(5);
  });

  it("an edit made during the request is not cleared by that request's success", async () => {
    let release: (v: PutOutcome) => void = () => {};
    const putDraft = vi.fn<Transport["putDraft"]>().mockImplementationOnce(
      () => new Promise((r) => { release = r; }),
    );
    const q = queue(fakeTransport({ putDraft }));
    q.enqueueDraft("two-sum", "python", { code: "v1", updatedAt: AT, deleted: false });
    const flushing = q.flush();
    q.enqueueDraft("two-sum", "python", { code: "v2", updatedAt: AT, deleted: false });
    release({ kind: "ok", rev: 1 });
    await flushing;
    expect(q.hasPendingDraft("two-sum", "python")).toBe(true);
  });
});

describe("flushWithin", () => {
  it("reports false when the cap runs out with writes still queued", async () => {
    const q = queue(fakeTransport({ postMarks: vi.fn(() => new Promise<number>(() => {})) }));
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    const done = q.flushWithin(3000);
    await vi.advanceTimersByTimeAsync(3000);
    expect(await done).toBe(false);
  });

  it("clears its own timer once the flush finishes first", async () => {
    // A plain in-memory Storage, not `localStorage`: jsdom schedules its own
    // internal timer on every `setItem` (for the cross-tab storage event),
    // which would show up in `vi.getTimerCount()` and swamp the one timer
    // this test actually cares about.
    const memory = new Map<string, string>();
    const storage: Storage = {
      getItem: (k) => memory.get(k) ?? null,
      setItem: (k, v) => { memory.set(k, v); },
      removeItem: (k) => { memory.delete(k); },
      clear: () => memory.clear(),
      key: (i) => Array.from(memory.keys())[i] ?? null,
      get length() { return memory.size; },
    };
    const q = new SyncQueue({ storage, userId: "u1", transport: fakeTransport() });
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    const done = q.flushWithin(5000);
    // The flush itself resolves on a microtask (no timer involved) since the
    // mocked postMarks needs no real delay; only flushWithin's own race
    // timeout is a live timer, and it must be cleared once that race is won.
    expect(await done).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});

// Review round 1: four "Important" bugs the plan's code shipped with,
// reproduced by an independent reviewer against a scratch harness before
// this file's tests were extended. Kept alongside the originals rather than
// as a separate file so a future change to this module can't pass one suite
// while quietly regressing the other.
describe("review round 1", () => {
  it("a debounce that fires mid-flight does not swallow the follow-up run (lost flush)", async () => {
    // PUT #1 resolves on its own 2 s fake-timer delay. A second edit lands
    // 1.6 s in (still mid-flight) and arms a 1.5 s follow-up timer, due at
    // t=3100 — *before* PUT #1's timer fires at t=3500. Before the fix, that
    // follow-up's `flush()` call at t=3100 is swallowed by the single-flight
    // guard (a run is already in progress) and, because it also nulls out
    // `this.timer` on the way in, nothing is left to pick v2 up once PUT #1
    // finally resolves at t=3500 with a mismatched identity: the queue is
    // stuck reporting "syncing" with v2 never sent.
    const putDraft = vi
      .fn<Transport["putDraft"]>()
      .mockImplementationOnce(() => new Promise<PutOutcome>((r) => setTimeout(() => r({ kind: "ok", rev: 1 }), 2000)))
      .mockResolvedValueOnce({ kind: "ok", rev: 2 });
    const q = queue(fakeTransport({ putDraft }));
    q.enqueueDraft("s", "python", { code: "v1", updatedAt: AT, deleted: false });
    await vi.advanceTimersByTimeAsync(1500); // debounce fires; PUT #1 starts (resolves at t=3500)
    await vi.advanceTimersByTimeAsync(100); // t=1600
    q.enqueueDraft("s", "python", { code: "v2", updatedAt: AT, deleted: false }); // follow-up timer due at t=3100
    await vi.advanceTimersByTimeAsync(600000); // give every scheduled step all the time it needs

    expect(putDraft).toHaveBeenCalledTimes(2);
    expect(putDraft.mock.calls[1]![1].code).toBe("v2");
    expect(q.pendingCount()).toBe(0);
    expect(q.status()).toBe("synced");
  });

  it("enqueuing while offline does not reset the backoff timer to a fresh debounce", async () => {
    const postMarks = vi.fn<Transport["postMarks"]>(async () => 503);
    const q = queue(fakeTransport({ postMarks }));
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/0" });
    await vi.advanceTimersByTimeAsync(2000); // first attempt fails -> offline, retry armed for t=4000
    expect(postMarks).toHaveBeenCalledTimes(1);
    expect(q.status()).toBe("offline");

    await vi.advanceTimersByTimeAsync(1000); // t=3000
    // If this enqueue's debounce touched the timer, the retry would move to
    // t=3000+2000=5000 instead of firing at the backoff's own t=4000.
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/1" });
    await vi.advanceTimersByTimeAsync(999); // t=3999
    expect(postMarks).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1); // t=4000: the backoff timer fires on schedule
    expect(postMarks).toHaveBeenCalledTimes(2);
    expect(q.pendingCount()).toBe(2);
  });

  it("dispose stops an in-flight run: no further writes or requests once it resolves", async () => {
    let release: (n: number) => void = () => {};
    const postMarks = vi.fn<Transport["postMarks"]>(() => new Promise<number>((r) => { release = r; }));
    const putDraft = vi.fn<Transport["putDraft"]>(async () => ({ kind: "ok", rev: 1 }));
    const q = queue(fakeTransport({ postMarks, putDraft }));
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    q.enqueueDraft("two-sum", "python", { code: "secret", updatedAt: AT, deleted: false });
    const flushing = q.flush();

    q.dispose();
    localStorage.clear();
    release(204); // the hung request finally resolves after dispose
    await flushing;

    expect(postMarks).toHaveBeenCalledTimes(1);
    expect(putDraft).not.toHaveBeenCalled(); // run() must not have reached the draft loop
    expect(localStorage.getItem("sync:v1:u1")).toBeNull(); // no write after dispose
  });

  it("a thrown transport error is a network failure, not a crash", async () => {
    const putDraft = vi
      .fn<Transport["putDraft"]>()
      .mockRejectedValueOnce(new Error("body read failed"))
      .mockResolvedValueOnce({ kind: "ok", rev: 1 });
    const q = queue(fakeTransport({ putDraft }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    q.enqueueDraft("two-sum", "python", { code: "v1", updatedAt: AT, deleted: false });

    await expect(q.flush()).resolves.toBeUndefined(); // must not reject
    expect(q.status()).toBe("offline");
    expect(q.hasPendingDraft("two-sum", "python")).toBe(true);

    await vi.advanceTimersByTimeAsync(BACKOFF_START_MS); // the scheduled retry
    expect(putDraft).toHaveBeenCalledTimes(2);
    expect(q.pendingCount()).toBe(0);
  });

  it("flushWithin resolves false rather than rejecting when the transport throws", async () => {
    const putDraft = vi.fn<Transport["putDraft"]>().mockRejectedValue(new Error("body read failed"));
    const q = queue(fakeTransport({ putDraft }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    q.enqueueDraft("two-sum", "python", { code: "v1", updatedAt: AT, deleted: false });

    await expect(q.flushWithin(3000)).resolves.toBe(false);
  });

  it("a 400 on a draft only drops it if no newer edit arrived during the request", async () => {
    let release: (v: PutOutcome) => void = () => {};
    const putDraft = vi.fn<Transport["putDraft"]>().mockImplementationOnce(
      () => new Promise((r) => { release = r; }),
    );
    const q = queue(fakeTransport({ putDraft }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    q.enqueueDraft("two-sum", "python", { code: "v1", updatedAt: AT, deleted: false });
    const flushing = q.flush();
    q.enqueueDraft("two-sum", "python", { code: "v2", updatedAt: AT, deleted: false });
    release({ kind: "error", status: 400 });
    await flushing;

    expect(q.hasPendingDraft("two-sum", "python")).toBe(true);
  });

  it("a 400 on a batch isolates the rejected mark instead of dropping the whole batch", async () => {
    const postMarks = vi.fn<Transport["postMarks"]>(async (_course, marks) =>
      marks.some((m) => m.id === "bad") ? 400 : 204,
    );
    const q = queue(fakeTransport({ postMarks }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    q.enqueueMark({ course: "dsa", kind: "visited", id: "good-1" });
    q.enqueueMark({ course: "dsa", kind: "visited", id: "bad" });
    q.enqueueMark({ course: "dsa", kind: "visited", id: "good-2" });

    await q.flush();

    expect(q.pendingCount()).toBe(0); // both good marks sent, "bad" dropped
    const singletonBadCalls = postMarks.mock.calls.filter(
      (c) => c[1].length === 1 && c[1][0]!.id === "bad",
    );
    expect(singletonBadCalls).toHaveLength(1); // "bad" was isolated to its own request
    const sentIds = postMarks.mock.calls.flatMap((c) => c[1].map((m) => m.id));
    expect(sentIds).toContain("good-1");
    expect(sentIds).toContain("good-2");
  });

  it("a keepalive flush during an in-flight run re-sends what's left once it settles", async () => {
    const postMarks = vi
      .fn<Transport["postMarks"]>()
      .mockResolvedValueOnce(503)
      .mockResolvedValueOnce(204);
    const q = queue(fakeTransport({ postMarks }));
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/1" });

    const first = q.flush();
    const second = q.flush({ keepalive: true });
    await first;
    await second;

    expect(postMarks).toHaveBeenCalledTimes(2);
    expect(postMarks.mock.calls[1]).toEqual(["dsa", [{ kind: "visited", id: "a/1" }], { keepalive: true }]);
    expect(q.pendingCount()).toBe(0);
  });
});

describe("reset", () => {
  it("drops pending marks, drafts, revs and stashes, cancels the armed timer and persists the empty record", async () => {
    const t = fakeTransport();
    const q = queue(t);
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    q.enqueueDraft("two-sum", "python", { code: "x", updatedAt: AT, deleted: false });
    q.setBaseRev("two-sum", "python", 3);
    q.setStash("two-sum", "python", { code: "old", updatedAt: AT, deleted: false });
    const notified = vi.fn();
    q.subscribe(notified);

    q.reset();

    expect(notified).toHaveBeenCalled();
    expect(q.pendingCount()).toBe(0);
    expect(q.hasPendingDraft("two-sum", "python")).toBe(false);
    expect(q.baseRev("two-sum", "python")).toBe(0);
    expect(q.stash("two-sum", "python")).toBeNull();
    await vi.advanceTimersByTimeAsync(60000);
    expect(t.postMarks).not.toHaveBeenCalled();
    expect(t.putDraft).not.toHaveBeenCalled();
    expect(readSyncRecord(localStorage, "u1")).toEqual(emptySyncRecord());
    q.dispose();
  });

  it("returns an offline queue to synced, and leaves an unauthorized one unauthorized", async () => {
    const offline = queue(fakeTransport({ postMarks: vi.fn(async () => 503) }));
    offline.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await offline.flush();
    expect(offline.status()).toBe("offline");
    offline.reset();
    expect(offline.status()).toBe("synced");
    expect(offline.offlineSince()).toBeNull();
    offline.dispose();

    const unauth = queue(fakeTransport({ postMarks: vi.fn(async () => 401) }), "u2");
    unauth.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await unauth.flush();
    unauth.reset();
    expect(unauth.status()).toBe("unauthorized");
    unauth.dispose();
  });

  it("writes nothing once disposed", () => {
    const q = queue(fakeTransport());
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    q.dispose();
    q.reset();
    expect(readSyncRecord(localStorage, "u1").marks).toHaveLength(1);
  });
});

describe("pendingDraft", () => {
  it("returns the queued edit, a queued reset as a tombstone, and null when nothing is queued", () => {
    const q = queue(fakeTransport());
    expect(q.pendingDraft("two-sum", "python")).toBeNull();
    q.enqueueDraft("two-sum", "python", { code: "x", updatedAt: AT, deleted: false });
    expect(q.pendingDraft("two-sum", "python")).toEqual({ code: "x", updatedAt: AT, deleted: false });
    q.enqueueDraft("two-sum", "python", { code: "", updatedAt: AT, deleted: true });
    expect(q.pendingDraft("two-sum", "python")).toMatchObject({ deleted: true });
    expect(q.pendingDraft("two-sum", "javascript")).toBeNull();
    q.dispose();
  });
});

describe("discardDraft", () => {
  it("removes one slot's queued write, persists, and cancels nothing else", async () => {
    const t = fakeTransport();
    const q = queue(t);
    q.enqueueDraft("two-sum", "python", { code: "old", updatedAt: AT, deleted: false });
    q.enqueueDraft("two-sum", "javascript", { code: "keep", updatedAt: AT, deleted: false });
    q.discardDraft("two-sum", "python");
    expect(q.hasPendingDraft("two-sum", "python")).toBe(false);
    expect(readSyncRecord(localStorage, "u1").drafts).not.toHaveProperty("two-sum:python");
    await q.flush();
    expect(t.putDraft).toHaveBeenCalledTimes(1);
    expect(t.putDraft.mock.calls[0]![1]).toMatchObject({ lang: "javascript", code: "keep" });
    q.dispose();
  });

  it("is a no-op for a slot with nothing queued", () => {
    const q = queue(fakeTransport());
    const notified = vi.fn();
    q.subscribe(notified);
    q.discardDraft("two-sum", "python");
    expect(notified).not.toHaveBeenCalled();
    q.dispose();
  });
});

describe("a draft response that arrives after its slot was discarded", () => {
  it("writes no stash and no rev, and does not re-send", async () => {
    // The sandbox's pull can resolve while the first PUT is unanswered, take
    // the server copy and discard the queued draft; the 409 then describes a
    // draft that no longer exists.
    let answer: (o: PutOutcome) => void = () => {};
    const t = fakeTransport({ putDraft: vi.fn(() => new Promise<PutOutcome>((r) => (answer = r))) });
    const q = queue(t);
    q.setBaseRev("two-sum", "python", 1);
    q.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: AT, deleted: false });
    const flushing = q.flush();
    q.setBaseRev("two-sum", "python", 2);
    q.discardDraft("two-sum", "python");
    answer({ kind: "conflict", server: { code: "theirs", updatedAt: AT, rev: 2, deleted: false } });
    await flushing;
    expect(q.stash("two-sum", "python")).toBeNull();
    expect(q.baseRev("two-sum", "python")).toBe(2);
    expect(t.putDraft).toHaveBeenCalledTimes(1);
    expect(q.hasPendingDraft("two-sum", "python")).toBe(false);
    q.dispose();
  });
});
