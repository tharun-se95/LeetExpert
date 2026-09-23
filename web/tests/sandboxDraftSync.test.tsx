// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Sandbox } from "@/components/sandbox/Sandbox";
import { SyncBridgeProvider, useSyncBridge, type SyncRuntime } from "@/components/providers/SyncBridge";
import type { PutOutcome, Transport } from "@/lib/progress/api";
import { draftKey, readLocalDraft } from "@/lib/progress/localStore";
import { SyncQueue } from "@/lib/progress/syncQueue";
import { CODE_LANG_STORAGE_KEY } from "@/lib/codeLanguages";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// A stand-in problem: the ids and shapes are all Sandbox reads here.
const SOURCE = JSON.stringify({
  id: "two-sum",
  fn: { python: "two_sum", javascript: "twoSum" },
  starter: { python: "def two_sum(nums, target):\n    pass\n", javascript: "function twoSum(nums, target) {}\n" },
  cases: [{ args: [[2, 7], 9], expect: [0, 1] }],
});

let root: Root | null = null;

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(CODE_LANG_STORAGE_KEY, "python");
});
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

function Register({ runtime }: { runtime: SyncRuntime | null }) {
  const { setRuntime } = useSyncBridge();
  useEffect(() => {
    if (runtime) setRuntime(runtime);
  }, [runtime, setRuntime]);
  return null;
}

function fakeRuntime(): { runtime: SyncRuntime; queue: SyncQueue; transport: Transport } {
  const transport: Transport = {
    getMarks: vi.fn(async () => ({ visited: [], solved: [], hasDrafts: false })),
    postMarks: vi.fn(async () => 204),
    getDrafts: vi.fn(async () => ({})),
    putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "ok", rev: 1 })),
  };
  const queue = new SyncQueue({ storage: localStorage, userId: "u1", transport });
  return { runtime: { userId: "u1", queue, transport }, queue, transport };
}

async function mount(runtime: SyncRuntime | null, syncDraft: boolean) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <SyncBridgeProvider authEnabled>
        <Register runtime={runtime} />
        <Sandbox source={SOURCE} variant="ide" syncDraft={syncDraft} />
      </SyncBridgeProvider>,
    ),
  );
  await editorsIn(host, 1);
  return host;
}

/** The editor is a dynamic chunk; wait for it rather than guessing a delay, which flakes under load. */
async function editorsIn(scope: ParentNode, count: number) {
  const deadline = Date.now() + 5000;
  while (scope.querySelectorAll(".cm-content").length < count && Date.now() < deadline) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
  }
}

describe("Sandbox with no sync runtime", () => {
  it("restores the saved draft and renders nothing new, whether or not the caller opted in", async () => {
    localStorage.setItem(draftKey("two-sum", "python"), "def two_sum(nums, target):\n    return [0, 1]\n");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const optedIn = await mount(null, true);
    expect(optedIn.querySelector('[role="status"]')).toBeNull();
    expect(optedIn.textContent).not.toContain("another device");
    const withSync = optedIn.textContent;
    act(() => root!.unmount());
    root = null;
    document.body.innerHTML = "";

    const plain = await mount(null, false);
    expect(plain.textContent).toBe(withSync);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(plain.querySelector(".cm-content")?.textContent).toContain("return [0, 1]");
  });
});

describe("Sandbox with a sync runtime", () => {
  it("shows the stash row, and Use that version swaps the code, queues it and keeps the displaced copy", async () => {
    const { runtime, queue } = fakeRuntime();
    localStorage.setItem(draftKey("two-sum", "python"), "mine");
    queue.setStash("two-sum", "python", { code: "from another device", updatedAt: "2026-09-18T09:00:00.000Z", deleted: false });
    const host = await mount(runtime, true);

    const row = host.querySelector('[role="status"]');
    expect(row?.textContent).toContain("A different version of this draft was saved on another device.");
    const button = (label: string) => [...host.querySelectorAll("button")].find((b) => b.textContent === label)!;
    await act(async () => button("Use that version").click());

    expect(readLocalDraft(localStorage, "two-sum", "python")?.code).toBe("from another device");
    expect(queue.pendingDraft("two-sum", "python")?.code).toBe("from another device");
    expect(queue.stash("two-sum", "python")?.code).toBe("mine");
    expect(host.querySelector(".cm-content")?.textContent).toContain("from another device");
  });

  it("a stash of a reset restores the starter as a reset, not as typed code", async () => {
    const { runtime, queue } = fakeRuntime();
    localStorage.setItem(draftKey("two-sum", "python"), "mine");
    queue.setStash("two-sum", "python", { code: "", updatedAt: null, deleted: true });
    const host = await mount(runtime, true);
    const button = [...host.querySelectorAll("button")].find((b) => b.textContent === "Use that version")!;
    await act(async () => button.click());
    expect(readLocalDraft(localStorage, "two-sum", "python")).toBeNull();
    expect(queue.pendingDraft("two-sum", "python")).toMatchObject({ deleted: true });
  });

  it("does not sync when the caller did not opt in (the landing sandbox)", async () => {
    const { runtime, queue, transport } = fakeRuntime();
    queue.setStash("two-sum", "python", { code: "other", updatedAt: null, deleted: false });
    const host = await mount(runtime, false);
    expect(host.querySelector('[role="status"]')).toBeNull();
    expect(transport.getDrafts).not.toHaveBeenCalled();
  });
});

describe("Compare", () => {
  it("shows the learner's two drafts read-only, and Escape closes it leaving both copies in place", async () => {
    const { runtime, queue } = fakeRuntime();
    localStorage.setItem(draftKey("two-sum", "python"), "on this device");
    queue.setStash("two-sum", "python", { code: "from another device", updatedAt: null, deleted: false });
    const host = await mount(runtime, true);
    const compare = [...host.querySelectorAll("button")].find((b) => b.textContent === "Compare")!;
    await act(async () => compare.click());
    const dialog = document.querySelector('[role="dialog"]')!;
    await editorsIn(dialog, 2);

    const panes = [...dialog.querySelectorAll(".cm-content")];
    expect(panes.map((p) => p.textContent)).toEqual(["on this device", "from another device"]);
    // Locked document, but still focusable so keyboard users can scroll it.
    expect(panes.every((p) => p.getAttribute("aria-readonly") === "true" && p.getAttribute("contenteditable") === "true")).toBe(true);

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(queue.stash("two-sum", "python")?.code).toBe("from another device");
    expect(localStorage.getItem(draftKey("two-sum", "python"))).toBe("on this device");
  });
});
