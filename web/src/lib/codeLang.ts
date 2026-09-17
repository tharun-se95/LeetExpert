import { useSyncExternalStore } from "react";
import {
  CODE_LANG_ATTRIBUTE,
  CODE_LANG_STORAGE_KEY,
  DEFAULT_CODE_LANG,
  parseCodeLang,
  type CodeLangId,
} from "@/lib/codeLanguages";

/**
 * The learner's preferred code language, picked from any code surface's menu.
 * The source of truth is the `data-code-lang` attribute on <html>: an inline
 * script sets it from storage while the page parses, generated CSS resolves
 * server-rendered blocks from it, and this store reads the same attribute so
 * client components agree with what is already on screen.
 * Spec: docs/superpowers/specs/2026-09-14-global-code-language-switch-design.md
 */
const listeners = new Set<() => void>();

export function readCodeLang(): CodeLangId {
  return parseCodeLang(document.documentElement.getAttribute(CODE_LANG_ATTRIBUTE));
}

export function setCodeLang(next: CodeLangId): void {
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
 * server-rendered code blocks are resolved by CSS before paint, so only
 * interactive surfaces re-render once hydration reads the real attribute.
 */
export function useCodeLang(): [CodeLangId, (next: CodeLangId) => void] {
  const lang = useSyncExternalStore(subscribeCodeLang, readCodeLang, () => DEFAULT_CODE_LANG);
  return [lang, setCodeLang];
}
