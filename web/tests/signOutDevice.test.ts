// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SIGNOUT_PENDING_KEY, pendingSignOutApplies, readPendingSignOut, signOutDevice, syncWarning,
} from "../src/lib/auth/signOutDevice";
import { SyncQueue } from "../src/lib/progress/syncQueue";
import type { Transport } from "../src/lib/progress/api";

function queueWith(postMarks: Transport["postMarks"]) {
  const transport: Transport = {
    getMarks: vi.fn(), postMarks, getDrafts: vi.fn(), putDraft: vi.fn(),
  };
  const q = new SyncQueue({ storage: localStorage, userId: "u1", transport });
  q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
  return q;
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("course-progress:dsa", '["a/b"]');
  localStorage.setItem("code-lang", "python");
});

describe("signOutDevice (spec §5.4)", () => {
  it("flushes, ends the session, clears the device, tells other tabs", async () => {
    const order: string[] = [];
    const q = queueWith(vi.fn(async () => { order.push("flush"); return 204; }));
    const broadcast = vi.fn(() => order.push("broadcast"));
    const result = await signOutDevice({
      queue: q, storage: localStorage, broadcast,
      endSession: async () => { order.push("end"); },
    });
    expect(result).toEqual({ unsynced: false });
    expect(order).toEqual(["flush", "end", "broadcast"]);
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
    expect(localStorage.getItem("code-lang")).toBe("python");
  });

  it("tells other tabs only after this device is cleared, so a tab that reloads finds nothing", async () => {
    let seenByOtherTab: string | null = "not read";
    const q = queueWith(vi.fn(async () => 204));
    await signOutDevice({
      queue: q, storage: localStorage, endSession: async () => {},
      broadcast: () => { seenByOtherTab = localStorage.getItem("course-progress:dsa"); },
    });
    expect(seenByOtherTab).toBeNull();
  });

  it("stops the in-flight sign-in flow after the flush and before the clear", async () => {
    const order: string[] = [];
    const q = queueWith(vi.fn(async () => { order.push("flush"); return 204; }));
    await signOutDevice({
      queue: q, storage: localStorage, broadcast: () => {},
      // Before the clear, or the flow could write into what was just cleared;
      // after the flush, or a flow cut short would leave marks unsent.
      abort: () => { order.push(`abort:${localStorage.getItem("course-progress:dsa") === null ? "cleared" : "intact"}`); },
      endSession: async () => { order.push("end"); },
    });
    expect(order).toEqual(["flush", "abort:intact", "end"]);
  });

  it("reports a mark enqueued after the flush finished, since the clear drops it", async () => {
    const q = queueWith(vi.fn(async () => 204));
    const result = await signOutDevice({
      queue: q, storage: localStorage, broadcast: vi.fn(),
      // The session call is a network round trip; the learner can still click.
      endSession: async () => { q.enqueueMark({ course: "dsa", kind: "visited", id: "late/mark" }); },
    });
    expect(result).toEqual({ unsynced: true });
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
  });

  it("reports unsynced writes when the 3 s cap runs out, and still signs out", async () => {
    vi.useFakeTimers();
    const q = queueWith(vi.fn(() => new Promise<number>(() => {})));
    const done = signOutDevice({ queue: q, storage: localStorage, broadcast: vi.fn(), endSession: async () => {} });
    await vi.advanceTimersByTimeAsync(3000);
    expect(await done).toEqual({ unsynced: true });
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
    vi.useRealTimers();
  });

  describe("offline: clears the device and leaves the sign-out pending for the next load", () => {
    const offline = async (over: Partial<Parameters<typeof signOutDevice>[0]> = {}) => {
      await signOutDevice({
        queue: queueWith(vi.fn(async () => 204)), storage: localStorage, broadcast: vi.fn(),
        endSession: async () => { throw new Error("offline"); },
        ...over,
      });
    };

    it("names the session it was for", async () => {
      await offline({ session: { sessionId: "s1", userId: "u1" }, everywhere: true });
      expect(localStorage.getItem("course-progress:dsa")).toBeNull();
      expect(readPendingSignOut(localStorage)).toEqual({ session: "s1", user: "u1", everywhere: true });
    });

    it("falls back to the device's owner, read before the clear removes it", async () => {
      localStorage.setItem("sync:owner", "u9");
      await offline();
      expect(localStorage.getItem("sync:owner")).toBeNull();
      expect(readPendingSignOut(localStorage)).toEqual({ session: null, user: "u9", everywhere: false });
    });

    it("with no identity at all, records that none was known", async () => {
      await offline();
      expect(readPendingSignOut(localStorage)).toEqual({ session: null, user: null, everywhere: false });
    });
  });

  it("a sign-out that finished leaves nothing pending", async () => {
    await signOutDevice({
      queue: queueWith(vi.fn(async () => 204)), storage: localStorage, broadcast: vi.fn(),
      endSession: async () => {}, session: { sessionId: "s1", userId: "u1" },
    });
    expect(localStorage.getItem(SIGNOUT_PENDING_KEY)).toBeNull();
  });
});

