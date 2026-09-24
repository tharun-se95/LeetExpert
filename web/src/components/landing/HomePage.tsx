import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingOutro } from "@/components/landing/LandingOutro";
import { LandingStory } from "@/components/landing/LandingStory";
import { isAuthConfigured } from "@/lib/auth/env";
import { viaSignIn } from "@/lib/auth/signInPrompt";
import { CURRICULUM, FIRST_LESSON, curriculumStats } from "@/lib/landing/content";
import { heatYear } from "@/lib/landing/heat";
import { featureData, stageCardsWithArt } from "@/lib/landing/productData";

/**
 * The home page: why learn data structures and algorithms when agents write
 * code, and every feature the course gives you. A hero that says what
 * leetExpert is, then Understand, Build and Keep — nine verbs, each showing
 * the real feature (owner, 2026-09-17) — the course stages, placeholder
 * learner proof, pricing, questions and the footer, on a page that scrolls
 * natively; the hero's 3D floor and the motion as sections arrive are CSS.
 * Specs: docs/superpowers/specs/2026-09-14-landing-rewrite-agentic-ai-design.md,
 * docs/superpowers/specs/2026-09-15-landing-product-page-design.md,
 * docs/superpowers/specs/2026-09-23-landing-natural-scroll-3d-hero-design.md
 *
 * Server component: it reads the manifest, the windows' lessons, cheatsheet
 * and media, and hands plain data to the client sections, so none of those
 * readers ship to the client.
 * One centred max-w-landing column with px-6 md:px-16 gutters, shared with
 * LandingHeader so the logo sits on the hero's left edge.
 */
export default function HomePage() {
  const { modules, lessons, problems } = curriculumStats();
  // With sign-in configured, the calls to action ask first (owner, 2026-09-24;
  // spec 2026-09-24-sign-in-prompt-design.md): /sign-in offers "Continue without
  // signing in" and forwards a signed-in visitor straight on. Without it they stay
  // direct, since /sign-in would only say sign-in isn't available. Read at build,
  // like the root layout's authEnabled, so the two always agree.
  const ask = isAuthConfigured() ? viaSignIn : (href: string) => href;

  return (
    // overflow-x clip, not hidden: the floating cards tilt past the column's
    // edge, and hidden would make this a scroller, stealing the view timelines
    // their motion runs on from <main>.
    <div className="mx-auto max-w-landing overflow-x-clip px-6 md:px-16">
      <LandingStory
        counts={{ modules, lessons, problems }}
        links={{ start: ask(FIRST_LESSON), curriculum: ask(CURRICULUM) }}
        stages={stageCardsWithArt()}
        // The example year ends on the render date; built here so the client
        // receives plain data and all 364 days are identical on hydration.
        features={{ ...featureData(), heat: heatYear(new Date().toISOString().slice(0, 10)) }}
      />
      <LandingOutro firstLessonHref={ask(FIRST_LESSON)} />
      <LandingFooter year={new Date().getFullYear()} />
    </div>
  );
}
