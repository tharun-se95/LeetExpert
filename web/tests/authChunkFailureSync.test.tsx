// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, Component, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// The App Router aliases next/dynamic to app-dynamic, whose loader is wrapped in
// React.lazy: a rejected import() throws during render. The pages build vitest
// resolves by default renders an error into `loading` instead, which would hide
// the very failure these tests are about.
vi.mock("next/dynamic", async () => {
  const app = await import("next/dist/shared/lib/app-dynamic");
  return { default: app.default };
});

// The sync runtime is the one chunk SessionSync loads itself, for signed-in
// visitors; when it cannot be fetched, sync simply does not start.
vi.mock("@/components/providers/SyncProvider", () => {
  throw new Error("SyncProvider chunk unavailable");
});
vi.mock("@/lib/auth/client", () => ({
  authClient: {
    useSession: () => ({ data: { user: { id: "u1" }, session: { id: "s1" } } }),
    signOut: vi.fn(),
    revokeSessions: vi.fn(),
  },
}));

const { SessionSync } = await import("@/components/auth/SessionSync");

class Catch extends Component<{ children: ReactNode; onError: (e: unknown) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    this.props.onError(e);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("SessionSync when the sync runtime chunk fails to load", () => {
  it("leaves the page rendered, with nothing syncing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const caught: unknown[] = [];
    const host = document.body.appendChild(document.createElement("div"));
    root = createRoot(host);
    await act(async () => {
      root!.render(
        <Catch onError={(e) => caught.push(e)}>
          <main>lesson content</main>
          <SessionSync />
        </Catch>,
      );
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(caught).toEqual([]);
    expect(host.textContent).toBe("lesson content");
  });
});
