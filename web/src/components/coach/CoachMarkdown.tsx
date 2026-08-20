"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Model output is untrusted: only absolute http(s) links become anchors.
function safeHref(href: string | undefined): string | null {
  if (!href) return null;
  return /^https?:\/\//i.test(href) ? href : null;
}

/**
 * Assistant bubbles render a deliberately small GFM subset — not the lesson
 * Markdown component, which would pull Mermaid, Quiz, and Viz into the rail.
 * Headings flatten to paragraphs and fenced blocks never reach here (the
 * server filter refuses any reply containing one).
 */
export function CoachMarkdown({ source }: { source: string }) {
  return (
    <div className="text-sm leading-relaxed text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1 [&_code]:rounded-[length:var(--radius-sm)] [&_code]:bg-code [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_strong]:font-semibold [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-3 [&_blockquote]:text-muted">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <p>{children}</p>,
          h1: "p",
          h2: "p",
          h3: "p",
          h4: "p",
          h5: "p",
          h6: "p",
          img: () => null,
          a: ({ href, children }) => {
            const safe = safeHref(href);
            if (!safe) return <span>{children}</span>;
            return (
              <a
                href={safe}
                rel="noreferrer"
                className="text-mark underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
