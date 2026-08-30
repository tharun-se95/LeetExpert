"use client";

import { useId, useState } from "react";
import {
  Brain,
  Check,
  Copy,
  Info,
  Lightbulb,
  ListChecks,
  RocketLaunch,
  WarningCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type CalloutType =
  | "tip"
  | "note"
  | "goal"
  | "constraint"
  | "warn"
  | "rocket"
  | "build"
  | "brain"
  | "default";

interface CalloutProps {
  children: React.ReactNode;
  type?: CalloutType;
  /** Optional label above the body (used by fenced callouts). */
  label?: string;
}

// A rule + label, not a filled box: the callout sits on the page's own
// background, distinguished by a coloured left rule and a small status
// label — the same treatment the coach's diagnosis card uses. A solid
// pastel/dark fill on every Goal/Constraint/Tip in 191 lessons was the
// loudest thing on the page; the colour still tells you the type, it just
// no longer competes with the prose it's introducing.
const TYPE_RULE: Record<CalloutType, string> = {
  tip: "border-l-warn",
  note: "border-l-info",
  goal: "border-l-info",
  constraint: "border-l-good",
  warn: "border-l-warn",
  rocket: "border-l-info",
  build: "border-l-good",
  brain: "border-l-insight",
  default: "border-l-border",
};

const TYPE_LABELS: Partial<Record<CalloutType, string>> = {
  tip: "Tip",
  note: "Note",
  goal: "Goal",
  constraint: "Constraints",
  warn: "Watch out",
  brain: "Mental model",
  build: "Build",
  rocket: "Ship",
};

const TYPE_ICON_CLASS: Partial<Record<CalloutType, string>> = {
  tip: "text-warn",
  note: "text-info",
  goal: "text-info",
  constraint: "text-good",
  warn: "text-warn",
  brain: "text-insight",
  build: "text-good",
  rocket: "text-info",
};

function TypeIcon({ type }: { type: CalloutType }) {
  const className = cn("h-3.5 w-3.5 shrink-0", TYPE_ICON_CLASS[type]);
  switch (type) {
    case "tip":
      return <Lightbulb className={className} aria-hidden />;
    case "note":
    case "goal":
    case "rocket":
      return <Info className={className} aria-hidden />;
    case "constraint":
      return <ListChecks className={className} aria-hidden />;
    case "warn":
      return <WarningCircle className={className} aria-hidden />;
    case "brain":
      return <Brain className={className} aria-hidden />;
    case "build":
      return <RocketLaunch className={className} aria-hidden />;
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

  return (
    <blockquote
      id={id}
      className={cn(
        "group relative my-4 border-l-2 py-0.5 pr-8 pl-4 not-italic",
        TYPE_RULE[type] ?? TYPE_RULE.default,
      )}
    >
      <button
        type="button"
        onClick={copyText}
        className="absolute top-1 right-0 rounded-[length:var(--radius-md)] border border-transparent p-1.5 text-muted opacity-0 transition group-hover:opacity-100 hover:border-border hover:bg-surface hover:text-foreground"
        aria-label="Copy callout"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <div className="text-[0.95rem] leading-relaxed text-foreground/90 [&_p]:my-0">
        {resolvedLabel ? (
          <p className="mb-1 !mt-0 flex items-center gap-1.5 text-[0.7rem] font-medium tracking-wide text-muted uppercase">
            <TypeIcon type={type} />
            {resolvedLabel}
          </p>
        ) : null}
        {children}
      </div>
    </blockquote>
  );
}
