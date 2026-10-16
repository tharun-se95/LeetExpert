// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { CodeLangSwitch } from "@/components/layout/CodeLangSwitch";
import { setCodeLang, readCodeLang } from "@/lib/codeLang";
import { CODE_LANG_ATTRIBUTE } from "@/lib/codeLanguages";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});

beforeEach(() => {
  document.documentElement.removeAttribute(CODE_LANG_ATTRIBUTE);
  localStorage.clear();
});

function mount(ui: ReactElement): HTMLElement {
  const host = document.createElement("div");
  document.body.append(host);
  const created = createRoot(host);
  root = created;
  act(() => created.render(ui));
  return host;
}

const press = (el: Element, key: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });

const click = (el: Element) =>
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });

describe("CodeLangSwitch static markup", () => {
  it("renders a radiogroup with python and javascript options", () => {
    const html = renderToStaticMarkup(<CodeLangSwitch />);
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="Code language"');
    expect(html).toContain('aria-label="Python"');
    expect(html).toContain('aria-label="JavaScript"');
  });
});

describe("CodeLangSwitch interactive", () => {
  it("reflects default python selection", () => {
    const host = mount(<CodeLangSwitch />);
    const py = host.querySelector<HTMLButtonElement>('button[aria-label="Python"]');
    const js = host.querySelector<HTMLButtonElement>('button[aria-label="JavaScript"]');

    expect(py?.getAttribute("aria-checked")).toBe("true");
    expect(js?.getAttribute("aria-checked")).toBe("false");
    expect(py?.getAttribute("tabindex")).toBe("0");
    expect(js?.getAttribute("tabindex")).toBe("-1");
  });

  it("switches to javascript on click", () => {
    const host = mount(<CodeLangSwitch />);
    const js = host.querySelector<HTMLButtonElement>('button[aria-label="JavaScript"]');
    expect(js).toBeDefined();

    click(js!);

    expect(readCodeLang()).toBe("javascript");
    expect(js?.getAttribute("aria-checked")).toBe("true");
    const py = host.querySelector<HTMLButtonElement>('button[aria-label="Python"]');
    expect(py?.getAttribute("aria-checked")).toBe("false");
  });

  it("switches to python on click", () => {
    setCodeLang("javascript");
    const host = mount(<CodeLangSwitch />);
    const py = host.querySelector<HTMLButtonElement>('button[aria-label="Python"]');

    click(py!);

    expect(readCodeLang()).toBe("python");
    expect(py?.getAttribute("aria-checked")).toBe("true");
  });

  it("navigates between languages using arrow keys", () => {
    const host = mount(<CodeLangSwitch />);
    const py = host.querySelector<HTMLButtonElement>('button[aria-label="Python"]');

    press(py!, "ArrowRight");
    expect(readCodeLang()).toBe("javascript");

    const js = host.querySelector<HTMLButtonElement>('button[aria-label="JavaScript"]');
    press(js!, "ArrowLeft");
    expect(readCodeLang()).toBe("python");
  });
});
