import Link from "next/link";
import {
  ArrowRight,
  Books,
  Browser,
  ChartLineUp,
  Check,
  Clock,
  Code,
  CurrencyDollar,
  Eye,
  Gift,
  GithubLogo,
  Lightning,
  Quotes,
  Sparkle,
  Stack,
  Target,
} from "@phosphor-icons/react/dist/ssr";
import {
  StickyCta,
} from "@/components/landing/ContinueAndSticky";
import { ApproachRail } from "@/components/landing/ApproachRail";
import { FamilySpotlight } from "@/components/landing/FamilySpotlight";
import { LandingSandbox } from "@/components/landing/LandingSandbox";
import { LandingVizStrip } from "@/components/landing/LandingViz";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import {
  CURRICULUM,
  EARLY_BIRD_LINE,
  FIRST_LESSON,
  GITHUB_REPO,
  START_HERE,
  TOPIC_CHIPS,
  curriculumStats,
} from "@/lib/landing/content";

/** FAQ items. Lesson counts come from the manifest at render time — one
 * source of truth for what "the course has N lessons" means everywhere. */
function buildFaq(lessonCount: number) {
  return [
    {
      q: "Is it really free?",
      a: "Yes — during early bird. Access stays free until we ship a paid launch. Join the waitlist below if you want notice when that changes.",
    },
    {
      q: "Which languages?",
      a: "Lessons teach in Python and TypeScript. Sandboxes run Python and JavaScript (types stripped so the browser can execute).",
    },
    {
      q: "Do I need a CS degree?",
      a: "No. Comfortable writing basic loops and functions is enough. Stage 0 builds the analysis vocabulary the rest of the course uses.",
    },
    {
      q: "How long does it take?",
      a: `Roughly 80–120 hours of focused study across ${lessonCount} lessons — pace yourself. A steady few lessons a week finishes in a few months.`,
    },
    {
      q: "How is this different from grinding LeetCode?",
      a: "We teach the structure first, then make you solve before the write-up. Patterns become consequences of understanding — not flashcards.",
    },
  ] as const;
}

const FEATURES = [
  { icon: Books, label: "Interactive lessons" },
  { icon: Eye, label: "Visual explanations" },
  { icon: Code, label: "Real-world practice" },
  { icon: ChartLineUp, label: "Track progress" },
] as const;

/** The product's real proof points — what the live sandbox to the left
 * actually does. Copy is grounded in the shipped runner, not aspiration. */
const SANDBOX_POINTS = [
  {
    icon: Lightning,
    title: "Runs in-browser",
    body: "Python via Pyodide, JS natively. Zero setup, works offline once loaded.",
  },
  {
    icon: Check,
    title: "Real test cases",
    body: "Edge cases included — the ones that catch the mistakes you'd actually make.",
  },
  {
    icon: Code,
    title: "Both languages",
    body: "Every problem ships starter code and a reference solution in Python and JavaScript.",
  },
  {
    icon: Target,
    title: "Solve-first",
    body: "The write-up stays hidden until you've tried — no spoilers, no passive reading.",
  },
] as const;

/** Why the course exists, as differentiators — replaces the older
 * who/not/practical split with a single scannable grid. */
const WHY = [
  {
    icon: Stack,
    title: "Structure before syntax",
    body: "We teach why a structure exists and what it costs — so new problems become variations you can reason about, not puzzles you have to have seen.",
  },
  {
    icon: Clock,
    title: "Built for retention",
    body: "Solve-first ordering, spaced quizzes and progress tracking. You come back because the next thing is right there, not buried.",
  },
  {
    icon: Browser,
    title: "Nothing to install",
    body: "The whole course runs in the browser — editor, runtime, tests, visualizations. Open a tab, start learning, on any machine.",
  },
  {
    icon: Target,
    title: "Interview-honest",
    body: "Content maps to how interviews actually test — the patterns that recur and the edge cases interviewers reach for.",
  },
  {
    icon: Code,
    title: "Two runtimes, one lesson",
    body: "Learn the idea once; see it in Python and JavaScript side by side. Switch languages without losing your place.",
  },
  {
    icon: Sparkle,
    title: "Free while in early access",
    body: "Every lesson, every sandbox, both runtimes — open now, no card. Pricing arrives only when the paid tier ships.",
  },
] as const;

