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

// A chunk that cannot be fetched: offline, blocked, or gone after a deploy.
// A throwing mock factory makes the module's import() reject.
const { unavailable } = vi.hoisted(() => ({
  unavailable: (name: string) => () => {
    throw new Error(`${name} chunk unavailable`);
  },
}));
vi.mock("@/components/auth/SessionControl", unavailable("SessionControl"));
vi.mock("@/components/auth/SessionSync", unavailable("SessionSync"));
vi.mock("@/components/auth/SignedOutLine", unavailable("SignedOutLine"));
vi.mock("@/lib/auth/client", () => ({ authClient: { useSession: () => ({ data: null, isPending: false }) } }));
vi.mock("next/navigation", () => ({ usePathname: () => "/courses/dsa" }));

const { AccountControl } = await import("@/components/auth/AccountControl");
const { AccountRuntime } = await import("@/components/auth/AccountRuntime");
const { SyncHint } = await import("@/components/auth/SyncHint");
const { authChunk, NothingWhenFailed } = await import("@/components/auth/lazyAuthChunk");
const { SyncBridgeProvider } = await import("@/components/providers/SyncBridge");

// The app has no error boundary: whatever throws here would unmount the page.
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

async function page(children: ReactNode) {
  const caught: unknown[] = [];
  // React logs a caught render error; the assertion on `caught` is the test.
  vi.spyOn(console, "error").mockImplementation(() => {});
  const host = document.body.appendChild(document.createElement("div"));
  root = createRoot(host);
  await act(async () => {
    root!.render(
      <Catch onError={(e) => caught.push(e)}>
        <main>lesson content</main>
        {children}
      </Catch>,
    );
    await new Promise((r) => setTimeout(r, 50));
  });
  return { host, caught };
}

describe("an auth chunk that fails to load leaves the page working", () => {
  it("AccountControl: the lesson renders, the control stays a placeholder", async () => {
    const { host, caught } = await page(<SyncBridgeProvider authEnabled><AccountControl /></SyncBridgeProvider>);
    expect(caught).toEqual([]);
    expect(host.textContent).toContain("lesson content");
    expect(host.querySelector("[data-account-placeholder]")).not.toBeNull();
    expect(host.querySelector("a, button")).toBeNull();
  });

  it("AccountRuntime: the lesson renders and nothing syncs", async () => {
    const { host, caught } = await page(<SyncBridgeProvider authEnabled><AccountRuntime /></SyncBridgeProvider>);
    expect(caught).toEqual([]);
    expect(host.textContent).toContain("lesson content");
  });

  it("SyncHint: the lesson renders and no hint shows", async () => {
    const { host, caught } = await page(<SyncBridgeProvider authEnabled><SyncHint /></SyncBridgeProvider>);
    expect(caught).toEqual([]);
    expect(host.textContent).toBe("lesson content");
  });

  it("the helper itself, including a chunk that rejects on a later load", async () => {
    const Shown = authChunk(() => Promise.reject(new Error("gone")), { failed: NothingWhenFailed });
    const { host, caught } = await page(<Shown />);
    expect(caught).toEqual([]);
    expect(host.textContent).toBe("lesson content");
  });
});
