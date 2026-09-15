/**
 * The class sets the app header and the landing header share, so the two
 * cannot drift apart (spec:
 * docs/superpowers/specs/2026-09-14-app-header-and-grain-design.md).
 * Focus is the global :focus-visible outline: it is unlayered, so a ring
 * utility here would only sit under it, unseen.
 */
/**
 * Rendered size of the brand lamp that ends the wordmark in both headers
 * (components/brand/Lamp.tsx). One number, so the two marks cannot drift.
 */
export const LOGO_LAMP_SIZE = 26;

export const WORDMARK = "truncate text-base font-semibold tracking-tight";

/** Full ink, no pill; a 1px underline on hover. min-h-11 is the touch target below md. */
export const NAV_LINK =
  "inline-flex min-h-11 items-center rounded-[length:var(--radius-xs)] text-base font-normal text-foreground decoration-border underline-offset-4 transition-colors hover:underline hover:decoration-foreground md:min-h-10";

/** The current mode: a steady 2px ink underline, so a hover never reads as selection. */
export const NAV_LINK_ACTIVE = "underline decoration-foreground decoration-2";

/** Round hairline controls: search, the lessons menu button (the theme toggle takes its own size). */
export const ROUND_CONTROL =
  "inline-flex shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent/50 hover:text-foreground";

/**
 * Translucent chrome paper: the page's paper at 90% with the content scrolling
 * beneath blurred through it (the app header, the drawer's pinned row, the
 * landing header once scrolled). 90%, not the 80% the landing header started
 * at: over a dark code block passing beneath, muted header text measured
 * 3.85:1 at 80% and 4.76:1 at 90% in light (6.20:1 dark) —
 * grainContrast.test.ts reads the opacity from this string. A translucent layer
 * cannot carry .grain-paper (it is opaque), so the page's own grain is what
 * shows through. Spec: docs/superpowers/specs/2026-09-15-translucent-chrome-and-pane-grain-design.md
 */
export const TRANSLUCENT_PAPER = "bg-background/90 backdrop-blur-md";
