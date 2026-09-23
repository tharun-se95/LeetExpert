import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";

/**
 * Every auth chunk goes through here. next/dynamic wraps the loader in
 * React.lazy, so a rejected import() throws during render; Suspense does not
 * catch that, and the app has no error boundary, so it would unmount the whole
 * page. The chunk is fetched by every visitor on an auth-enabled build right
 * after hydration, and it can be missing (offline, an ad blocker, an old page
 * asking for a chunk hash a newer deploy removed). Failing quietly is the right
 * outcome: a lesson without an account control still works, and nothing syncs
 * until the next load.
 */
export function authChunk<P extends object>(
  load: () => Promise<ComponentType<P>>,
  options: { failed: ComponentType<P>; loading?: () => ReactNode },
): ComponentType<P> {
  // Always a function: the pages-router next/dynamic that unit tests resolve
  // renders whatever `loading` is, and an explicit undefined crashes it.
  return dynamic<P>(() => load().catch(() => options.failed), { ssr: false, loading: options.loading ?? (() => null) });
}

/** What a chunk that failed to load renders, for the pieces that have nothing to show. */
export function NothingWhenFailed(): null {
  return null;
}
