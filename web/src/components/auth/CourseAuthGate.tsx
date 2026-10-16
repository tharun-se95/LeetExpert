"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { authChunk } from "@/components/auth/lazyAuthChunk";
import { useSyncBridge } from "@/components/providers/SyncBridge";

const CourseAuthCheck = authChunk(() => import("@/components/auth/CourseAuthCheck").then((m) => m.CourseAuthCheck), {
    failed: ({ children }: { children: ReactNode }) => <>{children}</>,
    loading: () => (
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
    ),
  },
);

/**
 * Shell gate for course route access.
 * Does not import the auth client directly, preserving root bundle chunk boundaries.
 * When auth is configured and the path is within /courses, delegates to the lazy
 * CourseAuthCheck chunk to verify session and redirect if unauthenticated.
 */
export function CourseAuthGate({ children }: { children: ReactNode }) {
  const { authEnabled } = useSyncBridge();
  const pathname = usePathname();

  const isCoursePath = pathname.startsWith("/courses");

  if (!authEnabled || !isCoursePath) {
    return <>{children}</>;
  }

  return <CourseAuthCheck>{children}</CourseAuthCheck>;
}
