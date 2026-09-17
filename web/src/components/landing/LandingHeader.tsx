import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Lamp } from "@/components/brand/Lamp";
import { LOGO_LAMP_SIZE, NAV_LINK, ROUND_CONTROL, WORDMARK, TRANSLUCENT_PAPER } from "@/components/layout/headerChrome";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/courses/dsa", label: "Lessons" },
  { href: "/courses/dsa/problems", label: "Practice" },
] as const;

/**
 * The home page's header: transparent over the paper grain with a hairline
 * beneath, pinned to the top as the page scrolls (owner, 2026-09-14 — it
 * originally scrolled away like the reference).
 * Spec: docs/superpowers/specs/2026-09-14-landing-header-and-grain-design.md
 *
 * AppShell renders this INSIDE <main> on "/" only. The app Header sits above
 * the scroller, so it could neither scroll away nor show the grain — and every
 * other route keeps it, because the lessons drawer's tabs are aligned to its
 * height.
 *
 * Focus is the global :focus-visible outline, as in Header.tsx — that rule is
 * unlayered, so per-element ring utilities here would sit under it unseen.
 *
 * Hook-free on purpose: tests call it as a plain function and inspect the
 * element tree, which is how they prove the search button is wired to the
 * shell's opener without a DOM.
 */
export function LandingHeader({
  onOpenSearch,
  scrolled = false,
}: {
  onOpenSearch: () => void;
  /** Content is scrolled under the header (AppShell observes the page top). */
  scrolled?: boolean;
}) {
  return (
    <header
      className={cn(
        // Sticky within <main>, the page's scroller. Transparent over the grain
        // at rest; once content passes beneath, a translucent paper keeps the
        // nav legible over it. The height never changes, so nothing below jumps.
        "print:hidden sticky top-0 z-30 border-b border-border py-6 transition-[background-color,box-shadow] duration-300",
        scrolled && cn(TRANSLUCENT_PAPER, "shadow-edge-bottom"),
      )}
    >
      {/* Same centred container as HomePage (max-w-landing, px-6 md:px-16),
          so the logo's left edge sits on the hero heading's left edge. */}
      <div className="mx-auto grid h-11 max-w-landing grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-6 md:h-10 md:px-16">
        <Link
          href="/"
          className="lamp-link flex min-w-0 items-center gap-2.5 justify-self-start rounded-[length:var(--radius-md)]"
        >
          {/* sr-only below sm, not hidden: the lamp is aria-hidden, so this
              text is the link's only accessible name at every width. */}
          <span className={cn(WORDMARK, "max-sm:sr-only")}>
            <span className="text-foreground">leet</span>
            <span className="text-mark">Expert</span>
          </span>
          {/* The green signal ends the name. / renders no app Header, so this
              is the lamp a first visit sees and it carries the bloom.
              sm:-ml-1 takes back the halo's transparent edge only where the
              wordmark is visible beside it. */}
          <Lamp size={LOGO_LAMP_SIZE} bloom className="sm:-ml-1" />
        </Link>

        <nav
          aria-label="Product modes"
          className="flex items-center gap-5 justify-self-center sm:gap-8"
        >
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={NAV_LINK}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 justify-self-end sm:gap-3">
          {/* h-11 below md matches Header.tsx's touch target; the pill takes
              over from md, where there is room for the label and ⌘K. */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search lessons and problems"
            className={cn(ROUND_CONTROL, "h-11 w-11 md:h-10 md:w-auto md:gap-2 md:px-3.5 md:text-sm")}
          >
            <MagnifyingGlass className="h-4 w-4" aria-hidden />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden font-mono text-[11px] md:inline">⌘K</kbd>
          </button>
          <ThemeToggle className="h-11 w-11 rounded-full md:h-10 md:w-10" />
        </div>
      </div>
    </header>
  );
}
