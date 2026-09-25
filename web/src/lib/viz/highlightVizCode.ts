import type { CSSProperties } from "react";
import {
  createHighlighter,
  type Highlighter,
  type ThemedToken,
  type ThemeRegistrationRaw,
} from "shiki";
import { PRESS_DARK } from "@/lib/content/codePalette";

const LANGS = ["python", "typescript"] as const;
export type VizLang = (typeof LANGS)[number];

const THEME = PRESS_DARK as unknown as ThemeRegistrationRaw;
const THEME_NAME = PRESS_DARK.name;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: [...LANGS],
    });
  }
  return highlighterPromise;
}

const cache = new Map<string, ThemedToken[][]>();

/**
 * Tokenizes a viz code snippet with the same palette as handbook
 * `highlightCode`, returned as tokens-per-line so the active-line highlight
 * bar still works. Each token carries its colour; see `vizTokenStyle`.
 */
export async function tokenizeVizCode(
  code: string,
  lang: VizLang,
): Promise<ThemedToken[][]> {
  const key = `${lang}\n${code}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const highlighter = await getHighlighter();
  const { tokens } = highlighter.codeToTokens(code, { lang, theme: THEME_NAME });
  cache.set(key, tokens);
  return tokens;
}

/*
  Shiki's FontStyle.Italic bit. FontStyle is a `declare const enum`, which tsc
  inlines but esbuild and SWC (vitest, Next) compile file by file and cannot:
  imported, it is undefined at runtime.
*/
const ITALIC = 1;

/**
 * A token's React style. Shiki's own `getTokenStyleObject` returns kebab-case
 * keys (`font-style`), which React's `style` prop does not accept.
 */
export function vizTokenStyle(token: ThemedToken): CSSProperties {
  return {
    color: token.color,
    fontStyle: (token.fontStyle ?? 0) & ITALIC ? "italic" : undefined,
  };
}
