"use client";

import dynamic from "next/dynamic";
import { useSyncBridge } from "@/components/providers/SyncBridge";
import { authClient } from "@/lib/auth/client";

const SyncProvider = dynamic(() => import("@/components/providers/SyncProvider"), { ssr: false });

function SessionSync() {
  const { data } = authClient.useSession();
  // Keyed so a different account remounts the provider: its cleanup disposes
  // the previous account's queue, and its merge prompt state starts clean.
  return data ? <SyncProvider key={data.user.id} userId={data.user.id} /> : null;
}

/**
 * SessionSync is a separate component so useSession, which fetches the
 * session, is never called when auth is not configured.
 */
export function AccountRuntime() {
  const { authEnabled } = useSyncBridge();
  return authEnabled ? <SessionSync /> : null;
}
