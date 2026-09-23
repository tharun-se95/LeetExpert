// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ReviewCoach } from "@/components/landing/ReviewCoach";
import { COACH_LOCKED, reviewDiagnosis, reviewThread } from "@/lib/landing/method";

/**
 * Review's window on the landing page (owner, 2026-09-19): the real coach
 * panel over a scripted thread, asking nothing of the AI, since every
 * visitor would otherwise be a paid request.
 */

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  host?.remove();
  vi.unstubAllGlobals();
});

function mount() {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root!.render(<ReviewCoach />));
  return fetch;
}

describe("the scripted coach", () => {
  it("shows the real panel with the diagnosis, the question and the reply", () => {
    mount();
    expect(host.querySelector('section[aria-label="Problem coach"]')).not.toBeNull();
    expect(host.textContent).toContain(reviewDiagnosis().prose);
    for (const item of reviewThread()) {
      if (item.kind === "user") expect(host.textContent).toContain(item.content);
    }
    expect(host.textContent).toContain("What changes if you look for the partner first?");
  });

  it("cannot be asked: the composer is locked and says why, and nothing is sent", () => {
    const fetch = mount();
    const input = host.querySelector<HTMLTextAreaElement>("textarea")!;
    expect(input.disabled).toBe(true);
    expect(host.textContent).toContain(COACH_LOCKED);
    const form = host.querySelector("form")!;
    act(() => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("offers no control that does nothing: no close, collapse or clear", () => {
    mount();
    for (const name of ["Close problem coach", "Collapse problem coach", "Clear coach thread"]) {
      expect(host.querySelector(`button[aria-label="${name}"]`), name).toBeNull();
    }
  });
});
