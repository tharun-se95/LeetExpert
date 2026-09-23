import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { isAuthConfigured } from "@/lib/auth/env";
import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";
import { SignInButtons } from "./SignInButtons";
import { SignInStory } from "./SignInStory";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

// Static: the query string is read on the client (useSearchParams inside
// Suspense), so this page does not render per request. Whether auth is
// configured is therefore fixed at build time, exactly like the root layout's
// authEnabled, so the header and this page always agree.
export default function SignInPage() {
  if (!isAuthConfigured()) return <Unavailable />;
  return (
    // One DOM order (headline, card, structure and benefits) so a phone shows the
    // buttons before the story and a screen reader reads the same sequence; from
    // lg the grid places the card beside the other two.
    <div className="mx-auto grid max-w-5xl gap-y-10 px-6 py-12 md:px-16 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-x-16 lg:py-20">
      <header className="lg:col-start-1 lg:row-start-1">
        <h1 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">{SIGN_IN_COPY.headline}</h1>
        <p className="mt-4 max-w-prose text-base text-muted">{SIGN_IN_COPY.subline}</p>
      </header>
      <section
        aria-labelledby="sign-in-heading"
        className="w-full rounded-[length:var(--radius-lg)] border border-border bg-elevated p-8 shadow-elevation lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
      >
        <h2 id="sign-in-heading" className="font-display text-2xl font-bold tracking-tight">
          Sign in
        </h2>
        <Suspense fallback={<div className="mt-6 h-[6.25rem]" aria-hidden />}>
          <SignInButtons />
        </Suspense>
        <p className="mt-6 text-xs text-muted">{SIGN_IN_COPY.stored}</p>
      </section>
      <div className="lg:col-start-1 lg:row-start-2">
        <SignInStory />
      </div>
    </div>
  );
}

function Unavailable() {
  return (
    <div className="mx-auto flex max-w-md px-4 py-16 lg:py-24">
      <section className="w-full rounded-[length:var(--radius-lg)] border border-border bg-elevated p-8 shadow-elevation">
        <h1 className="font-display text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-3 text-sm text-muted">Sign-in isn&apos;t available here. Your progress is saved on this device.</p>
        <Link
          href="/courses/dsa"
          className="mt-6 inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-border px-4 text-sm font-medium transition hover:bg-surface"
        >
          Back to the course
        </Link>
      </section>
    </div>
  );
}
