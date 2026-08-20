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
  tip: "border-warn/30 bg-warn-surface",
  note: "border-info/30 bg-info-surface",
  goal: "border-info/30 bg-info-surface",
  constraint: "border-good/30 bg-good-surface",
  warn: "border-warn/30 bg-warn-surface",
  rocket: "border-info/30 bg-info-surface",
  build: "border-good/30 bg-good-surface",
  brain: "border-insight/30 bg-insight-surface",
  default: "border-border bg-surface",
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
  const className = cn("h-4 w-4 shrink-0", TYPE_ICON_CLASS[type]);
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
        "group relative my-4 rounded-[length:var(--radius-md)] border px-4 py-3 not-italic",
        TYPE_STYLES[type] ?? TYPE_STYLES.default,
      )}
    >
      <button
        type="button"
        onClick={copyText}
        className="absolute right-2 top-2 rounded-[length:var(--radius-md)] border border-transparent p-1.5 text-muted opacity-0 transition group-hover:opacity-100 hover:border-border hover:bg-background hover:text-foreground"
        aria-label="Copy callout"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <div className="pr-8 text-[0.95rem] leading-relaxed text-foreground/90 [&_p]:my-0">
        {resolvedLabel ? (
          <p className="mb-1.5 !mt-0 flex items-center gap-2 text-[0.95rem] font-bold text-foreground">
            <TypeIcon type={type} />
            {resolvedLabel}
          </p>
        ) : null}
        {children}
      </div>
    </blockquote>
  );
}
