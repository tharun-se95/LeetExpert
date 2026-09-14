"use client";

import { useId, useState } from "react";
import {
  Brain,
  Check,
  Copy,
  Key,
  Lightbulb,
  ListChecks,
  Target,
  WarningCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type CalloutType =
  | "key"
  | "brain"
  | "warn"
  | "tip"
  | "goal"
  | "constraint"
  | "default";

interface CalloutProps {
  children: React.ReactNode;
  type?: CalloutType;
  /** Optional label above the body (used by fenced callouts). */
  label?: string;
}

// Treatment B (spec 2026-09-13 §5). Colour names the *kind* of message and
// the label names the exact type, so two types may share a colour. Every
// labelled callout carries a tint (fallback A sets the tint tokens to
// transparent — a token change, not a component change) and a *-line rule,
// which clears 3:1 against the page beside it.
const TYPE_STYLE: Record<CalloutType, string> = {
  key: "border-l-insight-line bg-callout-tint-understanding",
  brain: "border-l-insight-line bg-callout-tint-understanding",
  warn: "border-l-bad-line bg-callout-tint-mistake",
  tip: "border-l-advice-line bg-callout-tint-advice",
  goal: "border-l-info-line bg-callout-tint-context",
  constraint: "border-l-good-line bg-callout-tint-requirement",
  // A plain `>` is a quotation or a formula display, not a claim: a visible
  // rule, no tint, no label, so it is never mistaken for a Key idea.
  default: "border-l-2 border-l-rule-strong",
};

const TYPE_LABELS: Partial<Record<CalloutType, string>> = {
  key: "Key idea",
  brain: "Mental model",
  warn: "Watch out",
  tip: "Tip",
  goal: "Goal",
  constraint: "Constraints",
};

/** Label and icon colour: the category's text colour, AA on its tint. */
const TYPE_LABEL_CLASS: Partial<Record<CalloutType, string>> = {
  key: "text-insight",
  brain: "text-insight",
  warn: "text-bad",
  tip: "text-mark",
  goal: "text-info",
  constraint: "text-good",
};

function TypeIcon({ type }: { type: CalloutType }) {
  const className = "h-3.5 w-3.5 shrink-0";
  switch (type) {
    case "key":
      return <Key className={className} aria-hidden />;
    case "brain":
      return <Brain className={className} aria-hidden />;
    case "warn":
      return <WarningCircle className={className} aria-hidden />;
    case "tip":
      return <Lightbulb className={className} aria-hidden />;
    case "goal":
      return <Target className={className} aria-hidden />;
    case "constraint":
      return <ListChecks className={className} aria-hidden />;
    default:
      return null;
  }
}

export function Callout({
  children,
  type = "default",
  label,
}: CalloutProps) {
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

  const resolvedLabel = label ?? TYPE_LABELS[type];
  const labelled = type !== "default";

  return (
    <blockquote
      id={id}
      className={cn(
        "group relative my-4 pr-8 pl-4 not-italic",
        labelled
          ? "border-l-3 py-2.5 rounded-r-[length:var(--radius-sm)]"
          : "py-0.5",
        TYPE_STYLE[type],
      )}
    >
      <button
        type="button"
        onClick={copyText}
        className="absolute top-1 right-0 rounded-[length:var(--radius-md)] border border-transparent p-1.5 text-muted opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:border-border hover:bg-surface hover:text-foreground"
        aria-label="Copy callout"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <div className="leading-relaxed text-foreground/90 [&_p]:my-0">
        {resolvedLabel ? (
          <p
            className={cn(
              "mb-1 !mt-0 flex items-center gap-1.5 text-[0.7rem] font-bold tracking-wide uppercase",
              TYPE_LABEL_CLASS[type] ?? "text-muted",
            )}
          >
            <TypeIcon type={type} />
            {resolvedLabel}
          </p>
        ) : null}
        {children}
      </div>
    </blockquote>
  );
}
