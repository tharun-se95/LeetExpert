"use client";

import dynamic from "next/dynamic";
import { AccountPlaceholder } from "@/components/auth/AccountPlaceholder";
import { useSyncBridge } from "@/components/providers/SyncBridge";

// Its own chunk: the session hook pulls in the whole auth client, the account
// menu and its dialogs, and every page has this control in its header. With
// auth unconfigured (or before it is enabled) none of that should download.
// The loading state is the pending placeholder, which is also what the server
// renders for it, so the header does not move.
const SessionControl = dynamic(() => import("@/components/auth/SessionControl").then((m) => m.SessionControl), {
  ssr: false,
  loading: () => <AccountPlaceholder />,
});

export function AccountControl() {
  const { authEnabled } = useSyncBridge();
  return authEnabled ? <SessionControl /> : null;
}
