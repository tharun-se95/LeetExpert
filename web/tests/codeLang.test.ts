// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CODE_LANG_ATTRIBUTE,
  CODE_LANG_STORAGE_KEY,
  codeLangForFence,
  parseCodeLang,
  readCodeLang,
  readingLangFor,
  sandboxLangFor,
  setCodeLang,
  subscribeCodeLang,
} from "@/lib/codeLang";
import { CODE_LANG_INIT_SCRIPT } from "@/lib/codeLangScript";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute(CODE_LANG_ATTRIBUTE);
});
afterEach(() => vi.restoreAllMocks());

describe("parsing and mapping", () => {
  it("accepts only js as the alternative; everything else is python", () => {
    expect(parseCodeLang("js")).toBe("js");
    expect(parseCodeLang("python")).toBe("python");
    for (const junk of [null, undefined, "", "JS", "javascript", "typescript", 1]) {
      expect(parseCodeLang(junk)).toBe("python");
    }
  });

  it("maps fence languages onto the two choices", () => {
    expect(codeLangForFence("python")).toBe("python");
    expect(codeLangForFence("typescript")).toBe("js");
    expect(codeLangForFence("javascript")).toBe("js");
    expect(codeLangForFence("go")).toBeNull();
  });

  it("runs JavaScript in the sandbox and reads TypeScript in viz panels", () => {
    expect(sandboxLangFor("js")).toBe("javascript");
    expect(sandboxLangFor("python")).toBe("python");
    expect(readingLangFor("js")).toBe("typescript");
    expect(readingLangFor("python")).toBe("python");
  });
});

describe("the store", () => {
  it("reads python when no attribute is set", () => {
    expect(readCodeLang()).toBe("python");
  });

  it("writes the attribute and storage, and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCodeLang(listener);
    setCodeLang("js");
    expect(document.documentElement.getAttribute(CODE_LANG_ATTRIBUTE)).toBe("js");
    expect(localStorage.getItem(CODE_LANG_STORAGE_KEY)).toBe("js");
    expect(readCodeLang()).toBe("js");
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
    setCodeLang("js");
    expect(readCodeLang()).toBe("js");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("follows a change made in another tab", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCodeLang(listener);
    window.dispatchEvent(
      new StorageEvent("storage", { key: CODE_LANG_STORAGE_KEY, newValue: "js" }),
    );
    expect(readCodeLang()).toBe("js");
    expect(listener).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated", newValue: "x" }));
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
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

  it("sets js when js is stored", () => {
    expect(run({ getItem: () => "js" }).get(CODE_LANG_ATTRIBUTE)).toBe("js");
  });

  it("sets nothing for python, junk or an empty store", () => {
    for (const stored of ["python", "JS", null]) {
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

  it("runs while the HTML parses, right after the lamp's boot script, not from Next's bootstrap", () => {
    // The lamp's boot script must stay first in <body>; ours follows it. Both
    // are plain inline scripts: next/script beforeInteractive is queued and run
    // by Next's bootstrap after the JS chunks load, which is after first paint.
    const layout = readFileSync(join(__dirname, "..", "src", "app", "layout.tsx"), "utf8");
    expect(layout).toMatch(
      /<script dangerouslySetInnerHTML=\{\{ __html: LAMP_BOOT_SCRIPT \}\} \/>\s*\{\/\*[\s\S]*?\*\/\}\s*<script\s+id="code-lang-init"\s+dangerouslySetInnerHTML=\{\{ __html: CODE_LANG_INIT_SCRIPT \}\}\s*\/>/,
    );
    expect(layout).not.toContain("beforeInteractive");
  });
});
