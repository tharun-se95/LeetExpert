import Link from "next/link";
import { EnvelopeSimple, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";
import { Lamp } from "@/components/brand/Lamp";
import { FooterWordmark } from "@/components/landing/FooterWordmark";
import { LOGO_LAMP_SIZE } from "@/components/layout/headerChrome";
import { FIRST_LESSON, TOPIC_CHIPS } from "@/lib/landing/content";
import { CONNECT_LINKS, FOOTER_TAGLINE, type ConnectLink } from "@/lib/landing/footer";

const COLUMN_LABEL = "font-mono text-xs font-bold tracking-[0.16em] text-accent uppercase";
const LINK = "text-sm text-muted transition-colors hover:text-foreground";

const CONNECT_ICONS: Record<ConnectLink["kind"], ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  github: GithubLogo,
  email: EnvelopeSimple,
};

const COURSE_LINKS = [
  { label: "Start the first lesson", href: FIRST_LESSON },
] as const;

/**
 * The landing page's footer — landing only (owner, 2026-09-14): lesson and
 * problem pages are viewport-locked workspaces with no room for one.
 *
 * Links only to pages that exist; there are no privacy or terms pages yet, so
 * none are linked. `year` is passed in so the copyright year is computed,
 * not typed.
 */
export function LandingFooter({ year }: { year: number }) {
  return (
    <footer className="relative border-t border-border/80 bg-gradient-to-b from-transparent via-surface/20 to-surface/50 pt-16 pb-10 lg:pt-24 overflow-hidden">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-3/4 max-w-4xl rounded-full bg-accent/5 blur-[100px]"
        aria-hidden
      />
      <div className="relative grid gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.4fr)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="text-base font-semibold tracking-tight">
              <span className="text-foreground">leet</span>
              <span className="text-mark">Expert</span>
            </span>
            {/* The same mark as the headers, at their size. Static: the
                landing header already blooms, and a page gets one bloom. */}
            <Lamp size={LOGO_LAMP_SIZE} className="-ml-1" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{FOOTER_TAGLINE}</p>
        </div>

        <nav aria-label="Course">
          <p className={COLUMN_LABEL}>Course</p>
          <ul className="mt-4 space-y-3">
            {COURSE_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className={LINK}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Topics">
          <p className={COLUMN_LABEL}>Topics</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
            {TOPIC_CHIPS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className={LINK}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {CONNECT_LINKS.length > 0 ? (
          <nav aria-label="Connect">
            <p className={COLUMN_LABEL}>Connect</p>
            <ul className="mt-4 space-y-3">
              {CONNECT_LINKS.map(({ kind, label, href }) => {
                const Icon = CONNECT_ICONS[kind];
                const external = href.startsWith("https://");
                return (
                  <li key={href}>
                    <a
                      href={href}
                      className={`inline-flex items-center gap-2 ${LINK}`}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </div>

      <FooterWordmark className="mt-16 lg:mt-24" />

      <p className="mt-6 text-xs text-muted">© {year} leetExpert</p>
    </footer>
  );
}
