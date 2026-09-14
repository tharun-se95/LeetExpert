import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingOutro } from "@/components/landing/LandingOutro";
import { LandingStory } from "@/components/landing/LandingStory";
import { FIRST_LESSON, TOPIC_CHIPS, curriculumStats } from "@/lib/landing/content";
import { heatYear } from "@/lib/landing/heat";

/**
 * The home page: why learn data structures and algorithms when agents can
 * write code. Minimal on purpose (owner, 2026-09-14) — a hero, four argument
 * chapters and a line of real counts beside one evolving structure, then
 * pricing, three questions and the footer. No viz or code blocks, no feature
 * grids, no sticky CTA. Each section snaps into view and types itself.
 * Spec: docs/superpowers/specs/2026-09-14-landing-rewrite-agentic-ai-design.md
 *
 * Server component: it reads the manifest (counts, topic links) and hands
 * plain data to the client story, so the manifest stays off the client.
 * One centred max-w-landing column with px-6 md:px-16 gutters, shared with
 * LandingHeader so the logo sits on the hero's left edge.
 */
export default function HomePage() {
  const { modules, lessons, problems } = curriculumStats();

  return (
    <div className="mx-auto max-w-landing px-6 md:px-16">
      <LandingStory counts={{ modules, lessons, problems }} topics={TOPIC_CHIPS} />
      {/* The example year ends on the render date; built here so the client
          receives plain data and all 364 days are identical on hydration. */}
      <LandingOutro firstLessonHref={FIRST_LESSON} heat={heatYear(new Date().toISOString().slice(0, 10))} />
      <LandingFooter year={new Date().getFullYear()} />
    </div>
  );
}
