// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_NEXT, safeNext } from "@/lib/auth/redirect";
import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type SocialResult = { data?: unknown; error: { status: number; message?: string } | null };
type Session = { data: { user: { id: string } } | null; isPending: boolean };
const social = vi.fn<(opts: unknown) => Promise<SocialResult>>(async () => ({ error: null }));
const replace = vi.fn();
let session: Session = { data: null, isPending: false };
const useSession = vi.fn((): Session => session);
let params = new URLSearchParams();
vi.mock("@/lib/auth/client", () => ({
  authClient: { signIn: { social }, useSession: () => useSession() },
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => params,
  useRouter: () => ({ replace }),
}));

const { SignInButtons } = await import("@/app/sign-in/SignInButtons");
const { default: SignInPage } = await import("@/app/sign-in/page");
// Warm the chunk SyncHint loads on demand: its first import is slower than the
// 20 ms the mounts below allow.
await import("@/components/auth/SignedOutLine");
const { SyncHint } = await import("@/components/auth/SyncHint");
const { SyncBridgeProvider } = await import("@/components/providers/SyncBridge");

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  social.mockReset();
  social.mockResolvedValue({ error: null });
  replace.mockClear();
  useSession.mockClear();
  session = { data: null, isPending: false };
  params = new URLSearchParams();
  vi.unstubAllEnvs();
});

function mount(node: React.ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root!.render(node));
  return host;
}

const button = (host: HTMLElement, name: string) =>
  [...host.querySelectorAll("button")].find((b) => b.textContent?.includes(name))!;

const TAB = String.fromCharCode(9);
const LF = String.fromCharCode(10);
const CR = String.fromCharCode(13);
const NUL = String.fromCharCode(0);

