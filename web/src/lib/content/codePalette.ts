/**
 * The code palette — single source for both syntax highlighters.
 *
 * Shiki renders code blocks + viz panes; CodeMirror renders the sandbox
 * editor. They paint from these values / mirrored `--tok-*` in globals.css.
 *
 * Tuned for Indigo Modern (Primary #5B5CEB).
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
  keyword: "#5b5ceb",
  string: "#047857",
  constant: "#4f46e5",
  entity: "#4338ca",
  type: "#b45309",
  variable: "#111827",
};

export const CODE_DARK: CodeInk = {
  fg: "#f9fafc",
  comment: "#a1a1aa",
  keyword: "#818cf8",
  string: "#22d497",
  constant: "#a5b4fc",
  entity: "#c4b5fd",
  type: "#f59e0b",
  variable: "#f9fafc",
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
