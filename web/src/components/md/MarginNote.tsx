import type { ReactNode } from "react";

/**
 * The teacher's aside — the second ink of the Riso system.
 *
 * This is the "I got this wrong for years" voice, deliberately set apart from
 * the lesson's own register. It uses `--mark` (the blue) rather than
 * `--accent` (the pink): pink means *pay attention to this*, blue means
 * *someone is talking to you*. Keeping those separate is what stops the page
 * turning into undifferentiated colour.
 *
 * Keep them short. An aside that runs longer than a couple of sentences is
 * really body text that belongs in the lesson.
 */
export function MarginNote({ children }: { children: ReactNode }) {
  return (
    <aside className="my-5 border-l-2 border-mark pl-4 text-[0.92em] text-mark [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
      {children}
    </aside>
  );
}
