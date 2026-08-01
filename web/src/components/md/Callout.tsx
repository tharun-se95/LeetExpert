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

const TYPE_STYLES: Record<CalloutType, string> = {
  tip: "border-l-accent bg-accent/5",
  note: "border-l-info bg-info/[0.06]",
  goal: "border-l-info bg-info/5",
  constraint: "border-l-good bg-good/[0.06]",
  warn: "border-l-warn bg-warn/5",
  rocket: "border-l-info bg-info/5",
  build: "border-l-good bg-good/5",
  brain: "border-l-insight bg-insight/5",
  default: "border-l-border bg-surface",
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
  tip: "text-accent",
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
        "group relative my-5 rounded-lg border border-border border-l-4 px-4 py-3 not-italic",
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
        {resolvedLabel ? (
          <p className="mb-1.5 !mt-0 flex items-center gap-1.5 font-mono text-[0.65rem] font-semibold tracking-[0.12em] text-muted uppercase">
            <TypeIcon type={type} />
            {resolvedLabel}
          </p>
        ) : null}
        {children}
      </div>
    </blockquote>
  );
}
