import { permanentRedirect } from "next/navigation";

/**
 * This used to render its own copy of the home page — identical HTML,
 * reachable at two indexable URLs with no canonical relationship, a
 * duplicate-content issue for search engines. The real content now lives
 * at "/" (see app/page.tsx); this route exists only so an old link or
 * bookmark to /courses/dsa/marketing still resolves. A 308 (not the
 * default 307) tells crawlers the move is permanent, so link equity
 * consolidates onto "/" instead of splitting between the two URLs.
 */
export default function MarketingRedirect(): never {
  permanentRedirect("/");
}
