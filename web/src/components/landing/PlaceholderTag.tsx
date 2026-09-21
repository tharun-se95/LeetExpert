import { cn } from "@/lib/utils";

/**
 * Marks landing content that stands in for something not real yet — example
 * social proof, the showcase frames (owner, 2026-09-15: labelled everywhere,
 * production too). A dashed outline reads as "to be filled"; the word does the
 * work for screen readers. `data-placeholder` lets tests find every one. A
 * span, so it is valid inside a <dt> as well as on its own line.
 */
export function PlaceholderTag({ label, className }: { label?: string; className?: string }) {
  return (
    <span
      data-placeholder
      className={cn(
        "inline-flex w-fit flex-wrap items-center gap-x-2 rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs text-muted",
        className,
      )}
    >
      <span className="font-medium tracking-[0.14em] text-mark uppercase">Placeholder</span>
      {label ? <span>{label}</span> : null}
    </span>
  );
}
