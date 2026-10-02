// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { VizPlayer } from "@/components/viz/VizPlayer";
import { StatusPanel, statusSlots, type StatusItem } from "@/components/viz/pieces";

/**
 * A tracer's stage holds still between steps (#69). The fullscreen stage is
 * centred both ways, so a caption that wrapped to a second line or a readout
 * that grew from "—" to "23" moved the whole drawing. Each now reserves the
 * room of its largest value over the trace: every value sits in one grid cell,
 * only the current one visible. jsdom has no layout, so this pins that
 * structure; the sizes themselves were measured in the browser.
 */

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type S = { sum: number | null; gap: number | null };
const states: S[] = [
  { sum: null, gap: null },
  { sum: 23, gap: 4 },
  { sum: 7, gap: null },
];
const status = (s: S): StatusItem[] => [
  { label: "sum", value: s.sum ?? "—" },
  ...(s.gap !== null ? [{ label: "gap", value: s.gap }] : []),
  { label: "target", value: 22 },
];

const code = { python: "x = 1", typescript: "let x = 1;" };
const steps = [
  { caption: "short", line: { python: 1, typescript: 1 }, state: states[0] },
  {
    caption: "a much longer caption that wraps onto another line",
    line: { python: 1, typescript: 1 },
    state: states[1],
  },
  { caption: "done", line: { python: 1, typescript: 1 }, state: states[2] },
];

let root: Root | null = null;
let host: HTMLElement;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  host?.remove();
  vi.unstubAllGlobals();
});

function mount() {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root!.render(
      <VizPlayer code={code} steps={steps} label="Test trace">
        {(state, ctx) => <StatusPanel state={state} states={ctx.states} items={status} />}
      </VizPlayer>,
    ),
  );
}

const forward = () =>
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Step forward"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true })),
  );

describe("statusSlots", () => {
  it("orders labels by the trace, whatever step is shown", () => {
    const all = states.map(status);
    for (const s of states) {
      expect(statusSlots(status(s), all).map((x) => x.label)).toEqual(["sum", "gap", "target"]);
    }
  });

  it("collects each label's distinct values and marks an absent one", () => {
    const slots = statusSlots(status(states[0]), states.map(status));
    expect(slots.find((x) => x.label === "sum")!.ghosts).toEqual(["—", 23, 7]);
    expect(slots.find((x) => x.label === "target")!.ghosts).toEqual([22]);
    expect(slots.find((x) => x.label === "gap")!.current).toBeUndefined();
  });
});

describe("tracer stage", () => {
  it("stacks every caption in one cell and announces only the current one", () => {
    mount();
    const live = host.querySelector('[aria-live="polite"]')!;
    const cell = live.parentElement!;
    const ghosts = [...cell.children].filter((el) => el !== live);
    expect(ghosts.map((g) => g.textContent)).toEqual(
      steps.map((s, i) => `step ${i + 1} / 3${s.caption}`),
    );
    for (const g of [...ghosts, live]) expect(g.className).toContain("[grid-area:1/1]");
    for (const g of ghosts) {
      expect(g.className).toContain("invisible");
      expect(g.getAttribute("aria-hidden")).toBe("true");
    }
    expect(live.textContent).toBe("step 1 / 3short");
    forward();
    expect(live.textContent).toBe(`step 2 / 3${steps[1].caption}`);
  });

  it("keeps every readout slot, hiding one the step leaves out", () => {
    mount();
    const slot = (label: string) =>
      [...host.querySelectorAll(".font-mono > span")].find(
        (el) => el.firstElementChild?.textContent === label,
      ) as HTMLElement;
    // Step 1 has no gap: its slot is there, hidden, sized by the values it will show.
    expect(slot("gap").className).toContain("invisible");
    expect(slot("gap").getAttribute("aria-hidden")).toBe("true");
    const values = (label: string) =>
      [...slot(label).lastElementChild!.children].map((el) => ({
        text: el.textContent,
        shown: !el.className.includes("invisible"),
      }));
    expect(values("sum")).toEqual([
      { text: "—", shown: false },
      { text: "23", shown: false },
      { text: "7", shown: false },
      { text: "—", shown: true },
    ]);
    forward();
    expect(slot("gap").className).not.toContain("invisible");
    expect(values("sum").at(-1)).toEqual({ text: "23", shown: true });
  });
});
