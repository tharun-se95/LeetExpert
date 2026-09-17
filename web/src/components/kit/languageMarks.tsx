/**
 * Small per-language identity marks: the header's code-language switch, the
 * sandbox toolbar, lesson code blocks and viz code panels all render them, so
 * a language reads the same wherever its code appears.
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

function Badge({ label, background, color }: { label: string; background: string; color: string }) {
  return (
    <span aria-hidden className={badgeBase} style={{ background, color }}>
      {label}
    </span>
  );
}

/**
 * The mark for a code fence's language, or nothing. Lesson code blocks are
 * Python + TypeScript and the editor is Python + JavaScript; any other
 * language gets no badge rather than a guessed one.
 */
export function LanguageMark({ language }: { language: string }) {
  switch (language) {
    case "python":
      return <Badge label="Py" background="#3776AB" color="#FFFFFF" />;
    case "javascript":
      return <Badge label="JS" background="#F7DF1E" color="#000000" />;
    case "typescript":
      return <Badge label="TS" background="#3178C6" color="#FFFFFF" />;
    default:
      return null;
  }
}
