"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSyncBridge } from "@/components/providers/SyncBridge";
import { authClient } from "@/lib/auth/client";
import { endSession } from "@/lib/auth/endSession";
import { SIGNOUT_PENDING_KEY } from "@/lib/auth/signOutDevice";
import { reloadPage } from "@/lib/progress/reloadPage";

const SyncProvider = dynamic(() => import("@/components/providers/SyncProvider"), { ssr: false });

function hasPendingSignOut(): boolean {
  try {
    return window.localStorage.getItem(SIGNOUT_PENDING_KEY) !== null;
  } catch {
    return false;
  }
}

function SessionSync() {
  const { data } = authClient.useSession();
  const [pendingSignOut, setPendingSignOut] = useState(false);

  // An offline sign-out cleared this device but could not end the session.
  // Finish it before sync starts, or the account's progress would be pulled
  // straight back for whoever uses this device next.
  useEffect(() => {
    if (!data || !hasPendingSignOut()) return;
    setPendingSignOut(true);
    endSession(false).then(
      () => {
        try {
          window.localStorage.removeItem(SIGNOUT_PENDING_KEY);
        } catch {
          /* the sign-out itself is done; a stuck flag only repeats it */
        }
        reloadPage();
      },
      // Still offline: the flag stays, and sync stays off, until a load can finish it.
      () => {},
    );
  }, [data]);

  // Keyed so a different account remounts the provider: its cleanup disposes
  // the previous account's queue, and its merge prompt state starts clean.
  // hasPendingSignOut() runs during render only on the client: this renders
  // nothing on the server because useSession has no data there.
  return data && !pendingSignOut && !hasPendingSignOut() ? <SyncProvider key={data.user.id} userId={data.user.id} /> : null;
}

/**
 * SessionSync is a separate component so useSession, which fetches the
 * session, is never called when auth is not configured.
 */
export function AccountRuntime() {
  const { authEnabled } = useSyncBridge();
  return authEnabled ? <SessionSync /> : null;
}
