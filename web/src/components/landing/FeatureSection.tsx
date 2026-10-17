import Link from "next/link";
import {
  ArrowRight,
  Cards,
  Code,
  Fire,
  Gauge,
  ListNumbers,
  PlayCircle,
  Sparkle,
  Target,
  TreeStructure,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { KICKER, STOP } from "@/components/landing/landingClasses";
import { MarkedHeading } from "@/components/landing/MarkedHeading";
import { SectionDeco } from "@/components/landing/SectionDeco";
import type { FeatureSection as Section, SectionId, VerbId } from "@/lib/landing/features";
import { familyCssVars } from "@/lib/visual/familyTheme";
import { cn } from "@/lib/utils";

export type WindowContent = {
  body: ReactNode;
  /** Names the component for screen readers. */
  label: string;
  link?: { label: string; href: string };
  /** A second line under the feature's own line (Burn: the credits line). */
  note?: string;
  /** The component has no height of its own (the map, the list, the coach), so its card sets one. */
  fill?: boolean;
};

const VERB_ICON: Record<VerbId, Icon> = {
  watch: PlayCircle,
  learn: ListNumbers,
  map: TreeStructure,
  code: Code,
  review: Sparkle,
  optimize: Gauge,
  practice: Target,
  recall: Cards,
  burn: Fire,
};

export const SECTION_ICON: Record<SectionId, Icon> = {
  understand: TreeStructure,
  build: Code,
  keep: Fire,
};

/**
 * One of Understand, Build and Keep (owner, 2026-09-17), its three features
 * stacked as rows (owner, 2026-09-23: "no more scroll to reveal" — every
 * feature on the page at once): the feature's icon, name, line and link beside
 * its component, the text on alternate sides. Each component floats in a 3D
 * card that tilts in as it arrives, and the heading's key word is drawn over;
 * all of that is CSS on view timelines (globals.css, "Landing motion"), so the
 * page scrolls natively and a still page is the finished design.
 * Spec: docs/superpowers/specs/2026-09-23-landing-natural-scroll-3d-hero-design.md
 */
export function FeatureSection({
  section,
  windows,
}: {
  section: Section;
  windows: Record<VerbId, WindowContent>;
}) {
  const SectionIcon = SECTION_ICON[section.id];
  return (
    <section
      data-scroll-section
      id={section.id}
      // The family's colour, scoped to this section's content (marks, icons, rules).
      style={familyCssVars(section.family)}
      className={cn(STOP, "relative border-t border-border")}
    >
      <SectionDeco id={section.id} />
      <p className={cn(KICKER, "landing-pop flex items-center gap-2.5")}>
        <SectionIcon weight="bold" className="h-5 w-5 text-accent" aria-hidden />
        {section.title}
        <span aria-hidden className="landing-kline" />
      </p>
      <MarkedHeading text={section.heading} mark={section.mark} />
      <p className="landing-pop mt-5 max-w-3xl text-xl leading-relaxed text-muted">{section.lede}</p>

      <div className="mt-12 flex flex-col gap-16 lg:mt-16 lg:gap-20">
        {section.verbs.map((verb, i) => {
          const content = windows[verb.id];
          const VerbIcon = VERB_ICON[verb.id];
          const flip = i % 2 === 1;
          return (
            <div
              key={verb.id}
              id={verb.id}
              data-flip={flip || undefined}
              className={cn(
                // The component takes two thirds of the row (owner, 2026-09-24:
                // at 7:5 the real app screens read small beside the headings);
                // the text column needs no more than its three lines.
                "grid scroll-mt-28 items-center gap-8 lg:gap-14",
                flip ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
              )}
            >
              <div className={cn("landing-pop min-w-0 max-w-md", flip && "lg:order-2")}>
                <span className="landing-icon flex h-12 w-12 items-center justify-center rounded-[length:var(--radius-md)]">
                  <VerbIcon weight="bold" className="h-6 w-6 text-accent" aria-hidden />
                </span>
                {/* 2xl below md: at 3xl it sat 24px under the section's 29px heading on a phone. */}
                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight md:text-3xl">{verb.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-foreground">{verb.line}</p>
                {content.note ? <p className="mt-2 font-display font-bold text-foreground">{content.note}</p> : null}
                {content.link ? (
                  <Link
                    href={content.link.href}
                    className="group/link mt-5 inline-flex min-h-9 items-center gap-1.5 text-base font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-mark"
                  >
                    {content.link.label}
                    <ArrowRight className="h-4 w-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease)] group-hover/link:translate-x-1" aria-hidden />
                  </Link>
                ) : null}
              </div>
              <div className={cn("landing-stage landing-pop min-w-0 [--pop-delay:120ms]", flip && "lg:order-1")}>
                <div className="landing-card3d">
                  <div className="landing-float">
                    <div
                      role="group"
                      aria-label={content.label}
                      // Clips to the rounded corners but never scrolls (owner,
                      // 2026-09-24: a capped, scrolling frame put a second
                      // scrollbar inside the page). A window is its content's
                      // height; the fill ones are fixed and scroll their own list.
                      className={cn(
                        "relative flex min-w-0 flex-col overflow-clip rounded-[length:var(--radius-lg)]",
                        content.fill && "h-[28rem]",
                      )}
                    >
                      <div className={cn("w-full min-w-0", content.fill && "h-full min-h-0")}>{content.body}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
