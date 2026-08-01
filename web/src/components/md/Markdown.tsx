"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Components } from "react-markdown";
import { Mermaid } from "@/components/md/Mermaid";
import { Callout, type CalloutType } from "@/components/md/Callout";
import { CodeBlock } from "@/components/md/CodeBlock";
import { ExamplesBlock } from "@/components/md/ExamplesBlock";
import {
  looksLikeExamples,
  parseExampleRows,
} from "@/lib/content/parseExamples";
import { Quiz } from "@/components/course/Quiz";
import { CodeTabs } from "@/components/course/CodeTabs";
import { Reveal } from "@/components/course/Reveal";
import { Complexity } from "@/components/course/Complexity";
import { Viz } from "@/components/viz/Viz";
import { MarginNote } from "@/components/md/MarginNote";
import { remarkHighlight } from "@/lib/content/remarkHighlight";
import { Diagram } from "@/components/md/Diagram";
import { Roadmap, RoadmapError } from "@/components/md/Roadmap";
import { parseRoadmapStages } from "@/lib/content/parseRoadmapStages";
import { codeHighlightKey, type TabBlock } from "@/lib/content/highlightBlocks";
import type { ReactNode } from "react";

function flattenText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (typeof node === "object" && node !== null && "props" in node) {
    const el = node as { props?: { children?: ReactNode } };
    return flattenText(el.props?.children);
  }
  return "";
}

function detectCalloutType(children: ReactNode): {
  type: "tip" | "warn" | "rocket" | "build" | "brain" | "default";
} {
  const text = flattenText(children);
  if (text.includes("💡")) return { type: "tip" };
  if (text.includes("⚠️")) return { type: "warn" };
  if (text.includes("🚀")) return { type: "rocket" };
  if (text.includes("🏗️")) return { type: "build" };
  if (text.includes("🧠")) return { type: "brain" };
  return { type: "default" };
}

export function Markdown({
  source,
  highlightedBlocks,
  highlightedTabs,
}: {
  source: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
}) {
  const components: Components = {
    pre({ children }) {
      const child = Array.isArray(children) ? children[0] : children;
      if (child && typeof child === "object" && "props" in child) {
        const codeEl = child as {
          props: {
            className?: string;
            children?: ReactNode;
            node?: { data?: { meta?: string } };
          };
        };
        const className = codeEl.props.className ?? "";
        const text = () => flattenText(codeEl.props.children);
        // react-markdown/remark-rehype appends one synthetic trailing "\n" to a
        // fenced code block's rendered text (CommonMark's HTML convention),
        // which mdast's raw `code.value` — what highlightBlocks.ts keys against
        // server-side — never has. Strip it so lookups line up.
        const codeText = () => text().replace(/\n$/, "");
        if (className.includes("language-mermaid")) {
          return <Mermaid chart={text()} />;
        }
        if (className.includes("language-quiz")) {
          return <Quiz source={text()} />;
        }
        if (className.includes("language-tabs")) {
          const key = codeText();
          const tabs = highlightedTabs[key];
          // A missing/empty lookup means something went wrong upstream (bad
          // parse, key mismatch). Fall back to the raw block instead of
          // rendering nothing, so a future miss is visible, not silent.
          if (!tabs || tabs.length === 0) {
            return <CodeBlock language="tabs" code={key} html={null} />;
          }
          return <CodeTabs tabs={tabs} />;
        }
        if (className.includes("language-complexity")) {
          return <Complexity source={text()} />;
        }
        if (className.includes("language-viz")) {
          return <Viz source={text()} />;
        }
        if (className.includes("language-diagram")) {
          return <Diagram source={text()} />;
        }
        if (className.includes("language-examples")) {
          const rows = parseExampleRows(text());
          if (!rows) {
            return <CodeBlock language="text" code={codeText()} html={null} />;
          }
          return <ExamplesBlock rows={rows} />;
        }
        if (
          className.includes("language-tip") ||
          className.includes("language-note") ||
          className.includes("language-goal") ||
          className.includes("language-constraint")
        ) {
          const lang = /language-(tip|note|goal|constraint)/.exec(className)?.[1] as
            | CalloutType
            | undefined;
          return (
            <Callout type={lang ?? "note"}>
              <Markdown
                source={text()}
                highlightedBlocks={highlightedBlocks}
                highlightedTabs={highlightedTabs}
              />
            </Callout>
          );
        }
        if (className.includes("language-text")) {
          const body = text();
          if (looksLikeExamples(body)) {
            const rows = parseExampleRows(body);
            if (rows) return <ExamplesBlock rows={rows} />;
          }
        }
        if (className.includes("language-aside")) {
          return (
            <MarginNote>
              <Markdown
                source={text()}
                highlightedBlocks={highlightedBlocks}
                highlightedTabs={highlightedTabs}
              />
            </MarginNote>
          );
        }
        if (className.includes("language-reveal")) {
          const label = codeEl.props.node?.data?.meta?.trim() || "Reveal";
          return (
            <Reveal label={label}>
              <Markdown
                source={text()}
                highlightedBlocks={highlightedBlocks}
                highlightedTabs={highlightedTabs}
              />
            </Reveal>
          );
        }
        if (className.includes("language-roadmap")) {
          const stages = parseRoadmapStages(text());
          if (!stages) return <RoadmapError />;
          return (
            <Roadmap
              stages={stages.map((chunk) => {
                const num = /^### Stage (\d+)/.exec(chunk)?.[1] ?? "?";
                return {
                  number: num,
                  content: (
                    <Markdown
                      source={chunk}
                      highlightedBlocks={highlightedBlocks}
                      highlightedTabs={highlightedTabs}
                    />
                  ),
                };
              })}
            />
          );
        }
        const langMatch = /language-(\S+)/.exec(className);
        if (langMatch) {
          const language = langMatch[1];
          const code = codeText();
          const html = highlightedBlocks[codeHighlightKey(language, code)] ?? null;
          return <CodeBlock language={language} code={code} html={html} />;
        }
      }
      return (
        <pre className="overflow-x-auto rounded-lg border border-border bg-code px-4 py-3 font-mono text-[0.85rem] leading-relaxed">
          {children}
        </pre>
      );
    },
    blockquote({ children }) {
      const { type } = detectCalloutType(children);
      return <Callout type={type}>{children}</Callout>;
    },
    a({ href, children, className }) {
      // rehype-autolink-headings wraps every heading in an anchor carrying
      // `anchor-link`. This override used to replace that class outright,
      // so each heading inherited link styling and rendered as a coloured,
      // underlined link. Headings must look like headings.
      if (className?.includes("anchor-link")) {
        return (
          <a href={href} className="anchor-link">
            {children}
          </a>
        );
      }
      return (
        <a
          href={href}
          className="font-medium text-accent underline decoration-accent/30 underline-offset-2 transition hover:decoration-accent"
          {...(href?.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
    table({ children }) {
      return (
        <div className="my-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            {children}
          </table>
        </div>
      );
    },
    th({ children }) {
      return (
        <th className="border-b border-border bg-surface px-3 py-2 text-left font-medium">
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="border-b border-border/60 px-3 py-2 align-top">{children}</td>
      );
    },
    code({ className, children }) {
      if (className) {
        return <code className={className}>{children}</code>;
      }
      return (
        <code className="rounded-md border border-accent/20 bg-accent/[0.07] px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
          {children}
        </code>
      );
    },
  };

  return (
    <div className="handbook-prose prose-headings:scroll-mt-24">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkHighlight]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: ["anchor-link"] },
            },
          ],
        ]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
