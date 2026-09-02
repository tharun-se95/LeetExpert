import type { Metadata } from "next";
import Link from "next/link";
import { Circle } from "@phosphor-icons/react/dist/ssr";
import { MODULES } from "./manifest";
import { NEXTJS_COURSE } from "./registry";

export const metadata: Metadata = { title: NEXTJS_COURSE.title };

export default function NextjsCoursePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 lg:px-8 lg:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Next.js Interview Prep
      </p>
      <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Course curriculum
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        {NEXTJS_COURSE.tagline}
      </p>

      <div className="mt-8 space-y-6">
        {MODULES.map((mod) => (
          <section
            key={mod.slug}
            className="rounded-[length:var(--radius-lg)] border border-border bg-elevated p-5 shadow-elevation"
          >
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-xs font-semibold text-muted">
                {String(mod.number).padStart(2, "0")}
              </span>
              <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                {mod.title}
              </h2>
            </div>
            <p className="mt-1.5 text-sm text-muted">{mod.description}</p>

            <div className="mt-4 space-y-3">
              {mod.chapters.map((chapter) => (
                <div key={chapter.slug}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {chapter.title}
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {chapter.lessons.map((lesson) => (
                      <li key={lesson.slug}>
                        <Link
                          href={`/courses/nextjs/${mod.slug}/${chapter.slug}/${lesson.slug}`}
                          className="flex items-center gap-2 rounded-[length:var(--radius-xs)] px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-surface"
                        >
                          <Circle
                            className="h-3.5 w-3.5 shrink-0 text-muted"
                            weight="regular"
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {lesson.title}
                          </span>
                          {lesson.depth === "advanced" ? (
                            <span className="shrink-0 rounded-[length:var(--radius-xs)] border border-border px-1.5 py-0.5 text-[0.65rem] text-muted">
                              advanced
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
