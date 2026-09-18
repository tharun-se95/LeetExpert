// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import type { PutOutcome, Transport } from "../src/lib/progress/api";
import { SyncQueue } from "../src/lib/progress/syncQueue";
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
});
