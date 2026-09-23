// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { VizChromeContext } from "@/components/viz/vizChrome";

/**
 * The tracer player's chrome on the landing carousel (owner, 2026-09-19):
 * the code panel can be hidden, and fullscreen escapes any transformed
 * ancestor.
 */

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const code = { python: "x = 1\ny = 2", typescript: "let x = 1;\nlet y = 2;" };
const steps = [
  { caption: "first", line: { python: 1, typescript: 1 }, state: 1 },
  { caption: "second", line: { python: 2, typescript: 2 }, state: 2 },
];

let root: Root | null = null;
let host: HTMLElement;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  host?.remove();
  vi.unstubAllGlobals();
});

function mount(chrome: { embedded: boolean; code: boolean }) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
  host = document.createElement("div");
  // The carousel's ring slot: a transformed, filtered ancestor.
  host.style.transform = "translateZ(-240px) rotateY(24deg)";
  host.style.filter = "blur(4px)";
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root!.render(
      <VizChromeContext.Provider value={chrome}>
        <VizPlayer code={code} steps={steps} label="Test trace">
          {(s) => <span>state {s}</span>}
        </VizPlayer>
      </VizChromeContext.Provider>,
    ),
  );
}

const codeShown = () => document.body.textContent!.includes("y = 2");

describe("tracer chrome", () => {
  it("hides the code panel when the surface asks, and shows it otherwise", () => {
    mount({ embedded: true, code: false });
    expect(codeShown()).toBe(false);
    expect(host.textContent).toContain("state 1");
    act(() => root!.unmount());
    host.remove();
    mount({ embedded: true, code: true });
    expect(codeShown()).toBe(true);
  });

  it("opens fullscreen in <body>, out of a transformed ancestor, with the code back", () => {
    mount({ embedded: true, code: false });
    const expand = document.querySelector<HTMLButtonElement>('button[aria-label="Expand to fullscreen"]')!;
    act(() => expand.click());
    const dialog = document.querySelector('[role="dialog"][aria-modal="true"]')!;
    expect(dialog.parentElement).toBe(document.body);
    expect(host.contains(dialog)).toBe(false);
    expect(codeShown()).toBe(true);
    // Escape brings it back inside its slot.
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(host.textContent).toContain("state 1");
  });
});
