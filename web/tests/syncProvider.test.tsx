// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { PutOutcome, Transport } from "@/lib/progress/api";
import { AUTH_CHANNEL, type MarksSnapshot } from "@/lib/progress/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let server: MarksSnapshot = { visited: [], solved: [], hasDrafts: false };
const fake: Transport = {
  getMarks: vi.fn(async () => server),
  postMarks: vi.fn(async () => 204),
  getDrafts: vi.fn(async () => ({})),
  putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "ok", rev: 1 })),
};
vi.mock("@/lib/progress/api", async (orig) => ({
  ...(await orig<typeof import("@/lib/progress/api")>()),
  httpTransport: fake,
}));
const reload = vi.fn();
vi.mock("@/lib/progress/reloadPage", () => ({ reloadPage: () => reload() }));

// After the mock: a static import would load the mocked module before `fake` exists.
const { TransportError } = await import("@/lib/progress/api");
const { default: SyncProvider } = await import("@/components/providers/SyncProvider");
const { SyncBridgeProvider, useSyncBridge } = await import("@/components/providers/SyncBridge");
const { ProgressProvider, useProgress } = await import("@/components/providers/ProgressProvider");
const { SyncQueue } = await import("@/lib/progress/syncQueue");

let root: Root | null = null;
let bridge: ReturnType<typeof useSyncBridge> | null = null;
let progress: ReturnType<typeof useProgress> | null = null;

// Effect capture: reassigning module state during render is a side effect.
function Probe() {
  const b = useSyncBridge();
  const p = useProgress();
  useEffect(() => {
    bridge = b;
    progress = p;
  });
  return null;
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.mocked(fake.getMarks).mockImplementation(async () => server);
  vi.mocked(fake.postMarks).mockImplementation(async () => 204);
  server = { visited: [], solved: [], hasDrafts: false };
  bridge = null;
  progress = null;
});
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function mount(userId = "u1") {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(
      <SyncBridgeProvider authEnabled>
        <ProgressProvider courseSlug="dsa" totalCount={10} totalProblemCount={5} lessonProgressIds={[]}>
          <Probe />
          <SyncProvider userId={userId} />
        </ProgressProvider>
      </SyncBridgeProvider>,
    );
  });
}

const dialog = () => document.querySelector('[role="dialog"]');
const button = (label: string) =>
  [...dialog()!.querySelectorAll("button")].find((b) => b.textContent === label)!;

async function press(key: string) {
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  });
}

function seedLocal(ids = ["arrays/intro"]) {
  localStorage.setItem("course-progress:dsa", JSON.stringify(ids));
}

