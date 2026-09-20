// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SyncBridgeProvider, useSyncBridge, type SyncRuntime } from "@/components/providers/SyncBridge";
import { useDraftSync, type DraftSyncApi } from "@/components/sandbox/useDraftSync";
import { DraftStashRow } from "@/components/sandbox/DraftStashRow";
import type { PutOutcome, Transport } from "@/lib/progress/api";
import { draftKey, readLocalDraft, writeLocalDraft } from "@/lib/progress/localStore";
import { LEGACY_UPDATED_AT } from "@/lib/progress/merge";
import { completeMerge } from "@/lib/progress/signInFlow";
import { SyncQueue } from "@/lib/progress/syncQueue";
import type { ServerDrafts } from "@/lib/progress/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const EARLY = "2026-09-18T09:00:00.000Z";
const LATE = "2026-09-18T11:00:00.000Z";

let root: Root | null = null;
let api: DraftSyncApi | null = null;
let setRuntimeRef: ((r: SyncRuntime | null) => void) | null = null;
let renders = 0;
const applied: [string, string | null][] = [];

beforeEach(() => {
  localStorage.clear();
  applied.length = 0;
  renders = 0;
  api = null;
  setRuntimeRef = null;
});
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

function runtimeWith(serverDrafts: ServerDrafts | (() => Promise<ServerDrafts>), userId = "u1") {
  const transport: Transport = {
    getMarks: vi.fn(async () => ({ visited: [], solved: [], hasDrafts: false })),
    postMarks: vi.fn(async () => 204),
    getDrafts: vi.fn(typeof serverDrafts === "function" ? serverDrafts : async () => serverDrafts),
    putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "ok", rev: 9 })),
  };
  const queue = new SyncQueue({ storage: localStorage, userId, transport });
  const runtime: SyncRuntime = { userId, queue, transport };
  return { runtime, queue, transport };
}

function Harness({ runtime, enabled = true }: { runtime: SyncRuntime | null; enabled?: boolean }) {
  const { setRuntime } = useSyncBridge();
  useEffect(() => {
    if (runtime) setRuntime(runtime);
  }, [runtime, setRuntime]);
  const sync = useDraftSync({ sandboxId: "two-sum", enabled, applyRemote: (l, c) => applied.push([l, c]) });
  // Published from an effect (every commit), not during render.
  useEffect(() => {
    setRuntimeRef = setRuntime;
    api = sync;
    renders += 1;
  });
  return null;
}

async function mount(runtime: SyncRuntime | null, enabled = true) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <SyncBridgeProvider authEnabled>
        <Harness runtime={runtime} enabled={enabled} />
      </SyncBridgeProvider>,
    ),
  );
}

