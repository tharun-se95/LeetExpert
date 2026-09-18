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
});
