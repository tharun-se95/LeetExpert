import { cn } from "@/lib/utils";

/** A hand-drawn underline: one stroke, drawn as the heading arrives (globals.css, .landing-mark). */
function Squiggle() {
  return (
    <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden>
      <path
        d="M3 12 C 30 4, 52 18, 80 10 S 132 4, 160 11 S 188 14, 197 7"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A landing section heading with its key word drawn over (owner, 2026-09-23:
 * "the text look very plain and boring"): underlined by hand, or swept with a
 * highlighter, in the section's family colour (--accent, scoped by the
 * section). A two-sentence heading sets its first sentence muted, on its own
 * line, so the second carries the weight. The text content is the
 * heading unchanged, so the words a screen reader hears are the owner's.
 */
export function MarkedHeading({
  text,
  mark,
  split: splitSentences = true,
  as: Tag = "h2",
  className,
}: {
  text: string;
  mark: { word: string; style: "underline" | "highlight" };
  /** Set a two-sentence heading's first sentence muted on its own line (the default). */
  split?: boolean;
  /** The heading level: h2 for landing sections, h1 where it heads its page (sign-in). */
  as?: "h1" | "h2";
  className?: string;
}) {
  const split = splitSentences ? text.indexOf(". ") : -1;
  const lead = split > -1 ? text.slice(0, split + 1) : null;
  const claim = split > -1 ? text.slice(split + 2) : text;
  if (!text.includes(mark.word)) throw new Error(`MarkedHeading: "${mark.word}" is not in "${text}"`);

  const marked = (part: string) => {
    const at = part.indexOf(mark.word);
    if (at === -1) return part;
    return (
      <>
        {part.slice(0, at)}
        {mark.style === "underline" ? (
          <span className="landing-mark">
            {mark.word}
            <Squiggle />
          </span>
        ) : (
          <span className="landing-hl">{mark.word}</span>
        )}
        {part.slice(at + mark.word.length)}
      </>
    );
  };

  return (
    <Tag
      className={cn(
        "landing-pop mt-5 max-w-4xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl",
        className,
      )}
    >
      {lead ? (
        <>
          <span className="text-muted">{marked(lead)}</span>{" "}
          <br />
        </>
      ) : null}
      {marked(claim)}
    </Tag>
  );
}