/**
 * TODO(launch): replace with REAL, attributed testimonials before going
 * live. CLAUDE.md forbids shipping fabricated content on the paid page —
 * these bracketed placeholders exist only to lock the layout and MUST NOT
 * ship as-is. Drop the whole section if real quotes aren't ready by launch.
 */
const TESTIMONIALS = [
  {
    quote:
      "The tracers finally made recursion click. I'd read the same explanation five times elsewhere — watching the call stack build itself was the thing that landed.",
    name: "[Learner name]",
    detail: "[role · company]",
  },
  {
    quote:
      "Solve-first is brutal in the best way. Being forced to try before the write-up unlocked is why I actually remember two pointers now instead of re-googling it.",
    name: "[Learner name]",
    detail: "[role · company]",
  },
  {
    quote:
      "The complexity breakdowns finally made Big-O intuitive. I can look at a nested loop now and know the cost without second-guessing every time.",
    name: "[Learner name]",
    detail: "[role · company]",
  },
] as const;

function SectionLabel({
  children,
  icon: Icon,
  tone = "text-accent",
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{
    className?: string;
    weight?: "regular" | "bold";
  }>;
  tone?: string;
}) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-accent uppercase">
      {Icon ? (
        <Icon className={`h-3.5 w-3.5 ${tone}`} weight="regular" />
      ) : null}
      {children}
    </p>
  );
}

/**
 * DSA course home. Editorial rhythm over a uniform card stack: hero with
 * the live pattern-family spotlight, a stat band, alternating feature
 * splits wrapping the REAL viz + sandbox (not screenshots), the method
 * rail, a why grid, social proof, pricing, and the waitlist. Curriculum
 * counts are read from the manifest — honest numbers only.
 */
