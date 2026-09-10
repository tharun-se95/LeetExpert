import type { Metadata } from "next";
import { canonicalFor } from "@/lib/seo/site";

/**
 * The root route IS the product's home page now — there's exactly one
 * active course (see NEXTJS_COURSE.status: "coming-soon" in
 * app/courses/nextjs/registry.ts), so a course-picker catalog in front of
 * it was a pointless extra click.
 *
 * The page content itself lives outside the app router tree, at
 * components/landing/HomePage.tsx, not in a route file under here — it used
 * to be re-exported from courses/dsa/marketing/page.tsx, which meant the
 * exact same HTML was reachable at two indexable URLs with no canonical
 * relationship between them (a duplicate-content issue for search
 * engines). That route now redirects here instead of rendering its own
 * copy; see its page.tsx for why.
 *
 * The canonical tag is the belt to that redirect's braces: it names "/" as
 * the one indexable address for this content no matter which host or query
 * string a crawler arrives on.
 */
export const metadata: Metadata = {
  alternates: canonicalFor("/"),
};

export { default } from "@/components/landing/HomePage";
