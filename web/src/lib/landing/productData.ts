import { CHEATSHEETS, getCheatsheet } from "@/lib/course/cheatsheets/registry";
import { readLessonMarkdown } from "@/lib/course/load";
import { getConceptMap } from "@/lib/course/conceptMaps/registry";
import { MODULES, getLesson, getModule, groupedProblems, moduleFamily, modulesByStage } from "@/lib/course/manifest";
import { getModuleArt, getModuleVideo } from "@/lib/course/media";
import { conceptMapHref, lessonHref, moduleHref } from "@/lib/course/nav";
import { PRACTICE, stageCards } from "@/lib/landing/content";
import type { StageCard } from "@/lib/landing/story";
import type { FeatureData } from "@/lib/landing/features";

/**
 * Landing data that reads the filesystem or the full course registries: the
 * lessons and media the Understand, Build and Keep windows show, and their
 * counts. Server only — imported by the server HomePage and nothing else. It
 * lives apart from content.ts because the app's client nav imports content.ts,
 * and an `fs` import there broke every route (found in the browser,
 * 2026-09-15); landingFeatures.test.tsx keeps client modules off this file.
 */

/** Real lessons and modules behind the windows (owner-approved mock, 2026-09-17). */
/** Watch plays this module's HyperFrames intro video (owner, 2026-09-19). */
export const WATCH_MODULE = "arrays";
export const LEARN_LESSON = { module: "strings", lesson: "valid-anagram" } as const;
export const RECALL_MODULE = "hash-tables";
export const MAP_MODULE = "hash-tables";

function fenceBody(markdown: string, lang: string, where: string): string {
  const body = markdown.match(new RegExp("```" + lang + "\\n([\\s\\S]*?)\\n```"))?.[1];
  if (!body) throw new Error(`${where} has no ${lang} fence`);
  return body;
}

/**
 * Everything the nine windows need, read from the course itself. Throws
 * rather than rendering an empty window, so a renamed lesson, a missing video
 * or a changed tracer fails the build.
 */
export function featureData(): FeatureData {
  const watch = getModule(WATCH_MODULE);
  const video = getModuleVideo(WATCH_MODULE);
  if (!watch || !video) throw new Error("Watch module or its intro video is missing");

  const learn = getLesson(LEARN_LESSON.module, LEARN_LESSON.lesson);
  const markdown = readLessonMarkdown(LEARN_LESSON.module, LEARN_LESSON.lesson);
  if (!learn || !markdown) throw new Error("Learn lesson is missing");
  const viz = fenceBody(markdown, "viz", `${LEARN_LESSON.module}/${LEARN_LESSON.lesson}`);

  const recallModule = getModule(RECALL_MODULE);
  if (!recallModule) throw new Error("Recall module is missing");

  const mapModule = getModule(MAP_MODULE);
  const mapRoot = getConceptMap(MAP_MODULE);
  if (!mapModule || !mapRoot) throw new Error("Map module or its concept map is missing");

  const lessons = MODULES.flatMap((m) => m.lessons.map((l) => ({ module: m.slug, lesson: l })));
  return {
    counts: {
      problems: lessons.filter(({ lesson }) => lesson.type === "problem").length,
      cheatsheets: Object.keys(CHEATSHEETS).length,
    },
    watch: { title: watch.title, href: moduleHref(WATCH_MODULE), video },
    learn: { title: learn.lesson.title, href: lessonHref(LEARN_LESSON.module, LEARN_LESSON.lesson), viz },
    map: { root: mapRoot, moduleTitle: mapModule.title, family: moduleFamily(mapModule), href: conceptMapHref(MAP_MODULE) },
    practice: { groups: groupedProblems(), href: PRACTICE },
    recall: { sheet: getCheatsheet(RECALL_MODULE), moduleTitle: recallModule.title, href: moduleHref(RECALL_MODULE) },
  };
}

/** How many of a stage's modules fan out on its card. */
const STAGE_ART = 3;

/**
 * The course stages as "What's inside" cards, each with the art of its first
 * modules (the same generated stills the curriculum hub's module cards show).
 * Here, not in content.ts: the art is found on disk, and content.ts is
 * reachable from the client course nav.
 */
export function stageCardsWithArt(): StageCard[] {
  return stageCards().map((card) => ({
    ...card,
    art: modulesByStage(card.number)
      .flatMap((mod) => {
        const art = getModuleArt(mod.slug);
        return art ? [{ ...art, title: mod.title }] : [];
      })
      .slice(0, STAGE_ART),
  }));
}