describe("useDraftSync on mount (spec §6.3)", () => {
  it("clean local, newer server: takes the server copy into storage and the editor", async () => {
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: LATE, rev: 2, deleted: false } });
    await mount(runtime);
    expect(applied).toEqual([["python", "server"]]);
    expect(readLocalDraft(localStorage, "two-sum", "python")?.code).toBe("server");
    expect(queue.baseRev("two-sum", "python")).toBe(2);
  });

  it("both changed, local newer: local stays, server copy is stashed", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "mine", LATE);
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    queue.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: LATE, deleted: false });
    await mount(runtime);
    expect(applied).toEqual([]);
    expect(api!.stashes.python?.code).toBe("server");
    expect(api!.stashes.python?.displaced).toBeUndefined();
    expect(queue.baseRev("two-sum", "python")).toBe(2);
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(true);
  });

  it("both changed, server newer: server goes in the editor, local is stashed", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "mine", EARLY);
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: LATE, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    queue.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: EARLY, deleted: false });
    await mount(runtime);
    expect(applied).toEqual([["python", "server"]]);
    expect(api!.stashes.python?.code).toBe("mine");
    // It is this device's own copy, not "another device's".
    expect(api!.stashes.python?.displaced).toBe(true);
  });

  it("server newer: the older queued draft is dropped so it cannot flush over the server copy", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "mine", EARLY);
    const { runtime, queue, transport } = runtimeWith({ python: { code: "server", updatedAt: LATE, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    queue.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: EARLY, deleted: false });
    await mount(runtime);
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(false);
    await act(async () => queue.flush());
    expect(transport.putDraft).not.toHaveBeenCalled();
  });

  it("both changed but identical: the queued copy is dropped, the rev adopted, nothing stashed", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "same", EARLY);
    const { runtime, queue, transport } = runtimeWith({ python: { code: "same", updatedAt: LATE, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    queue.enqueueDraft("two-sum", "python", { code: "same", updatedAt: EARLY, deleted: false });
    await mount(runtime);
    expect(applied).toEqual([]);
    expect(api!.stashes.python).toBeUndefined();
    expect(queue.baseRev("two-sum", "python")).toBe(2);
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(false);
    await act(async () => queue.flush());
    expect(transport.putDraft).not.toHaveBeenCalled();
  });

  it("a server tombstone over a clean local draft resets to the starter", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "old", EARLY);
    const { runtime, queue } = runtimeWith({ python: { code: "", updatedAt: LATE, rev: 3, deleted: true } });
    queue.setBaseRev("two-sum", "python", 2);
    await mount(runtime);
    expect(applied).toEqual([["python", null]]);
    expect(readLocalDraft(localStorage, "two-sum", "python")).toBeNull();
  });

  it("a queued reset (tombstone) newer than the server copy is kept, not overwritten by it", async () => {
    // Storage has no draft after a reset, so reading storage alone would call
    // this "clean" and let the server's older code back in.
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    queue.enqueueDraft("two-sum", "python", { code: "", updatedAt: LATE, deleted: true });
    await mount(runtime);
    expect(applied).toEqual([]);
    expect(api!.stashes.python?.code).toBe("server");
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(true);
  });

  it("a draft saved before sync shipped (no timestamp) loses to a server copy", async () => {
    localStorage.setItem(draftKey("two-sum", "python"), "legacy");
    const { runtime } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 2, deleted: false } });
    await mount(runtime);
    expect(applied).toEqual([["python", "server"]]);
    expect(api!.stashes.python?.code).toBe("legacy");
  });

  it("a never-synced local draft the server lacks is uploaded, stamped legacy when it has no timestamp", async () => {
    localStorage.setItem(draftKey("two-sum", "python"), "legacy");
    const { runtime, queue } = runtimeWith({});
    const spy = vi.spyOn(queue, "enqueueDraft");
    await mount(runtime);
    expect(spy).toHaveBeenCalledWith("two-sum", "python", { code: "legacy", updatedAt: LEGACY_UPDATED_AT, deleted: false });
  });

  it("an edit typed while the pull is in flight is judged against the server copy, not overwritten", async () => {
    let release: (d: ServerDrafts) => void = () => {};
    const { runtime, queue } = runtimeWith(() => new Promise<ServerDrafts>((r) => (release = r)));
    queue.setBaseRev("two-sum", "python", 1);
    await mount(runtime);
    const at = new Date().toISOString();
    writeLocalDraft(localStorage, "two-sum", "python", "typed meanwhile", at);
    act(() => api!.recordEdit("python", "typed meanwhile", at));
    await act(async () => release({ python: { code: "server", updatedAt: EARLY, rev: 2, deleted: false } }));
    expect(applied).toEqual([]);
    expect(readLocalDraft(localStorage, "two-sum", "python")?.code).toBe("typed meanwhile");
    expect(api!.stashes.python?.code).toBe("server");
  });
});

