"use client";

import { Printer } from "lucide-react";
import Link from "next/link";

export function PrintButton() {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted transition hover:bg-surface hover:text-foreground"
        aria-label="Print or export this page as PDF"
      >
        <Printer className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Export PDF</span>
      </button>
      <Link
        href="/print"
        className="hidden h-8 items-center rounded-md px-2 text-xs text-muted transition hover:text-foreground lg:inline-flex"
        title="Open full handbook printable view"
      >
        All pages
      </Link>
    </div>
  );
}
