"use client";

import dynamic from "next/dynamic";
import type { WindowContent } from "@/components/landing/FeatureSection";
import { HeatMap } from "@/components/landing/HeatMap";
import type { FeatureData, VerbId } from "@/lib/landing/features";
import { FIND_PAIR_SOURCE } from "@/lib/landing/findPairSandbox";
import type { HeatYear } from "@/lib/landing/heat";
import { HEAT } from "@/lib/landing/story";
import { familyCssVars } from "@/lib/visual/familyTheme";

/**
 * Heavy features load only when their section is near: each is its own
 * chunk, fetched once its section is the active stop or the next one. The
 * tracer, sandbox and map measure the DOM, so they render client-only.
 */
const stand = (label: string) =>
  function Loading() {
    return <Standin label={label} />;
  };
const VideoPlayer = dynamic(() => import("@/components/course/VideoPlayer").then((m) => m.VideoPlayer), {
  loading: stand("Loading the video"),
});
const Viz = dynamic(() => import("@/components/viz/Viz").then((m) => m.Viz), { ssr: false, loading: stand("Loading the tracer") });
// React Flow measures its canvas, so the map renders client-only.
const ConceptMindMap = dynamic(() => import("@/components/course/ConceptMindMap").then((m) => m.ConceptMindMap), {
  ssr: false,
  loading: stand("Loading the map"),
});
const Sandbox = dynamic(() => import("@/components/sandbox/Sandbox").then((m) => m.Sandbox), {
  ssr: false,
  loading: stand("Loading the editor"),
});
// The coach panel brings react-markdown with it.
const ReviewCoach = dynamic(() => import("@/components/landing/ReviewCoach").then((m) => m.ReviewCoach), {
  ssr: false,
  loading: stand("Loading the coach"),
});
const BigOObservatory = dynamic(() => import("@/components/explorers/BigOObservatory").then((m) => m.BigOObservatory));
const PracticeWindow = dynamic(() => import("@/components/landing/PracticeWindow").then((m) => m.PracticeWindow), {
  loading: stand("Loading practice"),
});
const Cheatsheet = dynamic(() => import("@/components/cheatsheet/Cheatsheet").then((m) => m.Cheatsheet));

/** What the server reads (productData.ts), plus the example year built on the render date. */
export type FeatureWindowData = FeatureData & { heat: HeatYear };

/**
 * The nine windows: each is the app's real component on a card of its own
 * (owner, 2026-09-23: a light frame per demo, now that each is its own row).
 * The instruments sit on the navy card; the rest bring their own. `near` is true once the window's section is the
 * active stop or the one before it; until then a heavy feature is a
 * stand-in, so the page's first load pays for none of them.
 */
export function featureWindows(
  data: FeatureWindowData,
  near: Record<"understand" | "build" | "keep", boolean>,
): Record<VerbId, WindowContent> {
  return {
    watch: {
      label: `${data.watch.title}: the module's intro video`,
      link: { label: "Open the module", href: data.watch.href },
      body: near.understand ? (
        <VideoPlayer src={data.watch.video} ariaLabel={`Video: ${data.watch.title}, the module intro`} />
      ) : (
        <Standin label="Video" />
      ),
    },
    learn: {
      label: `${data.learn.title}: the frequency count tracer`,
      link: { label: "Open the lesson", href: data.learn.href },
      body: near.understand ? (
        // The embedded tracer has no card of its own; the paper card frames it like the others.
        <div className="rounded-[length:var(--radius-lg)] border border-border bg-elevated p-4 shadow-elevation">
          <Viz source={data.learn.viz} embedded code={false} />
        </div>
      ) : (
        <Standin label="Tracer" />
      ),
    },
    map: {
      label: `${data.map.moduleTitle} concept map`,
      link: { label: "Open the map", href: data.map.href },
      fill: true,
      body: near.understand ? (
        // The map page scopes the module's family colour the same way; the card
        // is the same navy as the map page's panel and the other windows. The
        // family goes on the card itself: .navy-card re-declares --accent, and
        // an ancestor's family colour would lose to it.
        <div
          className="dark navy-card flex h-full min-h-0 flex-col"
          style={data.map.family ? familyCssVars(data.map.family) : undefined}
        >
          <ConceptMindMap root={data.map.root} label={`${data.map.moduleTitle} concept map`} fill scrollThrough />
        </div>
      ) : (
        <Standin label="Concept map" />
      ),
    },
    code: {
      label: "The find_pair editor",
      body: near.build ? <Sandbox source={FIND_PAIR_SOURCE} variant="card" embedded /> : <Standin label="Editor" />,
    },
    review: {
      label: "The coach on a broken find_pair draft",
      fill: true,
      body: near.build ? (
        // The panel paints no paper of its own here (CoachPanel showcase): the
        // card is the surface, the same navy as the stage and the practice window.
        <div className="dark navy-card h-full">
          <ReviewCoach />
        </div>
      ) : (
        <Standin label="Coach" />
      ),
    },
    optimize: {
      label: "The Big-O observatory",
      body: near.build ? <BigOObservatory /> : <Standin label="Complexity stage" />,
    },
    practice: {
      label: "Every problem in the course",
      link: { label: "Open practice", href: data.practice.href },
      fill: true,
      body: near.keep ? (
        // A dark card (owner, 2026-09-21: the module art's navy) with padding,
        // so the filters and the list keep clear of the card's rounded clip.
        <div className="dark navy-card relative h-full min-h-0 p-5">
          <PracticeWindow groups={data.practice.groups} />
        </div>
      ) : (
        <Standin label="Practice" />
      ),
    },
    recall: {
      label: `${data.recall.moduleTitle} cheatsheet`,
      link: { label: "Open the module", href: data.recall.href },
      body: near.keep ? (
        // The sheet has no card of its own, so it gets the navy card; the
        // scroller is inside it because .navy-card clips its own overflow (and,
        // unlayered, would beat a Tailwind overflow utility).
        <div className="dark navy-card">
          <div className="max-h-[46rem] overflow-y-auto p-6 [&>section]:my-0">
            <Cheatsheet sheet={data.recall.sheet} moduleTitle={data.recall.moduleTitle} />
          </div>
        </div>
      ) : (
        <Standin label="Cheatsheet" />
      ),
    },
    burn: {
      label: "An example year of practice",
      note: HEAT.credits,
      // HeatMap is a card by default, which is the frame this row wants.
      body: <HeatMap year={data.heat} lit={near.keep} />,
    },
  };
}

function Standin({ label }: { label: string }) {
  return (
    <div className="grid h-full min-h-40 place-items-center rounded-[length:var(--radius-md)] bg-code text-sm text-muted">
      {label}
    </div>
  );
}
