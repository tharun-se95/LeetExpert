import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Cheatsheet } from "@/components/cheatsheet/Cheatsheet";
import { AudioMini } from "@/components/course/AudioMini";
import { ChapterInfographic } from "@/components/course/ChapterInfographic";
import { LessonView } from "@/components/course/LessonView";
import { WatchLessonLink } from "@/components/course/WatchLessonLink";
import { LESSON_EMBEDS } from "@/components/course/embeds";
import { Quiz } from "@/components/course/Quiz";
import { PracticeProblemsList } from "@/components/md/PracticeProblemsList";
import {
  allLessonParams,
  extractToc,
  getLessonNeighbors,
  loadLesson,
  readLessonMarkdown,
} from "@/lib/course/load";
import { getCheatsheet } from "@/lib/course/cheatsheets/registry";
import { getChapterMedia } from "@/lib/course/media";
import { getLesson, getModule } from "@/lib/course/manifest";
import { extractQuizFence } from "@/lib/content/extractQuizFence";
import {
  extractPracticeProblemsFence,
  mergePracticeProblems,
} from "@/lib/content/parsePracticeProblems";
import { splitPracticeBody } from "@/lib/content/splitPracticeBody";
import { lessonHref, lessonId, moduleHref, problemHref } from "@/lib/course/nav";
import { canonicalFor } from "@/lib/seo/site";
import { metaDescription } from "@/lib/seo/description";
import { JsonLd } from "@/components/seo/JsonLd";
import { learningResourceLd } from "@/lib/seo/jsonLd";

interface PageProps {
  params: Promise<{ module: string; lesson: string }>;
}

export function generateStaticParams() {
  // Keep problem course paths so permanentRedirect pages exist for bookmarks.
  return allLessonParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const hit = getLesson(moduleSlug, lessonSlug);
  // A problem lesson permanentRedirects to the problems hub below, so its
  // canonical must name the destination, not this URL — otherwise the two
  // addresses compete for the same content.
  const canonicalPath =
    hit?.lesson.type === "problem"
      ? problemHref(lessonSlug)
      : lessonHref(moduleSlug, lessonSlug);
  const body = readLessonMarkdown(moduleSlug, lessonSlug);
  return {
    title: hit ? hit.lesson.title : "Lesson",
    description: body ? metaDescription(body) : undefined,
    alternates: canonicalFor(canonicalPath),
  };
}

export default async function LessonPage({ params }: PageProps) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const mod = getModule(moduleSlug);
  const meta = getLesson(moduleSlug, lessonSlug);
  if (!mod || !meta) notFound();

  if (meta.lesson.type === "problem") {
    permanentRedirect(problemHref(lessonSlug));
  }

  const lesson = await loadLesson(moduleSlug, lessonSlug);
  if (!lesson) notFound();

  const { prev, next } = getLessonNeighbors(moduleSlug, lessonSlug);
  const Embed = LESSON_EMBEDS[lessonId(moduleSlug, lessonSlug)];

  const breadcrumbs = [
    { label: "Lessons", href: "/courses/dsa" },
    { label: mod.shortTitle, href: moduleHref(mod.slug) },
    { label: meta.lesson.title },
  ];
  const lessonJsonLd = (
    <JsonLd
      data={learningResourceLd({
        name: meta.lesson.title,
        path: lessonHref(moduleSlug, lessonSlug),
        learningResourceType:
          meta.lesson.type === "practice" ? "Practice set" : "Concept lesson",
        description: metaDescription(lesson.markdown),
      })}
    />
  );
  const prevLink = prev
    ? {
        href: lessonHref(prev.module, prev.lesson),
        title: prev.title,
        module:
          prev.module !== moduleSlug
            ? getModule(prev.module)?.shortTitle
            : undefined,
      }
    : null;
  const nextLink = next
    ? {
        href: lessonHref(next.module, next.lesson),
        title: next.title,
        module:
          next.module !== moduleSlug
            ? getModule(next.module)?.shortTitle
            : undefined,
      }
    : null;

  if (meta.lesson.type === "practice") {
    const { body, authored } = extractPracticeProblemsFence(lesson.markdown);
    const { intro } = splitPracticeBody(body);
    const rows = mergePracticeProblems(moduleSlug, authored);
    const sheet = getCheatsheet(moduleSlug);
    const toc = [
      ...extractToc(intro),
      { id: "problems", text: "Problems", level: 2 },
      { id: "cheatsheet", text: "Cheatsheet", level: 2 },
    ];
    return (
      <LessonView
        lesson={{ ...lesson, markdown: intro, toc }}
        eyebrow={`Module ${mod.number} · ${mod.title}`}
        typeLabel="Practice"
        jsonLd={lessonJsonLd}
        breadcrumbs={breadcrumbs}
        prev={prevLink}
        next={nextLink}
        afterMarkdown={
          <>
            <PracticeProblemsList
              moduleSlug={moduleSlug}
              moduleTitle={mod.shortTitle}
              rows={rows}
            />
            <Cheatsheet sheet={sheet} moduleTitle={mod.shortTitle} />
          </>
        }
      />
    );
  }

  const chapterMedia = getChapterMedia(moduleSlug, lessonSlug);
  const { body, quizSource } = extractQuizFence(lesson.markdown);

  return (
    <LessonView
      lesson={{ ...lesson, markdown: body }}
      eyebrow={`Module ${mod.number} · ${mod.title}`}
      typeLabel="Concept"
      jsonLd={lessonJsonLd}
      breadcrumbs={breadcrumbs}
      prev={prevLink}
      next={nextLink}
      stage={Embed ? <Embed /> : undefined}
      headerAudio={
        chapterMedia.audioSrc ? (
          <AudioMini
            src={chapterMedia.audioSrc}
            ariaLabel={`Audio walkthrough of ${meta.lesson.title}`}
          />
        ) : undefined
      }
      headerVideo={
        chapterMedia.videoSrc ? (
          <WatchLessonLink
            videoSrc={chapterMedia.videoSrc}
            lessonTitle={meta.lesson.title}
          />
        ) : undefined
      }
      infographic={
        chapterMedia.infographicSrc ? (
          <ChapterInfographic
            src={chapterMedia.infographicSrc}
            alt={`At-a-glance infographic for ${meta.lesson.title}`}
          />
        ) : undefined
      }
      afterMarkdown={quizSource ? <Quiz source={quizSource} /> : undefined}
    />
  );
}
