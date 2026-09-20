import { authClient } from "@/lib/auth/client";

interface Outcome {
  error: { status: number } | null;
}

// better-auth's client resolves with `{ error }` instead of throwing, so a
// dead network would look like a successful sign-out. 401 means the session
// is already gone, which is what was asked for.
function ensureEnded({ error }: Outcome): void {
  if (error && error.status !== 401) throw new Error(`sign-out failed (${error.status})`);
}

export async function endSession(everywhere: boolean): Promise<void> {
  if (everywhere) ensureEnded(await authClient.revokeSessions());
  ensureEnded(await authClient.signOut());
}
