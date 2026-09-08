import { notFound } from "next/navigation";

/**
 * The Next.js course is disabled for now (see the `status` comment in
 * ./registry.ts) — every route under /courses/nextjs, including the
 * dynamic lesson pages, 404s via this layout regardless of what content
 * or static params exist beneath it. Flipping NEXTJS_COURSE.status back
 * to "available" does NOT undo this on its own; delete this file too.
 *
 * `LayoutProps` is Next.js's global, no-import route-props helper (this
 * version generates it per-route at dev/build time) — see
 * node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md.
 */
export default function NextjsCourseLayout(
  _props: LayoutProps<"/courses/nextjs">,
) {
  notFound();
}
