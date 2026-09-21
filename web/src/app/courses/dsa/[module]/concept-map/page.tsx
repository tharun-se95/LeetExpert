import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TreeStructure } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ConceptMindMap } from "@/components/course/ConceptMindMap";
import { getModule, moduleFamily } from "@/lib/course/manifest";
import { getConceptMap } from "@/lib/course/conceptMaps/registry";
import { familyCssVars } from "@/lib/visual/familyTheme";
import { allModuleSlugs } from "@/lib/course/load";
import { conceptMapHref, moduleHref } from "@/lib/course/nav";
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
    title: mod ? `${mod.title} — Concept map` : "Concept map",
    description: mod
      ? `How every idea in ${mod.title} connects — the module's concepts as one map.`
      : undefined,
    alternates: canonicalFor(conceptMapHref(slug)),
  };
}

/**
 * The concept map's own page. It used to sit on the module page, where it
 * competed with the lesson list for attention and was capped at a panel's
 * share of the height; here the canvas gets the room the graph actually wants
 * (size="xl") and nothing else is asking to be read first.
 */
export default async function ConceptMapPage({ params }: PageProps) {
  const { module: slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();

  const conceptMap = getConceptMap(slug);
  // Every module has one today; if a future module ships without one this is a
  // 404 rather than an empty frame pretending to be a map.
  if (!conceptMap) notFound();

  const family = moduleFamily(mod);

  return (
    // h-full against main (a flex-1 child of the h-dvh shell), so the column is
    // exactly the viewport minus the header and the map takes whatever the
    // heading block leaves.
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className="relative mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 py-8 lg:px-8 lg:py-12"
        style={family ? familyCssVars(family) : undefined}
      >
        <Breadcrumbs
          items={[
            { label: "Lessons", href: "/courses/dsa" },
            { label: mod.title, href: moduleHref(mod.slug) },
            { label: "Concept map" },
          ]}
        />

        <p className="mt-6 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
          <TreeStructure weight="bold" className="h-4 w-4" />
          Module {mod.number} · Concept map
        </p>
        <h1 className="press-overprint mt-2 font-display text-3xl font-bold tracking-tight text-balance uppercase sm:text-[2.1rem]">
          {mod.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
          Every idea in this module and how it connects. Expand a branch to see
          what sits under it, or open a lesson straight from its node.
        </p>

        {/* min-h-0 lets the panel shrink inside the flex column instead of
            being pushed past the fold; the floor keeps it usable on a short
            window, where filling the viewport would otherwise squash it. */}
        {/* The family goes on the card, not only the wrapper above:
            .navy-card re-declares --accent, so an ancestor's would lose. */}
        <div
          className="dark navy-card mt-8 flex min-h-[22rem] flex-1 flex-col p-5"
          style={family ? familyCssVars(family) : undefined}
        >
          <ConceptMindMap root={conceptMap} label={mod.title} size="xl" fill />
        </div>
      </div>
    </div>
  );
}
