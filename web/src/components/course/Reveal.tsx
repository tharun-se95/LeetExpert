"use client";

import { useState, type ReactNode } from "react";
import { CaretRight as ChevronRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function Reveal({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-4 overflow-hidden rounded-[length:var(--radius-md)] border border-border/70 bg-surface/30 transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full min-h-11 items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-foreground touch-manipulation focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        aria-expanded={open}
      >
        <ChevronRight
          size={14}
          weight="bold"
          className={cn(
            "shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease)] text-muted group-hover:text-foreground",
            open && "rotate-90 text-foreground",
          )}
        />
        <span>{label}</span>
      </button>
      {open ? (
        <div className="border-t border-border/50 px-4 pt-2 pb-3.5">{children}</div>
      ) : null}
    </div>
  );
}
