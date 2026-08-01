import type { ReactNode } from "react";

/**
 * The teacher's aside — the second ink of the Riso system.
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
    <aside className="my-5 border-l-2 border-info pl-4 text-[0.92em] text-info [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
      {children}
    </aside>
  );
}
