// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { PanelSplit } from "@/components/problems/PanelSplit";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});

describe("PanelSplit", () => {
  it("bounds the drag by the primary pane's CSS max-width and min-width, so the handle never runs past the pane", () => {
    const style = document.createElement("style");
    style.textContent = ".capped { max-width: 400px; min-width: 150px; }";
    document.head.append(style);
    const host = document.createElement("div");
    document.body.append(host);
    const created = createRoot(host);
    root = created;
    act(() =>
      created.render(
        <PanelSplit
          orientation="horizontal"
          initialPrimary={0.3}
          maxPrimary={0.58}
          primaryClassName="capped"
          primary={<p>left</p>}
          secondary={<p>right</p>}
        />,
      ),
    );
    const container = host.firstElementChild;
    if (!(container instanceof HTMLElement)) throw new Error("no container");
    container.getBoundingClientRect = () => new DOMRect(0, 0, 1000, 600);
    const primary = container.firstElementChild;
    const handle = container.querySelector("button");
    if (!(primary instanceof HTMLElement) || !handle) throw new Error("no panes");
    expect(primary.className).toContain("capped");

    act(() => {
      handle.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    });
    act(() => {
      window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 550, clientY: 10 }));
    });
    // 55% is inside maxPrimary (58%) but past the 400px cap on a 1000px split.
    expect(primary.style.width).toBe("40%");
    act(() => {
      window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 300, clientY: 10 }));
    });
    expect(primary.style.width).toBe("30%");
    // minPrimary is 25% (250px) by default; the pane's own 150px min-width is
    // the lower floor, so the drag may go below the fraction. On a wide screen
    // a fractional floor can exceed the cap and lock the pane in place.
    act(() => {
      window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 100, clientY: 10 }));
    });
    expect(primary.style.width).toBe("15%");
    act(() => {
      window.dispatchEvent(new Event("pointerup"));
    });
  });
});