describe("safeNext (spec §5.1)", () => {
  it.each([
    ["/courses/dsa/arrays", "/courses/dsa/arrays"],
    ["/courses/dsa?x=1#y", "/courses/dsa?x=1#y"],
    ["/courses/dsa/problems/two-sum?tab=notes", "/courses/dsa/problems/two-sum?tab=notes"],
    // Percent-encoding that is not a path separator is ordinary.
    ["/courses/a%20b", "/courses/a%20b"],
    ["/courses/dsa?next=a%2Fb#c%5Cd", "/courses/dsa?next=a%2Fb#c%5Cd"],
    // Only the whole segment is the page; a sibling path is fine.
    ["/sign-in-help", "/sign-in-help"],
    // The parser's output is what is returned, so dot segments are gone.
    ["/courses/./dsa/../dsa/arrays", "/courses/dsa/arrays"],
    [null, DEFAULT_NEXT],
    [undefined, DEFAULT_NEXT],
    ["", DEFAULT_NEXT],
    ["courses/dsa", DEFAULT_NEXT],
    ["https://evil.example", DEFAULT_NEXT],
    ["//evil.example", DEFAULT_NEXT],
    ["///evil.example", DEFAULT_NEXT],
    ["/\\evil.example", DEFAULT_NEXT],
    ["\\\\evil.example", DEFAULT_NEXT],
    ["\\/evil.example", DEFAULT_NEXT],
    ["/%5Cevil.example", DEFAULT_NEXT],
    ["/%5cevil.example", DEFAULT_NEXT],
    ["/%2F%2Fevil.example", DEFAULT_NEXT],
    ["/%2f/evil.example", DEFAULT_NEXT],
    // Better Auth answers 403 INVALID_CALLBACK_URL to an encoded separator
    // anywhere in the path, in either case, so it is not passed on.
    ["/courses/a%2Fb", DEFAULT_NEXT],
    ["/courses/a%2fb", DEFAULT_NEXT],
    ["/courses/a%5Cb", DEFAULT_NEXT],
    ["/courses/a%5cb", DEFAULT_NEXT],
    [`/${TAB}/evil.example`, DEFAULT_NEXT],
    [`/${LF}/evil.example`, DEFAULT_NEXT],
    [`/${CR}/evil.example`, DEFAULT_NEXT],
    [`/ok${LF}Set-Cookie: x`, DEFAULT_NEXT],
    [`/ok${NUL}`, DEFAULT_NEXT],
    [" //evil.example", DEFAULT_NEXT],
    [" /courses/dsa", DEFAULT_NEXT],
    ["javascript:alert(1)", DEFAULT_NEXT],
    ["JaVaScRiPt:alert(1)", DEFAULT_NEXT],
    ["data:text/html,<script>alert(1)</script>", DEFAULT_NEXT],
    // Dot segments collapse into a protocol-relative path once resolved.
    ["/.//evil.example", DEFAULT_NEXT],
    ["/a/..//evil.example", DEFAULT_NEXT],
    ["/%2e%2e//evil.example", DEFAULT_NEXT],
    // The sign-in page is not a destination: it would loop.
    ["/sign-in", DEFAULT_NEXT],
    ["/sign-in?next=%2Fsign-in", DEFAULT_NEXT],
    ["/sign-in/", DEFAULT_NEXT],
    ["/a/../sign-in", DEFAULT_NEXT],
    ["/courses/../sign-in?x=1", DEFAULT_NEXT],
    // The router decodes these to the same page.
    ["/%73ign-in", DEFAULT_NEXT],
    ["/sign%2Din", DEFAULT_NEXT],
    ["/%73ign-in/x", DEFAULT_NEXT],
  ])("%j → %j", (raw, expected) => {
    expect(safeNext(raw)).toBe(expected);
  });

  it.each([[42], [{}], [["/courses/dsa"]], [true], [() => "/x"]])("refuses non-string input %j", (raw) => {
    expect(safeNext(raw)).toBe(DEFAULT_NEXT);
  });

  it("refuses very long input and keeps one at the limit", () => {
    expect(safeNext(`/${"a".repeat(5000)}`)).toBe(DEFAULT_NEXT);
    expect(safeNext(`/${"a".repeat(2000)}`)).toBe(`/${"a".repeat(2000)}`);
  });

  it("never returns anything but a same-origin absolute path", () => {
    const hostile = [
      "//evil.example", "/\\evil.example", "/%2F%2Fevil.example", "/.//evil.example",
      "https://evil.example/", `/${TAB}/evil.example`, "http:evil.example", "/?next=//evil.example",
    ];
    for (const raw of hostile) {
      const out = safeNext(raw);
      const resolved = new URL(out, "https://app.invalid");
      expect(resolved.origin, raw).toBe("https://app.invalid");
      expect(out.startsWith("/") && !out.startsWith("//") && !out.startsWith("/\\"), raw).toBe(true);
    }
  });
});

