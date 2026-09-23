"use client";

import { NothingWhenFailed, authChunk } from "@/components/auth/lazyAuthChunk";
import { useSyncBridge } from "@/components/providers/SyncBridge";

// Split so the session hook runs only where auth exists (without it there is
// no session endpoint to ask, and hooks cannot be called conditionally), and
// so the auth client downloads only there. It renders nothing while pending,
// so the absent loading state changes no layout.
const SignedOutLine = authChunk(() => import("@/components/auth/SignedOutLine").then((m) => m.SignedOutLine), {
  failed: NothingWhenFailed,
});

export function SyncHint() {
  const { authEnabled } = useSyncBridge();
  return authEnabled ? <SignedOutLine /> : null;
}
