/**
 * What the header's account control last showed on this device, so the next
 * page can paint it before any script loads (owner, 2026-09-24: the avatar
 * "does load late" — measured ≈1.8s after navigation, behind hydration, the
 * session chunk and a 300ms session request, in that order). The real control
 * still replaces it and corrects it within that time; this only removes the
 * wait on every visit after the first.
 *
 * Hook-free and import-free: the root layout inlines ACCOUNT_HINT_SCRIPT, the
 * same way it sets data-code-lang, so the hint is on <html> before the header
 * is parsed. Never the email or ids: only what the header shows anyway.
 */
export const ACCOUNT_HINT_KEY = "leetexpert:account";

/** An avatar URL the early script may put into CSS: https only, nothing that could close url("…"). */
export const SAFE_AVATAR = /^https:\/\/[^\s"'()\\<>]+$/;

export type AccountHint = { signedIn: false } | { signedIn: true; image?: string | null; initials: string };

export function writeAccountHint(hint: AccountHint, storage: Pick<Storage, "setItem"> | undefined = globalThis.localStorage): void {
  const value = hint.signedIn
    ? JSON.stringify({ s: "in", img: hint.image && SAFE_AVATAR.test(hint.image) ? hint.image : undefined, ini: hint.initials.slice(0, 2) })
    : "out";
  try {
    storage?.setItem(ACCOUNT_HINT_KEY, value);
  } catch {
    /* blocked storage: the header waits for the session, as before */
  }
}

/**
 * Sets <html data-account="in|out"> and, when signed in, --account-avatar (a
 * url()) or --account-initials (a CSS string) for AccountPlaceholder's rules in
 * globals.css. Anything unexpected leaves <html> untouched: an empty box, as
 * before.
 */
export const ACCOUNT_HINT_SCRIPT = `(function(){try{var v=localStorage.getItem(${JSON.stringify(ACCOUNT_HINT_KEY)});if(!v)return;var h=document.documentElement;if(v==="out"){h.setAttribute("data-account","out");return}var a=JSON.parse(v);if(!a||a.s!=="in")return;h.setAttribute("data-account","in");if(typeof a.img==="string"&&${SAFE_AVATAR.toString()}.test(a.img)){h.style.setProperty("--account-avatar",'url("'+a.img+'")')}else if(typeof a.ini==="string"){h.style.setProperty("--account-initials",JSON.stringify(a.ini.slice(0,2)))}}catch(e){}})();`;
