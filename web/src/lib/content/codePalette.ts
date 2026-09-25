/**
 * The code palette — single source for both syntax highlighters.
 *
 * Shiki renders code blocks + viz panes; CodeMirror renders the sandbox
 * editor. They paint from these values / mirrored `--tok-*` in globals.css.
 *
 * One ink set: the code well is dark in both site themes (navy in each), so
 * there is no light variant. A light one existed until 2026-09-25 and was
 * never painted after the dark theme's well turned dark (#19).
 */

export interface CodeInk {
  fg: string;
  comment: string;
  keyword: string;
  string: string;
  constant: string;
  entity: string;
  type: string;
  variable: string;
}

export const CODE_DARK: CodeInk = {
  // Cooler, sky/mint family (was indigo/violet) — matches the ink already
  // used for dark-mode body text (--press-ink dark), so code doesn't sit in
  // a different color world than the prose around it.
  fg: "#e6edf4",
  comment: "#94a3b8",
  keyword: "#7dd3fc",
  string: "#86efac",
  constant: "#4ade80",
  entity: "#c7d2fe",
  type: "#fbbf24",
  variable: "#e6edf4",
};

/** Minimal TextMate theme shape — enough for Shiki, without pulling its types. */
interface RawTheme {
  name: string;
  type: "dark";
  colors: Record<string, string>;
  tokenColors: {
    scope: string | string[];
    settings: { foreground?: string; fontStyle?: string };
  }[];
}

function buildTheme(name: string, ink: CodeInk): RawTheme {
  return {
    name,
    type: "dark",
    colors: { "editor.background": "#00000000", "editor.foreground": ink.fg },
    tokenColors: [
      {
        scope: ["comment", "punctuation.definition.comment", "string.comment"],
        settings: { foreground: ink.comment, fontStyle: "italic" },
      },
      {
        scope: ["keyword", "storage", "storage.type", "keyword.operator.new"],
        settings: { foreground: ink.keyword },
      },
      {
        scope: ["string", "punctuation.definition.string", "string.template"],
        settings: { foreground: ink.string },
      },
      {
        scope: [
          "constant",
          "constant.numeric",
          "constant.language",
          "variable.language",
          "support.constant",
        ],
        settings: { foreground: ink.constant },
      },
      {
        scope: ["entity", "entity.name", "entity.name.function", "support.function"],
        settings: { foreground: ink.entity },
      },
      {
        scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
        settings: { foreground: ink.type },
      },
      {
        scope: ["variable", "variable.other", "variable.parameter", "meta.definition"],
        settings: { foreground: ink.variable },
      },
      { scope: ["punctuation", "meta.brace"], settings: { foreground: ink.fg } },
    ],
  };
}

export const PRESS_DARK = buildTheme("press-dark", CODE_DARK);
