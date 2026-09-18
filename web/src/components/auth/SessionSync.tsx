"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { endSession } from "@/lib/auth/endSession";
import {
  SIGNOUT_PENDING_KEY,
  pendingSignOutApplies,
  readPendingSignOut,
  type PendingSignOut,
  type SessionIdentity,
} from "@/lib/auth/signOutDevice";
import { reloadPage } from "@/lib/progress/reloadPage";

const SyncProvider = dynamic(() => import("@/components/providers/SyncProvider"), { ssr: false });

function removePendingSignOut(): void {
  try {
    window.localStorage.removeItem(SIGNOUT_PENDING_KEY);
  } catch {
    /* the sign-out itself is done; a stuck flag only repeats it */
  }
}

/** The unfinished sign-out that was for this session, if there is one. */
function pendingFor(now: SessionIdentity): PendingSignOut | null {
  const pending = readPendingSignOut(window.localStorage);
  return pending && pendingSignOutApplies(pending, now) ? pending : null;
}

export function SessionSync() {
  const { data } = authClient.useSession();
  const [pendingSignOut, setPendingSignOut] = useState(false);
  const identity: SessionIdentity | null = data ? { sessionId: data.session.id, userId: data.user.id } : null;
  const sessionId = identity?.sessionId;
  const userId = identity?.userId;

  // An offline sign-out cleared this device but could not end the session.
  // Finish it before sync starts, or the account's progress would be pulled
  // straight back for whoever uses this device next.
  useEffect(() => {
    if (!sessionId || !userId) return;
    const now = { sessionId, userId };
    const pending = pendingFor(now);
    if (!pending) {
      // A flag that names another session is stale: signing that one out
      // would end a sign-in the learner has just made.
      if (readPendingSignOut(window.localStorage)) removePendingSignOut();
      return;
    }
    setPendingSignOut(true);
    endSession(pending.everywhere).then(
      () => {
        removePendingSignOut();
        reloadPage();
      },
      // Still offline: the flag stays, and sync stays off, until a load can finish it.
      () => {},
    );
  }, [sessionId, userId]);

  // Keyed so a different account remounts the provider: its cleanup disposes
  // the previous account's queue, and its merge prompt state starts clean.
  // pendingFor() runs during render only on the client: this renders nothing
  // on the server because useSession has no data there.
  return identity && !pendingSignOut && !pendingFor(identity) ? <SyncProvider key={identity.userId} userId={identity.userId} /> : null;
}
