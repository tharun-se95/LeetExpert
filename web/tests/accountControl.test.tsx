// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Transport } from "@/lib/progress/api";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type SessionState = { data: { user: { id: string; name: string; email: string; image: string | null } } | null; isPending: boolean };
let session: SessionState = { data: null, isPending: false };
const ADA: SessionState = { data: { user: { id: "u1", name: "Ada Lovelace", email: "ada@example.com", image: null } }, isPending: false };

type Outcome = { data: null; error: { status: number } | null };
const signOut = vi.fn(async (): Promise<Outcome> => ({ data: null, error: null }));
const revokeSessions = vi.fn(async (): Promise<Outcome> => ({ data: null, error: null }));
vi.mock("@/lib/auth/client", () => ({
  authClient: {
    useSession: () => session,
    signOut: () => signOut(),
    revokeSessions: () => revokeSessions(),
  },
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/courses/dsa/arrays/intro" }));
const reload = vi.fn();
vi.mock("@/lib/progress/reloadPage", () => ({ reloadPage: () => reload() }));

const { AccountControl } = await import("@/components/auth/AccountControl");
const { SyncBridgeProvider, useSyncBridge } = await import("@/components/providers/SyncBridge");
const { SyncQueue } = await import("@/lib/progress/syncQueue");
const { SIGNOUT_PENDING_KEY } = await import("@/lib/auth/signOutDevice");

let root: Root | null = null;
let bridge: ReturnType<typeof useSyncBridge> | null = null;
const queues: InstanceType<typeof SyncQueue>[] = [];

function Probe() {
  const b = useSyncBridge();
  useEffect(() => {
    bridge = b;
  });
  return null;
}

beforeEach(() => {
  localStorage.clear();
  session = ADA;
});
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  bridge = null;
  for (const q of queues.splice(0)) q.dispose();
  document.body.innerHTML = "";
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function mount(authEnabled: boolean) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root!.render(<SyncBridgeProvider authEnabled={authEnabled}><Probe /><AccountControl /></SyncBridgeProvider>));
  return host;
}

function registerQueue(postMarks: Transport["postMarks"] = vi.fn(async () => 204)) {
  const transport: Transport = { getMarks: vi.fn(), postMarks, getDrafts: vi.fn(), putDraft: vi.fn() };
  const queue = new SyncQueue({ storage: localStorage, userId: "u1", transport });
  queues.push(queue);
  act(() => bridge!.setRuntime({ userId: "u1", queue, transport }));
  return queue;
}

function openMenu(host: HTMLElement) {
  act(() => host.querySelector("button")!.click());
}
const item = (label: string) =>
  [...document.querySelectorAll('[role="menuitem"]')].find((i) => i.textContent === label) as HTMLElement;
const dialog = () => document.querySelector('[role="dialog"]');
const dialogButton = (label: string) =>
  [...dialog()!.querySelectorAll("button")].find((b) => b.textContent === label)!;
const statusLine = () => document.querySelector("[data-sync-status]")!.textContent;
const warningDot = (host: HTMLElement) => host.querySelector("[data-sync-warning]");

async function click(el: Element) {
  await act(async () => {
    (el as HTMLElement).click();
    // The click handler awaits a dynamic import before it signs out.
    await new Promise((r) => setTimeout(r, 30));
  });
}

describe("AccountControl", () => {
  it("renders nothing when auth is not configured", () => {
    session = { data: null, isPending: false };
    expect(mount(false).innerHTML).toBe("");
  });

  it("reserves the avatar's space while the session loads", () => {
    session = { data: null, isPending: true };
    const host = mount(true);
    expect(host.querySelector("[data-account-placeholder]")).not.toBeNull();
  });

  it("signed out: a Sign in link that returns to this page", () => {
    session = { data: null, isPending: false };
    const links = [...mount(true).querySelectorAll("a")];
    expect(links.length).toBeGreaterThan(0);
    for (const a of links) {
      expect(a.getAttribute("href")).toBe("/sign-in?next=%2Fcourses%2Fdsa%2Farrays%2Fintro");
    }
  });

  it("signed in: an avatar button that opens the account menu", () => {
    const host = mount(true);
    const button = host.querySelector("button")!;
    expect(button.getAttribute("aria-label")).toBe("Account menu, signed in as Ada Lovelace");
    expect(button.textContent).toContain("AL");
    act(() => button.click());
    const menu = document.querySelector('[role="menu"]')!;
    const items = [...menu.querySelectorAll('[role="menuitem"]')].map((i) => i.textContent);
    expect(items).toEqual(["Sign out", "Sign out everywhere", "Download my data", "Delete account"]);
    expect(document.body.textContent).toContain("ada@example.com");
  });
});

describe("the sync status in the menu", () => {
  it("does not claim 'Synced' before a runtime exists", () => {
    const host = mount(true);
    openMenu(host);
    expect(statusLine()).toBe("Connecting…");
    expect(warningDot(host)).toBeNull();
  });

  it("with a runtime, reads the queue", () => {
    const host = mount(true);
    registerQueue();
    openMenu(host);
    expect(statusLine()).toBe("Synced");
    expect(warningDot(host)).toBeNull();
  });

  it.each([
    ["failed", "Not syncing: something went wrong"],
    ["expired", "Not syncing: your session expired"],
    ["paused", "Not syncing: choose whether to add"],
  ] as const)("shows a fatal %s state with the warning dot", (issue, text) => {
    const host = mount(true);
    act(() => bridge!.setIssue(issue));
    openMenu(host);
    expect(statusLine()).toContain(text);
    expect(warningDot(host)).not.toBeNull();
    expect(host.textContent).toContain("sync needs attention");
  });

  it("offline while sign-in retries: says so without an alarm", () => {
    const host = mount(true);
    act(() => bridge!.setIssue("offline"));
    openMenu(host);
    expect(statusLine()).toBe("Offline, will retry");
    expect(warningDot(host)).toBeNull();
  });

  it("follows the issue as it changes", () => {
    const host = mount(true);
    act(() => bridge!.setIssue("failed"));
    openMenu(host);
    act(() => bridge!.setIssue(null));
    expect(statusLine()).toBe("Connecting…");
    expect(warningDot(host)).toBeNull();
  });
});

describe("Sign out", () => {
  it("with a runtime: ends the session, clears the device, stops the sync flow, reloads", async () => {
    const host = mount(true);
    localStorage.setItem("course-progress:dsa", '["a/b"]');
    registerQueue();
    const abort = vi.fn();
    act(() => bridge!.registerAbort(abort));
    openMenu(host);
    await click(item("Sign out"));
    expect(signOut).toHaveBeenCalledOnce();
    expect(abort).toHaveBeenCalledOnce();
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("everywhere: revokes every session first", async () => {
    const host = mount(true);
    registerQueue();
    openMenu(host);
    await click(item("Sign out everywhere"));
    expect(revokeSessions).toHaveBeenCalledOnce();
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("a dead network is a failed sign-out, not a successful one: the device is cleared and the sign-out stays pending", async () => {
    // better-auth resolves with `error` rather than throwing.
    signOut.mockResolvedValueOnce({ data: null, error: { status: 0 } });
    const host = mount(true);
    localStorage.setItem("course-progress:dsa", '["a/b"]');
    registerQueue();
    openMenu(host);
    await click(item("Sign out"));
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
    expect(localStorage.getItem(SIGNOUT_PENDING_KEY)).toBe("1");
  });

  it("a 401 means the session was already gone: signed out, nothing pending", async () => {
    signOut.mockResolvedValueOnce({ data: null, error: { status: 401 } });
    const host = mount(true);
    registerQueue();
    openMenu(host);
    await click(item("Sign out"));
    expect(localStorage.getItem(SIGNOUT_PENDING_KEY)).toBeNull();
  });

  it("changes that cannot sync in 3 s: tells the learner, and does not reload over the notice", async () => {
    const host = mount(true);
    localStorage.setItem("course-progress:dsa", '["a/b"]');
    const queue = registerQueue(vi.fn(() => new Promise<number>(() => {})));
    queue.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    vi.useFakeTimers();
    openMenu(host);
    await act(async () => {
      item("Sign out").click();
      await vi.advanceTimersByTimeAsync(3100);
    });
    expect(document.querySelector('[role="alert"]')!.textContent).toContain("hadn't synced");
    expect(reload).not.toHaveBeenCalled();
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
  });
});

describe("Sign out with progress that was never added to the account", () => {
  function seedUnmerged() {
    localStorage.setItem("course-progress:dsa", '["a/b","c/d"]');
    localStorage.setItem("course-solved:dsa", '["p/q"]');
  }

  it("asks first: nothing is signed out or cleared, and the sync flow is left running", async () => {
    const host = mount(true);
    seedUnmerged();
    const abort = vi.fn();
    act(() => bridge!.registerAbort(abort));
    act(() => bridge!.setIssue("paused"));
    openMenu(host);
    await click(item("Sign out"));
    expect(dialog()!.textContent).toContain("2 lessons visited");
    expect(dialog()!.textContent).toContain("1 problem solved");
    expect(dialog()!.textContent).toContain("deletes it from this device");
    expect(signOut).not.toHaveBeenCalled();
    expect(abort).not.toHaveBeenCalled();
    expect(localStorage.getItem("course-progress:dsa")).toBe('["a/b","c/d"]');
    expect(reload).not.toHaveBeenCalled();
  });

  it("Cancel keeps the progress and the session", async () => {
    const host = mount(true);
    seedUnmerged();
    openMenu(host);
    await click(item("Sign out"));
    await click(dialogButton("Cancel"));
    expect(dialog()).toBeNull();
    expect(signOut).not.toHaveBeenCalled();
    expect(localStorage.getItem("course-progress:dsa")).toBe('["a/b","c/d"]');
  });

  it("Reload and review it: reloads so the merge prompt returns, keeping the progress", async () => {
    const host = mount(true);
    seedUnmerged();
    openMenu(host);
    await click(item("Sign out"));
    await click(dialogButton("Reload and review it"));
    expect(reload).toHaveBeenCalledOnce();
    expect(signOut).not.toHaveBeenCalled();
    expect(localStorage.getItem("course-progress:dsa")).toBe('["a/b","c/d"]');
  });

  it("Sign out and delete it: only then is the progress cleared", async () => {
    const host = mount(true);
    seedUnmerged();
    openMenu(host);
    await click(item("Sign out"));
    await click(dialogButton("Sign out and delete it"));
    expect(signOut).toHaveBeenCalledOnce();
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
    expect(localStorage.getItem("course-solved:dsa")).toBeNull();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("'everywhere' survives the confirmation", async () => {
    const host = mount(true);
    seedUnmerged();
    openMenu(host);
    await click(item("Sign out everywhere"));
    expect(revokeSessions).not.toHaveBeenCalled();
    await click(dialogButton("Sign out and delete it"));
    expect(revokeSessions).toHaveBeenCalledOnce();
  });

  it("the landing page's local-only sandbox draft is not progress to protect", async () => {
    const host = mount(true);
    localStorage.setItem("dsa:sandbox:landing-find-pair:python", "x");
    openMenu(host);
    await click(item("Sign out"));
    expect(dialog()).toBeNull();
    expect(signOut).toHaveBeenCalledOnce();
  });
});

describe("Delete account", () => {
  it("needs the word typed, erases the device without the unmerged-progress question, and reloads", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const host = mount(true);
    localStorage.setItem("course-progress:dsa", '["a/b"]');
    const abort = vi.fn();
    act(() => bridge!.registerAbort(abort));
    openMenu(host);
    act(() => item("Delete account").click());
    const confirm = dialogButton("Delete account") as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    const input = dialog()!.querySelector("input")!;
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "delete");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect((dialogButton("Delete account") as HTMLButtonElement).disabled).toBe(false);
    await click(dialogButton("Delete account"));
    expect(fetchMock).toHaveBeenCalledWith("/api/account", { method: "DELETE", credentials: "same-origin" });
    expect(abort).toHaveBeenCalledOnce();
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("a failed deletion erases nothing and says so", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 500 })));
    const host = mount(true);
    localStorage.setItem("course-progress:dsa", '["a/b"]');
    openMenu(host);
    act(() => item("Delete account").click());
    const input = dialog()!.querySelector("input")!;
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "delete");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await click(dialogButton("Delete account"));
    expect(localStorage.getItem("course-progress:dsa")).toBe('["a/b"]');
    expect(signOut).not.toHaveBeenCalled();
    expect(document.querySelector('[role="alert"]')!.textContent).toContain("could not be deleted");
    expect(reload).not.toHaveBeenCalled();
  });

  it("a reopened dialog does not arrive with the word already typed", () => {
    const host = mount(true);
    openMenu(host);
    act(() => item("Delete account").click());
    const input = dialog()!.querySelector("input")!;
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "delete");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => dialogButton("Cancel").click());
    openMenu(host);
    act(() => item("Delete account").click());
    expect(dialog()!.querySelector("input")!.value).toBe("");
  });
});

describe("the headers", () => {
  it.each(["components/layout/Header.tsx", "components/landing/LandingHeader.tsx"])(
    "%s renders the control right after the theme toggle",
    (file) => {
      const src = readFileSync(join(__dirname, "..", "src", file), "utf8");
      expect(src).toMatch(/<ThemeToggle[^>]*\/>\s*<AccountControl \/>/);
    },
  );
});
