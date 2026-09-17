// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CODE_LANG_ATTRIBUTE,
  CODE_LANG_IDS,
  CODE_LANG_STORAGE_KEY,
  codeLangChain,
  codeLangCss,
  parseCodeLang,
  resolveCodeLang,
  type CodeLangId,
} from "@/lib/codeLanguages";
import { readCodeLang, setCodeLang, subscribeCodeLang } from "@/lib/codeLang";
import { CODE_LANG_INIT_SCRIPT } from "@/lib/codeLangScript";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute(CODE_LANG_ATTRIBUTE);
});
afterEach(() => vi.restoreAllMocks());

describe("the registry", () => {
  it("accepts only registry ids; everything else is python", () => {
    for (const id of CODE_LANG_IDS) expect(parseCodeLang(id)).toBe(id);
    for (const junk of [null, undefined, "", "js", "JS", "Python", "ts", 1]) {
      expect(parseCodeLang(junk)).toBe("python");
    }
  });

  it("falls back to the nearest relative, then registry order, covering every language", () => {
    expect(codeLangChain("typescript")).toEqual(["typescript", "javascript", "python"]);
    expect(codeLangChain("javascript")).toEqual(["javascript", "typescript", "python"]);
    expect(codeLangChain("python")).toEqual(["python", "javascript", "typescript"]);
    for (const id of CODE_LANG_IDS) {
      expect([...codeLangChain(id)].sort()).toEqual([...CODE_LANG_IDS].sort());
    }
  });

  it("resolves a preference against the languages a surface has", () => {
    expect(resolveCodeLang("typescript", ["python", "javascript"])).toBe("javascript");
    expect(resolveCodeLang("javascript", ["python", "typescript"])).toBe("typescript");
    expect(resolveCodeLang("typescript", ["python", "typescript"])).toBe("typescript");
    expect(resolveCodeLang("javascript", ["python"])).toBe("python");
  });
});

describe("the store", () => {
  it("reads python when no attribute is set", () => {
    expect(readCodeLang()).toBe("python");
  });

  it("writes the attribute and storage, and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCodeLang(listener);
    setCodeLang("typescript");
    expect(document.documentElement.getAttribute(CODE_LANG_ATTRIBUTE)).toBe("typescript");
    expect(localStorage.getItem(CODE_LANG_STORAGE_KEY)).toBe("typescript");
    expect(readCodeLang()).toBe("typescript");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    setCodeLang("python");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("still switches for the session when storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const listener = vi.fn();
    const unsubscribe = subscribeCodeLang(listener);
    setCodeLang("javascript");
    expect(readCodeLang()).toBe("javascript");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("follows a change made in another tab, and ignores junk", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCodeLang(listener);
    window.dispatchEvent(new StorageEvent("storage", { key: CODE_LANG_STORAGE_KEY, newValue: "typescript" }));
    expect(readCodeLang()).toBe("typescript");
    window.dispatchEvent(new StorageEvent("storage", { key: CODE_LANG_STORAGE_KEY, newValue: "js" }));
    expect(readCodeLang()).toBe("python");
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated", newValue: "x" }));
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });
});

describe("the generated resolution rules", () => {
  const subsets = (ids: readonly CodeLangId[]): CodeLangId[][] =>
    ids.reduce<CodeLangId[][]>((all, id) => [...all, ...all.map((s) => [...s, id]), [id]], []);

  it("show exactly the resolved language in every block, for every preference", () => {
    // Executed, not string-matched: jsdom applies the stylesheet.
    const style = document.createElement("style");
    style.textContent = codeLangCss();
    document.head.append(style);
    const mismatches: string[] = [];
    for (const preferred of [null, ...CODE_LANG_IDS]) {
      if (preferred) document.documentElement.setAttribute(CODE_LANG_ATTRIBUTE, preferred);
      else document.documentElement.removeAttribute(CODE_LANG_ATTRIBUTE);
      for (const available of subsets(CODE_LANG_IDS)) {
        const block = document.createElement("div");
        block.setAttribute("data-code-lang-has", available.join(" "));
        for (const id of available) {
          const label = document.createElement("span");
          label.setAttribute("data-code-lang-panel", id);
          const wrapper = document.createElement("button");
          wrapper.append(label);
          block.append(wrapper);
        }
        document.body.append(block);
        const shown = [...block.querySelectorAll("[data-code-lang-panel]")]
          .filter((el) => getComputedStyle(el).display !== "none")
          .map((el) => el.getAttribute("data-code-lang-panel"));
        const expected = resolveCodeLang(preferred ?? "python", available);
        if (shown.join(",") !== expected) {
          mismatches.push(`${preferred}: [${available}] showed [${shown}], expected ${expected}`);
        }
        block.remove();
      }
    }
    style.remove();
    expect(mismatches).toEqual([]);
  });
});

describe("the pre-paint script", () => {
  const run = (storage: { getItem: (key: string) => string | null }) => {
    const attrs = new Map<string, string>();
    const fakeDocument = {
      documentElement: { setAttribute: (k: string, v: string) => attrs.set(k, v) },
    };
    // Executed, not string-matched: the script is what the browser runs.
    new Function("document", "localStorage", CODE_LANG_INIT_SCRIPT)(fakeDocument, storage);
    return attrs;
  };

  it("sets every registry id that is stored", () => {
    for (const id of CODE_LANG_IDS) {
      expect(run({ getItem: () => id }).get(CODE_LANG_ATTRIBUTE)).toBe(id);
    }
  });

  it("sets nothing for junk or an empty store", () => {
    for (const stored of ["js", "JS", "", null]) {
      expect(run({ getItem: () => stored }).size).toBe(0);
    }
  });

  it("survives storage that throws", () => {
    expect(
      run({
        getItem: () => {
          throw new Error("blocked");
        },
      }).size,
    ).toBe(0);
  });

  it("runs while the HTML parses, after the lamp's boot script, with the rules right after it", () => {
    // Plain inline tags: next/script beforeInteractive is queued and run by
    // Next's bootstrap after the JS chunks load, which is after first paint.
    const layout = readFileSync(join(__dirname, "..", "src", "app", "layout.tsx"), "utf8");
    expect(layout).toMatch(
      /<script dangerouslySetInnerHTML=\{\{ __html: LAMP_BOOT_SCRIPT \}\} \/>\s*\{\/\*[\s\S]*?\*\/\}\s*<script\s+id="code-lang-init"\s+dangerouslySetInnerHTML=\{\{ __html: CODE_LANG_INIT_SCRIPT \}\}\s*\/>\s*<style\s+id="code-lang-rules"\s+dangerouslySetInnerHTML=\{\{ __html: CODE_LANG_CSS \}\}\s*\/>/,
    );
    // Usage, not the word: the layout's own comment explains why it is not used.
    expect(layout).not.toMatch(/strategy=["'{]\s*["']?beforeInteractive/);
  });

  it("imports nothing that uses React hooks, since the server layout imports it", () => {
    // tsc and these tests cannot see Next's server/client boundary: when this
    // module reached codeLang.ts (useSyncExternalStore), every route 500'd.
    const src = join(__dirname, "..", "src");
    const script = readFileSync(join(src, "lib", "codeLangScript.ts"), "utf8");
    const imports = [...script.matchAll(/from "@\/([^"]+)"/g)].map((m) => m[1]);
    expect(imports.length).toBeGreaterThan(0);
    for (const path of imports) {
      const imported = readFileSync(join(src, `${path}.ts`), "utf8");
      expect(imported, path).not.toMatch(/from "react"/);
    }
  });
});
