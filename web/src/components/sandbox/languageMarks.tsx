/**
 * Small per-language identity marks for the editor's language tabs.
 *
 * Phosphor (this app's whole icon set) is a generic UI icon library — it
 * has no Python or JavaScript logo, and hand-approximating either brand's
 * actual mark from memory as an SVG path risks rendering as a recognisably
 * wrong logo, which is worse than none. A monogram badge in the language's
 * real, widely-recognised brand colour is the same solve tools like
 * CodeSandbox and Replit reach for when a proper vector logo isn't in
 * hand: instantly distinct, correctly coloured, unambiguous at tab size.
 *
 * These colours are brand identity, not design-system colour, and must
 * stay the real hex regardless of theme — the same reasoning that already
 * allowlists Mermaid's resolved-hex theme values. See HEX_ALLOW in
 * tests/design-tokens.test.ts.
 */

const badgeBase = "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] font-sans text-[0.55rem] font-bold leading-none";

export function PythonMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`${badgeBase} ${className ?? ""}`}
      style={{ background: "#3776AB", color: "#FFFFFF" }}
    >
      Py
    </span>
  );
}

export function JavaScriptMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`${badgeBase} ${className ?? ""}`}
      style={{ background: "#F7DF1E", color: "#000000" }}
    >
      JS
    </span>
  );
}
