import { LandingBackdrop } from "@/components/landing/LandingBackdrop";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingOutro } from "@/components/landing/LandingOutro";
import { LandingStory } from "@/components/landing/LandingStory";
import { CURRICULUM, FIRST_LESSON, curriculumStats, stageCards } from "@/lib/landing/content";
import { heatYear } from "@/lib/landing/heat";
import { featureData, flashColours } from "@/lib/landing/productData";

/**
 * The home page: why learn data structures and algorithms when agents write
 * code, and every feature the course gives you. A hero that says what
 * leetExpert is, then Understand, Build and Keep — nine verbs, each showing
 * the real feature (owner, 2026-09-17) — the course stages, placeholder
 * learner proof, pricing, questions and the footer. Each section snaps into
 * view and types itself.
 * Specs: docs/superpowers/specs/2026-09-14-landing-rewrite-agentic-ai-design.md,
 * docs/superpowers/specs/2026-09-15-landing-product-page-design.md
 *
 * Server component: it reads the manifest, the windows' lessons, cheatsheet
 * and media, and hands plain data to the client sections, so none of those
 * readers ship to the client.
 * One centred max-w-landing column with px-6 md:px-16 gutters, shared with
 * LandingHeader so the logo sits on the hero's left edge.
 */
export default function HomePage() {
  const { modules, lessons, problems } = curriculumStats();

  return (
    <div className="mx-auto max-w-landing px-6 md:px-16">
      <LandingBackdrop colours={flashColours()} />
      <LandingStory
        counts={{ modules, lessons, problems }}
        links={{ start: FIRST_LESSON, curriculum: CURRICULUM }}
        stages={stageCards()}
        // The example year ends on the render date; built here so the client
        // receives plain data and all 364 days are identical on hydration.
        features={{ ...featureData(), heat: heatYear(new Date().toISOString().slice(0, 10)) }}
      />
      <LandingOutro firstLessonHref={FIRST_LESSON} />
      <LandingFooter year={new Date().getFullYear()} />
    </div>
  );
}
