"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle } from "@phosphor-icons/react";
import { NAV_LINK, ROUND_CONTROL } from "@/components/layout/headerChrome";
import { cn } from "@/lib/utils";

export const CONTROL_SIZE = "h-11 w-11 md:h-10 md:w-10";

/** The signed-out control: a text link from md, a round icon below. Shared by the real control and the placeholder, so the two are one box. */
export function SignInLinks({ href }: { href: string }) {
  return (
    <>
      <Link href={href} className={cn(NAV_LINK, "hidden md:inline-flex")}>Sign in</Link>
      <Link href={href} aria-label="Sign in" className={cn(ROUND_CONTROL, CONTROL_SIZE, "md:hidden")}>
        <UserCircle className="h-5 w-5" aria-hidden />
      </Link>
    </>
  );
}

/**
 * The avatar's footprint while the session chunk downloads and the session
 * loads, so the header does not shift when either finishes. With a hint from
 * this device's last visit (lib/auth/accountHint.ts, set on <html> before the
 * header is parsed) it paints what the control will show at once: the avatar
 * (or initials) for a signed-in reader, the working Sign in links for a
 * signed-out one. globals.css ("Account hint") picks the variant; no hint is
 * the empty box, as before. `hinted={false}` is the bare box, for a chunk that
 * failed to load, where a stale avatar would stay up for good.
 */
export function AccountPlaceholder({ hinted = true }: { hinted?: boolean }) {
  const pathname = usePathname();
  const box = <span data-account-placeholder aria-hidden className={cn("shrink-0 rounded-full", CONTROL_SIZE)} />;
  if (!hinted) return box;
  return (
    <>
      {box}
      <span data-account-hint-out className="contents">
        <SignInLinks href={`/sign-in?next=${encodeURIComponent(pathname || "/")}`} />
      </span>
    </>
  );
}

/** The bare box, for the chunk's `failed` state. */
export function AccountPlaceholderBare() {
  return <AccountPlaceholder hinted={false} />;
}