describe("SyncProvider", () => {
  it("empty device: pulls, takes ownership, shows no prompt", async () => {
    server = { visited: ["arrays/intro"], solved: [], hasDrafts: false };
    await mount();
    expect(localStorage.getItem("sync:owner")).toBe("u1");
    expect(JSON.parse(localStorage.getItem("course-progress:dsa")!)).toEqual(["arrays/intro"]);
    expect(dialog()).toBeNull();
    expect(bridge!.runtime).not.toBeNull();
  });

  it("re-reads localStorage after a pull, so the UI shows the server's marks", async () => {
    server = { visited: ["z/z"], solved: ["p/q"], hasDrafts: false };
    await mount();
    // pullMarks only writes storage: without a bump the provider keeps its
    // pre-pull (empty) state.
    expect([...progress!.visited]).toEqual(["z/z"]);
    expect([...progress!.solved]).toEqual(["p/q"]);
  });

  it("resume: a returning learner's pull also reaches the UI", async () => {
    localStorage.setItem("sync:owner", "u1");
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount();
    expect([...progress!.visited]).toEqual(["z/z"]);
    expect(bridge!.runtime).not.toBeNull();
  });

  it("existing account with local progress: asks, and Add merges", async () => {
    seedLocal();
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount();
    expect(dialog()!.textContent).toContain("1 lesson visited");
    // Dismissal leaves no runtime for the rest of the page's life, so the
    // dialog has to say what not choosing costs.
    expect(dialog()!.textContent).toContain("Nothing syncs from this device until you choose.");
    await act(async () => button("Add to my account").click());
    expect(fake.postMarks).toHaveBeenCalled();
    expect(localStorage.getItem("sync:owner")).toBe("u1");
    expect(dialog()).toBeNull();
    expect([...progress!.visited].sort()).toEqual(["arrays/intro", "z/z"]);
  });

  it("registers no runtime while the prompt is open, so nothing enqueues before the choice", async () => {
    seedLocal();
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount();
    expect(dialog()).not.toBeNull();
    // ProgressProvider enqueues on the runtime's queue the moment one is set;
    // a mark sent here would reach the account before "Don't add" is possible.
    expect(bridge!.runtime).toBeNull();
    await act(async () => button("Add to my account").click());
    expect(bridge!.runtime).not.toBeNull();
  });

  it("Don't add: nothing is uploaded, local progress is dropped, the account's marks arrive", async () => {
    seedLocal();
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount();
    await act(async () => button("Don't add").click());
    expect(fake.postMarks).not.toHaveBeenCalled();
    expect(localStorage.getItem("sync:owner")).toBe("u1");
    expect(JSON.parse(localStorage.getItem("course-progress:dsa")!)).toEqual(["z/z"]);
    expect([...progress!.visited]).toEqual(["z/z"]);
    expect(dialog()).toBeNull();
    expect(bridge!.runtime).not.toBeNull();
  });

  it("Esc means 'not yet': nothing is uploaded or discarded, and the prompt returns on the next load", async () => {
    seedLocal();
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount();
    await press("Escape");
    expect(dialog()).toBeNull();
    expect(fake.postMarks).not.toHaveBeenCalled();
    expect(localStorage.getItem("course-progress:dsa")).toBe(JSON.stringify(["arrays/intro"]));
    // No owner and no runtime: this device is still nobody's.
    expect(localStorage.getItem("sync:owner")).toBeNull();
    expect(bridge!.runtime).toBeNull();

    act(() => root?.unmount());
    root = null;
    await mount();
    expect(dialog()!.textContent).toContain("1 lesson visited");
  });

  it("Esc is ignored while a choice is being applied", async () => {
    seedLocal();
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount();
    let release!: () => void;
    vi.mocked(fake.postMarks).mockImplementationOnce(
      () => new Promise<number>((resolve) => (release = () => resolve(204))),
    );
    await act(async () => button("Add to my account").click());
    expect(button("Add to my account").hasAttribute("disabled")).toBe(true);
    await press("Escape");
    expect(dialog()).not.toBeNull();
    await act(async () => release());
    expect(dialog()).toBeNull();
  });

  it("offline during Add: the prompt stays, says so, disposes the dead queue, and a retry works", async () => {
    seedLocal();
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount();
    const dispose = vi.spyOn(SyncQueue.prototype, "dispose");
    vi.mocked(fake.postMarks).mockImplementationOnce(async () => {
      throw new TransportError(0);
    });
    await act(async () => button("Add to my account").click());
    expect(dialog()!.textContent).toContain("Couldn't reach the server");
    expect(localStorage.getItem("sync:owner")).toBeNull();
    expect(bridge!.runtime).toBeNull();
    expect(dispose).toHaveBeenCalledTimes(1);

    await act(async () => button("Add to my account").click());
    expect(dialog()).toBeNull();
    expect(localStorage.getItem("sync:owner")).toBe("u1");
    expect(bridge!.runtime).not.toBeNull();
  });

  it("offline at sign-in: no runtime, queue disposed, and the flow reruns on reconnect", async () => {
    const dispose = vi.spyOn(SyncQueue.prototype, "dispose");
    vi.mocked(fake.getMarks).mockRejectedValueOnce(new TransportError(0));
    await mount();
    expect(bridge!.runtime).toBeNull();
    expect(localStorage.getItem("sync:owner")).toBeNull();
    expect(dispose).toHaveBeenCalledTimes(1);

    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await act(async () => window.dispatchEvent(new Event("online")));
    expect(localStorage.getItem("sync:owner")).toBe("u1");
    expect(bridge!.runtime).not.toBeNull();
    expect([...progress!.visited]).toEqual(["z/z"]);
  });

  it("offline at sign-in: a backoff timer retries even if no online event ever fires", async () => {
    vi.useFakeTimers();
    vi.mocked(fake.getMarks).mockRejectedValueOnce(new TransportError(503));
    await mount();
    expect(bridge!.runtime).toBeNull();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(bridge!.runtime).not.toBeNull();
    expect(localStorage.getItem("sync:owner")).toBe("u1");
  });

  it("401 from a flow call is an expired session, not offline: no retry, nothing registered", async () => {
    vi.useFakeTimers();
    vi.mocked(fake.getMarks).mockRejectedValue(new TransportError(401));
    await mount();
    await act(async () => window.dispatchEvent(new Event("online")));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });
    expect(fake.getMarks).toHaveBeenCalledTimes(1);
    expect(bridge!.runtime).toBeNull();
    expect(localStorage.getItem("sync:owner")).toBeNull();
  });

  it("401 inside the queue flush (collapsed to status 0) is also an expired session, and the queue's data is kept", async () => {
    vi.useFakeTimers();
    seedLocal();
    vi.mocked(fake.postMarks).mockResolvedValue(401);
    server = { visited: [], solved: [], hasDrafts: false }; // new account: merge-silently
    await mount();
    await act(async () => window.dispatchEvent(new Event("online")));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });
    expect(fake.getMarks).toHaveBeenCalledTimes(1);
    expect(fake.postMarks).toHaveBeenCalledTimes(1);
    expect(bridge!.runtime).toBeNull();
    // The enqueued mark stays on disk for the same learner's next sign-in.
    const record = JSON.parse(localStorage.getItem("sync:v1:u1")!) as { marks: { id: string }[] };
    expect(record.marks.map((m) => m.id)).toEqual(["arrays/intro"]);
  });

  it("a mark made while the first-sign-in flow runs is queued once the runtime registers", async () => {
    vi.useFakeTimers();
    // Written after beginSignIn read storage for its summary: it is in
    // storage but nothing enqueued it, and ProgressProvider skips it later
    // because storage already has the id.
    vi.mocked(fake.getMarks).mockImplementationOnce(async () => {
      localStorage.setItem("course-progress:dsa", JSON.stringify(["late/mark"]));
      return server;
    });
    await mount();
    expect(bridge!.runtime).not.toBeNull();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });
    expect(fake.postMarks).toHaveBeenCalledWith("dsa", [{ kind: "visited", id: "late/mark" }], undefined);
  });

  it("the same holds when the mark is made during Add to my account", async () => {
    vi.useFakeTimers();
    seedLocal();
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount();
    vi.mocked(fake.postMarks).mockImplementationOnce(async () => {
      localStorage.setItem("course-progress:dsa", JSON.stringify(["arrays/intro", "late/mark"]));
      return 204;
    });
    await act(async () => button("Add to my account").click());
    expect(bridge!.runtime).not.toBeNull();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });
    const sent = vi.mocked(fake.postMarks).mock.calls.flatMap(([, marks]) => marks.map((m) => m.id));
    expect(sent).toContain("late/mark");
  });

  it("a returning learner's resume flow does not pull a second time", async () => {
    localStorage.setItem("sync:owner", "u1");
    await mount();
    expect(fake.getMarks).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["a 403", () => new TransportError(403)],
    ["an unparseable response", () => new Error("bad body")],
  ])("%s at sign-in is not retried: it stops, with no runtime", async (_name, make) => {
    vi.useFakeTimers();
    vi.mocked(fake.getMarks).mockRejectedValue(make());
    await mount();
    await act(async () => window.dispatchEvent(new Event("online")));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });
    expect(fake.getMarks).toHaveBeenCalledTimes(1);
    expect(bridge!.runtime).toBeNull();
    expect(localStorage.getItem("sync:owner")).toBeNull();
  });

  it("a 5xx at sign-in is retried like a dropped connection", async () => {
    vi.useFakeTimers();
    vi.mocked(fake.getMarks).mockRejectedValueOnce(new TransportError(502));
    await mount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(bridge!.runtime).not.toBeNull();
  });

  it("a non-retryable failure during Add says so in the dialog instead of the offline message", async () => {
    seedLocal();
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount();
    vi.mocked(fake.getMarks).mockRejectedValueOnce(new TransportError(403));
    await act(async () => button("Add to my account").click());
    expect(dialog()!.textContent).toContain("Reload the page");
    expect(dialog()!.textContent).not.toContain("Check your connection");
  });

  it("flushes with keepalive when the tab is hidden", async () => {
    const flush = vi.spyOn(SyncQueue.prototype, "flush");
    await mount();
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    await act(async () => document.dispatchEvent(new Event("visibilitychange")));
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    expect(flush).toHaveBeenCalledWith({ keepalive: true });
  });

  it("a queue that reports unauthorized stays registered with its data, and is not retried", async () => {
    vi.useFakeTimers();
    localStorage.setItem("sync:owner", "u1");
    await mount();
    const { queue } = bridge!.runtime!;
    vi.mocked(fake.postMarks).mockResolvedValue(401);
    queue.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });
    expect(queue.status()).toBe("unauthorized");
    await act(async () => window.dispatchEvent(new Event("online")));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });
    expect(fake.postMarks).toHaveBeenCalledTimes(1);
    expect(queue.pendingCount()).toBe(1);
    expect(bridge!.runtime).not.toBeNull();
  });

  it("sign-out in another tab: disposes the queue, unregisters the runtime, reloads", async () => {
    await mount();
    expect(bridge!.runtime).not.toBeNull();
    const dispose = vi.spyOn(SyncQueue.prototype, "dispose");
    const other = new BroadcastChannel(AUTH_CHANNEL);
    await act(async () => {
      other.postMessage("signed-out");
      await new Promise((r) => setTimeout(r, 20));
    });
    other.close();
    expect(dispose).toHaveBeenCalled();
    expect(bridge!.runtime).toBeNull();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("unmount disposes the queue, unregisters the runtime and stops listening", async () => {
    await mount();
    const dispose = vi.spyOn(SyncQueue.prototype, "dispose");
    act(() => root?.unmount());
    root = null;
    expect(dispose).toHaveBeenCalledTimes(1);
    const other = new BroadcastChannel(AUTH_CHANNEL);
    await act(async () => {
      other.postMessage("signed-out");
      await new Promise((r) => setTimeout(r, 20));
    });
    other.close();
    expect(reload).not.toHaveBeenCalled();
  });

  it("a different account on the same device: the previous one's queue is disposed and its data replaced", async () => {
    localStorage.setItem("sync:owner", "u1");
    seedLocal(["old/lesson"]);
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount("u2");
    expect(localStorage.getItem("sync:owner")).toBe("u2");
    expect(JSON.parse(localStorage.getItem("course-progress:dsa")!)).toEqual(["z/z"]);
    expect(dialog()).toBeNull();
  });

  describe("the account menu's view of sync (bridge issue)", () => {
    it("says nothing is wrong while syncing", async () => {
      await mount();
      expect(bridge!.runtime).not.toBeNull();
      expect(bridge!.issue).toBeNull();
    });

    it("paused while the merge prompt is open, and it stays after Esc", async () => {
      seedLocal();
      server = { visited: ["z/z"], solved: [], hasDrafts: false };
      await mount();
      expect(bridge!.issue).toBe("paused");
      await press("Escape");
      expect(bridge!.issue).toBe("paused");
    });

    it("clears once the learner chooses", async () => {
      seedLocal();
      server = { visited: ["z/z"], solved: [], hasDrafts: false };
      await mount();
      await act(async () => button("Add to my account").click());
      expect(bridge!.issue).toBeNull();
    });

    it("failed: an error a retry cannot fix, which the console alone used to carry", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(fake.getMarks).mockRejectedValue(new TransportError(403));
      await mount();
      expect(bridge!.runtime).toBeNull();
      expect(bridge!.issue).toBe("failed");
    });

    it("expired: a 401", async () => {
      vi.mocked(fake.getMarks).mockRejectedValue(new TransportError(401));
      await mount();
      expect(bridge!.issue).toBe("expired");
    });

    it("offline while the flow retries, then clear once it gets through", async () => {
      vi.mocked(fake.getMarks).mockRejectedValueOnce(new TransportError(0));
      await mount();
      expect(bridge!.issue).toBe("offline");
      await act(async () => window.dispatchEvent(new Event("online")));
      expect(bridge!.runtime).not.toBeNull();
      expect(bridge!.issue).toBeNull();
    });
  });

  describe("sign-out from this tab (abortSync)", () => {
    it("a pull that answers after the abort writes no marks and no owner, and registers nothing", async () => {
      let answer!: (s: MarksSnapshot) => void;
      // One deferred answer for every getMarks, so the pull inside finish() ends too.
      const pending = new Promise<MarksSnapshot>((resolve) => (answer = resolve));
      vi.mocked(fake.getMarks).mockImplementation(() => pending);
      await mount();
      act(() => bridge!.abortSync());
      // What signOutDevice does next: the device is emptied.
      localStorage.clear();
      await act(async () => answer({ visited: ["z/z"], solved: [], hasDrafts: false }));
      expect(localStorage.getItem("sync:owner")).toBeNull();
      expect(localStorage.getItem("course-progress:dsa")).toBeNull();
      expect(bridge!.runtime).toBeNull();
    });

    it("a queue the flow built but never registered is disposed by the abort", async () => {
      vi.mocked(fake.getMarks).mockImplementation(() => new Promise<MarksSnapshot>(() => {}));
      await mount();
      const dispose = vi.spyOn(SyncQueue.prototype, "dispose");
      act(() => bridge!.abortSync());
      expect(dispose).toHaveBeenCalledTimes(1);
    });

    it("the registered runtime's queue is left for signOutDevice, which still has to flush it", async () => {
      await mount();
      const dispose = vi.spyOn(SyncQueue.prototype, "dispose");
      act(() => bridge!.abortSync());
      expect(dispose).not.toHaveBeenCalled();
      expect(bridge!.runtime).not.toBeNull();
    });

    it("no retry fires after the abort", async () => {
      vi.useFakeTimers();
      vi.mocked(fake.getMarks).mockRejectedValue(new TransportError(0));
      await mount();
      act(() => bridge!.abortSync());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(120_000);
      });
      expect(fake.getMarks).toHaveBeenCalledTimes(1);
    });

    it("this tab does not reload on its own 'signed-out' broadcast, which would erase the menu's notice", async () => {
      await mount();
      act(() => bridge!.abortSync());
      const mine = new BroadcastChannel(AUTH_CHANNEL);
      await act(async () => {
        mine.postMessage("signed-out");
        await new Promise((r) => setTimeout(r, 20));
      });
      mine.close();
      expect(reload).not.toHaveBeenCalled();
    });
  });

  it("a manual retry that works ends the halt a fatal error set, so a reconnect retries the queue again", async () => {
    seedLocal();
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount();
    vi.mocked(fake.getMarks).mockRejectedValueOnce(new TransportError(403));
    await act(async () => button("Add to my account").click());
    expect(dialog()!.textContent).toContain("Reload the page");
    await act(async () => button("Add to my account").click());
    expect(bridge!.runtime).not.toBeNull();

    // Go offline with a pending write, then reconnect: onOnline must call retryNow.
    vi.mocked(fake.postMarks).mockRejectedValueOnce(new TransportError(0));
    const queue = bridge!.runtime!.queue;
    queue.enqueueMark({ course: "dsa", kind: "visited", id: "late/one" });
    await act(async () => queue.flush());
    expect(queue.status()).toBe("offline");
    vi.mocked(fake.postMarks).mockClear();
    await act(async () => window.dispatchEvent(new Event("online")));
    expect(fake.postMarks).toHaveBeenCalled();
  });
});
