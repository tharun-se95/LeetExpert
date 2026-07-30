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
    <div className="my-4 rounded-xl border border-border bg-surface/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-muted transition hover:text-foreground"
        aria-expanded={open}
      >
        <ChevronRight
          className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-90")}
        />
        {label}
      </button>
      {open ? (
        <div className="border-t border-border px-4 pb-3 pt-1">{children}</div>
      ) : null}
    </div>
  );
}
