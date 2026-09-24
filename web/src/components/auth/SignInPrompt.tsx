"use client";

import { usePathname } from "next/navigation";
import { Providers } from "@/app/sign-in/SignInButtons";
import { Dialog } from "@/components/ui/Dialog";
import { KICKER } from "@/components/landing/landingClasses";
import { authClient } from "@/lib/auth/client";
import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";

/**
 * The once-per-visit sign-in dialog. It opens only when the session is known
 * and empty, so a signed-in reader never sees it flash. Esc, the backdrop and
 * "Continue without signing in" all defer it for the visit: accounts stay
 * optional, and a dialog that could not be left would trap keyboard users.
 * The buttons are the sign-in page's own, returning to the page opened on.
 */
export function SignInPrompt({ onDefer }: { onDefer: () => void }) {
  const { data, isPending } = authClient.useSession();
  const pathname = usePathname();
  const open = !isPending && !data;

  return (
    <Dialog open={open} onClose={onDefer} label="Sign in">
      <p className={KICKER}>{SIGN_IN_COPY.kicker}</p>
      <h2 className="mt-3 font-display text-xl font-bold tracking-tight">{SIGN_IN_COPY.headline}</h2>
      <p className="mt-2 text-sm text-muted">{SIGN_IN_COPY.subline}</p>
      <Providers next={pathname || "/"} failedBefore={false} />
      <button
        type="button"
        onClick={onDefer}
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-medium text-muted transition hover:bg-surface hover:text-foreground"
      >
        {SIGN_IN_COPY.later}
      </button>
      <p className="mt-4 text-xs text-muted">{SIGN_IN_COPY.stored}</p>
    </Dialog>
  );
}
