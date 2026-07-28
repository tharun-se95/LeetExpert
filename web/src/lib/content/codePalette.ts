/**
 * The code palette — single source for both syntax highlighters.
 *
 * Shiki renders code blocks server-side; CodeMirror renders the sandbox
 * editor client-side. They are different engines, so the only way they stay
 * identical is by both painting from these values. Shiki reads them from
 * here directly; CodeMirror reads the `--tok-*` custom properties in
 * globals.css, which mirror this file — change one, change both.
 *
 * A note on the ink discipline: the Riso page chrome is strictly limited to
 * olive/lime (accent + pop), blue (mark), and the status inks. Code is the
 * deliberate exception. Syntax colour is functional, not decorative — a
 * reader has to tell a string from a number at a glance — so this palette
 * carries the extra hues it needs. They are tuned warm to sit on the riso
 * paper rather than fight it.
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
  fg: "#17150f",
  comment: "#8a8071",
  keyword: "#c41d60",
  string: "#046b4f",
  constant: "#2a56a8",
  entity: "#7a3ea8",
  type: "#a85a17",
  variable: "#17150f",
};

export const CODE_DARK: CodeInk = {
  fg: "#f3ece0",
  comment: "#7c7466",
  keyword: "#ff5c9c",
  string: "#24d69a",
  constant: "#7fa9ff",
  entity: "#c9a6ff",
  type: "#ffab70",
  variable: "#f3ece0",
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
    // Backgrounds stay transparent — the page's own surface shows through,
    // exactly as the previous github themes were overridden to do.
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
