"use client";

import dynamic from "next/dynamic";
import { useSyncBridge } from "@/components/providers/SyncBridge";

// Split so the session hook runs only where auth exists (without it there is
// no session endpoint to ask, and hooks cannot be called conditionally), and
// so the auth client downloads only there. It renders nothing while pending,
// so the absent loading state changes no layout.
const SignedOutLine = dynamic(() => import("@/components/auth/SignedOutLine").then((m) => m.SignedOutLine), { ssr: false });

export function SyncHint() {
  const { authEnabled } = useSyncBridge();
  return authEnabled ? <SignedOutLine /> : null;
}
