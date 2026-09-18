// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let session: { user: { id: string } } | null = null;
const useSession = vi.fn(() => ({ data: session }));
vi.mock("@/lib/auth/client", () => ({ authClient: { useSession: () => useSession() } }));

const mounted = vi.fn();
const unmounted = vi.fn();
vi.mock("@/components/providers/SyncProvider", async () => {
  const { useEffect } = await import("react");
  return {
    default: function FakeSyncProvider({ userId }: { userId: string }) {
      // Mount-only on purpose: the provider's own state (a pending merge prompt)
      // outlives a userId change unless the element is remounted by its key.
      useEffect(() => {
        mounted(userId);
        return () => unmounted(userId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return null;
    },
  };
});

const { AccountRuntime } = await import("@/components/auth/AccountRuntime");
const { SyncBridgeProvider } = await import("@/components/providers/SyncBridge");

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  vi.clearAllMocks();
  session = null;
});

async function render(authEnabled: boolean) {
  root ??= createRoot(document.body.appendChild(document.createElement("div")));
  await act(async () => {
    root!.render(
      <SyncBridgeProvider authEnabled={authEnabled}>
        <AccountRuntime />
      </SyncBridgeProvider>,
    );
    // next/dynamic resolves its chunk on a later tick.
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe("AccountRuntime", () => {
  it("auth not configured: never reads the session and loads nothing", async () => {
    session = { user: { id: "u1" } };
    await render(false);
    expect(useSession).not.toHaveBeenCalled();
    expect(mounted).not.toHaveBeenCalled();
  });

  it("configured but signed out: loads nothing", async () => {
    await render(true);
    expect(useSession).toHaveBeenCalled();
    expect(mounted).not.toHaveBeenCalled();
  });

  it("signed in: mounts the provider for that user; another account remounts it", async () => {
    session = { user: { id: "u1" } };
    await render(true);
    expect(mounted).toHaveBeenCalledWith("u1");
    session = { user: { id: "u2" } };
    await render(true);
    expect(unmounted).toHaveBeenCalledWith("u1");
    expect(mounted).toHaveBeenCalledWith("u2");
  });

  it("sign-out unmounts the provider", async () => {
    session = { user: { id: "u1" } };
    await render(true);
    session = null;
    await render(true);
    expect(unmounted).toHaveBeenCalledWith("u1");
  });
});
