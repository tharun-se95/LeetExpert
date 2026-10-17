import type { ReactNode } from "react";

/**
 * The teacher's aside — the second ink of the press system.
 *
 * Uses `--info` (Sky) rather than `--accent` (Primary): accent means *pay
 * attention to this, it's interactive*; info means *someone is giving you
 * context*. Keeping those separate is what stops the page turning into
 * undifferentiated colour.
 *
 * Keep them short. An aside that runs longer than a couple of sentences is
 * really body text that belongs in the lesson.
 */
export function MarginNote({ children }: { children: ReactNode }) {
  return (
    <aside className="my-5 rounded-r-[length:var(--radius-sm)] border border-info-line/30 border-l-3 border-l-info bg-info-surface/30 p-3.5 shadow-elevation text-[0.92em] text-info [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
      <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[0.68rem] font-bold tracking-wider text-info uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-info" aria-hidden />
        Instructor Note
      </div>
      <div className="text-foreground/90">{children}</div>
    </aside>
  );
}
