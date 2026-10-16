"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

/**
 * Enforces authentication to access course material.
 * When unauthenticated, immediately redirects the learner to the sign-in page
 * with the return path preserved, showing a loading state in the interim to
 * prevent unauthenticated flash of course content.
 */
export function CourseAuthCheck({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !data) {
      const extra = typeof window !== "undefined" ? `${window.location.search}${window.location.hash}` : "";
      const target = `${pathname}${extra}`;
      router.replace(`/sign-in?next=${encodeURIComponent(target)}`);
    }
  }, [isPending, data, router, pathname]);

  if (isPending || !data) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[50vh] flex-1 items-center justify-center p-12 text-sm text-muted"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span>Verifying course access…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
