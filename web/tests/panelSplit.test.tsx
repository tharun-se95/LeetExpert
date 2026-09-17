// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, useState, type ReactElement, type ReactNode } from "react";
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

function Counter() {
  const [n, setN] = useState(0);
  return (
    <button type="button" data-counter onClick={() => setN((v) => v + 1)}>
      {n}
    </button>
  );
}

describe("PanelSplit with a secondary-sized pane", () => {
  function mountSplit() {
    const host = document.createElement("div");
    document.body.append(host);
    const created = createRoot(host);
    root = created;
    return { host, render: (ui: ReactElement) => act(() => created.render(ui)) };
  }

  it("keeps the primary mounted when the secondary appears, disappears or stops resizing", () => {
    // The sandbox is the primary: a remount would wipe its run results.
    const { host, render } = mountSplit();
    const split = (secondary: ReactNode, resizable = true) => (
      <PanelSplit
        orientation="horizontal"
        sizedPane="secondary"
        resizable={resizable}
        primary={<Counter />}
        secondary={secondary}
      />
    );
    render(split(null));
    const counter = host.querySelector("[data-counter]");
    if (!(counter instanceof HTMLButtonElement)) throw new Error("no counter");
    expect(host.querySelector("[data-split-handle]")).toBeNull();
    act(() => counter.click());
    render(split(<p>coach</p>));
    expect(host.querySelector("[data-split-handle]")).not.toBeNull();
    render(split(<p>strip</p>, false));
    expect(host.querySelector("[data-split-handle]")).toBeNull();
    render(split(null));
    expect(host.querySelector("[data-counter]")).toBe(counter);
    expect(counter.textContent).toBe("1");
  });

  it("bounds a secondary drag by both panes' floors, in rem, and remembers it", () => {
    const style = document.createElement("style");
    style.textContent = ".side { min-width: 200px; max-width: 600px; } .main { min-width: 500px; }";
    document.head.append(style);
    document.documentElement.style.fontSize = "20px";
    localStorage.clear();
    const { host, render } = mountSplit();
    const split = (
      <PanelSplit
        orientation="horizontal"
        sizedPane="secondary"
        storageKey="test:split"
        primaryClassName="main"
        secondaryClassName="side"
        primary={<p>editor</p>}
        secondary={<p>coach</p>}
      />
    );
    render(split);
    const container = host.firstElementChild;
    if (!(container instanceof HTMLElement)) throw new Error("no container");
    container.getBoundingClientRect = () => new DOMRect(0, 0, 1000, 600);
    const handle = host.querySelector("[data-split-handle]");
    const side = container.lastElementChild;
    if (!handle || !(side instanceof HTMLElement)) throw new Error("no panes");
    const move = (clientX: number) =>
      act(() => {
        window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX, clientY: 10 }));
      });

    act(() => {
      handle.dispatchEvent(new Event("pointerdown", { bubbles: true, cancelable: true }));
    });
    move(900); // 100px wanted, the coach's 200px floor wins
    expect(side.style.width).toBe("10rem");
    move(200); // 800px wanted: 600px cap, but the editor keeps its 500px floor
    expect(side.style.width).toBe("25rem");
    move(650);
    expect(side.style.width).toBe("17.5rem");
    act(() => {
      window.dispatchEvent(new Event("pointerup"));
    });
    expect(localStorage.getItem("test:split")).toBe("17.5");

    act(() => root?.unmount());
    const again = mountSplit();
    again.render(split);
    const restored = again.host.firstElementChild?.lastElementChild;
    expect(restored instanceof HTMLElement && restored.style.width).toBe("17.5rem");
    document.documentElement.style.fontSize = "";
  });
});
