/**
 * The landing footer's own copy and outbound links. Course and topic links
 * come from content.ts; this file holds only what exists nowhere else.
 *
 * CONNECT_LINKS lists only addresses the owner has confirmed and that resolve
 * publicly — a footer link to a private repo or a guessed handle is a broken
 * link for every visitor. The Connect column is not rendered while it is
 * empty. landingFooter.test.tsx checks every entry is https or mailto.
 */

export const FOOTER_TAGLINE = "The developer-first DSA learning platform. Dual-runtime sandboxes, interactive tracers, and Socratic code coaching.";

export type ConnectLink = {
  kind: "github" | "email";
  label: string;
  href: string;
};

export const CONNECT_LINKS: readonly ConnectLink[] = [];
