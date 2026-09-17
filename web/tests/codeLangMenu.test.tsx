// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CodeLangMenuView } from "@/components/code/CodeLangMenu";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});

function mount(ui: ReactElement): HTMLElement {
  const host = document.createElement("div");
  document.body.append(host);
  const created = createRoot(host);
  root = created;
  act(() => created.render(ui));
  return host;
}

function must<T extends Element>(el: T | null, what: string): T {
  if (!el) throw new Error(`missing ${what}`);
  return el;
}

const trigger = (host: HTMLElement) =>
  must(host.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]'), "trigger");
const items = () => [...document.body.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')];
const press = (el: Element, key: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });

describe("the picker trigger", () => {
  it("labels every language for CSS resolution and names itself before hydration", () => {
    const html = renderToStaticMarkup(
      <CodeLangMenuView available={["python", "javascript"]} preferred="python" onPick={() => {}} cssLabels />,
    );
    expect(html).toContain('data-code-lang-has="python javascript"');
    expect(html).toContain('<span class="sr-only">Code language: </span>');
    expect(html).toMatch(/<span data-code-lang-panel="python"[^>]*>[\s\S]*?Python<\/span>/);
    expect(html).toMatch(/<span data-code-lang-panel="javascript"[^>]*>[\s\S]*?JavaScript<\/span>/);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('role="menu"');
  });

  it("labels only the resolved language when the surface renders on the client", () => {
    const html = renderToStaticMarkup(
      <CodeLangMenuView available={["python", "javascript"]} preferred="typescript" onPick={() => {}} />,
    );
    expect(html).toContain("JavaScript");
    expect(html).not.toContain(">Python<");
    expect(html).not.toContain("data-code-lang-panel");
  });

  it("takes the page's muted ink on paper and the code ink on the canvas", () => {
    const globals = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
    expect(globals).toMatch(/\n\.code-lang-label\[data-tone="paper"\] \{[^}]*color: var\(--muted\);/);
    const html = renderToStaticMarkup(
      <CodeLangMenuView available={["python"]} preferred="python" onPick={() => {}} tone="paper" />,
    );
    expect(html).toContain('data-tone="paper"');
  });
});

describe("the picker's focus ring", () => {
  const globals = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
  const rule = (selector: string) => {
    const at = globals.indexOf(`\n${selector} {`);
    expect(at, `missing rule: ${selector}`).toBeGreaterThanOrEqual(0);
    return globals.slice(at, globals.indexOf("}", at));
  };

  it("draws inside the trigger, which fills its toolbar's height, keeping its radius", () => {
    // The global ring sits 2px outside and squares corners to 2px: on a
    // trigger as tall as its toolbar it spilled over the page and the editor.
    const ring = rule(".code-lang-label:focus-visible");
    expect(ring).toMatch(/outline-offset:\s*-2px/);
    expect(ring).toMatch(/border-radius:\s*var\(--radius-sm\)/);
    // --accent is steel, near-invisible on the inverted code canvas.
    expect(ring).toMatch(/outline-color:\s*var\(--tok-keyword\)/);
    expect(rule('.code-lang-label[data-tone="paper"]:focus-visible')).toMatch(/outline-color:\s*var\(--accent\)/);
  });

  it("draws inside menu items, which the menu clips at its sides", () => {
    const menu = readFileSync(join(__dirname, "..", "src", "components", "code", "CodeLangMenu.tsx"), "utf8");
    expect(menu).toMatch(/role="menuitemradio"[\s\S]*?"code-lang-option /);
    expect(rule(".code-lang-option:focus-visible")).toMatch(/outline-offset:\s*-2px/);
  });
});

describe("the picker menu", () => {
  it("opens from the keyboard on the shown language, moves with wrap, and picks", () => {
    const onPick = vi.fn();
    const host = mount(<CodeLangMenuView available={["python", "javascript"]} preferred="python" onPick={onPick} />);
    press(trigger(host), "ArrowDown");
    const menu = must(document.body.querySelector('[role="menu"]'), "menu");
    expect(menu.getAttribute("aria-label")).toBe("Code language");
    expect(items().map((b) => [b.textContent, b.getAttribute("aria-checked")])).toEqual([
      ["PyPython", "true"],
      ["JSJavaScript", "false"],
    ]);
    expect(document.activeElement).toBe(items()[0]);
    press(menu, "ArrowDown");
    expect(document.activeElement).toBe(items()[1]);
    press(menu, "ArrowDown");
    expect(document.activeElement).toBe(items()[0]);
    press(menu, "End");
    expect(document.activeElement).toBe(items()[1]);
    press(menu, "Enter");
    expect(onPick).toHaveBeenCalledWith("javascript", trigger(host));
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger(host));
  });

  it("closes on Escape without picking and returns focus", () => {
    const onPick = vi.fn();
    const host = mount(<CodeLangMenuView available={["python", "javascript"]} preferred="python" onPick={onPick} />);
    press(trigger(host), "Enter");
    press(must(document.body.querySelector('[role="menu"]'), "menu"), "Escape");
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(onPick).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger(host));
  });

  it("closes when the pointer goes down outside it", () => {
    const host = mount(<CodeLangMenuView available={["python", "javascript"]} preferred="python" onPick={() => {}} />);
    act(() => trigger(host).click());
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
    act(() => {
      document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });

  it("follows its trigger while the page scrolls, and closes once the trigger leaves the screen", () => {
    // The page scrolls smoothly, so a click during a scroll used to open and
    // instantly close the menu.
    const host = mount(<CodeLangMenuView available={["python", "javascript"]} preferred="python" onPick={() => {}} />);
    const button = trigger(host);
    let top = 300;
    button.getBoundingClientRect = () => new DOMRect(40, top, 120, 28);
    act(() => button.click());
    const panel = () => must(document.body.querySelector<HTMLElement>('[role="menu"]'), "menu").parentElement;
    expect(panel()?.style.top).toBe("332px");
    top = 200;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
    expect(panel()?.style.top).toBe("232px");
    top = -40;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });

  it("says when the preferred language is not on this surface", () => {
    const host = mount(
      <CodeLangMenuView available={["python", "javascript"]} preferred="typescript" onPick={() => {}} />,
    );
    press(trigger(host), "ArrowDown");
    const menu = must(document.body.querySelector('[role="menu"]'), "menu");
    const note = must(document.getElementById(menu.getAttribute("aria-describedby") ?? ""), "note");
    expect(note.textContent).toBe("TypeScript isn't available here — showing JavaScript.");
    expect(items().find((b) => b.getAttribute("aria-checked") === "true")?.textContent).toBe("JSJavaScript");
  });
});