describe("SignInButtons", () => {
  it("starts OAuth with the validated return path", async () => {
    params = new URLSearchParams("next=%2Fcourses%2Fdsa%2Farrays");
    const host = mount(<SignInButtons />);
    await act(async () => button(host, "GitHub").click());
    expect(social).toHaveBeenCalledWith({
      provider: "github",
      callbackURL: "/courses/dsa/arrays",
      errorCallbackURL: "/sign-in?error=oauth&next=%2Fcourses%2Fdsa%2Farrays",
    });
  });

  it("never forwards a hostile next", async () => {
    params = new URLSearchParams("next=%2F%2Fevil.example");
    const host = mount(<SignInButtons />);
    await act(async () => button(host, "Google").click());
    expect(social).toHaveBeenCalledWith(expect.objectContaining({
      provider: "google",
      callbackURL: DEFAULT_NEXT,
      errorCallbackURL: `/sign-in?error=oauth&next=${encodeURIComponent(DEFAULT_NEXT)}`,
    }));
  });

  it("does not send the learner back to the sign-in page", async () => {
    params = new URLSearchParams("next=%2Fsign-in");
    const host = mount(<SignInButtons />);
    await act(async () => button(host, "GitHub").click());
    expect(social).toHaveBeenCalledWith(expect.objectContaining({ callbackURL: DEFAULT_NEXT }));
  });

  it("shows an OAuth error with the buttons still usable", () => {
    params = new URLSearchParams("error=oauth");
    const host = mount(<SignInButtons />);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Sign-in didn't complete");
    expect(host.querySelectorAll("button")).toHaveLength(2);
    for (const b of host.querySelectorAll("button")) expect(b.getAttribute("aria-disabled")).not.toBe("true");
  });

  it("has no alert until something has gone wrong", () => {
    const host = mount(<SignInButtons />);
    expect(host.querySelector('[role="alert"]')).toBeNull();
  });

  it("is busy while a sign-in starts: both providers refuse a second click", async () => {
    let finish: (r: SocialResult) => void = () => {};
    social.mockImplementation(() => new Promise<SocialResult>((r) => { finish = r; }));
    const host = mount(<SignInButtons />);
    await act(async () => button(host, "GitHub").click());
    expect(button(host, "GitHub").getAttribute("aria-busy")).toBe("true");
    expect(button(host, "GitHub").textContent).toContain("Connecting");
    for (const b of host.querySelectorAll("button")) expect(b.getAttribute("aria-disabled")).toBe("true");
    await act(async () => button(host, "Google").click());
    await act(async () => button(host, "GitHub").click());
    expect(social).toHaveBeenCalledTimes(1);
    // The redirect is what ends a successful start, so nothing re-enables the
    // buttons in the meantime.
    await act(async () => finish({ error: null }));
    expect(button(host, "GitHub").getAttribute("aria-disabled")).toBe("true");
  });

  it("announces a provider failure, re-enables the buttons and keeps focus", async () => {
    social.mockResolvedValue({ error: { status: 500, message: "boom" } });
    const host = mount(<SignInButtons />);
    const github = button(host, "GitHub");
    github.focus();
    await act(async () => github.click());
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("couldn't start");
    for (const b of host.querySelectorAll("button")) expect(b.getAttribute("aria-disabled")).not.toBe("true");
    expect(document.activeElement).toBe(github);
    await act(async () => github.click());
    expect(social).toHaveBeenCalledTimes(2);
  });

  it("announces an offline failure when the client throws", async () => {
    social.mockRejectedValue(new TypeError("Failed to fetch"));
    const host = mount(<SignInButtons />);
    await act(async () => button(host, "Google").click());
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("connection");
    expect(button(host, "Google").getAttribute("aria-busy")).not.toBe("true");
  });

  it("clears the busy state when the page is restored from the back/forward cache", async () => {
    const host = mount(<SignInButtons />);
    await act(async () => button(host, "GitHub").click());
    expect(button(host, "GitHub").getAttribute("aria-disabled")).toBe("true");
    await act(async () => {
      const e = new Event("pageshow");
      Object.defineProperty(e, "persisted", { value: true });
      window.dispatchEvent(e);
    });
    expect(button(host, "GitHub").getAttribute("aria-disabled")).not.toBe("true");
  });

  it("gives the buttons real names and hides the decorative icons", () => {
    const host = mount(<SignInButtons />);
    expect(button(host, "Continue with GitHub")).toBeTruthy();
    expect(button(host, "Continue with Google")).toBeTruthy();
    for (const svg of host.querySelectorAll("svg")) expect(svg.getAttribute("aria-hidden")).toBe("true");
    for (const b of host.querySelectorAll("button")) expect(b.getAttribute("type")).toBe("button");
  });

  it("shows no provider buttons to a signed-in learner and sends them on", () => {
    session = { data: { user: { id: "u1" } }, isPending: false };
    params = new URLSearchParams("next=%2Fcourses%2Fdsa%2Farrays");
    const host = mount(<SignInButtons />);
    expect(host.querySelectorAll("button")).toHaveLength(0);
    expect(host.textContent).toContain("You're signed in");
    expect(host.querySelector("a")?.getAttribute("href")).toBe("/courses/dsa/arrays");
    expect(replace).toHaveBeenCalledWith("/courses/dsa/arrays");
  });

  it("sends a signed-in learner with a hostile next to the default", () => {
    session = { data: { user: { id: "u1" } }, isPending: false };
    params = new URLSearchParams("next=https%3A%2F%2Fevil.example");
    const host = mount(<SignInButtons />);
    expect(replace).toHaveBeenCalledWith(DEFAULT_NEXT);
    expect(host.querySelector("a")?.getAttribute("href")).toBe(DEFAULT_NEXT);
  });

  it("shows no buttons and no redirect while the session is still loading", () => {
    session = { data: null, isPending: true };
    const host = mount(<SignInButtons />);
    expect(host.querySelectorAll("button")).toHaveLength(0);
    expect(replace).not.toHaveBeenCalled();
  });
});

