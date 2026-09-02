"use client";

import { useId, useMemo } from "react";
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
  height,
  minHeight = "10rem",
  onCursorChange,
}: {
  value: string;
  onChange: (next: string) => void;
  lang: SandboxLang;
  ariaLabel: string;
  /** Fill a flex parent (IDE layout). When set, `minHeight` is ignored. */
  height?: string;
  minHeight?: string;
  /**
   * Caret position for the status bar, 1-based as editors report it.
   * MUST be a stable reference (a setState function, or useCallback): it is
   * an extension dependency, so a new identity each render rebuilds the
   * whole extension array.
   */
  onCursorChange?: (pos: { line: number; col: number }) => void;
}) {
  const hintId = useId();

  const extensions = useMemo(
    () => [
      lang === "python" ? python() : javascript(),
      // CodeMirror defaults to 2 spaces. Every Python snippet in the course
      // uses 4, and so does the starter code — leaving the default would mix
      // widths inside one file, which in Python is a bug, not a style nit.
      indentUnit.of(lang === "python" ? "    " : "  "),
      ...sandboxEditorTheme,
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        // selectionSet alone misses the caret moving because text above it
        // changed; docChanged covers that without firing on pure scrolls.
        if (!update.selectionSet && !update.docChanged) return;
        const head = update.state.selection.main.head;
        const line = update.state.doc.lineAt(head);
        onCursorChange?.({
          line: line.number,
          col: head - line.from + 1,
        });
      }),
      EditorView.contentAttributes.of({
        "aria-label": ariaLabel,
        "aria-describedby": hintId,
      }),
    ],
    [lang, ariaLabel, hintId, onCursorChange],
  );

  return (
    // Tab is genuinely captured here for indentation (@uiw's indentWithTab,
    // left on) — correct for a Python-heavy course, but WCAG 2.1.2 then
    // requires the exit method be ADVISED, not just present. CodeMirror
    // already lets a real Escape keypress arm a short window in which Tab
    // moves focus out instead of indenting (core behaviour, unconditional) —
    // the gap was never a trap, only that nothing here ever said so.
    <div className="group relative h-full">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        {...(height ? { height } : { minHeight })}
        // Without this, @uiw injects its own default LIGHT theme — an opaque
        // white background that survives into dark mode and washes the
        // tokens out. Our chrome comes from editorTheme.ts instead.
        theme="none"
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          // Ours replaces it — see editorTheme.ts. Leaving this on would
          // layer CodeMirror's light-background default underneath and wash
          // out dark mode.
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
      <p id={hintId} className="sr-only">
        Tab indents. To move keyboard focus out of this editor, press Escape,
        then Tab.
      </p>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1.5 right-2 rounded-[length:var(--radius-xs)] bg-elevated shadow-elevation px-1.5 py-0.5 text-[0.62rem] text-muted opacity-0 transition-opacity group-focus-within:opacity-100 motion-reduce:transition-none"
      >
        Esc then Tab to leave
      </div>
    </div>
  );
}
