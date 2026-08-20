"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copyCode}
      className="rounded-[length:var(--radius-md)] p-1 text-muted opacity-0 transition group-hover:opacity-100 hover:text-foreground"
      aria-label="Copy code"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export function CodeBody({ code, html }: { code: string; html: string | null }) {
  return html ? (
    <div
      className="code-body [&_code]:font-mono [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <pre className="code-body px-4 font-mono whitespace-pre-wrap">{code}</pre>
  );
}

export function CodeBlock({
  language,
  code,
  html,
}: {
  language: string;
  code: string;
  html: string | null;
}) {
  return (
    <div className="code-surface group my-5">
      <div className="code-surface-header">
        <span className="font-mono text-xs text-muted">{language}</span>
        <CopyButton code={code} />
      </div>
      <CodeBody code={code} html={html} />
    </div>
  );
}
