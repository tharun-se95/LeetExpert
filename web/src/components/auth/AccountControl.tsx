"use client";

import { AccountPlaceholder } from "@/components/auth/AccountPlaceholder";
import { authChunk } from "@/components/auth/lazyAuthChunk";
import { useSyncBridge } from "@/components/providers/SyncBridge";

// Its own chunk: the session hook pulls in the whole auth client, the account
// menu and its dialogs, and every page has this control in its header. With
// auth unconfigured (or before it is enabled) none of that should download.
// The loading state is the pending placeholder, which is also what the server
// renders for it, so the header does not move. If the chunk cannot load, the
// placeholder stays: the same box, and no control.
const SessionControl = authChunk(() => import("@/components/auth/SessionControl").then((m) => m.SessionControl), {
  failed: AccountPlaceholder,
  loading: () => <AccountPlaceholder />,
});

export function AccountControl() {
  const { authEnabled } = useSyncBridge();
  return authEnabled ? <SessionControl /> : null;
}
