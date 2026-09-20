export const DEFAULT_NEXT = "/courses/dsa";

const SIGN_IN_PATH = "/sign-in";
// Far beyond any real route, and short enough that the value fits in a
// callback URL and a Location header without a proxy truncating it.
const MAX_LENGTH = 2048;
// Never dereferenced: it only gives the URL parser a base to resolve against.
const PROBE_ORIGIN = "https://safe-next.invalid";

/**
 * The path a learner may be sent to after signing in. `next` arrives from a
 * query string anyone can craft, so this is an open-redirect surface.
 *
 * Regexes alone are a losing game here: browsers strip tabs and newlines
 * from URLs, read `\` as `/`, and collapse `/a/..//host` into `//host`. So the
 * value is resolved by the same WHATWG parser browsers use, and it survives
 * only if the result is still on the probe origin and its own path does not
 * begin with a second slash. What is returned is the parser's output, never
 * the raw string, so nothing the parser would have rewritten reaches a
 * redirect header. Control characters and backslashes are refused up front
 * rather than repaired, since the parser would silently repair them.
 */
export function safeNext(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_LENGTH) return DEFAULT_NEXT;
  if (raw[0] !== "/" || raw[1] === "/") return DEFAULT_NEXT;
  if (/[\x00-\x20\x7f\\]/.test(raw)) return DEFAULT_NEXT;

  let url: URL;
  try {
    url = new URL(raw, PROBE_ORIGIN);
  } catch {
    return DEFAULT_NEXT;
  }
  if (url.origin !== PROBE_ORIGIN) return DEFAULT_NEXT;

  // Better Auth refuses a callback URL whose path holds an encoded separator
  // (403 INVALID_CALLBACK_URL), so returning one would only break the sign-in
  // it is meant to resume. It also covers the start of the path: an encoded
  // slash there decodes to a host boundary in servers that decode before
  // redirecting.
  if (/%2f|%5c/i.test(url.pathname)) return DEFAULT_NEXT;

  let decoded: string;
  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    return DEFAULT_NEXT;
  }
  if (decoded.startsWith("//") || decoded.startsWith("/\\") || url.pathname.startsWith("//")) return DEFAULT_NEXT;

  // Signing in from the sign-in page would bring the learner straight back.
  // The decoded path too: the router decodes "/%73ign-in" to the same page.
  for (const path of [url.pathname, decoded]) {
    if (path === SIGN_IN_PATH || path.startsWith(`${SIGN_IN_PATH}/`)) return DEFAULT_NEXT;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
