"use client";

import dynamic from "next/dynamic";
import { useSyncBridge } from "@/components/providers/SyncBridge";

// A chunk of its own: SessionSync is the only thing here that needs the auth
// client, and it should download only where auth is enabled.
const SessionSync = dynamic(() => import("@/components/auth/SessionSync").then((m) => m.SessionSync), { ssr: false });

/**
 * SessionSync is a separate component so useSession, which fetches the
 * session, is never called when auth is not configured.
 */
export function AccountRuntime() {
  const { authEnabled } = useSyncBridge();
  return authEnabled ? <SessionSync /> : null;
}
