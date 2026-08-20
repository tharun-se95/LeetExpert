import { ArrowRight, ChartLineUp, Code, Lightning, Stack } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const STEPS = [
  {
    icon: Lightning,
    title: "Understand",
    body: "Visual explanations and intuition — why the structure exists.",
  },
  {
    icon: Code,
    title: "Implement",
    body: "Code it yourself in an interactive editor. Both runtimes.",
  },
  {
    icon: ChartLineUp,
    title: "Visualize",
    body: "Tracers and animations make the algorithm’s moves obvious.",
  },
  {
    icon: Stack,
    title: "Solve",
    body: "Solve-first problems that build skill — not flashcards.",
  },
] as const;

/**
 * Connected numbered rail — a through-line joins the four steps instead of
 * four boxed cards. All icons share one accent wash (no rainbow status
 * tokens used as marketing decoration).
 */
export function ApproachRail({ firstLessonHref }: { firstLessonHref: string }) {
  return (
    <section className="py-8 lg:py-10">
      <p className="text-xs font-medium tracking-[0.14em] text-mark uppercase">
        Our approach
      </p>
      <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight sm:text-2xl">
        Understand → Implement → Visualize → Solve
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
        We don’t just show the solution. We build your intuition so you can
        solve anything new.
      </p>

      <ol className="relative mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <div
          className="pointer-events-none absolute top-5 right-0 left-0 hidden h-px bg-border lg:block"
          aria-hidden
        />
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="relative">
            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent ring-4 ring-background">
              <Icon weight="regular" className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-3 text-sm font-semibold">
              <span className="mr-1.5 font-mono text-xs text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              {title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ol>

      <Link
        href={firstLessonHref}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-mark transition hover:text-foreground"
      >
        See how it works
        <ArrowRight weight="bold" className="h-4 w-4" />
      </Link>
    </section>
  );
}
