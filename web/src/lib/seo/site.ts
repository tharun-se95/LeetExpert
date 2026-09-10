import type { Metadata } from "next";
import { MODULES, allProblemSlugs } from "@/lib/course/manifest";
import { lessonHref, moduleHref, problemHref } from "@/lib/course/nav";

/**
 * The one canonical origin for the site. Production redirects the apex to
 * `www` with a 308, so `www` is the host search engines must see in every
 * canonical tag, sitemap entry and OG URL — a mix of the two splits link
 * equity across what Google treats as two separate sites.
 *
 * Everything that needs the origin (metadataBase, sitemap, robots,
 * canonicals) reads it from here; a second literal elsewhere is how a host
 * change ships half-applied.
 */
export const SITE_ORIGIN = "https://www.leetexpert.com";

/** Resolve a root-relative path against the canonical origin. */
export function absoluteUrl(path: string): string {
  // "/" would otherwise produce a trailing-slash variant of the origin,
  // which is a second URL for the same page as far as crawlers are concerned.
  return path === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${path}`;
}

/**
 * The `alternates` block for a page's metadata. The path stays relative so
 * Next resolves it against `metadataBase`, which keeps the origin in exactly
 * one place.
 */
export function canonicalFor(path: string): NonNullable<Metadata["alternates"]> {
  return { canonical: path };
}

/**
 * Every URL that should be crawled and indexed, derived from the course
 * manifest rather than hand-listed so a renamed module or lesson moves the
 * sitemap with it instead of leaving a 404 behind.
 *
 * Three deliberate exclusions, each because the URL does not return 200:
 *  - problem lessons' course URLs (`/courses/dsa/[module]/[problem]`)
 *    permanentRedirect to the problems hub, so only the destination belongs
 *    here;
 *  - `/courses/dsa/marketing` permanentRedirects to "/";
 *  - everything under `/courses/nextjs` 404s while that course is disabled
 *    by its layout. Listing 404s is a reported error in Search Console and
 *    devalues the rest of the file.
 */
export function indexableRoutes(): string[] {
  const routes: string[] = ["/", "/courses/dsa", "/courses/dsa/problems"];

  for (const mod of MODULES) {
    routes.push(moduleHref(mod.slug));
    for (const lesson of mod.lessons) {
      if (lesson.type === "problem") continue;
      routes.push(lessonHref(mod.slug, lesson.slug));
    }
  }

  for (const slug of allProblemSlugs()) {
    routes.push(problemHref(slug));
  }

  return routes;
}

/**
 * Relative importance within this site only (it is not a cross-site ranking
 * signal). The hubs are the entry points crawlers should revisit most; a
 * single problem drill is the leaf.
 */
export function priorityFor(path: string): number {
  if (path === "/") return 1;
  if (path === "/courses/dsa" || path === "/courses/dsa/problems") return 0.9;
  if (path.startsWith("/courses/dsa/problems/")) return 0.6;
  // A module page vs. a lesson page: lessons carry one more path segment.
  return path.split("/").length > 4 ? 0.7 : 0.8;
}
