"use client";

import { Printer } from "lucide-react";

export function PrintAllButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-3 text-sm font-medium text-background transition hover:opacity-90"
    >
      <Printer className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
