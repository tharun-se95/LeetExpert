// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ProgressProvider, useProgress } from "@/components/providers/ProgressProvider";
import { SyncBridgeProvider, useSyncBridge, type SyncRuntime } from "@/components/providers/SyncBridge";
import type { Transport } from "@/lib/progress/api";
import { SyncQueue } from "@/lib/progress/syncQueue";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
beforeEach(() => localStorage.clear());
afterEach(() => {
  act(() => root?.unmount());
  root = null;
});

function fakeRuntime() {
  const transport: Transport = {
    getMarks: vi.fn(async () => ({ visited: [], solved: [], hasDrafts: false })),
    postMarks: vi.fn(async () => 204),
    getDrafts: vi.fn(async () => ({})),
    putDraft: vi.fn(async () => ({ kind: "ok" as const, rev: 1 })),
  };
  const queue = new SyncQueue({ storage: localStorage, userId: "u1", transport });
  const enqueueMark = vi.spyOn(queue, "enqueueMark");
  const runtime: SyncRuntime = { userId: "u1", queue, transport };
  return { runtime, enqueueMark };
}

let api: { markVisited: (id: string) => void; visited: Set<string> } | null = null;
let bridge: ReturnType<typeof useSyncBridge> | null = null;

function Probe({ runtime }: { runtime: SyncRuntime | null }) {
  const progress = useProgress();
  const b = useSyncBridge();
  // Captured in an effect: reassigning module state during render is a side effect.
  useEffect(() => {
    api = progress;
    bridge = b;
  });
  useEffect(() => b.setRuntime(runtime), [b, runtime]);
  return null;
}

function mount(runtime: SyncRuntime | null) {
  const host = document.createElement("div");
  root = createRoot(host);
  act(() =>
    root!.render(
      <SyncBridgeProvider authEnabled>
        <ProgressProvider courseSlug="dsa" totalCount={1} totalProblemCount={1} lessonProgressIds={["a/b"]}>
          <Probe runtime={runtime} />
        </ProgressProvider>
      </SyncBridgeProvider>,
    ),
  );
}

describe("ProgressProvider through the sync bridge", () => {
  it("signed out: marks write localStorage only", () => {
    mount(null);
    act(() => api!.markVisited("a/b"));
    expect(JSON.parse(localStorage.getItem("course-progress:dsa")!)).toEqual(["a/b"]);
  });

  it("signed in: a new mark is enqueued once; a repeat visit is not", () => {
    const { runtime, enqueueMark } = fakeRuntime();
    mount(runtime);
    act(() => api!.markVisited("a/b"));
    act(() => api!.markVisited("a/b"));
    expect(enqueueMark).toHaveBeenCalledTimes(1);
    expect(enqueueMark).toHaveBeenCalledWith({ course: "dsa", kind: "visited", id: "a/b" });
  });

  it("bumpMarks re-reads localStorage after a pull", () => {
    mount(null);
    localStorage.setItem("course-progress:dsa", JSON.stringify(["x/y"]));
    act(() => bridge!.bumpMarks());
    expect([...api!.visited]).toEqual(["x/y"]);
  });
});
