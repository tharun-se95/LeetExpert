"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { sandboxEditorTheme } from "@/components/sandbox/editorTheme";
import type { SandboxLang } from "@/components/sandbox/types";

/**
 * CodeMirror 6, painted with the site's own token palette.
 *
 * The language packs matter more than the colours: `lang-python` parses with
 * a real grammar, so it knows a line ending in `:` opens a block and indents
 * accordingly. In a course where a misplaced `return` silently changes the
 * algorithm, heuristic indentation is not good enough.
 *
 * Reached only through a dynamic import (see Sandbox), so the ~185 lessons
 * without a sandbox never download it.
 */
export function CodeEditor({
  value,
  onChange,
  lang,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  lang: SandboxLang;
  ariaLabel: string;
}) {
  const extensions = useMemo(
    () => [
      lang === "python" ? python() : javascript(),
      // CodeMirror defaults to 2 spaces. Every Python snippet in the course
      // uses 4, and so does the starter code — leaving the default would mix
      // widths inside one file, which in Python is a bug, not a style nit.
      indentUnit.of(lang === "python" ? "    " : "  "),
      ...sandboxEditorTheme,
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
    ],
    [lang, ariaLabel],
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      minHeight="10rem"
      // Without this, @uiw injects its own default LIGHT theme — an opaque
      // white background that survives into dark mode and washes the tokens
      // out. Our chrome comes from editorTheme.ts instead.
      theme="none"
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        // Ours replaces it — see editorTheme.ts. Leaving this on would layer
        // CodeMirror's light-background default underneath and wash out dark
        // mode.
        syntaxHighlighting: false,
        // The page owns Ctrl/Cmd+F; a second search box inside the editor
        // would shadow it while focused.
        searchKeymap: false,
        autocompletion: false,
        highlightActiveLine: true,
        bracketMatching: true,
        closeBrackets: true,
        indentOnInput: true,
      }}
    />
  );
}
