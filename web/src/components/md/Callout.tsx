"use client";

import { useId, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface CalloutProps {
  children: React.ReactNode;
  type?: "tip" | "warn" | "rocket" | "build" | "brain" | "default";
}

const TYPE_STYLES: Record<string, string> = {
  tip: "border-l-accent bg-accent/5",
  warn: "border-l-amber-500 bg-amber-500/5",
  rocket: "border-l-sky-500 bg-sky-500/5",
  build: "border-l-good bg-good/5",
  brain: "border-l-violet-500 bg-violet-500/5",
  default: "border-l-border bg-surface",
};

export function Callout({ children, type = "default" }: CalloutProps) {
  const [copied, setCopied] = useState(false);
  const id = useId();

  async function copyText() {
    const el = document.getElementById(id);
    const text = el?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <blockquote
      id={id}
      className={cn(
        "riso-halftone group relative my-5 rounded-r-lg border border-border border-l-4 px-4 py-3 not-italic",
        TYPE_STYLES[type] ?? TYPE_STYLES.default,
      )}
    >
      <button
        type="button"
        onClick={copyText}
        className="absolute right-2 top-2 rounded-md border border-transparent p-1.5 text-muted opacity-0 transition group-hover:opacity-100 hover:border-border hover:bg-background hover:text-foreground"
        aria-label="Copy callout"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <div className="pr-8 text-[0.95rem] leading-relaxed text-foreground/90 [&_p]:my-0">
        {children}
      </div>
    </blockquote>
  );
}
