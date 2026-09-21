// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { FeatureSection, type WindowContent } from "@/components/landing/FeatureSection";
import { ALL_VERBS, featureSections, type VerbId } from "@/lib/landing/features";

/**
 * The feature stack (owner, 2026-09-19/20): a section's three components,
 * bare, one visible at a time in a vertical stack; from lg scrolling drives
 * it, one screen per feature with the content pinned; below lg a swipeable
 * row.
 * Spec: docs/superpowers/specs/2026-09-15-landing-product-page-design.md §14
 */

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// jsdom has no layout, so no scrollIntoView; picking a feature from lg calls it.
Element.prototype.scrollIntoView ??= () => {};

type Report = (e: { isIntersecting: boolean; target: Element }[]) => void;

/** Media the page asks about: the lg breakpoint and reduced motion. */
function stubMedia({ wide, reduce }: { wide: boolean; reduce: boolean }) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("min-width: 1024px") ? wide : query.includes("prefers-reduced-motion: reduce") ? reduce : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
}

const stub = Object.fromEntries(ALL_VERBS.map((v) => [v, { label: `${v} component`, body: <p>{v} body</p> }])) as Record<
  VerbId,
  WindowContent
>;
stub.watch = { ...stub.watch, link: { label: "Open the module", href: "/courses/dsa/arrays" } };
const section = featureSections({ problems: 1, cheatsheets: 1 })[0]!;

let root: Root | null = null;
let host: HTMLElement;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  (host?.closest("main") ?? host)?.remove();
  vi.unstubAllGlobals();
  window.location.hash = "";
});

function mount(ui: ReactElement) {
  // Inside <main>, the page's scroller: the steps are observed against it.
  const main = document.createElement("main");
  host = document.createElement("div");
  main.append(host);
  document.body.append(main);
  root = createRoot(host);
  act(() => root!.render(ui));
}
const ringAt = () => <FeatureSection section={section} started windows={stub} />;

