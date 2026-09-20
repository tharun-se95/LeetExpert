import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { isAuthConfigured } from "@/lib/auth/env";
import { SignInButtons } from "./SignInButtons";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

// Static: the query string is read on the client (useSearchParams inside
// Suspense), so this page does not render per request. Whether auth is
// configured is therefore fixed at build time, exactly like the root layout's
// authEnabled, so the header and this page always agree.
export default function SignInPage() {
  const available = isAuthConfigured();
  return (
    <div className="mx-auto flex max-w-md px-4 py-16 lg:py-24">
      <section className="w-full rounded-[length:var(--radius-lg)] border border-border bg-elevated p-8 shadow-elevation">
        <h1 className="font-display text-2xl font-bold tracking-tight">Sign in</h1>
        {available ? (
          <>
            <p className="mt-3 text-sm text-muted">Your progress and code follow you to any device.</p>
            <Suspense fallback={<div className="mt-6 h-[6.25rem]" aria-hidden />}>
              <SignInButtons />
            </Suspense>
            <p className="mt-6 text-xs text-muted">
              We store your name, email, avatar, lesson progress and sandbox code.
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted">
              Sign-in isn&apos;t available here. Your progress is saved on this device.
            </p>
            <Link
              href="/courses/dsa"
              className="mt-6 inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-border px-4 text-sm font-medium transition hover:bg-surface"
            >
              Back to the course
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
