/**
 * The class sets the app header and the landing header share, so the two
 * cannot drift apart (spec:
 * docs/superpowers/specs/2026-09-14-app-header-and-grain-design.md).
 * Focus is the global :focus-visible outline: it is unlayered, so a ring
 * utility here would only sit under it, unseen.
 */
export const LOGO_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] bg-pop font-mono text-sm font-bold text-on-pop";

export const WORDMARK = "truncate text-base font-semibold tracking-tight";

/** Full ink, no pill; a 1px underline on hover. min-h-11 is the touch target below md. */
export const NAV_LINK =
  "inline-flex min-h-11 items-center rounded-[length:var(--radius-xs)] text-base font-normal text-foreground decoration-border underline-offset-4 transition-colors hover:underline hover:decoration-foreground md:min-h-10";

/** The current mode: a steady 2px ink underline, so a hover never reads as selection. */
export const NAV_LINK_ACTIVE = "underline decoration-foreground decoration-2";

/** Round hairline controls: search, the lessons menu button (the theme toggle takes its own size). */
export const ROUND_CONTROL =
  "inline-flex shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent/50 hover:text-foreground";