/** A promise the test settles by hand, to pin the order two requests are answered in. */
function deferred<T>() {
  let resolve: (v: T) => void = () => {};
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe("the pull racing the flush SyncProvider starts on registration", () => {
  it("a 409 answered after the pull discarded the queued draft leaves the learner's copy in the stash", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "mine", EARLY);
    const put1 = deferred<PutOutcome>();
    const { runtime, queue, transport } = runtimeWith({ python: { code: "server", updatedAt: LATE, rev: 2, deleted: false } });
    transport.putDraft = vi.fn(() => put1.promise);
    queue.setBaseRev("two-sum", "python", 1);
    queue.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: EARLY, deleted: false });
    const flushing = queue.flush();
    await mount(runtime);
    expect(applied).toEqual([["python", "server"]]);
    expect(api!.stashes.python?.code).toBe("mine");

    put1.resolve({ kind: "conflict", server: { code: "server", updatedAt: LATE, rev: 2, deleted: false } });
    await act(async () => flushing);
    expect(api!.stashes.python?.code).toBe("mine");
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(false);
    expect(transport.putDraft).toHaveBeenCalledTimes(1);
  });

  it("a pull answered from a state older than a PUT that has since succeeded does not replace the saved draft", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "mine", LATE);
    const get = deferred<ServerDrafts>();
    const put1 = deferred<PutOutcome>();
    const put2 = deferred<PutOutcome>();
    const { runtime, queue, transport } = runtimeWith(() => get.promise);
    transport.putDraft = vi.fn().mockReturnValueOnce(put1.promise).mockReturnValueOnce(put2.promise);
    queue.setBaseRev("two-sum", "python", 1);
    queue.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: LATE, deleted: false });
    const flushing = queue.flush();
    await mount(runtime);

    put1.resolve({ kind: "conflict", server: { code: "theirs", updatedAt: EARLY, rev: 2, deleted: false } });
    await act(async () => {
      await Promise.resolve();
    });
    put2.resolve({ kind: "ok", rev: 3 });
    await act(async () => flushing);
    expect(queue.baseRev("two-sum", "python")).toBe(3);

    // The GET was answered from before the second PUT: rev 2, older than baseRev.
    await act(async () => get.resolve({ python: { code: "theirs", updatedAt: EARLY, rev: 2, deleted: false } }));
    expect(applied).toEqual([]);
    expect(readLocalDraft(localStorage, "two-sum", "python")?.code).toBe("mine");
    expect(queue.baseRev("two-sum", "python")).toBe(3);
  });
});

