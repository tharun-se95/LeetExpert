"use client";

import { useEffect, useState, type FormEvent } from "react";

const WAITLIST_KEY = "dsa:paid-launch-waitlist-email";

/**
 * Local waitlist until a real backend exists. Persists the email in
 * localStorage so a refresh still shows “you’re on the list.”
 */
export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setSaved(window.localStorage.getItem(WAITLIST_KEY));
    } catch {
      setSaved(null);
    }
    setReady(true);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    try {
      window.localStorage.setItem(WAITLIST_KEY, trimmed);
    } catch {
      /* ignore */
    }
    setSaved(trimmed);
    setEmail("");
  };

  if (!ready) {
    return <div className="h-11 animate-pulse rounded-lg bg-surface" />;
  }

  if (saved) {
    return (
      <p className="rounded-lg border border-good/40 bg-good/10 px-4 py-3 text-sm text-foreground">
        You’re on the list for the paid launch notice (
        <span className="font-mono text-xs text-muted">{saved}</span>).
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
    >
      <label className="sr-only" htmlFor="waitlist-email">
        Email for paid launch waitlist
      </label>
      <input
        id="waitlist-email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-accent"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-pop px-4 py-2.5 text-sm font-semibold text-on-pop transition hover:opacity-90"
      >
        Notify me
      </button>
    </form>
  );
}
