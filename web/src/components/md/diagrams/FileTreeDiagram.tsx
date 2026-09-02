"use client";

/**
 * A monospace file/folder tree with optional per-line color and a trailing
 * annotation — the shape for every "where does this file go" lesson:
 * routing conventions, dynamic segments, route groups, middleware
 * placement, monorepo layout. `indent` is in tree levels (each level = one
 * folder deeper), not raw pixels.
 */
export interface TreeLine {
  text: string;
  indent?: number;
  note?: string;
  /** Tints this line's text with the theme accent (or a custom token). */
  color?: string;
}

interface FileTreeDiagramProps {
  lines?: TreeLine[];
  caption?: string;
}

const LINE_H = 20;
const INDENT_W = 16;
const PAD = 14;

export function FileTreeDiagram({
  lines = [{ text: "app/" }, { text: "page.tsx", indent: 1 }],
  caption,
}: FileTreeDiagramProps) {
  const maxLineLen = Math.max(
    ...lines.map((l) => (l.text.length + (l.indent ?? 0) * 2)),
  );
  const noteX = PAD + maxLineLen * 6.6 + 24;
  const hasNotes = lines.some((l) => l.note);
  const maxNoteLen = Math.max(0, ...lines.map((l) => l.note?.length ?? 0));
  const contentWidth = hasNotes ? noteX + maxNoteLen * 5.6 + PAD : noteX;
  const captionWidth = caption ? caption.length * 5.4 + PAD * 2 : 0;
  const width = Math.max(280, contentWidth, captionWidth);
  const height = PAD * 2 + lines.length * LINE_H + (caption ? 20 : 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-[440px]"
      role="img"
      aria-label={
        (caption ? `${caption}: ` : "") +
        lines.map((l) => `${"  ".repeat(l.indent ?? 0)}${l.text}${l.note ? ` — ${l.note}` : ""}`).join("; ")
      }
    >
      {lines.map((line, i) => {
        const y = PAD + i * LINE_H + 12;
        const x = PAD + (line.indent ?? 0) * INDENT_W;
        return (
          <g key={i}>
            <text
              x={x}
              y={y}
              fontSize={11.5}
              fontWeight={line.color ? 700 : 400}
              fill={line.color ?? "var(--foreground)"}
              fontFamily="var(--font-mono), monospace"
            >
              {line.text}
            </text>
            {line.note ? (
              <text
                x={noteX}
                y={y}
                fontSize={10}
                fill="var(--muted)"
                fontFamily="var(--font-sans), system-ui"
              >
                — {line.note}
              </text>
            ) : null}
          </g>
        );
      })}
      {caption ? (
        <text
          x={width / 2}
          y={height - 4}
          fontSize={10}
          fill="var(--muted)"
          textAnchor="middle"
          fontFamily="var(--font-sans), system-ui"
        >
          {caption}
        </text>
      ) : null}
    </svg>
  );
}