describe("edits typed before the runtime registers", () => {
  const TYPED = "2026-09-18T12:00:00.000Z";

  function typeBeforeRegistration(code = "typed early", at = TYPED) {
    writeLocalDraft(localStorage, "two-sum", "python", code, at);
    act(() => api!.recordEdit("python", code, at));
  }

  it("a returning learner's edit is uploaded once the runtime is live, when the server did not move", async () => {
    const { runtime, queue, transport } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 1, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    await mount(null);
    typeBeforeRegistration();
    await act(async () => setRuntimeRef!(runtime));
    expect(applied).toEqual([]);
    expect(queue.pendingDraft("two-sum", "python")).toMatchObject({ code: "typed early", updatedAt: TYPED });
    await act(async () => queue.flush());
    expect(transport.putDraft).toHaveBeenCalledWith("two-sum", expect.objectContaining({ code: "typed early", baseRev: 1 }), undefined);
  });

  it("when the server moved and is older, the edit stays and the server copy is stashed", async () => {
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    await mount(null);
    typeBeforeRegistration();
    await act(async () => setRuntimeRef!(runtime));
    expect(applied).toEqual([]);
    expect(readLocalDraft(localStorage, "two-sum", "python")?.code).toBe("typed early");
    expect(api!.stashes.python?.code).toBe("server");
  });

  it("when the server moved and is newer, the server copy goes in and the edit is stashed, never overwritten", async () => {
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: "2026-09-18T13:00:00.000Z", rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    await mount(null);
    typeBeforeRegistration();
    await act(async () => setRuntimeRef!(runtime));
    expect(applied).toEqual([["python", "server"]]);
    expect(api!.stashes.python?.code).toBe("typed early");
  });

  it("a reset made before registration is carried over as a tombstone", async () => {
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    await mount(null);
    act(() => api!.recordReset("python"));
    await act(async () => setRuntimeRef!(runtime));
    expect(queue.pendingDraft("two-sum", "python")).toMatchObject({ deleted: true });
  });

  it("is not uploaded if the device data was cleared meanwhile (the learner chose to discard it)", async () => {
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 1, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    await mount(null);
    typeBeforeRegistration();
    localStorage.removeItem(draftKey("two-sum", "python"));
    localStorage.removeItem(`${draftKey("two-sum", "python")}:at`);
    await act(async () => setRuntimeRef!(runtime));
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(false);
  });

  it("is forgotten on unmount: with storage cleared too, nothing reaches a later mount's queue", async () => {
    await mount(null);
    typeBeforeRegistration();
    act(() => root!.unmount());
    root = null;
    // The learner discarded it (or a "replace" cleared the device), so the
    // only trace left would be the in-memory note the unmount dropped.
    localStorage.removeItem(draftKey("two-sum", "python"));
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 1, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1, EARLY);
    await mount(runtime);
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(false);
  });

  it("survives an unmount through storage: a later mount recognises it and queues it", async () => {
    await mount(null);
    typeBeforeRegistration();
    act(() => root!.unmount());
    root = null;
    // The in-memory note is gone, but storage still holds the edit. It is
    // stamped after this slot's sync point, so it is a local change — before,
    // `dirty` read only the queue and called it clean, and the edit was
    // stranded here forever (and replaced outright once the server moved).
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 1, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1, EARLY);
    await mount(runtime);
    expect(queue.pendingDraft("two-sum", "python")).toMatchObject({ code: "typed early", updatedAt: TYPED });
  });

  it("is not remembered for a runtime that was disposed, only handed to the next one if storage still holds it", async () => {
    const first = runtimeWith({});
    await mount(first.runtime);
    first.queue.dispose();
    await act(async () => setRuntimeRef!(null));
    const disposedEnqueue = vi.spyOn(first.queue, "enqueueDraft");
    typeBeforeRegistration();
    const second = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 1, deleted: false } }, "u2");
    second.queue.setBaseRev("two-sum", "python", 1);
    await act(async () => setRuntimeRef!(second.runtime));
    expect(disposedEnqueue).not.toHaveBeenCalled();
    expect(second.queue.pendingDraft("two-sum", "python")).toMatchObject({ code: "typed early" });
  });

  it("is handed over once: a later runtime does not receive an edit the earlier one already took", async () => {
    const synced = { python: { code: "server", updatedAt: EARLY, rev: 1, deleted: false } } as const;
    const first = runtimeWith(synced);
    first.queue.setBaseRev("two-sum", "python", 1);
    const second = runtimeWith(synced, "u2");
    second.queue.setBaseRev("two-sum", "python", 1);
    await mount(null);
    typeBeforeRegistration();
    await act(async () => setRuntimeRef!(first.runtime));
    expect(first.queue.hasPendingDraft("two-sum", "python")).toBe(true);
    // Clear storage so only the in-memory note could still feed the second
    // runtime: this is about the handover, not about storage recovery, which
    // the test above covers.
    localStorage.removeItem(draftKey("two-sum", "python"));
    await act(async () => setRuntimeRef!(second.runtime));
    expect(second.queue.hasPendingDraft("two-sum", "python")).toBe(false);
  });

  it("stays inert when the caller did not opt in: nothing is remembered or uploaded", async () => {
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 1, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    await mount(null, false);
    typeBeforeRegistration();
    await act(async () => setRuntimeRef!(runtime));
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(false);
  });
});

describe("with no runtime the sandbox is unchanged", () => {
  it("makes no request, stays inert and never re-renders on its own", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await mount(null);
    // Rendered once: nothing in the hook set state or re-rendered the sandbox.
    expect(renders).toBe(1);
    const first = api!;
    const seen = renders;
    act(() => first.recordEdit("python", "x", LATE));
    act(() => first.recordReset("python"));
    expect(first.takeStash("python", "x")).toBeNull();
    act(() => first.dismiss("python"));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(applied).toEqual([]);
    expect(api!.stashes).toEqual({});
    expect(renders).toBe(seen);
  });

  it("stays inert when the caller disables it, even with a runtime registered", async () => {
    const { runtime, transport, queue } = runtimeWith({ python: { code: "server", updatedAt: LATE, rev: 2, deleted: false } });
    await mount(runtime, false);
    act(() => api!.recordEdit("python", "x", LATE));
    expect(transport.getDrafts).not.toHaveBeenCalled();
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(false);
    expect(applied).toEqual([]);
  });
});

