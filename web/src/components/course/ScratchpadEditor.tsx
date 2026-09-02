"use client";

import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { sandboxEditorTheme } from "@/components/sandbox/editorTheme";

/**
 * A standalone CodeMirror instance for TSX practice write-ups — not the
 * DSA `CodeEditor` primitive, which is typed to `SandboxLang`
 * ("python" | "javascript") for the algorithm-judge sandbox. Course
 * lessons here write React/Next.js snippets, not judged pure functions,
 * so this needs `javascript({ jsx: true, typescript: true })` instead —
 * a genuinely different language configuration, not a variant worth
 * bending the judge-sandbox primitive's type to cover.
 */
export function ScratchpadEditor({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
}) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme="none"
      extensions={[
        javascript({ jsx: true, typescript: true }),
        indentUnit.of("  "),
        ...sandboxEditorTheme,
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      ]}
      minHeight="10rem"
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        syntaxHighlighting: false,
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
