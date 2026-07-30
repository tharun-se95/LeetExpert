/**
 * The code palette — single source for both syntax highlighters.
 *
 * Shiki renders code blocks + viz panes; CodeMirror renders the sandbox
 * editor. They are different engines, so the only way they stay identical
 * is by both painting from these values. Shiki reads them from here
 * directly; CodeMirror reads the `--tok-*` custom properties in
 * globals.css, which mirror this file — change one, change both.
 *
 * Tuned for the codeMacha Brand Design System v1.0 accent #6E63FF.
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

export const CODE_LIGHT: CodeInk = {
  fg: "#111827",
  comment: "#6b7280",
  keyword: "#6e63ff",
  string: "#047857",
  constant: "#5c53f2",
  entity: "#7c3aed",
  type: "#b45309",
  variable: "#111827",
};

export const CODE_DARK: CodeInk = {
  fg: "#ffffff",
  comment: "#7b8193",
  keyword: "#6e63ff",
  string: "#34d399",
  constant: "#7c74ff",
  entity: "#a78bfa",
  type: "#fbbf24",
  variable: "#ffffff",
};

/** Minimal TextMate theme shape — enough for Shiki, without pulling its types. */
interface RawTheme {
  name: string;
  type: "light" | "dark";
  colors: Record<string, string>;
  tokenColors: {
    scope: string | string[];
    settings: { foreground?: string; fontStyle?: string };
  }[];
}

function buildTheme(name: string, type: "light" | "dark", ink: CodeInk): RawTheme {
  return {
    name,
    type,
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

export const RISO_LIGHT = buildTheme("riso-light", "light", CODE_LIGHT);
export const RISO_DARK = buildTheme("riso-dark", "dark", CODE_DARK);
