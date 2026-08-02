import { Users, Wrench, X } from "@phosphor-icons/react/dist/ssr";

const NOT_FOR = [
  "50-problem cram before tomorrow’s interview",
  "Video binge with no typing",
  "Certificate over skill",
] as const;

const PRACTICAL = [
  { term: "Prerequisites", detail: "Loops, functions, arrays." },
  { term: "Time", detail: "~80–120 focused hours." },
  {
    term: "Languages",
    detail: "Teach: Python + TypeScript. Run: Python + JavaScript.",
  },
] as const;

/**
 * Asymmetric split — "Who it's for" leads as the wide column; "Not for" and
 * "Practical" stack in the narrow column, divided by a rule rather than a
 * second and third box (deliberately not a 3-up card grid).
 */
export function WhoNotPractical() {
  return (
    <section className="grid gap-8 border-y border-border py-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12 lg:py-10">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-accent uppercase">
          <Users className="h-3.5 w-3.5" weight="regular" aria-hidden />
          Who it’s for
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
          Interview prep without cheat sheets
        </h2>
        <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted">
          You memorized patterns and still blank on variants. Learn the
          structure, earn the solution in the editor, then open the
          write-up.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:divide-y lg:divide-border">
        <div className="lg:pb-6">
          <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-bad uppercase">
            <X className="h-3.5 w-3.5" weight="regular" aria-hidden />
            Not for
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {NOT_FOR.map((item) => (
              <li key={item} className="flex gap-2">
                <X
                  className="mt-0.5 h-4 w-4 shrink-0 text-bad"
                  weight="bold"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:pt-6">
          <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-accent uppercase">
            <Wrench className="h-3.5 w-3.5" weight="regular" aria-hidden />
            Practical
          </p>
          <dl className="mt-3 space-y-2.5 text-sm">
            {PRACTICAL.map(({ term, detail }) => (
              <div key={term}>
                <dt className="font-semibold">{term}</dt>
                <dd className="mt-0.5 text-muted">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
