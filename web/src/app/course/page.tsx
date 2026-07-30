import Link from "next/link";
import { ArrowRight, BookOpen, Lock } from "@phosphor-icons/react/dist/ssr";
import { MODULES, STAGES, modulesByStage } from "@/lib/course/manifest";
import { moduleHref } from "@/lib/course/nav";
import { cn } from "@/lib/utils";

/**
 * Full curriculum map — stages and modules. The marketing sell page lives
 * at `/`; this is where learners browse structure before (or after) starting.
 */
export default function CourseOverviewPage() {
  const availableCount = MODULES.filter(
    (m) => m.status === "available",
  ).length;

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--accent)_12%,transparent),_transparent_60%)]"
      />
      <div className="relative mx-auto max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Curriculum
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-balance uppercase sm:text-5xl">
          Course overview
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {MODULES.length} modules, built in order. Every structure taught from
          first principles — how it works in memory, what operations really
          cost and why, implemented from scratch — then drilled with
          solve-first problems and quizzes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/course/getting-started/course-introduction"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-pop px-4 text-sm font-semibold text-on-pop transition hover:opacity-90"
          >
            Start the course
            <ArrowRight weight="bold" className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium transition hover:bg-surface"
          >
            Back to home
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted">
          {availableCount} of {MODULES.length} modules live — the rest are
          being written in curriculum order.
        </p>

        {STAGES.map((stage) => (
          <section key={stage.number} className="mt-14">
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Stage {stage.number} — {stage.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                {stage.description}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {modulesByStage(stage.number).map((module) => {
                const available = module.status === "available";
                return (
                  <Link
                    key={module.slug}
                    href={moduleHref(module.slug)}
                    className={cn(
                      "group flex flex-col rounded-xl border border-border p-4 transition hover:border-accent/40 hover:bg-surface",
                      !available && "opacity-70",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums text-muted">
                        {String(module.number).padStart(2, "0")}
                      </span>
                      {available ? (
                        <BookOpen
                          weight="bold"
                          className="h-3.5 w-3.5 text-accent"
                        />
                      ) : (
                        <Lock
                          weight="bold"
                          className="h-3.5 w-3.5 text-muted/60"
                        />
                      )}
                      {!available ? (
                        <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted/70">
                          Soon
                        </span>
                      ) : (
                        <span className="ml-auto font-mono text-[10px] tracking-wide text-muted">
                          {module.lessons.length} lessons
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-semibold">
                      {module.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">
                      {module.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
