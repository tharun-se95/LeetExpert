import { useSyncExternalStore } from "react";
import type { SandboxLang } from "@/components/sandbox/types";
import type { VizLang } from "@/lib/viz/highlightVizCode";

/**
 * The learner's code language, chosen once in the header.
 *
 * "js" means TypeScript wherever code is read (lesson blocks, viz panels)
 * and JavaScript wherever it runs (the sandbox runs JavaScript). The source
 * of truth is the `data-code-lang` attribute on <html>: an inline script sets
 * it from storage while the page parses, CSS hides the unchosen language in
 * server-rendered blocks, and this store reads the same attribute so client
 * components agree with what is already on screen.
 * Spec: docs/superpowers/specs/2026-09-14-global-code-language-switch-design.md
 */
export type CodeLang = "python" | "js";

export const CODE_LANG_STORAGE_KEY = "dsa-code-lang";
export const CODE_LANG_ATTRIBUTE = "data-code-lang";

export function parseCodeLang(value: unknown): CodeLang {
  return value === "js" ? "js" : "python";
}

/** Which choice a `tabs` fence language belongs to; null for any other language. */
export function codeLangForFence(fenceLanguage: string): CodeLang | null {
  if (fenceLanguage === "python") return "python";
  if (fenceLanguage === "typescript" || fenceLanguage === "javascript") return "js";
  return null;
}

export function sandboxLangFor(lang: CodeLang): SandboxLang {
  return lang === "js" ? "javascript" : "python";
}

export function readingLangFor(lang: CodeLang): VizLang {
  return lang === "js" ? "typescript" : "python";
}

const listeners = new Set<() => void>();

export function readCodeLang(): CodeLang {
  return parseCodeLang(document.documentElement.getAttribute(CODE_LANG_ATTRIBUTE));
}

export function setCodeLang(next: CodeLang): void {
  document.documentElement.setAttribute(CODE_LANG_ATTRIBUTE, next);
  try {
    localStorage.setItem(CODE_LANG_STORAGE_KEY, next);
  } catch {
    // Private mode or a full quota: the choice still holds for this session.
  }
  for (const listener of listeners) listener();
}

export function subscribeCodeLang(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab changed the choice: adopt it so every open tab agrees.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== CODE_LANG_STORAGE_KEY) return;
    document.documentElement.setAttribute(CODE_LANG_ATTRIBUTE, parseCodeLang(event.newValue));
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * The server snapshot is python: static pages render Python markup, and
 * server-rendered code blocks are corrected by CSS before paint, so only
 * interactive surfaces re-render once hydration reads the real attribute.
 */
export function useCodeLang(): [CodeLang, (next: CodeLang) => void] {
  const lang = useSyncExternalStore(subscribeCodeLang, readCodeLang, () => "python" as const);
  return [lang, setCodeLang];
}
