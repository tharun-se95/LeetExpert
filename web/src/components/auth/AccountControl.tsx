"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { UserCircle } from "@phosphor-icons/react";
import sandboxIds from "@/lib/sandbox/sandboxIds.generated.json";
import { DeleteAccountDialog } from "@/components/auth/DeleteAccountDialog";
import { UnmergedSignOutDialog } from "@/components/auth/UnmergedSignOutDialog";
import { NAV_LINK, ROUND_CONTROL } from "@/components/layout/headerChrome";
import { useSyncBridge, type SyncIssue, type SyncRuntime } from "@/components/providers/SyncBridge";
import { authClient } from "@/lib/auth/client";
import { endSession } from "@/lib/auth/endSession";
import { signOutDevice, syncWarning } from "@/lib/auth/signOutDevice";
import type { AnonymousSummary } from "@/lib/progress/localStore";
import { reloadPage } from "@/lib/progress/reloadPage";
import type { SyncStatus } from "@/lib/progress/syncQueue";
import { AUTH_CHANNEL } from "@/lib/progress/types";
import { cn } from "@/lib/utils";

const CONTROL_SIZE = "h-11 w-11 md:h-10 md:w-10";

const STATUS_TEXT: Record<SyncStatus, string> = {
  synced: "Synced",
  syncing: "Syncing…",
  offline: "Offline, will retry",
  unauthorized: "Signed out, sign in to keep syncing",
};

// Shown when no runtime is registered. Every entry but "offline" is a state
// the learner has to act on, so those also raise the warning dot.
const ISSUE_TEXT: Record<SyncIssue, string> = {
  paused: "Not syncing: choose whether to add this device's progress",
  offline: "Offline, will retry",
  expired: "Not syncing: your session expired, sign in again",
  failed: "Not syncing: something went wrong. Reload the page to try again.",
};

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

function readQueue(runtime: SyncRuntime | null): { status: SyncStatus; warn: boolean } {
  if (!runtime) return { status: "synced", warn: false };
  const { queue } = runtime;
  return {
    status: queue.status(),
    warn: syncWarning(queue.status(), queue.offlineSince(), queue.pendingCount(), Date.now()),
  };
}

function useQueueState(runtime: SyncRuntime | null) {
  const [state, setState] = useState(() => readQueue(runtime));
  useEffect(() => {
    if (!runtime) return;
    const update = () => setState(readQueue(runtime));
    update();
    const off = runtime.queue.subscribe(update);
    // The 5-minute warning is time-based; nothing else would re-check it.
    const tick = window.setInterval(update, 30_000);
    return () => {
      off();
      window.clearInterval(tick);
    };
  }, [runtime]);
  return state;
}

// Sandboxes that never sync (the landing page's) are not progress to warn about.
// Imported statically: a click-time import() of this list rejects on a dead
// network when its chunk is not cached, and sign-out must work offline (spec 5.4).
const KNOWN_SANDBOXES = new Set<string>(sandboxIds);

function broadcastSignedOut(): void {
  try {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.postMessage("signed-out");
    channel.close();
  } catch {
    // Other tabs then keep a session this device already ended; that is
    // worth less than a sign-out that stops half way.
  }
}

export function AccountControl() {
  const { authEnabled } = useSyncBridge();
  return authEnabled ? <SessionControl /> : null;
}

function SessionControl() {
  const { data, isPending } = authClient.useSession();
  const pathname = usePathname();
  if (isPending) return <span data-account-placeholder aria-hidden className={cn("shrink-0", CONTROL_SIZE)} />;
  if (!data) {
    const href = `/sign-in?next=${encodeURIComponent(pathname)}`;
    return (
      <>
        <Link href={href} className={cn(NAV_LINK, "hidden md:inline-flex")}>Sign in</Link>
        <Link href={href} aria-label="Sign in" className={cn(ROUND_CONTROL, CONTROL_SIZE, "md:hidden")}>
          <UserCircle className="h-5 w-5" aria-hidden />
        </Link>
      </>
    );
  }
  return <AccountMenu user={data.user} />;
}

type Notice = { text: string; reload: boolean };

