"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/course/load";

interface TableOfContentsProps {
  items: TocItem[];
}

/** Fades the scroll rail's own top/bottom edges to transparent, instead of clipping hard. */
const EDGE_FADE_MASK =
  "linear-gradient(to bottom, transparent, black 12px, black calc(100% - 12px), transparent)";

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className="print:hidden sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[length:var(--radius-md)] bg-surface/50 p-3"
      style={{ maskImage: EDGE_FADE_MASK, WebkitMaskImage: EDGE_FADE_MASK }}
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-border text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block origin-left border-l-2 -ml-px py-0.5 transition-[color,transform] duration-300 ease-[var(--ease)] hover:text-foreground motion-reduce:transition-none",
                item.level === 3 ? "pl-5" : "pl-3",
                activeId === item.id
                  ? "scale-[1.04] border-accent font-medium text-foreground"
                  : "border-transparent text-muted",
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                history.replaceState(null, "", `#${item.id}`);
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
