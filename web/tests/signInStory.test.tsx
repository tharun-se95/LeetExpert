import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { SignInStory } from "@/app/sign-in/SignInStory";
import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";

const html = renderToStaticMarkup(<SignInStory />);
const source = readFileSync(join(__dirname, "..", "src", "app", "sign-in", "SignInStory.tsx"), "utf8");

describe("SignInStory (owner, 2026-09-24: follows the landing's design)", () => {
  it("shows the landing's 3D floor, rendered on the server with nothing to run", () => {
    expect(html).toContain('class="hero-block"');
    // No client state: the old stage timer went with the evolving structure.
    expect(source).not.toMatch(/^"use client"/m);
    expect(source).not.toMatch(/useState|useEffect|setInterval/);
  });

  it("lists every benefit from the copy module, each in the landing's icon tile", () => {
    for (const { title, body } of SIGN_IN_COPY.benefits) {
      expect(html).toContain(title);
      expect(html).toContain(body);
    }
    expect(html.match(/<li/g)).toHaveLength(SIGN_IN_COPY.benefits.length);
    expect(html.match(/class="landing-icon /g)).toHaveLength(SIGN_IN_COPY.benefits.length);
  });

  it("uses no heading level: the page's h1 and the card's h2 own the outline", () => {
    expect(html).not.toMatch(/<h[1-6]/);
  });
});
