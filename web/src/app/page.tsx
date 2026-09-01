import Link from "next/link";
import type { Metadata } from "next";
import { COURSES } from "@/lib/courses/registry";

export const metadata: Metadata = {
  title: "Courses",
  description: "Pick a course to start learning.",
};

export default function CatalogPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">Courses</h1>
      <p className="mt-2 text-muted">
        Pick a course to start learning.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {COURSES.map((course) => (
          <Link
            key={course.slug}
            href={
              course.status === "available"
                ? course.slug === "dsa"
                  ? "/courses/dsa/marketing"
                  : course.href
                : "#"
            }
            aria-disabled={course.status !== "available"}
            className="block rounded-[length:var(--radius-lg)] border border-border bg-elevated p-5 shadow-elevation transition-colors hover:border-accent"
            style={{ borderTopColor: course.accent, borderTopWidth: 3 }}
          >
            <h2 className="text-lg font-semibold text-foreground">
              {course.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{course.tagline}</p>
            {course.stats ? (
              <div className="mt-3 flex gap-4 text-xs text-muted">
                {course.stats.map((s) => (
                  <span key={s.label}>
                    {s.value} {s.label}
                  </span>
                ))}
              </div>
            ) : null}
            {course.status === "coming-soon" ? (
              <span className="mt-3 inline-block rounded-[length:var(--radius-xs)] border border-border px-1.5 py-0.5 text-xs text-muted">
                coming soon
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
