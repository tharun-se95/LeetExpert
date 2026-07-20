"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/md/CodeBlock";
import type { TabBlock } from "@/lib/content/highlightBlocks";

export function CodeTabs({ tabs }: { tabs: TabBlock[] }) {
  const [active, setActive] = useState(0);

  if (tabs.length === 0) {
    return null;
  }

  const current = tabs[Math.min(active, tabs.length - 1)];

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
        {tabs.map((tab, i) => (
          <button
            key={tab.language}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition",
              i === active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock
        language={current.language}
        code={current.code}
        html={current.html}
      />
    </div>
  );
}