const tabs = () => [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
const selected = () => tabs().findIndex((t) => t.getAttribute("aria-selected") === "true");
const panels = () => [...host.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
const inert = () => panels().map((p) => p.hasAttribute("inert"));
const item = (p: HTMLElement) => p.closest<HTMLElement>("[data-offset]")!;
/** Where each component sits: -1 above (hidden), 0 shown, 1 below (hidden). */
const offsets = () => panels().map((p) => Number(item(p).getAttribute("data-offset")));
const markers = () => [...host.querySelectorAll<HTMLElement>("[data-step]")];

/** An IntersectionObserver that records its callback, so a test can say which step crosses the middle. */
function observeSteps() {
  const observers: { report: Report; watched: Element[] }[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      watched: Element[] = [];
      constructor(public report: Report) {
        observers.push(this);
      }
      observe(el: Element) {
        this.watched.push(el);
      }
      disconnect() {}
      unobserve() {}
    },
  );
  /** Report step i crossing the middle band, as scrolling to it would. */
  return (i: number) => {
    const obs = observers.find((o) => o.watched.some((el) => el.hasAttribute("data-step")))!;
    act(() => obs.report([{ isIntersecting: true, target: markers()[i]! }]));
  };
}

describe("the carousel, from lg", () => {
  it("shows all three components bare, named for screen readers, only the front one reachable", () => {
    stubMedia({ wide: true, reduce: false });
    mount(ringAt());
    expect(panels().map((p) => p.textContent)).toEqual(["watch body", "learn body", "map body"]);
    expect(panels().map((p) => p.getAttribute("aria-label"))).toEqual(["watch component", "learn component", "map component"]);
    expect(inert()).toEqual([false, true, true]);
    // No card: no window title, kind chip or "Today" footer.
    expect(host.textContent).not.toMatch(/Today|Live|Preview|Example/);
  });

  it("gives each feature a screen of scroll, and pages one feature per wheel gesture (owner, 2026-09-20)", () => {
    stubMedia({ wide: true, reduce: false });
    mount(ringAt());
    const sectionEl = host.querySelector("section")!;
    expect(sectionEl.getAttribute("data-scroll-steps")).toBe("3");
    expect(sectionEl.style.getPropertyValue("--steps")).toBe("3");
    expect(sectionEl.className).toContain("lg:h-[calc(var(--steps)*100dvh)]");
    expect(markers().map((m) => m.style.top)).toEqual(["0dvh", "100dvh", "200dvh"]);
    for (const m of markers()) expect(m.className).toMatch(/\bsnap-start\b.*\blg:block\b|\blg:block\b.*\bsnap-start\b/);
    // The content stays in view while the steps scroll past.
    expect(host.querySelector(".lg\\:sticky")).not.toBeNull();
    // No timer or pause control any more: scrolling is the control.
    expect(host.querySelector(".deck-fill")).toBeNull();
    expect(host.textContent).not.toMatch(/carousel/);
  });

  it("brings forward the feature whose step crosses the middle, forward and back", () => {
    stubMedia({ wide: true, reduce: false });
    const reach = observeSteps();
    mount(ringAt());
    expect(offsets()).toEqual([0, 1, 1]);
    reach(1);
    expect(selected()).toBe(1);
    // Watch has slid up and out; Map waits below.
    expect(offsets()).toEqual([-1, 0, 1]);
    reach(2);
    expect(selected()).toBe(2);
    expect(offsets()).toEqual([-1, -1, 0]);
    expect(inert()).toEqual([true, true, false]);
    // Scrolling back up brings Learn back down into view.
    reach(1);
    expect(offsets()).toEqual([-1, 0, 1]);
  });

  it("scrolls to a feature's step when its tab is picked", () => {
    stubMedia({ wide: true, reduce: false });
    mount(ringAt());
    const spy = vi.fn();
    markers()[2]!.scrollIntoView = spy;
    act(() => tabs()[2]!.click());
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ block: "start" }));
    expect(selected()).toBe(2);
  });

  it("shows only the selected component: the others are hidden, not dimmed beside it (owner, 2026-09-20)", () => {
    stubMedia({ wide: true, reduce: false });
    mount(ringAt());
    const shown = panels().map((p) => [item(p).style.opacity, item(p).className.includes("pointer-events-none")]);
    expect(shown).toEqual([
      ["1", false],
      ["0", true],
      ["0", true],
    ]);
    // Stacked in one place, moved only up and down: no sideways offset, turn or blur.
    for (const p of panels()) {
      expect(item(p).className).toContain("absolute inset-0");
      expect(item(p).style.transform).not.toMatch(/translateX|rotate/);
      expect(item(p).style.filter).not.toMatch(/blur/);
    }
    // Nothing to click behind the one in front.
    expect(host.querySelectorAll('button[aria-hidden="true"][tabindex="-1"]')).toHaveLength(0);
  });

  it("sizes each component box to its content, centred in its slot (owner, 2026-09-19)", () => {
    stubMedia({ wide: true, reduce: false });
    mount(ringAt());
    for (const p of panels()) {
      // The slot centres; the panel is capped, not stretched to the stage.
      expect(item(p).className).toMatch(/\bflex\b.*\bitems-center\b/);
      expect(p.className).toContain("max-h-[46rem]");
      expect(p.className).not.toMatch(/\bh-full\b/);
    }
  });

  it("jumps straight to a picked component, the ones before it above", () => {
    stubMedia({ wide: true, reduce: false });
    mount(ringAt());
    act(() => tabs()[2]!.click());
    expect(offsets()).toEqual([-1, -1, 0]);
    expect(selected()).toBe(2);
  });

  it("says what the selected component is and links to its page", () => {
    stubMedia({ wide: true, reduce: false });
    mount(ringAt());
    expect(host.textContent).toContain(section.verbs[0]!.line);
    expect(host.querySelector('a[href="/courses/dsa/arrays"]')?.textContent).toBe("Open the module");
    // Each tab still carries its line for screen readers.
    tabs().forEach((t, i) => expect(t.textContent).toContain(section.verbs[i]!.line));
  });
});

describe("opening the page at a verb", () => {
  it("keeps the verb the #hash picked when the stack resolves after hydration", async () => {
    // The server can't know the width, so the first client render is the
    // phone row; its scroll observer reported the first component as visible
    // and pulled a page opened at #learn back to Watch (found in the browser).
    stubMedia({ wide: true, reduce: false });
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(private report: Report) {}
        // A browser delivers an observer's first report in the rendering
        // steps after the frame's requestAnimationFrame callbacks.
        observe(el: Element) {
          setTimeout(() => this.report([{ isIntersecting: el.parentElement?.firstElementChild === el, target: el }]), 5);
        }
        disconnect() {}
        unobserve() {}
      },
    );
    vi.stubGlobal("requestAnimationFrame", (f: FrameRequestCallback) => setTimeout(() => f(0), 0));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
    window.location.hash = "#learn";
    host = document.createElement("div");
    host.innerHTML = renderToString(ringAt());
    document.body.append(host);
    await act(async () => {
      root = hydrateRoot(host, ringAt());
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(selected()).toBe(1);
    expect(inert()).toEqual([true, false, true]);
  });
});

describe("below lg", () => {
  it("is a swipeable row, one stop tall: the steps exist only from lg", () => {
    stubMedia({ wide: false, reduce: false });
    mount(ringAt());
    expect(panels()[0]!.closest(".snap-x"), "a scroll-snap row").not.toBeNull();
    expect(panels()).toHaveLength(3);
    for (const m of markers()) expect(m.className).toMatch(/\bhidden\b/);
  });

  it("lies flat, with no leftover fade from the stack", () => {
    // Motion keeps the last inline values when `style` goes undefined, so a
    // tablet turned across the breakpoint kept the ring's styles (found in the browser).
    stubMedia({ wide: false, reduce: false });
    mount(ringAt());
    for (const p of panels()) expect(item(p).style.opacity).toBe("1");
  });
});
