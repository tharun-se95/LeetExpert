import { MODULES } from "@/lib/course/manifest";
import { moduleHref } from "@/lib/course/nav";
import { SITE_ORIGIN, absoluteUrl } from "./site";

/**
 * Stable node ids. Emitting the Organization once and referencing it by @id
 * from the WebSite and Course nodes lets a crawler merge them into one entity
 * instead of reading three unrelated organisations with the same name.
 */
const ORG_ID = `${SITE_ORIGIN}/#organization`;
const COURSE_ID = `${SITE_ORIGIN}/courses/dsa#course`;

const CONTEXT = "https://schema.org" as const;

export interface BreadcrumbCrumb {
  name: string;
  /** Absent for the current page, which the visible trail renders unlinked. */
  path?: string;
}

export interface BreadcrumbLd {
  "@context": typeof CONTEXT;
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }[];
}

/**
 * Mirrors the visible Breadcrumbs component, which always renders a leading
 * "Home" link — markup that disagreed with the visible trail would be
 * inaccurate, and Google treats that as a structured-data violation.
 */
export function breadcrumbLd(crumbs: BreadcrumbCrumb[]): BreadcrumbLd {
  const all = [{ name: "Home", path: "/" }, ...crumbs];
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: all.map((crumb, i) => ({
      "@type": "ListItem" as const,
      position: i + 1,
      name: crumb.name,
      ...(crumb.path ? { item: absoluteUrl(crumb.path) } : {}),
    })),
  };
}

export function organizationLd() {
  return {
    "@context": CONTEXT,
    "@type": "Organization" as const,
    "@id": ORG_ID,
    name: "leetExpert",
    url: SITE_ORIGIN,
    logo: absoluteUrl("/icon.svg"),
    description:
      "Interactive programming courses with live sandboxes, visualizations and solve-first problems.",
  };
}

export function websiteLd() {
  return {
    "@context": CONTEXT,
    "@type": "WebSite" as const,
    "@id": `${SITE_ORIGIN}/#website`,
    url: SITE_ORIGIN,
    name: "leetExpert",
    publisher: { "@id": ORG_ID },
  };
}

/**
 * The DSA course as one entity, with its 24 modules as parts.
 *
 * Deliberately claims no `offers`, `aggregateRating` or `review`: the site
 * displays none of those, and marking up figures a visitor cannot see is
 * exactly the manipulative structured data Google penalises.
 */
export function courseLd() {
  return {
    "@context": CONTEXT,
    "@type": "Course" as const,
    "@id": COURSE_ID,
    name: "Data Structures & Algorithms",
    description:
      "A 24-module data structures and algorithms course — every concept paired with a visualization, a live Python and JavaScript sandbox, and solve-first practice problems.",
    url: absoluteUrl("/courses/dsa"),
    provider: { "@id": ORG_ID },
    inLanguage: "en",
    teaches: [
      "Data structures",
      "Algorithms",
      "Big-O complexity analysis",
      "Technical interview preparation",
    ],
    hasPart: MODULES.map((mod) => ({
      "@type": "Course" as const,
      name: mod.title,
      description: mod.description,
      url: absoluteUrl(moduleHref(mod.slug)),
      provider: { "@id": ORG_ID },
    })),
  };
}

export interface LearningResourceInput {
  name: string;
  path: string;
  learningResourceType: string;
  description?: string;
}

export function learningResourceLd(input: LearningResourceInput) {
  return {
    "@context": CONTEXT,
    "@type": "LearningResource" as const,
    name: input.name,
    url: absoluteUrl(input.path),
    learningResourceType: input.learningResourceType,
    isPartOf: { "@id": COURSE_ID },
    provider: { "@id": ORG_ID },
    inLanguage: "en",
    // Spread last and only when present: an empty `description` key is worse
    // than none, since it asserts the page has no summary.
    ...(input.description ? { description: input.description } : {}),
  };
}

/**
 * Serialize for embedding in a <script type="application/ld+json"> tag.
 *
 * `<` is escaped because a lesson title or description containing
 * "</script>" would otherwise close the tag early and turn page content into
 * live markup — the classic JSON-LD injection. Course content is authored in
 * this repo, but the escape costs nothing and removes the class of bug.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