describe("the runtime can go away mid-session", () => {
  it("stops enqueueing, clears stashes and unsubscribes when the runtime becomes null", async () => {
    const { runtime, queue } = runtimeWith({});
    const unsub = vi.fn();
    const realSubscribe = queue.subscribe.bind(queue);
    vi.spyOn(queue, "subscribe").mockImplementation((fn) => {
      const off = realSubscribe(fn);
      return () => {
        unsub();
        off();
      };
    });
    await mount(runtime);
    act(() => queue.setStash("two-sum", "python", { code: "other", updatedAt: EARLY, deleted: false }));
    expect(api!.stashes.python?.code).toBe("other");

    const enqueue = vi.spyOn(queue, "enqueueDraft");
    await act(async () => setRuntimeRef!(null));
    expect(unsub).toHaveBeenCalled();
    expect(api!.stashes).toEqual({});
    act(() => api!.recordEdit("python", "after sign-out", LATE));
    act(() => api!.recordReset("python"));
    expect(api!.takeStash("python", "x")).toBeNull();
    expect(enqueue).not.toHaveBeenCalled();
  });

  it("drops a pull that resolves after the runtime is gone", async () => {
    let release: (d: ServerDrafts) => void = () => {};
    const { runtime, queue } = runtimeWith(() => new Promise<ServerDrafts>((r) => (release = r)));
    await mount(runtime);
    await act(async () => setRuntimeRef!(null));
    await act(async () => release({ python: { code: "server", updatedAt: LATE, rev: 2, deleted: false } }));
    expect(applied).toEqual([]);
    expect(readLocalDraft(localStorage, "two-sum", "python")).toBeNull();
    expect(queue.baseRev("two-sum", "python")).toBe(0);
  });

  it("does not enqueue after unmount", async () => {
    const { runtime, queue } = runtimeWith({});
    await mount(runtime);
    const held = api!;
    const enqueue = vi.spyOn(queue, "enqueueDraft");
    act(() => root!.unmount());
    root = null;
    held.recordEdit("python", "late", LATE);
    held.recordReset("python");
    expect(enqueue).not.toHaveBeenCalled();
  });
});

describe("edits and stashes", () => {
  it("edits and resets are queued; a reset is a tombstone", async () => {
    const { runtime, queue } = runtimeWith({});
    await mount(runtime);
    act(() => api!.recordEdit("python", "x", LATE));
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(true);
    const spy = vi.spyOn(queue, "enqueueDraft");
    act(() => api!.recordReset("javascript"));
    expect(spy.mock.calls[0]![2]).toMatchObject({ code: "", deleted: true });
  });

  it("taking the stash keeps the displaced code as the new stash", async () => {
    const { runtime, queue } = runtimeWith({});
    await mount(runtime);
    act(() => queue.setStash("two-sum", "python", { code: "other", updatedAt: EARLY, deleted: false }));
    let taken = null as ReturnType<DraftSyncApi["takeStash"]>;
    act(() => {
      taken = api!.takeStash("python", "on screen");
    });
    expect(taken?.code).toBe("other");
    expect(api!.stashes.python?.code).toBe("on screen");
    expect(api!.stashes.python?.displaced).toBe(true);
    act(() => api!.dismiss("python"));
    expect(api!.stashes.python).toBeUndefined();
  });
});

