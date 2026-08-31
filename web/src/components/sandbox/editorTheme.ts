import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

/**
 * CodeMirror styling for the sandbox editor.
 *
 * Every colour is a CSS custom property defined in globals.css, which means:
 *   1. light/dark switching happens in CSS, with no React re-render and no
 *      second theme object to keep in sync, and
 *   2. the palette mirrors `codePalette.ts` (same ink as Shiki handbook + viz),
 *      so all three code surfaces stay identical.
 *
 * `basicSetup.syntaxHighlighting` MUST stay false where this is used.
 * CodeMirror's built-in defaultHighlightStyle is tuned for light
 * backgrounds; leaving it on paints near-invisible tokens over a dark
 * editor, which is exactly the bug this file exists to fix.
 */

export const editorHighlight = HighlightStyle.define([
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment, t.meta], color: "var(--tok-comment)", fontStyle: "italic" },

  {
    tag: [
      t.keyword,
      t.controlKeyword,
      t.moduleKeyword,
      t.operatorKeyword,
      t.definitionKeyword,
      t.modifier,
      t.self,
    ],
    color: "var(--tok-keyword)",
  },

  { tag: [t.string, t.special(t.string), t.regexp, t.escape], color: "var(--tok-string)" },

  {
    tag: [t.number, t.bool, t.null, t.atom, t.constant(t.name), t.standard(t.name)],
    color: "var(--tok-constant)",
  },

  {
    tag: [
      t.function(t.variableName),
      t.function(t.definition(t.variableName)),
      t.definition(t.function(t.variableName)),
      t.className,
      t.definition(t.className),
      t.typeName,
      t.namespace,
      t.macroName,
    ],
    color: "var(--tok-entity)",
  },

  // Builtins (len, range, console) read as "support" in the GitHub themes.
  { tag: [t.standard(t.variableName), t.special(t.variableName)], color: "var(--tok-constant)" },

  { tag: [t.tagName, t.angleBracket], color: "var(--tok-tag)" },
  { tag: [t.attributeName, t.propertyName], color: "var(--tok-variable)" },

  // Plain identifiers stay at text colour, as GitHub does — colouring every
  // name turns a 15-line solution into confetti.
  { tag: [t.variableName, t.definition(t.propertyName)], color: "var(--tok-name)" },

  { tag: [t.operator, t.punctuation, t.bracket, t.separator], color: "var(--tok-name)" },

  { tag: [t.invalid], color: "var(--tok-invalid)" },
  { tag: [t.strong], fontWeight: "600" },
  { tag: [t.emphasis], fontStyle: "italic" },
]);

/** Chrome: gutters, caret, selection, active line — match shared .code-body. */
export const editorChrome = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "var(--tok-name)",
    fontSize: "var(--code-size)",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    lineHeight: "1.65",
  },
  ".cm-content": { padding: "0.75rem 0", caretColor: "var(--accent)" },
  ".cm-line": { padding: "0 1rem 0 0" },

  // A trough, not just dimmer numbers: the rule is what separates the
  // gutter from the text column the way an editor's does, and it keeps the
  // numbers from reading as part of the code.
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "color-mix(in oklab, var(--muted) 55%, transparent)",
    border: "none",
    borderRight: "1px solid var(--border)",
    paddingLeft: "0.75rem",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.75rem 0 0",
    minWidth: "2.25rem",
  },
  // Full-strength ink rather than the accent: "which line am I on" is a
  // position cue, not a themed one, and --accent is remapped per topic
  // family — the caret's own line should not change hue with the module.
  ".cm-activeLineGutter": {
    backgroundColor: "var(--editor-active-line)",
    color: "var(--foreground)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--editor-active-line)",
  },

  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--accent)",
    borderLeftWidth: "2px",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    { backgroundColor: "color-mix(in oklab, var(--accent) 25%, transparent)" },
  ".cm-selectionMatch": {
    backgroundColor: "color-mix(in oklab, var(--accent) 16%, transparent)",
  },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
    backgroundColor: "color-mix(in oklab, var(--accent) 22%, transparent)",
    color: "inherit",
    outline: "none",
  },
});

export const sandboxEditorTheme = [
  editorChrome,
  syntaxHighlighting(editorHighlight),
];
