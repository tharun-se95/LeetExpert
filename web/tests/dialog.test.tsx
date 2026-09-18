// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Dialog } from "@/components/ui/Dialog";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});

function mount(open: boolean, onClose = vi.fn()) {
  const host = document.createElement("div");
  document.body.append(host);
  const opener = document.createElement("button");
  document.body.append(opener);
  opener.focus();
  root = createRoot(host);
  act(() =>
    root!.render(
      <Dialog open={open} onClose={onClose} label="Test dialog">
        <button type="button">First</button>
        <button type="button">Last</button>
      </Dialog>,
    ),
  );
  return { onClose, opener };
}

describe("Dialog", () => {
  it("renders nothing when closed", () => {
    mount(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("is labelled, modal, and focuses its first control", () => {
    mount(true);
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("Test dialog");
    expect(document.activeElement?.textContent).toBe("First");
  });

  it("Escape closes; Tab wraps from last to first and Shift+Tab back", () => {
    const { onClose } = mount(true);
    const [first, last] = [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')];
    last!.focus();
    act(() => last!.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true })));
    expect(document.activeElement).toBe(first);
    act(() => first!.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true })));
    expect(document.activeElement).toBe(last);
    act(() => first!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("returns focus to the opener when it closes", () => {
    const { opener } = mount(true);
    act(() => root!.render(<Dialog open={false} onClose={() => {}} label="Test dialog">x</Dialog>));
    expect(document.activeElement).toBe(opener);
  });

  it("keeps Tab inside after focus falls to the body (click on plain text)", () => {
    mount(true);
    const [first, last] = [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')];
    (document.activeElement as HTMLElement).blur();
    expect(document.activeElement).toBe(document.body);
    act(() => document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(first);
    (document.activeElement as HTMLElement).blur();
    act(() => document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(last);
  });

  it("Shift+Tab from the panel itself does not leave the dialog", () => {
    mount(true);
    const panel = document.querySelector<HTMLElement>('[role="dialog"]')!;
    const last = [...panel.querySelectorAll<HTMLButtonElement>("button")].at(-1);
    panel.focus();
    act(() => panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(last);
  });

  it("with no focusable child, focuses the panel and traps Tab on it", () => {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    act(() => root!.render(<Dialog open onClose={() => {}} label="Text only">Just words.</Dialog>));
    const panel = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(document.activeElement).toBe(panel);
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    act(() => panel.dispatchEvent(tab));
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(panel);
  });

  it("Escape closes even when focus is outside the panel", () => {
    const { onClose, opener } = mount(true);
    opener.focus();
    act(() => opener.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("skips disabled and hidden controls when trapping", () => {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    act(() =>
      root!.render(
        <Dialog open onClose={() => {}} label="Mixed">
          <button type="button">Real</button>
          <textarea disabled defaultValue="x" />
          <select disabled />
          <input type="hidden" />
          <button type="button" hidden>
            Hidden
          </button>
        </Dialog>,
      ),
    );
    const real = document.activeElement as HTMLElement;
    expect(real.textContent).toBe("Real");
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    act(() => real.dispatchEvent(tab));
    // Real is both first and last, so Tab wraps onto itself.
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(real);
  });
});
