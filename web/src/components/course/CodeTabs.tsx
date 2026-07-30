"use client";

import { useState } from "react";
import { CodeBody, CopyButton } from "@/components/md/CodeBlock";
import type { TabBlock } from "@/lib/content/highlightBlocks";

export function CodeTabs({ tabs }: { tabs: TabBlock[] }) {
  const [active, setActive] = useState(0);

  if (tabs.length === 0) {
    return null;
  }

  const current = tabs[Math.min(active, tabs.length - 1)];

  return (
    <div className="code-surface group my-5">
      <div className="code-surface-header">
        <div className="code-surface-tabs" role="tablist" aria-label="Language">
          {tabs.map((tab, i) => (
            <button
              key={tab.language}
              type="button"
              role="tab"
              aria-selected={i === active}
              data-active={i === active ? "true" : "false"}
              onClick={() => setActive(i)}
              className="code-tab"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <CopyButton code={current.code} />
      </div>
      <CodeBody code={current.code} html={current.html} />
    </div>
  );
}
