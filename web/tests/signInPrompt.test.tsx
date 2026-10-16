// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { PROMPT_DEFERRED_KEY, deferPrompt, promptDeferred, viaSignIn } from "@/lib/auth/signInPrompt";
import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";

/**
 * The once-per-visit sign-in prompt (owner, 2026-09-24; spec
 * docs/superpowers/specs/2026-09-24-sign-in-prompt-design.md).
 */

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Session = { data: unknown; isPending: boolean };
let session: Session = { data: null, isPending: false };
let authEnabled = true;
const social = vi.fn(async () => ({ error: null }));
const params = new URLSearchParams();

vi.mock("@/lib/auth/client", () => ({
  authClient: { signIn: { social }, useSession: () => session },
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/courses/dsa/arrays/intro",
  useSearchParams: () => params,
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock("@/components/providers/SyncBridge", () => ({ useSyncBridge: () => ({ authEnabled }) }));

const { SignInPrompt } = await import("@/components/auth/SignInPrompt");
const { SignInPromptGate } = await import("@/components/auth/SignInPromptGate");
const { SignInButtons } = await import("@/app/sign-in/SignInButtons");

let root: Root | null = null;
let host: HTMLElement;
beforeEach(() => {
  session = { data: null, isPending: false };
  authEnabled = true;
  sessionStorage.clear();
  host = document.createElement("div");
  document.body.append(host);
});
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});
function render(node: React.ReactNode) {
  root = createRoot(host);
  act(() => root!.render(node));
}
const dialog = () => document.querySelector('[role="dialog"]');

describe("the visit's memory", () => {
  it("defers for this visit in sessionStorage, and counts blocked storage as deferred", () => {
    expect(promptDeferred()).toBe(false);
    deferPrompt();
    expect(sessionStorage.getItem(PROMPT_DEFERRED_KEY)).toBe("later");
    expect(promptDeferred()).toBe(true);
    const throwing = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
    expect(promptDeferred(throwing)).toBe(true);
    expect(() => deferPrompt(throwing)).not.toThrow();
  });

  it("routes a landing link through /sign-in with the target as next", () => {
    expect(viaSignIn("/courses/dsa")).toBe("/sign-in?next=%2Fcourses%2Fdsa");
  });
});

describe("SignInPrompt", () => {
  it("opens for a signed-out visitor with the page's copy, both providers and a way on without an account", () => {
    const onDefer = vi.fn();
    render(<SignInPrompt onDefer={onDefer} />);
    const d = dialog()!;
    expect(d).not.toBeNull();
    expect(d.textContent).toContain(SIGN_IN_COPY.headline);
    expect(d.textContent).toContain("Continue with Google");
    expect(d.textContent).toContain("Continue with GitHub");
    const later = [...d.querySelectorAll("button")].find((b) => b.textContent === SIGN_IN_COPY.later)!;
    act(() => later.click());
    expect(onDefer).toHaveBeenCalledOnce();
  });

  it("returns to the page it was opened on after signing in", async () => {
    render(<SignInPrompt onDefer={() => {}} />);
    const google = [...dialog()!.querySelectorAll("button")].find((b) => b.textContent?.includes("Google"))!;
    await act(async () => google.click());
    expect(social).toHaveBeenCalledWith(expect.objectContaining({ provider: "google", callbackURL: "/courses/dsa/arrays/intro" }));
  });

  it("never shows while the session is unknown or for a signed-in reader", () => {
    session = { data: null, isPending: true };
    render(<SignInPrompt onDefer={() => {}} />);
    expect(dialog()).toBeNull();
    act(() => root!.unmount());
    root = null;
    session = { data: { user: { id: "u" } }, isPending: false };
    render(<SignInPrompt onDefer={() => {}} />);
    expect(dialog()).toBeNull();
  });

  it("lets Esc defer it: a dialog that could not be left would trap keyboard users", () => {
    const onDefer = vi.fn();
    render(<SignInPrompt onDefer={onDefer} />);
    act(() => void document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(onDefer).toHaveBeenCalled();
  });
});

describe("SignInPromptGate", () => {
  it("renders nothing, and loads nothing, when auth is off, the route is excluded or the visit deferred", () => {
    authEnabled = false;
    expect(renderToStaticMarkup(<SignInPromptGate allowed />)).toBe("");
    authEnabled = true;
    render(<SignInPromptGate allowed={false} />);
    expect(host.innerHTML).toBe("");
    act(() => root!.unmount());
    root = null;
    deferPrompt();
    render(<SignInPromptGate allowed />);
    expect(host.innerHTML).toBe("");
  });

  it("starts closed on the server and the first client render, so hydration agrees", () => {
    expect(renderToStaticMarkup(<SignInPromptGate allowed />)).toBe("");
  });
});

describe("/sign-in", () => {
  it("offers a way on without an account for non-course paths, but suppresses it for course routes", () => {
    params.set("next", "/about");
    render(<SignInButtons />);
    const later = [...host.querySelectorAll("a")].find((a) => a.textContent === SIGN_IN_COPY.later);
    expect(later).not.toBeUndefined();
    expect(later!.getAttribute("href")).toBe("/about");

    act(() => root?.unmount());
    root = null;

    params.set("next", "/courses/dsa");
    render(<SignInButtons />);
    const courseLater = [...host.querySelectorAll("a")].find((a) => a.textContent === SIGN_IN_COPY.later);
    expect(courseLater).toBeUndefined();
  });
});