function AccountMenu({ user }: { user: { name: string; email: string; image?: string | null } }) {
  const { runtime, issue, abortSync } = useSyncBridge();
  const queueState = useQueueState(runtime);
  const status = runtime
    ? { text: STATUS_TEXT[queueState.status], warn: queueState.warn }
    : issue
      ? { text: ISSUE_TEXT[issue], warn: issue !== "offline" }
      : { text: "Connecting…", warn: false };
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [unmerged, setUnmerged] = useState<AnonymousSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  // Which button opened the unmerged-progress dialog, so confirming it signs
  // out the way the learner asked.
  const everywhereRef = useRef(false);

  useLayoutEffect(() => {
    if (!open || !trigger.current || !menu.current) return;
    const r = trigger.current.getBoundingClientRect();
    const el = menu.current;
    el.style.top = `${r.bottom + 8}px`;
    el.style.left = `${Math.max(16, r.right - el.offsetWidth)}px`;
    el.style.visibility = "visible";
    el.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (e.target instanceof Node && !menu.current?.contains(e.target) && !trigger.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  const signOut = async (everywhere: boolean, discardUnmerged = false) => {
    setBusy(true);
    everywhereRef.current = everywhere;
    try {
      const { unsynced, blocked } = await signOutDevice({
        queue: runtime?.queue ?? null,
        storage: window.localStorage,
        broadcast: broadcastSignedOut,
        abort: abortSync,
        isKnownSandbox: (id) => KNOWN_SANDBOXES.has(id),
        discardUnmerged,
        endSession: () => endSession(everywhere),
      });
      if (blocked) {
        // The dialog hands focus back to whatever had it when it opened.
        setBusy(false);
        trigger.current?.focus();
        setOpen(false);
        setUnmerged(blocked);
        return;
      }
      setUnmerged(null);
      if (unsynced) {
        // The notice lives in the menu, so keep it open until they read it.
        // busy stays on: the session is over and the items would do nothing.
        setNotice({ text: "Some recent changes hadn't synced and were not saved.", reload: true });
        setOpen(true);
      } else reloadPage();
    } catch {
      // Nothing here may leave the menu disabled with no word said: the
      // learner can try again, or reload.
      setBusy(false);
      setUnmerged(null);
      setNotice({ text: "Signing out did not finish. Try again, or reload the page.", reload: false });
      setOpen(true);
    }
  };

  const deleteAccount = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE", credentials: "same-origin" }).catch(() => null);
      if (!res || res.status !== 204) {
        setBusy(false);
        setNotice({ text: "Your account could not be deleted. Nothing was erased; try again when you're online.", reload: false });
        setDeleting(false);
        setOpen(true);
        return;
      }
      // The server data is gone, so there is nothing to flush, and whatever this
      // device holds was just erased on purpose, so there is nothing to ask.
      await signOutDevice({
        queue: null,
        storage: window.localStorage,
        broadcast: broadcastSignedOut,
        abort: abortSync,
        discardUnmerged: true,
        endSession: () => endSession(false),
      });
      reloadPage();
    } catch {
      // Only signOutDevice can land here, after the server accepted the deletion.
      setBusy(false);
      setDeleting(false);
      setNotice({ text: "Your account was deleted, but this device could not finish signing out. Reload the page.", reload: true });
      setOpen(true);
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      items[(at + step + items.length) % items.length]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const ITEM = "flex min-h-11 w-full items-center px-3 text-left text-sm text-foreground transition-colors hover:bg-surface disabled:opacity-60 md:min-h-9";

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        // The name is the button's label, so a child's text would be ignored:
        // the warning has to be in the label itself to be announced.
        aria-label={`Account menu, signed in as ${user.name}${status.warn ? ", sync needs attention" : ""}`}
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(ROUND_CONTROL, CONTROL_SIZE, "relative overflow-visible text-xs font-medium text-foreground")}
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- provider avatars come from arbitrary hosts; next/image would need each allowlisted
          <img src={user.image} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-surface">{initials(user.name)}</span>
        )}
        {status.warn ? <span data-sync-warning aria-hidden className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-warn" /> : null}
      </button>
      {open
        ? createPortal(
            <div
              ref={menu}
              style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
              className="z-50 w-64 overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-elevated py-1 font-sans shadow-elevation"
            >
              <div className="border-b border-border px-3 pt-2 pb-2">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
                <p data-sync-status className={cn("mt-1 text-xs", status.warn ? "text-warn" : "text-muted")}>{status.text}</p>
              </div>
              {notice ? <p role="alert" className="border-b border-border px-3 py-2 text-xs text-warn">{notice.text}</p> : null}
              <div role="menu" aria-label="Account" onKeyDown={onMenuKeyDown}>
                <button type="button" role="menuitem" tabIndex={-1} disabled={busy} className={ITEM} onClick={() => void signOut(false)}>Sign out</button>
                <button type="button" role="menuitem" tabIndex={-1} disabled={busy} className={ITEM} onClick={() => void signOut(true)}>Sign out everywhere</button>
                <a role="menuitem" tabIndex={-1} href="/api/account/export" download className={ITEM}>Download my data</a>
                <button type="button" role="menuitem" tabIndex={-1} disabled={busy} className={cn(ITEM, "text-bad")} onClick={() => { setOpen(false); setDeleting(true); }}>Delete account</button>
              </div>
              {notice?.reload ? (
                <div className="border-t border-border px-3 py-2">
                  <button type="button" className="text-sm font-medium underline underline-offset-4" onClick={reloadPage}>Continue</button>
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
      <DeleteAccountDialog open={deleting} busy={busy} onClose={() => setDeleting(false)} onConfirm={() => void deleteAccount()} />
      <UnmergedSignOutDialog
        summary={unmerged}
        busy={busy}
        onCancel={() => setUnmerged(null)}
        onReview={reloadPage}
        onDiscard={() => void signOut(everywhereRef.current, true)}
      />
    </>
  );
}
