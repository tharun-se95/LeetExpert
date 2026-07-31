"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/course/manifest";
import { problemHref } from "@/lib/course/nav";

interface Entry {
  m: string;
  s: string;
  t: string;
  y: string;
  h: string[];
}

interface Hit {
  entry: Entry;
  score: number;
  /** the heading that matched, when the title didn't */
  via: string | null;
}

const MODULE_TITLE = new Map(MODULES.map((m) => [m.slug, m.shortTitle]));

/**
 * Ranking, in one place so it stays explainable:
 * a title match always outranks a heading match, and a match at the start of
 * a word outranks one buried mid-word. That is enough structure for 191
 * entries — a real scoring engine would be weight the results can't carry.
 */
function rank(entry: Entry, q: string): Hit | null {
  const title = entry.t.toLowerCase();
  if (title.startsWith(q)) return { entry, score: 100, via: null };
  if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(title)) {
    return { entry, score: 80, via: null };
  }
  if (title.includes(q)) return { entry, score: 60, via: null };

  for (const h of entry.h) {
    const lower = h.toLowerCase();
    if (lower.includes(q)) {
      return { entry, score: lower.startsWith(q) ? 40 : 25, via: h };
    }
  }
  return null;
}

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetched the first time search is opened, then kept. The index is useless
  // until someone searches, so it should not load with the page.
  useEffect(() => {
    if (!open || entries) return;
    let cancelled = false;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((data: Entry[]) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, entries]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      // rAF so the input exists and the dialog has painted before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!entries || q.length < 2) return [];
    return entries
      .map((e) => rank(e, q))
      .filter((h): h is Hit => h !== null)
      .sort((a, b) => b.score - a.score || a.entry.t.localeCompare(b.entry.t))
      .slice(0, 12);
  }, [entries, query]);

  useEffect(() => setActive(0), [query]);

  const go = useCallback(
    (hit: Hit) => {
      onClose();
      if (hit.entry.y === "problem") {
        router.push(problemHref(hit.entry.s));
      } else {
        router.push(`/course/${hit.entry.m}/${hit.entry.s}`);
      }
    },
    [onClose, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      go(hits[active]);
    }
  };

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/25 px-4 pt-[12vh] backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search lessons and problems"
        onKeyDown={onKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-background"
      >
        <div className="flex min-h-12 items-center gap-3 border-b border-border px-4 focus-within:bg-accent/[0.04]">
          <MagnifyingGlass
            size={18}
            className="shrink-0 text-muted"
            aria-hidden
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons and problems…"
            aria-label="Search lessons and problems"
            // Kill the global :focus-visible box — the row carries focus chrome.
            className="min-w-0 flex-1 bg-transparent py-3.5 text-[0.95rem] text-foreground outline-none placeholder:text-muted focus-visible:outline-none!"
          />
          <kbd className="shrink-0 rounded-[length:var(--radius-sm)] border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.62rem] text-muted">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto">
          {query.trim().length < 2 ? (
            <p className="px-4 py-8 text-center text-[0.82rem] text-muted">
              {entries === null
                ? "Loading index…"
                : "Type at least two characters."}
            </p>
          ) : hits.length === 0 ? (
            <p className="px-4 py-8 text-center text-[0.82rem] text-muted">
              Nothing matches “{query.trim()}”.
            </p>
          ) : (
            hits.map((hit, i) => (
              <button
                key={`${hit.entry.m}/${hit.entry.s}`}
                type="button"
                data-index={i}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(hit)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors focus-visible:outline-none!",
                  i === active ? "bg-accent/10" : "bg-transparent hover:bg-surface",
                )}
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[0.9rem] text-foreground">
                    {hit.entry.t}
                  </span>
                  <span className="block truncate font-mono text-[0.68rem] text-muted">
                    {MODULE_TITLE.get(hit.entry.m) ?? hit.entry.m}
                    {hit.via ? ` · ${hit.via}` : ""}
                  </span>
                </div>
                {hit.entry.y === "problem" ? (
                  <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[0.6rem] text-muted">
                    problem
                  </span>
                ) : hit.entry.y === "practice" ? (
                  <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[0.6rem] text-muted">
                    practice
                  </span>
                ) : null}
                <ArrowRight
                  size={13}
                  className={cn(
                    "shrink-0",
                    i === active ? "text-accent" : "text-transparent",
                  )}
                  aria-hidden
                />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
