// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CoachProvider, useCoach } from "@/components/coach/CoachProvider";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Coach = ReturnType<typeof useCoach>;
let root: Root | null = null;
let coach: Coach | null = null;

function Probe() {
  const value = useCoach();
  // Recorded after commit, so the tests read the context the page would see.
  useEffect(() => {
    coach = value;
  });
  return null;
}

function current(): Coach {
  if (!coach) throw new Error("provider not mounted");
  return coach;
}

function mount() {
  const host = document.createElement("div");
  document.body.append(host);
  const created = createRoot(host);
  root = created;
  act(() =>
    created.render(
      <CoachProvider sandboxId="layout-test" hintLabels={[]}>
        <Probe />
      </CoachProvider>,
    ),
  );
}

const fail = () =>
  act(() => current().reportRun({ results: null, fatal: "boom", property: false }));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ configured: false }) })));
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: true,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
});

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  coach = null;
  vi.unstubAllGlobals();
});

describe("coach layout", () => {
  it("opens the column by default, and a failing run never expands a collapsed one", () => {
    mount();
    act(() => current().setLayout("column"));
    expect(current().open).toBe(true);
    act(() => current().setOpen(false));
    expect(localStorage.getItem("dsa:coach:column-open")).toBe("0");
    fail();
    expect(current().open).toBe(false);
    expect(current().unread).toBe(true);
  });

  it("marks nothing unread when the column is open to show the diagnosis", () => {
    mount();
    act(() => current().setLayout("column"));
    fail();
    expect(current().open).toBe(true);
    expect(current().unread).toBe(false);
  });

  it("remembers a collapsed column across visits, separately from the floating panel", () => {
    localStorage.setItem("dsa:coach:column-open", "0");
    localStorage.setItem("dsa:coach:rail-open", "1");
    mount();
    expect(current().open).toBe(true);
    act(() => current().setLayout("column"));
    expect(current().open).toBe(false);
  });

  it("still opens the floating panel on the session's first failure", () => {
    mount();
    expect(current().layout).toBe("floating");
    expect(current().open).toBe(false);
    fail();
    expect(current().open).toBe(true);
  });
});
