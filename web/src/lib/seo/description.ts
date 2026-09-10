/**
 * Google renders roughly this many characters of a description on desktop;
 * past it the snippet is truncated mid-thought, which reads as sloppy in the
 * result and wastes the CTR the description exists to earn.
 */
export const METADATA_DESCRIPTION_MAX = 160;

/** Keep pulling in paragraphs until the description carries real substance. */
const MIN_TARGET = 80;

/** Markdown lines that are structure, not prose we can describe a page with. */
function isSkippableLine(line: string): boolean {
  const t = line.trim();
  return (
    t === "" ||
    t.startsWith("#") || // section heading
    t.startsWith("|") || // table row
    t.startsWith(">") || // blockquote
    t.startsWith("<") || // raw html
    /^[-*+]\s/.test(t) || // bullet
    /^\d+\.\s/.test(t) || // ordered item
    /^[-*_]{3,}$/.test(t) // thematic break
  );
}

/** Reduce inline markdown to the words a reader would actually see. */
function stripInline(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> their text
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/(?<!\w)__([^_]+)__(?!\w)/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/(?<!\w)_([^_]+)_(?!\w)/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/==([^=]+)==/g, "$1") // ==highlight==, used in problem statements
    .replace(/<[^>]+>/g, "") // stray inline html
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cut to the SERP limit, preferring a full sentence. A description that ends
 * on a complete thought reads as written-for-humans; one that ends on "…"
 * mid-clause reads as scraped.
 */
function truncate(text: string): string {
  if (text.length <= METADATA_DESCRIPTION_MAX) return text;

  const window = text.slice(0, METADATA_DESCRIPTION_MAX);
  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? "),
  );
  // Only honour the sentence boundary if it still fills the snippet. A
  // paragraph opening "Stages 0-1 built containers. <200 more chars>" would
  // otherwise collapse to that 28-character fragment.
  if (sentenceEnd >= MIN_TARGET) {
    return window.slice(0, sentenceEnd + 1).trim();
  }

  const cut = window.slice(0, METADATA_DESCRIPTION_MAX - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/**
 * Derive a meta description from a lesson's own opening prose.
 *
 * Written rather than hand-authored because there are 220 lesson files and a
 * per-file `description:` frontmatter field would rot the moment a lesson is
 * edited. Deriving it means the snippet always reflects what the page now
 * says. Fenced blocks (diagrams, sandbox specs, practice manifests) and
 * tables are skipped — they are the page's machinery, not its explanation.
 */
export function metaDescription(markdown: string): string | undefined {
  let body = markdown;
  // Tolerate a raw file being passed in rather than gray-matter's content.
  if (body.startsWith("---\n")) {
    const end = body.indexOf("\n---", 4);
    if (end !== -1) body = body.slice(end + 4);
  }

  const paragraphs: string[] = [];
  let current: string[] = [];
  // Track the OPENING fence's marker: this course wraps ```python blocks
  // inside ````tabs blocks, and a naive boolean toggle would read the inner
  // opener as a closer and leak source code into the description.
  let fence: { char: string; len: number } | null = null;
  let startedProse = false;

  const flush = () => {
    if (current.length) {
      paragraphs.push(current.join(" "));
      current = [];
    }
  };

  const enough = () =>
    [...paragraphs, current.join(" ")].join(" ").trim().length >= MIN_TARGET;

  for (const line of body.split("\n")) {
    const t = line.trim();

    const marker = /^(`{3,}|~{3,})/.exec(t);
    if (marker) {
      const char = marker[1][0];
      const len = marker[1].length;
      if (!fence) {
        fence = { char, len };
        flush();
        continue;
      }
      if (char === fence.char && len >= fence.len) {
        fence = null;
      }
      continue;
    }
    if (fence) continue;

    // A heading starts a new section. Stop there once we already have enough
    // prose; otherwise keep reading, since a 30-character description is
    // worse in the SERP than one that spans into the next section.
    if (t.startsWith("#")) {
      if (startedProse && enough()) break;
      flush();
      continue;
    }

    if (isSkippableLine(line)) {
      flush();
      // Only ever stop on a paragraph boundary: this course hard-wraps
      // inline code spans across lines, so cutting mid-paragraph can strand
      // an opening backtick with no closer for stripInline to pair it with.
      if (startedProse && enough()) break;
      continue;
    }

    startedProse = true;
    current.push(t);
  }
  flush();

  const joined = stripInline(paragraphs.join(" "));
  if (!joined) return undefined;
  return truncate(joined);
}
