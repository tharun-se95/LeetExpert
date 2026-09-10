import type { MetadataRoute } from "next";
import { SITE_ORIGIN, absoluteUrl } from "@/lib/seo/site";

/**
 * Served at /robots.txt, which was a 404 before this. A 404 is treated as
 * "crawl everything", so this is not what was keeping the site out of the
 * index — its real job is declaring the sitemap, which is how a crawler
 * that arrives without a Search Console submission still finds all ~200
 * URLs.
 *
 * /api/ is disallowed because the coach chat route is a POST endpoint with
 * no indexable content; crawling it only burns crawl budget.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_ORIGIN,
  };
}
