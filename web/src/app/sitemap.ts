import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  indexableRoutes,
  priorityFor,
} from "@/lib/seo/site";

/**
 * Served at /sitemap.xml. Without it Google has to discover ~200 lesson and
 * problem URLs by crawling three levels of navigation, which is slow and
 * incomplete; with it, the whole course is submittable in one line in Search
 * Console.
 *
 * `lastModified` is the build time rather than a per-file timestamp on
 * purpose: in CI every content file's mtime is the checkout time, so a
 * per-file mtime would claim all 200 pages changed on every deploy — a
 * signal Google learns to distrust. Build time is at least honest about
 * what it means ("this is the deploy this URL came from"). Per-page
 * accuracy would need real commit dates plumbed in at build time.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return indexableRoutes().map((route) => ({
    url: absoluteUrl(route),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: priorityFor(route),
  }));
}
