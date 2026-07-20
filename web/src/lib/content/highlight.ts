import { createHighlighter, type Highlighter } from "shiki";

const SUPPORTED_LANGS = [
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "python",
  "json",
  "bash",
] as const;

const LIGHT_THEME = "github-light";
const DARK_THEME = "github-dark";

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
      themes: { light: LIGHT_THEME, dark: DARK_THEME },
      defaultColor: false,
    });
  } catch {
    return null;
  }
}
