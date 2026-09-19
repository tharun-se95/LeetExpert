// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describeStage } from "@/lib/landing/structureLayouts";
import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let reduced: boolean | null = false;
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return { ...actual, useReducedMotion: () => reduced };
});

const { SignInStory, STAGE_MS } = await import("@/app/sign-in/SignInStory");

let root: Root | null = null;
let host: HTMLElement;
beforeEach(() => {
  vi.useFakeTimers();
  reduced = false;
  host = document.createElement("div");
  document.body.append(host);
});
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const label = () => host.querySelector('svg[role="img"]')!.getAttribute("aria-label");
function mount() {
  root = createRoot(host);
  act(() => root!.render(<SignInStory />));
}

describe("SignInStory", () => {
  it("starts on the array and steps once, a stage at a time, to the graph", () => {
    mount();
    expect(label()).toBe(describeStage(0));
    act(() => void vi.advanceTimersByTime(STAGE_MS));
    expect(label()).toBe(describeStage(1));
    act(() => void vi.advanceTimersByTime(STAGE_MS));
    expect(label()).toBe(describeStage(2));
    act(() => void vi.advanceTimersByTime(STAGE_MS));
    expect(label()).toBe(describeStage(3));
  });

  it("rests on the graph: it does not loop, and its timer is cleared once it arrives", () => {
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    mount();
    act(() => void vi.advanceTimersByTime(STAGE_MS * 12));
    expect(label()).toBe(describeStage(3));
    // EvolvingStructure clamps its stage, so a timer that kept counting past the
    // graph would show the same label: the label alone cannot tell "rested" from
    // "leaked". The clear must have happened before any unmount.
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("goes straight to the graph, with no timer, under reduced motion", () => {
    reduced = true;
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    mount();
    expect(label()).toBe(describeStage(3));
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it("stops its timer when it unmounts mid-animation", () => {
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    mount();
    act(() => void vi.advanceTimersByTime(STAGE_MS));
    act(() => root!.unmount());
    root = null;
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("lists every benefit from the copy module", () => {
    mount();
    for (const { title, body } of SIGN_IN_COPY.benefits) {
      expect(host.textContent).toContain(title);
      expect(host.textContent).toContain(body);
    }
    expect(host.querySelectorAll("li")).toHaveLength(SIGN_IN_COPY.benefits.length);
  });

  it("uses no heading level: the page's h1 and the card's h2 own the outline", () => {
    mount();
    expect(host.querySelector("h1, h2, h3, h4")).toBeNull();
  });
});
