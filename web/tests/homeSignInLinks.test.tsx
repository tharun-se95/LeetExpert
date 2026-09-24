import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import HomePage from "@/components/landing/HomePage";
import { viaSignIn } from "@/lib/auth/signInPrompt";
import { CURRICULUM, FIRST_LESSON } from "@/lib/landing/content";

/**
 * The landing's calls to action ask first when sign-in exists (owner,
 * 2026-09-24; spec 2026-09-24-sign-in-prompt-design.md), and stay direct when
 * it does not, where /sign-in would only say it isn't available.
 */
const AUTH_ENV = {
  DATABASE_URL: "postgres://u:p@h/db",
  BETTER_AUTH_SECRET: "s".repeat(32),
  BETTER_AUTH_URL: "https://www.leetexpert.com",
  GITHUB_CLIENT_ID: "a",
  GITHUB_CLIENT_SECRET: "b",
  GOOGLE_CLIENT_ID: "c",
  GOOGLE_CLIENT_SECRET: "d",
};
const href = (s: string) => `href="${s.replace(/&/g, "&amp;")}"`;

afterEach(() => vi.unstubAllEnvs());

describe("landing calls to action", () => {
  it("go through /sign-in, with the target as next, when sign-in is configured", () => {
    for (const [k, v] of Object.entries(AUTH_ENV)) vi.stubEnv(k, v);
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain(href(viaSignIn(FIRST_LESSON)));
    expect(html).toContain(href(viaSignIn(CURRICULUM)));
  });

  it("stay direct when it is not", () => {
    for (const k of Object.keys(AUTH_ENV)) vi.stubEnv(k, "");
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain(href(FIRST_LESSON));
    expect(html).not.toContain("/sign-in?next=");
  });
});
