import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPrevNext } from "@/lib/content/nav";

export function PrevNext({ pathname }: { pathname: string }) {
  const { prev, next } = getPrevNext(pathname);

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Previous and next"
      className="print:hidden mt-14 grid gap-3 border-t border-border pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col gap-1 rounded-lg border border-border p-4 transition hover:border-foreground/20 hover:bg-surface"
        >
          <span className="flex items-center gap-1 text-xs text-muted">
            <ArrowLeft className="h-3 w-3 transition group-hover:-translate-x-0.5" />
            Previous
          </span>
          <span className="text-sm font-medium text-foreground">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col gap-1 rounded-lg border border-border p-4 text-right transition hover:border-foreground/20 hover:bg-surface sm:items-end"
        >
          <span className="flex items-center justify-end gap-1 text-xs text-muted">
            Next
            <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
          </span>
          <span className="text-sm font-medium text-foreground">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
