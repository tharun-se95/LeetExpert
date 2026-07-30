import Link from "next/link";
import {
  ArrowRight,
  Books,
  ChartLineUp,
  Check,
  Code,
  Eye,
  Gift,
  GithubLogo,
  Lightning,
  Path as PathIcon,
  Stack,
  Users,
  Wrench,
  X,
} from "@phosphor-icons/react/dist/ssr";
import {
  ContinueBanner,
  StickyCta,
} from "@/components/landing/ContinueAndSticky";
import { HeroStatsArray } from "@/components/landing/HeroStatsArray";
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

const FAQ = [
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
    a: "Roughly 80–120 hours of focused study across 191 lessons — pace yourself. A steady few lessons a week finishes in a few months.",
  },
  {
    q: "How is this different from grinding LeetCode?",
    a: "We teach the structure first, then make you solve before the write-up. Patterns become consequences of understanding — not flashcards.",
  },
] as const;

const FEATURES = [
  {
    icon: Books,
    label: "Interactive lessons",
    tone: "bg-accent/10 text-accent",
  },
  {
    icon: Eye,
    label: "Visual explanations",
    tone: "bg-good/10 text-good",
  },
  {
    icon: Code,
    label: "Real-world practice",
    tone: "bg-warn/10 text-warn",
  },
  {
    icon: ChartLineUp,
    label: "Track progress",
    tone: "bg-tone-sky/10 text-tone-sky",
  },
] as const;

const APPROACH = [
  {
    icon: Lightning,
    title: "Understand",
    body: "Visual explanations and intuition — why the structure exists.",
    tone: "bg-accent/10 text-accent",
  },
  {
    icon: Code,
    title: "Implement",
    body: "Code it yourself in an interactive editor. Both runtimes.",
    tone: "bg-good/10 text-good",
  },
  {
    icon: ChartLineUp,
    title: "Visualize",
    body: "Tracers and animations make the algorithm’s moves obvious.",
    tone: "bg-warn/10 text-warn",
  },
  {
    icon: Stack,
    title: "Solve",
    body: "Solve-first problems that build skill — not flashcards.",
    tone: "bg-tone-sky/10 text-tone-sky",
  },
] as const;

function SectionLabel({
  children,
  icon: Icon,
  tone = "text-accent",
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; weight?: "regular" | "bold" }>;
  tone?: string;
}) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-accent uppercase">
      {Icon ? <Icon className={`h-3.5 w-3.5 ${tone}`} weight="regular" /> : null}
      {children}
    </p>
  );
}

/**
 * Brand-mockup home layout — curriculum map at `/course`.
 * Hero keeps the curriculum read/write stats array (honest counts only).
 */
