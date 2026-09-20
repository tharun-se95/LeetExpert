"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GithubLogo, GoogleLogo } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth/client";
import { safeNext } from "@/lib/auth/redirect";

const PROVIDERS = [
  { id: "github", name: "GitHub", Icon: GithubLogo },
  { id: "google", name: "Google", Icon: GoogleLogo },
] as const;

type ProviderId = (typeof PROVIDERS)[number]["id"];

const OAUTH_FAILED = "Sign-in didn't complete. You can try again.";
const COULD_NOT_START = "We couldn't start sign-in. Check your connection and try again.";

export function SignInButtons() {
  const { data, isPending } = authClient.useSession();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  // Nothing to choose between until the session is known, and nothing to
  // choose at all once it is: a signed-in learner is sent on.
  if (isPending) return <div className="mt-6 h-[6.25rem]" aria-hidden />;
  if (data) return <SignedIn next={next} />;
  return <Providers next={next} failedBefore={params.get("error") !== null} />;
}

function SignedIn({ next }: { next: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(next);
  }, [router, next]);
  return (
    <p className="mt-6 text-sm text-muted">
      You&apos;re signed in.{" "}
      <Link href={next} className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
        Continue
      </Link>
    </p>
  );
}

function Providers({ next, failedBefore }: { next: string; failedBefore: boolean }) {
  const [starting, setStarting] = useState<ProviderId | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    // Returning from the provider with Back can restore this page from the
    // back/forward cache with the busy state frozen on.
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setStarting(null);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const start = async (provider: ProviderId) => {
    // Buttons are aria-disabled, not disabled: a disabled button drops
    // keyboard focus, which would strand a keyboard user after a failure.
    if (starting) return;
    setStarting(provider);
    setFailure(null);
    const failed = () => {
      setStarting(null);
      setFailure(COULD_NOT_START);
    };
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: next,
        errorCallbackURL: `/sign-in?error=oauth&next=${encodeURIComponent(next)}`,
      });
      // better-auth resolves with `{ error }` on a refused or unreachable
      // request; on success the client navigates, so stay busy.
      if (result.error) failed();
    } catch {
      failed();
    }
  };

  const message = failure ?? (failedBefore ? OAUTH_FAILED : null);
  const busy = starting !== null;

  return (
    <div className="mt-6 flex flex-col gap-3">
      {message ? (
        <p role="alert" className="text-sm text-bad">
          {message}
        </p>
      ) : null}
      {PROVIDERS.map(({ id, name, Icon }) => (
        <button
          key={id}
          type="button"
          aria-disabled={busy}
          aria-busy={starting === id}
          onClick={() => void start(id)}
          className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium transition hover:bg-surface aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-elevated"
        >
          {/* Monochrome marks: the lamp stays the only non-steel colour in chrome. */}
          <Icon aria-hidden className="h-5 w-5" />
          {starting === id ? `Connecting to ${name}…` : `Continue with ${name}`}
        </button>
      ))}
    </div>
  );
}