describe("SignInPage", () => {
  const AUTH_ENV = {
    DATABASE_URL: "postgres://x",
    BETTER_AUTH_SECRET: "s".repeat(32),
    BETTER_AUTH_URL: "https://app.example",
    GITHUB_CLIENT_ID: "a",
    GITHUB_CLIENT_SECRET: "b",
    GOOGLE_CLIENT_ID: "c",
    GOOGLE_CLIENT_SECRET: "d",
  };

  it("renders the pitch, the benefits and the provider buttons when auth is configured", () => {
    for (const [k, v] of Object.entries(AUTH_ENV)) vi.stubEnv(k, v);
    const html = renderToStaticMarkup(<SignInPage />);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>Pick up where you left off, on any device\.<\/h1>/);
    expect(html).toMatch(/<h2[^>]*>Sign in<\/h2>/);
    for (const { title, body } of SIGN_IN_COPY.benefits) {
      expect(html).toContain(title);
      expect(html).toContain(body);
    }
    expect(html).toContain("Continue with GitHub");
    expect(html).toContain("Continue with Google");
    expect(html).toContain(SIGN_IN_COPY.stored);
  });

  it("puts the card before the structure and benefits in reading order, so phones see the buttons first", () => {
    for (const [k, v] of Object.entries(AUTH_ENV)) vi.stubEnv(k, v);
    const html = renderToStaticMarkup(<SignInPage />);
    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf("Sign in</h2>"));
    expect(html.indexOf("Sign in</h2>")).toBeLessThan(html.indexOf(SIGN_IN_COPY.benefits[0]!.title));
  });

  it("says plainly that sign-in is unavailable, with no dead buttons, when auth is not configured", () => {
    for (const k of Object.keys(AUTH_ENV)) vi.stubEnv(k, "");
    const html = renderToStaticMarkup(<SignInPage />);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("isn&#x27;t available");
    expect(html).not.toContain("<button");
    expect(html).toContain('href="/courses/dsa"');
    expect(html).not.toContain(SIGN_IN_COPY.headline);
    expect(html).not.toContain(SIGN_IN_COPY.benefits[0]!.title);
  });
});

describe("SyncHint", () => {
  // The hint is a next/dynamic chunk (it holds the auth client), which
  // resolves on a later tick than the render that asks for it.
  async function mountHint(authEnabled: boolean) {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    await act(async () => {
      root!.render(<SyncBridgeProvider authEnabled={authEnabled}><SyncHint /></SyncBridgeProvider>);
      await new Promise((r) => setTimeout(r, 20));
    });
    return host;
  }

  it("shows only to signed-out visitors where auth is configured", async () => {
    session = { data: null, isPending: false };
    const shown = await mountHint(true);
    expect(shown.textContent).toContain("Progress is saved on this device.");
    expect(shown.querySelector("a")?.getAttribute("href")).toBe("/sign-in?next=%2Fcourses%2Fdsa");
    act(() => root!.unmount());
    expect((await mountHint(false)).textContent).toBe("");
    act(() => root!.unmount());
    session = { data: { user: { id: "u1" } }, isPending: false };
    expect((await mountHint(true)).textContent).toBe("");
  });

  it("stays blank while the session loads, so a signed-in learner never sees it flash", async () => {
    session = { data: null, isPending: true };
    expect((await mountHint(true)).textContent).toBe("");
  });

  it("does not read the session at all when auth is not configured", async () => {
    await mountHint(false);
    expect(useSession).not.toHaveBeenCalled();
  });
});