describe("DraftStashRow", () => {
  function renderRow(onUse = vi.fn(), onDismiss = vi.fn()) {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    act(() =>
      root!.render(
        <DraftStashRow
          stash={{ code: "other", updatedAt: EARLY, deleted: false }}
          current="mine"
          lang="python"
          onUse={onUse}
          onDismiss={onDismiss}
        />,
      ),
    );
    const button = (label: string) => [...host.querySelectorAll("button")].find((b) => b.textContent === label)!;
    return { host, button, onUse, onDismiss };
  }

  it("names the situation and wires its three actions", () => {
    const { host, button, onUse, onDismiss } = renderRow();
    expect(host.textContent).toContain("A different version of this draft was saved on another device.");
    act(() => button("Use that version").click());
    act(() => button("Dismiss").click());
    expect(onUse).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
    act(() => button("Compare").click());
    expect(document.querySelector('[role="dialog"]')?.getAttribute("aria-label")).toBe("Compare draft versions");
  });

  it("says so when the stash is this device's own displaced version", () => {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    act(() =>
      root!.render(
        <DraftStashRow
          stash={{ code: "mine", updatedAt: EARLY, deleted: false, displaced: true }}
          current="server"
          lang="python"
          onUse={vi.fn()}
          onDismiss={vi.fn()}
        />,
      ),
    );
    expect(host.textContent).toContain("Your previous version of this draft was replaced");
    expect(host.textContent).not.toContain("another device");
    act(() => [...host.querySelectorAll("button")].find((b) => b.textContent === "Compare")!.click());
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Previous version");
    expect(document.querySelector('[role="dialog"]')?.textContent).not.toContain("Other device");
  });

  it("a draft the sign-in merge set aside is worded as the learner's own, not another device's", async () => {
    localStorage.setItem("dsa:sandbox:two-sum:python", "legacy");
    const server = { code: "theirs", updatedAt: EARLY, rev: 4, deleted: false };
    const transport: Transport = {
      getMarks: vi.fn(async () => ({ visited: [], solved: [], hasDrafts: true })),
      postMarks: vi.fn(async () => 204),
      getDrafts: vi.fn(async () => ({})),
      putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "conflict", server })),
    };
    const queue = new SyncQueue({ storage: localStorage, userId: "u1", transport });
    try {
      await completeMerge(
        { storage: localStorage, userId: "u1", course: "dsa", transport, queue, isKnownSandbox: (id) => id === "two-sum" },
        "add",
      );
      const stash = queue.stash("two-sum", "python");
      expect(stash).not.toBeNull();
      const host = document.createElement("div");
      document.body.append(host);
      root = createRoot(host);
      act(() => root!.render(<DraftStashRow stash={stash!} current="theirs" lang="python" onUse={vi.fn()} onDismiss={vi.fn()} />));
      expect(host.textContent).toContain("Your previous version of this draft was replaced");
      expect(host.textContent).not.toContain("another device");
    } finally {
      queue.dispose();
    }
  });

  it("Escape closes Compare without choosing either copy", () => {
    const { host, button, onUse, onDismiss } = renderRow();
    act(() => button("Compare").click());
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(onUse).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
    expect(host.textContent).toContain("A different version of this draft");
  });
});

describe("a draft edited with no runtime registered (regression)", () => {
  const TYPED = "2026-09-18T12:00:00.000Z";
  const LATEST = "2026-09-18T13:00:00.000Z";

  // The edit is typed while no runtime is registered and then carried only by
  // storage across the unmount that drops the hook's in-memory note. Judging
  // it by the queue alone called it clean, and a moved server replaced it with
  // no stash: silent, unrecoverable loss of the learner's own code.
  it("is not replaced by an older server copy, and the server copy is stashed instead", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "my unsaved work", TYPED);
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1, EARLY);
    await mount(runtime);
    expect(applied).toEqual([]);
    expect(readLocalDraft(localStorage, "two-sum", "python")?.code).toBe("my unsaved work");
    expect(api!.stashes.python?.code).toBe("server");
    expect(queue.pendingDraft("two-sum", "python")).toMatchObject({ code: "my unsaved work" });
  });

  it("is stashed, not dropped, when the server copy is newer and wins the editor", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "my unsaved work", TYPED);
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: LATEST, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1, EARLY);
    await mount(runtime);
    expect(applied).toEqual([["python", "server"]]);
    expect(api!.stashes.python).toMatchObject({ code: "my unsaved work", displaced: true });
  });

  it("still counts as clean when it is exactly what was last synced", async () => {
    // Same timestamp as the sync point: nothing was typed since, so the
    // server's newer copy is taken without a spurious stash or upload.
    writeLocalDraft(localStorage, "two-sum", "python", "old", EARLY);
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: LATE, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1, EARLY);
    await mount(runtime);
    expect(applied).toEqual([["python", "server"]]);
    expect(api!.stashes.python).toBeUndefined();
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(false);
  });
});