export default function HomePage() {
  const stats = curriculumStats();
  const faq = buildFaq(stats.lessons);

  return (
    <div className="relative pb-24">
      <div className="mx-auto max-w-6xl space-y-8 px-4 pt-8 lg:space-y-12 lg:px-8 lg:pt-14">
        {/* Hero */}
        <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[length:var(--radius-sm)] bg-pop font-mono text-[11px] font-bold text-on-pop"
                aria-hidden
              >
                {"</>"}
              </span>
              <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
                Interactive DSA course
              </p>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.85rem] lg:leading-[1.08]">
              Data structures, the way they{" "}
              <span className="text-accent">finally click.</span>
            </h1>
            <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted sm:mt-3 sm:text-[0.95rem]">
              Learn every structure from first principles — visual
              explanations, live in-browser sandboxes, and solve-first practice
              until the pattern is muscle memory, not a flashcard.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6">
              <Link
                href={FIRST_LESSON}
                className="inline-flex h-10 items-center gap-2 rounded-[length:var(--radius-md)] bg-pop px-4 text-sm font-semibold text-on-pop transition hover:bg-accent-hover"
              >
                Start learning for free
                <ArrowRight weight="bold" className="h-4 w-4" />
              </Link>
              <Link
                href={CURRICULUM}
                className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-accent/40 bg-background px-3.5 text-sm font-medium text-accent transition hover:border-accent hover:bg-accent/5"
              >
                Explore curriculum
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted">
              Free now —{" "}
              <a
                href="#paid-launch"
                className="font-medium text-accent underline decoration-accent/40 underline-offset-2 transition hover:text-foreground hover:decoration-accent"
              >
                get a heads-up before we charge
              </a>
              .
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5 sm:mt-7">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-xs font-medium text-muted"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-[length:var(--radius-sm)] bg-accent/10 text-accent">
                    <Icon
                      weight="regular"
                      className="h-3.5 w-3.5"
                      aria-hidden
                    />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <FamilySpotlight stats={stats} />
        </section>

        {/* Early bird — inset panel, not full-bleed */}
        <section className="flex flex-col gap-3 rounded-[length:var(--radius-lg)] border border-border bg-accent/[0.07] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Gift weight="regular" className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-sm text-foreground">
              <span className="font-semibold">
                Early Bird Offer · Free until we launch.
              </span>{" "}
              <span className="text-muted">
                All {stats.lessons} lessons, both runtimes, every sandbox — free
                now.
              </span>
            </p>
          </div>
          <Link
            href={FIRST_LESSON}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[length:var(--radius-md)] border border-border bg-surface px-3.5 text-sm font-semibold transition hover:border-accent/40"
          >
            Claim free access
            <ArrowRight weight="bold" className="h-4 w-4" />
          </Link>
        </section>
      </div>

      {/* Stat band — honest curriculum counts, full-bleed */}
      <section className="mt-8 border-y border-border bg-elevated lg:mt-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-4 py-8 sm:grid-cols-4 lg:px-8">
          {[
            { value: String(stats.modules), label: "modules" },
            { value: String(stats.lessons), label: "lessons" },
            { value: String(stats.problems), label: "solve-first problems" },
            { value: "2", label: "runtimes, zero setup" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col items-center gap-1 px-2 ${
                i > 0 ? "sm:border-l sm:border-border" : ""
              }`}
            >
              <span className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {s.value}
              </span>
              <span className="text-center font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 pt-16 pb-10 lg:space-y-20 lg:px-8 lg:pt-20 lg:pb-14">
        {/* Feature: visual explanations — full-width header, then the LIVE
            viz strip gets the whole row. It already splits itself in two
            (tracer | code) — squeezing it beside a text column halved that
            split again and clipped the code panel around ~260px wide. */}
        <section>
          <div className="max-w-2xl">
            <SectionLabel>See it in action</SectionLabel>
            <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight sm:text-2xl">
              See the algorithm think.
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">
              Static diagrams freeze one moment. Our tracers replay the whole
              run — every pointer glide, every eliminated branch, every stack
              frame — using one visual grammar across every module.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5">
              {[
                "Step through forward and back — code line, data, and pointers stay in lockstep.",
                "One grammar everywhere: cells, pointers and ranges mean the same thing in arrays as in trees and graphs.",
                "Reduced-motion aware — it settles on the finished frame, never a barrier.",
              ].map((point) => (
                <li key={point} className="flex max-w-sm gap-2.5 text-sm text-muted">
                  <Check
                    weight="bold"
                    className="mt-0.5 h-4 w-4 shrink-0 text-mark"
                    aria-hidden
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <LandingVizStrip />
          </div>
        </section>

        {/* Feature: live sandbox — the LIVE sandbox + proof points */}
        <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <LandingSandbox />
          <div>
            <SectionLabel>Your turn</SectionLabel>
            <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight sm:text-2xl">
              Your code, judged instantly.
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">
              No installs, no boilerplate, no “clone this repo.” Write a
              solution, hit Run, and watch real test cases pass or fail — the
              same editor and runner inside every lesson.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SANDBOX_POINTS.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-[length:var(--radius-md)] border border-border bg-elevated shadow-elevation p-4"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-[length:var(--radius-sm)] bg-accent/10 text-accent">
                    <Icon weight="regular" className="h-4 w-4" aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ApproachRail firstLessonHref={FIRST_LESSON} />

        {/* Why this course — differentiator grid */}
        <section>
          <div className="flex flex-col items-center text-center">
            <SectionLabel>Why leetExpert</SectionLabel>
            <h2 className="mt-1.5 max-w-xl font-display text-xl font-bold tracking-tight sm:text-2xl">
              Not another video course you’ll never finish.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-[length:var(--radius-md)] bg-accent/10 text-accent">
                  <Icon weight="regular" className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-base font-bold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Start path */}
        <section className="rounded-[length:var(--radius-lg)] border border-border bg-surface p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <SectionLabel>Start here</SectionLabel>
              <h2 className="mt-1.5 font-display text-lg font-bold tracking-tight">
                First three lessons
              </h2>
              <ol className="mt-3 space-y-2">
                {START_HERE.map((step, i) => (
                  <li key={step.href}>
                    <Link
                      href={step.href}
                      className="flex items-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated shadow-elevation px-3 py-2.5 transition hover:border-accent/40"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-[length:var(--radius-sm)] bg-pop font-mono text-[0.65rem] font-bold text-on-pop">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-semibold">
                        {step.title}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 text-muted"
                        weight="bold"
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <SectionLabel>Jump in by topic</SectionLabel>
              <h2 className="mt-1.5 font-display text-lg font-bold tracking-tight">
                Popular modules
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {TOPIC_CHIPS.map((chip) => (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    className="rounded-[length:var(--radius-sm)] border border-border bg-elevated px-2.5 py-1.5 text-sm font-medium transition hover:border-accent/40 hover:bg-accent/5"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
              <Link
                href={CURRICULUM}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-foreground"
              >
                Full curriculum map
                <ArrowRight weight="bold" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/*
          TODO(launch): social proof is placeholder. Replace every
          [bracketed] field with a real, attributed testimonial (name + role
          the person approved) before this ships to the paid page, or delete
          the section. Fabricated testimonials must not go live — see
          CLAUDE.md §3 (content standards) and §6 (reporting).
        */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionLabel>Early learners</SectionLabel>
              <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight sm:text-2xl">
                What early learners are saying.
              </h2>
            </div>
            <span className="hidden font-mono text-[11px] text-muted/70 sm:block">
              [placeholder — replace before launch]
            </span>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.quote}
                className="flex flex-col rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation p-6"
              >
                <Quotes
                  weight="fill"
                  className="h-7 w-7 text-surface"
                  aria-hidden
                />
                <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-foreground">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    className="h-9 w-9 shrink-0 rounded-full bg-surface"
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {t.name}
                    </span>
                    <span className="block font-mono text-[11px] text-muted">
                      {t.detail}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/*
          TODO(launch): pricing is a placeholder. The Pro price is [$X] and
          the Pro feature list is unconfirmed — do not ship a fabricated
          price to the paid page (CLAUDE.md §3/§6). Set a real price and
          real inclusions, or keep only the free tier, before launch.
        */}
        <section>
          <div className="flex flex-col items-center text-center">
            <SectionLabel icon={CurrencyDollar}>Pricing</SectionLabel>
            <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight sm:text-2xl">
              Free now. Fair later.
            </h2>
            <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted">
              Everything is open while leetExpert is in early access. When the
              paid tier ships, early learners keep a founding rate.
            </p>
          </div>
          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
            {/* Free — real, current offer */}
            <div className="relative rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation p-6">
              <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-good-surface px-2.5 py-1 text-[11px] font-semibold text-good">
                <span className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden />
                Available now
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
                Early access
              </p>
              <p className="mt-3 font-display text-4xl font-bold tracking-tight">
                Free
              </p>
              <p className="mt-1.5 text-sm text-muted">
                The full course, no card. While early access lasts.
              </p>
              <Link
                href={FIRST_LESSON}
                className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[length:var(--radius-md)] bg-pop text-sm font-semibold text-on-pop transition hover:bg-accent-hover"
              >
                Start learning free
              </Link>
              <ul className="mt-5 space-y-2.5">
                {[
                  `All ${stats.modules} modules & ${stats.lessons} lessons`,
                  "Live sandboxes, both runtimes",
                  `All ${stats.problems} solve-first problems`,
                  "Progress tracking",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm text-muted"
                  >
                    <Check
                      weight="bold"
                      className="mt-0.5 h-4 w-4 shrink-0 text-mark"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Pro — PLACEHOLDER, do not ship */}
            <div className="rounded-[length:var(--radius-lg)] border border-border bg-surface p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                Pro · coming soon
              </p>
              <p className="mt-3 font-display text-4xl font-bold tracking-tight text-muted">
                [$X]
                <span className="text-base font-normal text-muted/70">/mo</span>
              </p>
              <p className="mt-1.5 text-sm text-muted">
                For when the paid tier ships — founding rate locked for early
                learners.
              </p>
              <a
                href="#paid-launch"
                className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[length:var(--radius-md)] border border-accent/40 bg-background text-sm font-medium text-accent transition hover:border-accent"
              >
                Get founding-rate notice
              </a>
              <ul className="mt-5 space-y-2.5">
                {[
                  "Everything in Early access",
                  "[Mock interviews — planned]",
                  "[Certificates — planned]",
                  "[Priority support — planned]",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-muted">
                    <Check
                      weight="bold"
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted/60"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Author + waitlist */}
        <section
          id="paid-launch"
          className="overflow-hidden rounded-[length:var(--radius-lg)] border border-border"
        >
          <div className="grid lg:grid-cols-[1.5fr_1fr]">
            <div className="border-b border-border p-6 lg:border-r lg:border-b-0 lg:p-8">
              <SectionLabel>Why this exists</SectionLabel>
              <h2 className="mt-1.5 font-display text-lg font-bold tracking-tight">
                A note from the author
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                Tired of courses that skip the “why” and problem sites that skip
                the teaching. This is the handbook I wanted: structures from
                first principles, implemented for real, drilled until the
                pattern is obvious.
              </p>
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-foreground"
              >
                <GithubLogo weight="bold" className="h-4 w-4" />
                Source on GitHub
              </a>
            </div>
            <div className="p-6 lg:p-8">
              <SectionLabel>Paid launch</SectionLabel>
              <h2 className="mt-1.5 font-display text-lg font-bold tracking-tight">
                Get notified
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Heads-up before we charge. Stored in your browser until a real
                waitlist backend ships.
              </p>
              <div className="mt-3">
                <WaitlistForm />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-1.5 font-display text-lg font-bold tracking-tight">
            Common questions
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-[length:var(--radius-md)] border border-border bg-surface px-3.5 py-2.5"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.q}
                    <span aria-hidden className="text-muted group-open:hidden">
                      +
                    </span>
                    <span aria-hidden className="hidden text-muted group-open:inline">
                      −
                    </span>
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Closing — inset pop panel */}
        <section
          id="closing-cta"
          className="flex flex-col gap-4 rounded-[length:var(--radius-lg)] bg-pop px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8"
        >
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-on-pop">
              Start while it’s free
            </h2>
            <p className="mt-1 text-sm text-on-pop">{EARLY_BIRD_LINE}</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-pop">
              <li className="inline-flex items-center gap-1.5">
                <Check weight="bold" className="h-3.5 w-3.5" /> Full curriculum
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Check weight="bold" className="h-3.5 w-3.5" /> Both runtimes
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Check weight="bold" className="h-3.5 w-3.5" /> Live sandboxes
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={FIRST_LESSON}
              className="inline-flex h-10 items-center gap-2 rounded-[length:var(--radius-md)] bg-background px-4 text-sm font-semibold text-foreground"
            >
              Start free
              <ArrowRight weight="bold" className="h-4 w-4" />
            </Link>
            <Link
              href={CURRICULUM}
              className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-on-pop/35 px-3.5 text-sm font-medium text-on-pop"
            >
              Curriculum
            </Link>
          </div>
        </section>
      </div>

      <StickyCta />
    </div>
  );
}