export default function HomePage() {
  const stats = curriculumStats();
  const statTiles = [
    { label: "Modules", value: stats.modules },
    { label: "Concepts", value: stats.concepts },
    { label: "Lessons", value: stats.lessons },
    { label: "Problems", value: stats.problems },
  ] as const;

  return (
    <div className="relative pb-20">
      <ContinueBanner />

      {/* Hero — copy | curriculum scan */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8 lg:py-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              Interactive learning platform
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.85rem] lg:leading-[1.08]">
              Understand deeply.{" "}
              <span className="text-accent">Build confidently.</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-[0.95rem]">
              Master data structures through interactive lessons,
              visualizations, and solve-first practice — until the pattern is
              muscle memory.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href={FIRST_LESSON}
                className="inline-flex h-10 items-center gap-2 rounded-[length:var(--radius-md)] bg-pop px-4 text-sm font-semibold text-on-pop transition hover:bg-accent-hover"
              >
                Start learning for free
                <ArrowRight weight="bold" className="h-4 w-4" />
              </Link>
              <Link
                href={CURRICULUM}
                className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-border bg-surface px-3.5 text-sm font-medium transition hover:border-foreground/20"
              >
                Explore curriculum
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
              {FEATURES.map(({ icon: Icon, label, tone }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 text-xs font-medium text-muted"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-[length:var(--radius-sm)] ${tone}`}
                  >
                    <Icon weight="regular" className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <HeroStatsArray tiles={statTiles} />
        </div>
      </section>

      {/* Early bird strip */}
      <section className="border-b border-border bg-accent/8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
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
        </div>
      </section>

      {/* Audience — one band, vertical rules */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid sm:grid-cols-3">
            <div className="border-b border-border py-7 sm:border-r sm:border-b-0 sm:pr-6 lg:py-8 lg:pr-8">
              <SectionLabel icon={Users}>Who it’s for</SectionLabel>
              <h2 className="mt-2 font-display text-base font-semibold tracking-tight">
                Interview prep without cheat sheets
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                You memorized patterns and still blank on variants. Learn the
                structure, earn the solution in the editor, then open the
                write-up.
              </p>
            </div>
            <div className="border-b border-border py-7 sm:border-r sm:border-b-0 sm:px-6 lg:py-8 lg:px-8">
              <SectionLabel icon={X} tone="text-bad">
                Not for
              </SectionLabel>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li className="flex gap-2">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-bad" weight="bold" />
                  50-problem cram before tomorrow’s interview
                </li>
                <li className="flex gap-2">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-bad" weight="bold" />
                  Video binge with no typing
                </li>
                <li className="flex gap-2">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-bad" weight="bold" />
                  Certificate over skill
                </li>
              </ul>
            </div>
            <div className="py-7 sm:pl-6 lg:py-8 lg:pl-8">
              <SectionLabel icon={Wrench}>Practical</SectionLabel>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div>
                  <dt className="font-semibold">Prerequisites</dt>
                  <dd className="mt-0.5 text-muted">Loops, functions, arrays.</dd>
                </div>
                <div>
                  <dt className="font-semibold">Time</dt>
                  <dd className="mt-0.5 text-muted">~80–120 focused hours.</dd>
                </div>
                <div>
                  <dt className="font-semibold">Languages</dt>
                  <dd className="mt-0.5 text-muted">
                    Teach: Python + TypeScript. Run: Python + JavaScript.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Approach — copy left, cards right */}
      <section className="border-b border-border bg-code/30">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-8 lg:px-8 lg:py-10">
          <div>
            <SectionLabel>Our approach</SectionLabel>
            <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Understand → Implement → Solve
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              We don’t just show the solution. We build your intuition so you
              can solve anything new.
            </p>
            <Link
              href={FIRST_LESSON}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-foreground"
            >
              See how it works
              <ArrowRight weight="bold" className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {APPROACH.map(({ icon: Icon, title, body, tone }, i) => (
              <li
                key={title}
                className="elevated-card relative rounded-[length:var(--radius-md)] border border-border bg-surface p-3.5"
              >
                {i % 2 === 0 ? (
                  <PathIcon
                    className="pointer-events-none absolute top-1/2 -right-2 z-10 hidden h-3.5 w-3.5 -translate-y-1/2 text-muted sm:block lg:hidden"
                    weight="bold"
                    aria-hidden
                  />
                ) : null}
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-[length:var(--radius-sm)] ${tone}`}
                >
                  <Icon weight="regular" className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="mt-2.5 text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* See it in action — copy | viz */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-8 lg:px-8 lg:py-10">
          <div className="lg:pt-1">
            <SectionLabel>See it in action</SectionLabel>
            <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Visualizations aren’t decoration. They teach.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Same tracers you’ll use inside lessons — flip topics; one live viz
              at a time.
            </p>
          </div>
          <LandingVizStrip />
        </div>
      </section>

      {/* Start path */}
      <section className="border-b border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-2 lg:px-8 lg:py-9">
          <div>
            <SectionLabel>Start here</SectionLabel>
            <h2 className="mt-1.5 font-display text-lg font-semibold tracking-tight">
              First three lessons
            </h2>
            <ol className="mt-3 space-y-1.5">
              {START_HERE.map((step, i) => (
                <li key={step.href}>
                  <Link
                    href={step.href}
                    className="flex items-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-background px-3 py-2 transition hover:border-accent/40"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-[length:var(--radius-sm)] bg-pop font-mono text-[0.65rem] font-bold text-on-pop">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-semibold">
                      {step.title}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted" weight="bold" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionLabel>Jump in by topic</SectionLabel>
            <h2 className="mt-1.5 font-display text-lg font-semibold tracking-tight">
              Popular modules
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {TOPIC_CHIPS.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="rounded-[length:var(--radius-sm)] border border-border bg-background px-2.5 py-1.5 text-sm font-medium transition hover:border-accent/40 hover:bg-accent/5"
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

      {/* Author + waitlist */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl lg:grid-cols-2">
          <div className="border-b border-border px-4 py-8 lg:border-r lg:border-b-0 lg:px-8 lg:py-9">
            <SectionLabel>Why this exists</SectionLabel>
            <h2 className="mt-1.5 font-display text-lg font-semibold tracking-tight">
              A note from the author
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">
              Tired of courses that skip the “why” and problem sites that skip
              the teaching. This is the handbook I wanted: structures from first
              principles, implemented for real, drilled until the pattern is
              obvious.
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
          <div className="px-4 py-8 lg:px-8 lg:py-9">
            <SectionLabel>Paid launch</SectionLabel>
            <h2 className="mt-1.5 font-display text-lg font-semibold tracking-tight">
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
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-9">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-1.5 font-display text-lg font-semibold tracking-tight">
            Common questions
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="elevated-card group rounded-[length:var(--radius-md)] border border-border bg-surface px-3.5 py-2.5"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.q}
                    <span className="text-muted group-open:hidden">+</span>
                    <span className="hidden text-muted group-open:inline">−</span>
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-pop">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-on-pop">
              Start while it’s free
            </h2>
            <p className="mt-1 text-sm text-on-pop/80">{EARLY_BIRD_LINE}</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-pop/90">
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
              className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-on-pop/30 px-3.5 text-sm font-medium text-on-pop"
            >
              Curriculum
            </Link>
          </div>
        </div>
      </section>

      <StickyCta />
    </div>
  );
}
