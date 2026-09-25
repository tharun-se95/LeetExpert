// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ACCOUNT_HINT_KEY, ACCOUNT_HINT_SCRIPT, writeAccountHint } from "@/lib/auth/accountHint";

/**
 * The header's account control paints from this device's last visit (owner,
 * 2026-09-24: the avatar "does load late", ≈1.8s after navigation).
 */

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type SessionState = {
  data: { user: { id: string; name: string; email: string; image: string | null }; session: { id: string } } | null;
  isPending: boolean;
};
let session: SessionState = { data: null, isPending: false };
vi.mock("@/lib/auth/client", () => ({
  authClient: { useSession: () => session, signOut: vi.fn(), revokeSessions: vi.fn() },
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/courses/dsa/arrays/intro" }));

await import("@/components/auth/SessionControl");
const { AccountControl } = await import("@/components/auth/AccountControl");
const { AccountPlaceholder } = await import("@/components/auth/AccountPlaceholder");
const { SyncBridgeProvider } = await import("@/components/providers/SyncBridge");

const html = document.documentElement;
const runScript = () => new Function(ACCOUNT_HINT_SCRIPT)();
beforeEach(() => {
  localStorage.clear();
  html.removeAttribute("data-account");
  html.removeAttribute("style");
  session = { data: null, isPending: false };
});

describe("the early script", () => {
  it("marks a signed-out device, so the Sign in links paint at once", () => {
    writeAccountHint({ signedIn: false });
    runScript();
    expect(html.getAttribute("data-account")).toBe("out");
  });

  it("marks a signed-in device with its avatar, or its initials when there is none", () => {
    writeAccountHint({ signedIn: true, image: "https://avatars.githubusercontent.com/u/1?v=4", initials: "AL" });
    runScript();
    expect(html.getAttribute("data-account")).toBe("in");
    expect(html.style.getPropertyValue("--account-avatar")).toBe('url("https://avatars.githubusercontent.com/u/1?v=4")');
    html.removeAttribute("style");
    writeAccountHint({ signedIn: true, image: null, initials: "AL" });
    runScript();
    expect(html.style.getPropertyValue("--account-initials")).toBe('"AL"');
    expect(html.style.getPropertyValue("--account-avatar")).toBe("");
  });

  it("never puts an unsafe stored value into CSS, and leaves <html> alone on junk", () => {
    localStorage.setItem(ACCOUNT_HINT_KEY, JSON.stringify({ s: "in", img: 'https://x/a")};body{display:none', ini: "X" }));
    runScript();
    expect(html.style.getPropertyValue("--account-avatar")).toBe("");
    for (const junk of ["{", '{"s":"maybe"}', "in"]) {
      html.removeAttribute("data-account");
      localStorage.setItem(ACCOUNT_HINT_KEY, junk);
      runScript();
      expect(html.hasAttribute("data-account"), junk).toBe(false);
    }
  });

  it("stores no email or id, and drops a non-https avatar", () => {
    writeAccountHint({ signedIn: true, image: "javascript:alert(1)", initials: "ALX" });
    const stored = localStorage.getItem(ACCOUNT_HINT_KEY)!;
    expect(JSON.parse(stored)).toEqual({ s: "in", ini: "AL" });
  });
});

describe("the placeholder", () => {
  it("carries the working Sign in links for a signed-out hint, and the box for a signed-in one", () => {
    const markup = renderToStaticMarkup(<AccountPlaceholder />);
    expect(markup).toContain("data-account-placeholder");
    expect(markup).toMatch(/data-account-hint-out[^>]*>[\s\S]*href="\/sign-in\?next=%2Fcourses%2Fdsa%2Farrays%2Fintro"/);
  });

  it("is the bare box when the chunk failed, so no stale avatar stays up", () => {
    expect(renderToStaticMarkup(<AccountPlaceholder hinted={false} />)).not.toContain("data-account-hint-out");
  });

  it("has CSS for each variant, keyed on <html data-account>", () => {
    const css = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
    expect(css).toMatch(/html\[data-account="out"\] \[data-account-hint-out\] \{\s*display: contents;/);
    expect(css).toMatch(/html\[data-account="in"\] \[data-account-placeholder\] \{[^}]*var\(--account-avatar/);
  });

  it("is only scripted where sign-in exists", () => {
    const layout = readFileSync(join(__dirname, "..", "src", "app", "layout.tsx"), "utf8");
    expect(layout).toMatch(/isAuthConfigured\(\) \? <script id="account-hint" dangerouslySetInnerHTML=\{\{ __html: ACCOUNT_HINT_SCRIPT \}\} \/> : null/);
  });
});

describe("the real control remembers what it showed", () => {
  let root: Root | null = null;
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });
  async function mount() {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    await act(async () => {
      root!.render(<SyncBridgeProvider authEnabled><AccountControl /></SyncBridgeProvider>);
      await new Promise((r) => setTimeout(r, 30));
    });
  }

  it("writes 'out' for a signed-out session and the avatar for a signed-in one, never while pending", async () => {
    session = { data: null, isPending: true };
    await mount();
    expect(localStorage.getItem(ACCOUNT_HINT_KEY)).toBeNull();
    act(() => root!.unmount());
    session = { data: null, isPending: false };
    await mount();
    expect(localStorage.getItem(ACCOUNT_HINT_KEY)).toBe("out");
    act(() => root!.unmount());
    session = { data: { user: { id: "u1", name: "Ada Lovelace", email: "ada@example.com", image: "https://avatars.githubusercontent.com/u/1" }, session: { id: "s1" } }, isPending: false };
    await mount();
    expect(JSON.parse(localStorage.getItem(ACCOUNT_HINT_KEY)!)).toEqual({ s: "in", img: "https://avatars.githubusercontent.com/u/1", ini: "AL" });
  });
});
