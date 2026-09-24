"use client";

import { useEffect, useState } from "react";
import { NothingWhenFailed, authChunk } from "@/components/auth/lazyAuthChunk";
import { useSyncBridge } from "@/components/providers/SyncBridge";
import { deferPrompt, promptDeferred } from "@/lib/auth/signInPrompt";

// Its own chunk: the prompt needs the session, so it pulls in the auth client.
// A visit that already chose "Continue without signing in" never downloads it.
const SignInPrompt = authChunk(() => import("@/components/auth/SignInPrompt").then((m) => m.SignInPrompt), {
  failed: NothingWhenFailed,
});

/**
 * Asks a signed-out visitor to sign in, once per visit (owner, 2026-09-24; spec
 * 2026-09-24-sign-in-prompt-design.md). `allowed` is the route's say: never on the
 * landing page or /sign-in. Starts deferred so the server render and the first
 * client render agree; the visit's flag is read after mount.
 */
export function SignInPromptGate({ allowed }: { allowed: boolean }) {
  const { authEnabled } = useSyncBridge();
  const [deferred, setDeferred] = useState(true);
  useEffect(() => {
    setDeferred(promptDeferred());
  }, []);

  if (!authEnabled || !allowed || deferred) return null;
  return (
    <SignInPrompt
      onDefer={() => {
        deferPrompt();
        setDeferred(true);
      }}
    />
  );
}
