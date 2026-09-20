// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let session: { user: { id: string }; session: { id: string } } | null = null;
const signedIn = (userId: string, sessionId = `s-${userId}`) => ({ user: { id: userId }, session: { id: sessionId } });
const useSession = vi.fn(() => ({ data: session }));
const signOut = vi.fn(async (): Promise<{ error: { status: number } | null }> => ({ error: null }));
const revokeSessions = vi.fn(async (): Promise<{ error: { status: number } | null }> => ({ error: null }));
vi.mock("@/lib/auth/client", () => ({
  authClient: { useSession: () => useSession(), signOut: () => signOut(), revokeSessions: () => revokeSessions() },
}));
const reload = vi.fn();
vi.mock("@/lib/progress/reloadPage", () => ({ reloadPage: () => reload() }));

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

// Warm the chunk AccountRuntime loads on demand, so render()'s short wait is
// enough for it: its first import transforms the sign-out and sync modules.
await import("@/components/auth/SessionSync");
const { AccountRuntime } = await import("@/components/auth/AccountRuntime");
const { SyncBridgeProvider } = await import("@/components/providers/SyncBridge");

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  vi.clearAllMocks();
  session = null;
  localStorage.clear();
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
    session = signedIn("u1");
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
    session = signedIn("u1");
    await render(true);
    expect(mounted).toHaveBeenCalledWith("u1");
    session = signedIn("u2");
    await render(true);
    expect(unmounted).toHaveBeenCalledWith("u1");
    expect(mounted).toHaveBeenCalledWith("u2");
  });

  it("sign-out unmounts the provider", async () => {
    session = signedIn("u1");
    await render(true);
    session = null;
    await render(true);
    expect(unmounted).toHaveBeenCalledWith("u1");
  });

  describe("an offline sign-out left pending (spec deviation 6)", () => {
    const pend = (over: Partial<{ session: string | null; user: string | null; everywhere: boolean }> = {}) =>
      localStorage.setItem("signout-pending", JSON.stringify({ session: "s-u1", user: "u1", everywhere: false, ...over }));

    it("finishes it before sync can start, then reloads", async () => {
      pend();
      session = signedIn("u1");
      await render(true);
      expect(mounted).not.toHaveBeenCalled();
      expect(signOut).toHaveBeenCalledOnce();
      expect(revokeSessions).not.toHaveBeenCalled();
      expect(localStorage.getItem("signout-pending")).toBeNull();
      expect(reload).toHaveBeenCalledOnce();
    });

    it("a pending 'sign out everywhere' revokes every session again on the retry", async () => {
      pend({ everywhere: true });
      session = signedIn("u1");
      await render(true);
      expect(revokeSessions).toHaveBeenCalledOnce();
      expect(signOut).toHaveBeenCalledOnce();
      expect(reload).toHaveBeenCalledOnce();
    });

    it("still offline: sync stays off and the flag stays for the next load", async () => {
      pend();
      signOut.mockResolvedValueOnce({ error: { status: 0 } });
      session = signedIn("u1");
      await render(true);
      expect(mounted).not.toHaveBeenCalled();
      expect(JSON.parse(localStorage.getItem("signout-pending")!)).toMatchObject({ session: "s-u1" });
      expect(reload).not.toHaveBeenCalled();
    });

    it("a NEW session for the same account is not signed out by the old flag", async () => {
      pend();
      session = signedIn("u1", "s-fresh");
      await render(true);
      expect(signOut).not.toHaveBeenCalled();
      expect(reload).not.toHaveBeenCalled();
      expect(mounted).toHaveBeenCalledWith("u1");
      // Stale, so dropped rather than left to catch the next session too.
      expect(localStorage.getItem("signout-pending")).toBeNull();
    });

    it("another account's session is not signed out either", async () => {
      pend();
      session = signedIn("u2");
      await render(true);
      expect(signOut).not.toHaveBeenCalled();
      expect(mounted).toHaveBeenCalledWith("u2");
      expect(localStorage.getItem("signout-pending")).toBeNull();
    });

    it("with no session id recorded, it still applies to that account only", async () => {
      pend({ session: null });
      session = signedIn("u2");
      await render(true);
      expect(signOut).not.toHaveBeenCalled();
      expect(localStorage.getItem("signout-pending")).toBeNull();
    });

    it("the legacy value '1' names nobody and is still finished", async () => {
      localStorage.setItem("signout-pending", "1");
      session = signedIn("u1");
      await render(true);
      expect(mounted).not.toHaveBeenCalled();
      expect(signOut).toHaveBeenCalledOnce();
      expect(localStorage.getItem("signout-pending")).toBeNull();
    });

    it("with no flag, signing in does not sign out", async () => {
      session = signedIn("u1");
      await render(true);
      expect(signOut).not.toHaveBeenCalled();
      expect(mounted).toHaveBeenCalledWith("u1");
    });
  });
});
