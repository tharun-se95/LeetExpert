import Link from "next/link";
import { ConstellationJourney } from "@/components/explorers/ConstellationJourney";
import { FamilyCards } from "@/components/home/FamilyCards";
import { FOUNDATIONS, STATIC_PAGES } from "@/lib/content/manifest";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--accent)_12%,transparent),_transparent_60%)]"
      />
      <div className="relative mx-auto max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Think in patterns, not problems
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          DSA Pattern Handbook
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Thousands of interview questions shrink into a small set of repeating
          patterns. Learn to name the pattern, understand why it works, and
          spot it again under pressure.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/foundations/solving-problems"
            className="inline-flex h-10 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            Start with foundations
          </Link>
          <Link
            href="/patterns/linear-traversal"
            className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium transition hover:bg-surface"
          >
            Browse patterns
          </Link>
          <Link
            href="/decision-trees"
            className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-muted transition hover:bg-surface hover:text-foreground"
          >
            Decision observatory
          </Link>
        </div>

        <section className="mt-14">
          <ConstellationJourney />
        </section>

        <section className="mt-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Family portals
              </h2>
              <p className="mt-1 text-sm text-muted">
                Step into a lab — each portal remembers how many patterns you
                have visited.
              </p>
            </div>
          </div>
          <FamilyCards />
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold">Part 1 — Foundations</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {FOUNDATIONS.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/foundations/${c.slug}`}
                    className="transition hover:text-foreground"
                  >
                    {c.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold">Recognition toolkit</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link href={STATIC_PAGES.recognition.href} className="hover:text-foreground">
                  Guide + walkthrough
                </Link>
              </li>
              <li>
                <Link href={STATIC_PAGES.stems.href} className="hover:text-foreground">
                  Practice stems
                </Link>
              </li>
              <li>
                <Link href={STATIC_PAGES.decisionTrees.href} className="hover:text-foreground">
                  Decision trees
                </Link>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold">Drill & refresh</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link href="/cheat-sheets" className="hover:text-foreground">
                  Cheat sheets
                </Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-foreground">
                  Practice roadmap
                </Link>
              </li>
              <li>
                <Link href={STATIC_PAGES.glossary.href} className="hover:text-foreground">
                  Glossary
                </Link>
              </li>
              <li>
                <Link href={STATIC_PAGES.questionBank.href} className="hover:text-foreground">
                  Question bank
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