describe("the pending sign-out flag", () => {
  const now = { sessionId: "s2", userId: "u1" };

  it("applies to the session it names, and to no other, even for the same account", () => {
    expect(pendingSignOutApplies({ session: "s2", user: "u1", everywhere: false }, now)).toBe(true);
    expect(pendingSignOutApplies({ session: "s1", user: "u1", everywhere: false }, now)).toBe(false);
  });

  it("without a session id, falls back to the account", () => {
    expect(pendingSignOutApplies({ session: null, user: "u1", everywhere: false }, now)).toBe(true);
    expect(pendingSignOutApplies({ session: null, user: "u2", everywhere: false }, now)).toBe(false);
  });

  it("naming nobody applies to whoever is signed in, as the old flag did", () => {
    expect(pendingSignOutApplies({ session: null, user: null, everywhere: false }, now)).toBe(true);
  });

  it("reads the legacy value '1' (and anything unreadable) as naming nobody, so it is still finished", () => {
    for (const raw of ["1", "not json", "{}", '{"session":1,"user":null,"everywhere":false}', "null"]) {
      localStorage.setItem(SIGNOUT_PENDING_KEY, raw);
      expect(readPendingSignOut(localStorage), raw).toEqual({ session: null, user: null, everywhere: false });
    }
  });

  it("is absent when nothing is pending", () => {
    expect(readPendingSignOut(localStorage)).toBeNull();
  });
});

describe("signOutDevice with progress that was never merged", () => {
  // No queue: the merge prompt was dismissed (or sign-in is still failing), so
  // this device's marks and drafts were never uploaded and never discarded.
  const noQueue = () => ({
    queue: null, storage: localStorage, broadcast: vi.fn(), endSession: vi.fn(async () => {}),
  });

  it("refuses to clear them, and touches nothing, until the learner confirms", async () => {
    localStorage.setItem("dsa:sandbox:two-sum:python", "def f(): pass");
    const deps = noQueue();
    const abort = vi.fn();
    const result = await signOutDevice({ ...deps, abort, isKnownSandbox: () => true });
    expect(result).toEqual({ unsynced: false, blocked: { visited: 1, solved: 0, drafts: 1 } });
    expect(localStorage.getItem("course-progress:dsa")).toBe('["a/b"]');
    expect(localStorage.getItem("dsa:sandbox:two-sum:python")).toBe("def f(): pass");
    expect(deps.endSession).not.toHaveBeenCalled();
    expect(deps.broadcast).not.toHaveBeenCalled();
    expect(abort).not.toHaveBeenCalled();
  });

  it("clears them once the learner has confirmed", async () => {
    const deps = noQueue();
    const result = await signOutDevice({ ...deps, discardUnmerged: true });
    expect(result).toEqual({ unsynced: false });
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
    expect(deps.endSession).toHaveBeenCalledOnce();
  });

  it("does not count a draft of a sandbox that never syncs", async () => {
    localStorage.clear();
    localStorage.setItem("dsa:sandbox:landing-find-pair:python", "x");
    const deps = noQueue();
    const result = await signOutDevice({ ...deps, isKnownSandbox: () => false });
    expect(result).toEqual({ unsynced: false });
    expect(deps.endSession).toHaveBeenCalledOnce();
  });

  it("signs out at once when the device holds nothing", async () => {
    localStorage.clear();
    const deps = noQueue();
    expect(await signOutDevice(deps)).toEqual({ unsynced: false });
    expect(deps.endSession).toHaveBeenCalledOnce();
  });

  it("with a live queue there is nothing unmerged: the queue holds the writes", async () => {
    const q = queueWith(vi.fn(async () => 204));
    expect(await signOutDevice({ queue: q, storage: localStorage, broadcast: vi.fn(), endSession: async () => {} }))
      .toEqual({ unsynced: false });
  });
});

describe("syncWarning", () => {
  const MIN = 60_000;
  it("warns for a revoked session, or 5+ minutes offline with writes pending", () => {
    expect(syncWarning("unauthorized", null, 0, 0)).toBe(true);
    expect(syncWarning("offline", 0, 1, 5 * MIN)).toBe(true);
    expect(syncWarning("offline", 0, 1, 5 * MIN - 1)).toBe(false);
    expect(syncWarning("offline", 0, 0, 10 * MIN)).toBe(false);
    expect(syncWarning("synced", null, 0, 10 * MIN)).toBe(false);
  });
});
