"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface CodeTab {
  language: string;
  label: string;
  code: string;
}

const LABELS: Record<string, string> = {
  python: "Python",
  typescript: "TypeScript",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
};

/**
 * Parse the body of a ````tabs fence: a sequence of standard ```lang fences.
 */
function parseTabs(source: string): CodeTab[] {
  const tabs: CodeTab[] = [];
  const fence = /```(\w+)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = fence.exec(source)) !== null) {
    const language = match[1];
    tabs.push({
      language,
      label: LABELS[language] ?? language,
      code: match[2].replace(/\n$/, ""),
    });
  }
  return tabs;
}

export function CodeTabs({ source }: { source: string }) {
  const tabs = useMemo(() => parseTabs(source), [source]);
  const [active, setActive] = useState(0);

  if (tabs.length === 0) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-border bg-code px-4 py-3 font-mono text-[0.85rem] leading-relaxed">
        {source}
      </pre>
    );
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
      <pre className="overflow-x-auto bg-code px-4 py-3 font-mono text-[0.85rem] leading-relaxed">
        <code>{current.code}</code>
      </pre>
    </div>
  );
}
