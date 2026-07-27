import { createHighlighter, type Highlighter, type ThemeRegistrationRaw } from "shiki";
import { RISO_LIGHT, RISO_DARK } from "@/lib/content/codePalette";

const SUPPORTED_LANGS = [
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "python",
  "json",
  "bash",
] as const;

/*
  Custom themes rather than stock ones. GitHub's palette on the Riso paper
  reads as borrowed, and — more concretely — the sandbox editor paints from
  `--tok-*` in globals.css, so a stock theme here would put the code block
  and the editor beside each other in two different colour systems.
*/
const LIGHT_THEME = RISO_LIGHT as unknown as ThemeRegistrationRaw;
const DARK_THEME = RISO_DARK as unknown as ThemeRegistrationRaw;
const LIGHT_NAME = RISO_LIGHT.name;
const DARK_NAME = RISO_DARK.name;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [LIGHT_THEME, DARK_THEME],
      langs: [...SUPPORTED_LANGS],
    });
  }
  return highlighterPromise;
}

/**
 * Highlights `code` as `lang` using both the light and dark Shiki themes in
 * one pass (via CSS variables). Returns `null` for unsupported languages or
 * if Shiki fails to tokenize the code — callers must fall back to plain
 * text in that case, never throw.
 */
export async function highlightCode(
  code: string,
  lang: string,
): Promise<string | null> {
  if (!(SUPPORTED_LANGS as readonly string[]).includes(lang)) {
    return null;
  }
  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(code, {
      lang,
      themes: { light: LIGHT_NAME, dark: DARK_NAME },
      defaultColor: false,
    });
  } catch {
    return null;
  }
}
