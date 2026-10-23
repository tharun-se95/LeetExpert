import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  FileText,
  Target,
  TreeStructure,
} from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ModuleGlyph } from "@/app/courses/dsa/_components/ModuleGlyph";
import { ModulePracticeProgress } from "@/app/courses/dsa/_components/ModulePracticeProgress";
import {
  getModule,
  STAGES,
  isLessonsNavLesson,
  moduleFamily,
} from "@/lib/course/manifest";
import { CHEATSHEETS } from "@/lib/course/cheatsheets/registry";
import { getModuleArt, getModuleVideo } from "@/lib/course/media";
import { VideoPlayer } from "@/components/course/VideoPlayer";
import { familyCssVars, getFamilyTheme } from "@/lib/visual/familyTheme";
import { allModuleSlugs } from "@/lib/course/load";
import { lessonHref, moduleHref } from "@/lib/course/nav";
import { canonicalFor } from "@/lib/seo/site";

interface PageProps {
  params: Promise<{ module: string }>;
}

export function generateStaticParams() {
  return allModuleSlugs().map((module) => ({ module }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { module: slug } = await params;
  const mod = getModule(slug);
  return {
    title: mod ? mod.title : "Course",
    // The manifest already carries authored module copy; reusing it beats
    // letting Google synthesise a snippet from the page chrome.
    description: mod?.description,
    alternates: canonicalFor(moduleHref(slug)),
  };
}

export default async function ModulePage({ params }: PageProps) {
  const { module: slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();

  const stage = STAGES.find((s) => s.number === mod.stage);
  const navLessons = mod.lessons.filter(isLessonsNavLesson);
  const concepts = navLessons.filter((l) => l.type === "concept");
  const practice = navLessons.find((l) => l.type === "practice");
  const problems = mod.lessons.filter((l) => l.type === "problem");
  const problemCount = problems.length;
  const family = moduleFamily(mod);
  const familyLabel = family ? getFamilyTheme(family).label : null;
  const sheet = CHEATSHEETS[mod.slug];
  // Same image the curriculum card uses — it already carries the module
  // title as type, which is why the h1 below goes sr-only when it exists.
  const art = getModuleArt(mod.slug);
  const introVideo = getModuleVideo(mod.slug);
  const artImages = art ? (
    <>
      <Image
        src={art.light}
        alt=""
        fill
        priority
        sizes="(min-width: 1152px) 1088px, 100vw"
        className="module-art-light object-contain"
      />
      <Image
        src={art.dark}
        alt=""
        fill
        priority
        sizes="(min-width: 1152px) 1088px, 100vw"
        className="module-art-dark object-contain"
      />
    </>
  ) : null;

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--accent)_12%,transparent),_transparent_60%)]"
      />
      <div
        className="relative mx-auto w-full max-w-6xl px-4 py-8 lg:px-8 lg:py-12"
        style={family ? familyCssVars(family) : undefined}
      >
        <Breadcrumbs
          items={[
            { label: "Lessons", href: "/courses/dsa" },
            { label: mod.title },
          ]}
        />

        {/* Hero */}
        {art || introVideo ? (
          // The box matches the art's own 43:24, and object-contain guarantees
          // the whole frame is shown: a 16:6 box with object-cover threw away
          // 40% of the height (measured), slicing the bottom off trees and
          // chains. Nothing about the art is cropped here.
          <div className="relative mt-6 aspect-[43/24] w-full overflow-hidden rounded-[length:var(--radius-lg)] border border-border shadow-elevation">
            {introVideo ? (
              // A module with an intro plays it in this same box, with the art
              // as its poster until playback starts. The player preloads only
              // metadata (the MP4 index) — the video itself is fetched on play.
              <VideoPlayer
                src={introVideo}
                fill
                poster={artImages}
                ariaLabel={`Introduction to ${mod.title}`}
                playLabel={`Play the ${mod.title} intro video`}
                posterCta="Watch the module intro"
              />
            ) : (
              artImages
            )}
          </div>
        ) : null}
        <div className="mt-6 flex items-start gap-5">
          {!art ? (
            <div className="hidden h-20 w-30 shrink-0 sm:block">
              <ModuleGlyph slug={mod.slug} className="text-accent" />
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-mark">
                Stage {mod.stage} — {stage?.title} · Module {mod.number}
              </p>
              {familyLabel ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                  <span className="font-mono text-[10px] tracking-wide text-muted">
                    {familyLabel}
                  </span>
                </span>
              ) : null}

            </div>
            {/* The banner already shows the module name as type. Keeping a
                real h1 in the DOM (visually hidden when the art is present)
                means the page still has one, for assistive tech and search. */}
            <h1 className="press-overprint mt-2 font-display text-3xl font-bold tracking-tight text-balance uppercase sm:text-[2.1rem]">
              {mod.title}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
              {mod.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link
                href={`/courses/dsa/${mod.slug}/concept-map`}
                className="inline-flex h-8 items-center gap-1.5 rounded-[length:var(--radius-xs)] border border-border bg-surface px-3 text-xs font-medium text-foreground hover:bg-surface/80 hover:border-accent/40 transition"
              >
                <TreeStructure weight="bold" className="h-3.5 w-3.5 text-accent" />
                <span>Concept Map</span>
              </Link>
              {practice ? (
                <Link
                  href={lessonHref(mod.slug, "practice")}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[length:var(--radius-xs)] border border-border bg-surface px-3 text-xs font-medium text-foreground hover:bg-surface/80 hover:border-accent/40 transition"
                >
                  <FileText weight="bold" className="h-3.5 w-3.5 text-accent" />
                  <span>Cheatsheet & Practice</span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>


        {/*
          Stat strip (Concept lessons · Problems · Practice · Status) — hidden
          on request, 2026-09-14. To restore it, uncomment this block together
          with the CheckCircle, Timer and Lock icon imports at the top.

        <dl className="mt-8 grid grid-cols-2 gap-y-6 rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation px-5 py-4 sm:grid-cols-4 sm:divide-x sm:divide-border">
          <div className="sm:pr-4">
            <dt className="text-xs uppercase tracking-wide text-muted">
              Concept lessons
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-xl font-semibold tabular-nums">
              <BookOpen weight="bold" className="h-4 w-4 text-accent" />
              {concepts.length}
            </dd>
          </div>
          <div className="sm:px-4">
            <dt className="text-xs uppercase tracking-wide text-muted">
              Problems
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-xl font-semibold tabular-nums">
              <Target weight="bold" className="h-4 w-4 text-accent" />
              {problemCount}
            </dd>
          </div>
          <div className="sm:px-4">
            <dt className="text-xs uppercase tracking-wide text-muted">
              Practice
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-xl font-semibold tabular-nums">
              <Timer weight="bold" className="h-4 w-4 text-accent" />
              {practice ? "Hub" : "—"}
            </dd>
          </div>
          <div className="sm:pl-4">
            <dt className="text-xs uppercase tracking-wide text-muted">
              Status
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-xl font-semibold">
              {mod.status === "available" ? (
                <>
                  <CheckCircle weight="bold" className="h-4 w-4 text-good" />
                  Live
                </>
              ) : (
                <>
                  <Lock weight="bold" className="h-4 w-4 text-muted" />
                  Soon
                </>
              )}
            </dd>
          </div>
        </dl>
        */}

        {mod.status === "coming-soon" ? (
          <div className="mt-8 rounded-[length:var(--radius-lg)] border border-dashed border-border bg-surface/40 p-6">
            <p className="text-sm font-medium">Coming soon</p>
            <p className="mt-1 text-sm text-muted">
              This module hasn&apos;t been written yet. Modules are being
              built in curriculum order — earlier modules come first.
            </p>
          </div>
        ) : (
          <>
            {/* Concept lessons */}
            <h2 className="mt-10 mb-4 text-lg font-semibold tracking-tight">
              Lessons
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {concepts.map((lesson, i) => (
                <Link
                  key={lesson.slug}
                  href={lessonHref(mod.slug, lesson.slug)}
                  className="group flex items-start gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated shadow-elevation px-4 py-3.5 transition hover:border-accent/45 hover:bg-accent/[0.04]"
                >
                  <span className="mt-0.5 w-6 shrink-0 tabular-nums text-muted">
                    {i + 1}.
                  </span>
                  <BookOpen
                    weight="bold"
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium group-hover:text-accent">
                      {lesson.title}
                    </span>
                    <span className="mt-0.5 block text-xs uppercase tracking-wide text-muted/70">
                      concept
                    </span>
                  </span>
                </Link>
              ))}
            </div>

            {/* Practice chapter */}
            {practice && problemCount > 0 ? (
              <div className="mt-8 rounded-[length:var(--radius-lg)] border border-accent/35 bg-accent/[0.06] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                      <Target
                        weight="bold"
                        className="h-5 w-5 text-accent"
                      />
                      Practice
                    </h2>
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
                      {sheet?.tagline ??
                        `Solve the ${problemCount} problems in this module with a live sandbox, then read the explanation.`}
                    </p>
                  </div>
                  <ModulePracticeProgress
                    moduleSlug={mod.slug}
                    problemSlugs={problems.map((p) => p.slug)}
                  />
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}