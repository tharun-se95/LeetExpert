import { createHighlighter, type Highlighter, type ThemeRegistrationRaw } from "shiki";
import { PRESS_LIGHT, PRESS_DARK } from "@/lib/content/codePalette";

export const SUPPORTED_LANGS = [
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "python",
  "json",
  "bash",
] as const;

/*
  Lesson markdown fences the way authors actually type them — `ts`, `js`,
  `py`, `sh` — not the canonical Shiki grammar ids. Without this map those
  fences silently fell through the SUPPORTED_LANGS gate below and rendered
  as unhighlighted plain text everywhere in the app, since `lang` is
  compared by strict equality, not against Shiki's own internal aliases.
*/
export const LANG_ALIASES: Record<string, (typeof SUPPORTED_LANGS)[number]> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  sh: "bash",
  shell: "bash",
  jsonc: "json",
};

function canonicalLang(lang: string): string {
  return LANG_ALIASES[lang] ?? lang;
}

/*
  Custom themes rather than stock ones. GitHub's palette on the press paper
  reads as borrowed, and — more concretely — the sandbox editor paints from
  `--tok-*` in globals.css, so a stock theme here would put the code block
  and the editor beside each other in two different colour systems.
*/
const LIGHT_THEME = PRESS_LIGHT as unknown as ThemeRegistrationRaw;
const DARK_THEME = PRESS_DARK as unknown as ThemeRegistrationRaw;
const LIGHT_NAME = PRESS_LIGHT.name;
const DARK_NAME = PRESS_DARK.name;

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
  const resolvedLang = canonicalLang(lang);
  if (!(SUPPORTED_LANGS as readonly string[]).includes(resolvedLang)) {
    return null;
  }
  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(code, {
      lang: resolvedLang,
      themes: { light: LIGHT_NAME, dark: DARK_NAME },
      defaultColor: false,
    });
  } catch {
    return null;
  }
}
