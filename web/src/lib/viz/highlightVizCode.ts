import {
  createHighlighter,
  type Highlighter,
  type ThemedToken,
  type ThemeRegistrationRaw,
} from "shiki";
import { PRESS_DARK, PRESS_LIGHT } from "@/lib/content/codePalette";

const LANGS = ["python", "typescript"] as const;
export type VizLang = (typeof LANGS)[number];

const LIGHT_THEME = PRESS_LIGHT as unknown as ThemeRegistrationRaw;
const DARK_THEME = PRESS_DARK as unknown as ThemeRegistrationRaw;
const LIGHT_NAME = PRESS_LIGHT.name;
const DARK_NAME = PRESS_DARK.name;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [LIGHT_THEME, DARK_THEME],
      langs: [...LANGS],
    });
  }
  return highlighterPromise;
}

const cache = new Map<string, ThemedToken[][]>();

/**
 * Tokenizes a viz code snippet with both light and dark colors baked into
 * each token's `htmlStyle` (`--shiki-light` / `--shiki-dark`) — same dual-theme
 * mechanism and brand palette as handbook `highlightCode`, returned as
 * tokens-per-line so the active-line highlight bar still works.
 */
export async function tokenizeVizCode(
  code: string,
  lang: VizLang,
): Promise<ThemedToken[][]> {
  const key = `${lang}\n${code}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const highlighter = await getHighlighter();
  const { tokens } = highlighter.codeToTokens(code, {
    lang,
    themes: { light: LIGHT_NAME, dark: DARK_NAME },
    defaultColor: false,
  });
  cache.set(key, tokens);
  return tokens;
}
