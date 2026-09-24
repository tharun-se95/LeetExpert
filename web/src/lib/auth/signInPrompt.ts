/**
 * The sign-in prompt's per-visit memory (spec 2026-09-24-sign-in-prompt-design.md).
 * sessionStorage, not localStorage: "Continue without signing in" lasts for this visit, and a new
 * tab or window asks again (owner: ask every time the app is opened). Hook-free and import-free,
 * so the gate that decides whether to load the prompt's chunk never pulls in the auth client.
 */
export const PROMPT_DEFERRED_KEY = "leetexpert:sign-in-prompt";

/** True once this visit chose to continue without signing in. Storage that throws counts as deferred: never trap a reader behind a prompt that cannot remember "later". */
export function promptDeferred(storage: Pick<Storage, "getItem"> | undefined = globalThis.sessionStorage): boolean {
  try {
    return storage?.getItem(PROMPT_DEFERRED_KEY) === "later";
  } catch {
    return true;
  }
}

export function deferPrompt(storage: Pick<Storage, "setItem"> | undefined = globalThis.sessionStorage): void {
  try {
    storage?.setItem(PROMPT_DEFERRED_KEY, "later");
  } catch {
    /* private mode or blocked storage: the in-memory state still closes it for this page */
  }
}

/** A landing link that asks first: /sign-in forwards a signed-in visitor straight to `href`. */
export function viaSignIn(href: string): string {
  return `/sign-in?next=${encodeURIComponent(href)}`;
}
