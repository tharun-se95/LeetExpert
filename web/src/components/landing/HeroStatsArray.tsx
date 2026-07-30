"use client";

import { useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type HeroStatTile = {
  label: string;
  value: number;
};

function DownArrow({ color }: { color: string }) {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden>
      <path d="M6 8 L0 0 H12 Z" fill={color} />
    </svg>
  );
}

function UpArrow({ color }: { color: string }) {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden>
      <path d="M6 0 L12 8 H0 Z" fill={color} />
    </svg>
  );
}

/**
 * Curriculum counts as a write-pointer scan: read leads, write commits only
 * after read has moved on. Loop: write follows home → clear → rewrite.
 * Order: modules → concepts → lessons → problems.
 */
export function HeroStatsArray({ tiles }: { tiles: readonly HeroStatTile[] }) {
  const rowId = useId();
  const n = tiles.length;
  const [written, setWritten] = useState(0);
  const [read, setRead] = useState(0);
  const [write, setWrite] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduce || n === 0) return;

    /**
     * Beats: write never commits slot i until read has already moved on
     * (to i+1, or home for the last slot). Then hold → write follows →
     * clear → rewrite.
     */
    type Beat = { read: number; write: number; written: number };
    const beats: Beat[] = [];

    for (let i = 0; i < n; i++) {
      // Read lands on i (write still on prior commit).
      beats.push({
        read: i,
        write: i === 0 ? 0 : i - 1,
        written: i,
      });
      // Read must move to the next slot before write may commit i.
      // On the last cell, "next" is home (index 0).
      const nextRead = i < n - 1 ? i + 1 : 0;
      beats.push({
        read: nextRead,
        write: i === 0 ? 0 : i - 1,
        written: i,
      });
      beats.push({
        read: nextRead,
        write: i,
        written: i + 1,
      });
    }

    const full = { read: 0, write: n - 1, written: n };
    beats.push(full, full); // hold: read already home, write on last fill
    beats.push({ read: 0, write: 0, written: n }); // write follows
    beats.push({ read: 0, write: 0, written: 0 }); // clear, then rewrite

    let step = 0;
    const apply = (b: Beat) => {
      setRead(b.read);
      setWrite(b.write);
      setWritten(b.written);
    };
    apply(beats[0]!);

    const id = window.setInterval(() => {
      step = (step + 1) % beats.length;
      apply(beats[step]!);
    }, 700);

    return () => window.clearInterval(id);
  }, [reduce, n]);

  const readIndex = reduce ? n - 1 : read;
  const writeIndex = reduce ? n - 1 : write;
  const writtenCount = reduce ? n : written;

  const cols = {
    gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
  } as const;

  return (
    <div className="elevated-card overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-surface p-3 sm:p-4">
      <p className="font-mono text-[0.65rem] tracking-wide text-muted uppercase">
        Your learning progress
      </p>
      <p className="mt-0.5 text-xs text-muted">
        <span className="font-mono text-muted">read</span> leads ·{" "}
        <span className="font-mono text-accent">write</span> fills the counts
      </p>

      <div
        className="mt-2.5"
        role="img"
        aria-label={`Writing curriculum counts. Read at ${tiles[readIndex]?.label ?? "start"}. Write at index ${writeIndex}. ${writtenCount} of ${n} filled.`}
      >
        <div className="grid gap-1.5" style={cols} aria-hidden>
          {tiles.map((_, i) => (
            <div
              key={`r-${i}`}
              className="flex h-7 flex-col items-center justify-end"
            >
              {readIndex === i ? (
                <motion.div
                  layoutId={`${rowId}-read`}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="flex flex-col items-center"
                >
                  <span className="font-mono text-[10px] font-semibold text-muted">
                    read
                  </span>
                  <DownArrow color="var(--muted)" />
                </motion.div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-1 grid gap-1.5" style={cols}>
          {tiles.map((tile, i) => {
            const isFilled = i < writtenCount;
            const isReading = readIndex === i;
            const isWriteHere = writeIndex === i;
            const justWrote =
              isFilled && isWriteHere && writtenCount === i + 1;
            const readLeading = isReading && !isFilled;

            return (
              <div
                key={tile.label}
                className="flex min-w-0 flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    "flex w-full flex-col items-center justify-center rounded-lg border px-1.5 py-3 transition-colors duration-300",
                    justWrote
                      ? "border-pop bg-pop text-on-pop"
                      : readLeading
                        ? "border-accent/50 bg-accent/10 text-foreground"
                        : isFilled && isWriteHere
                          ? "border-pop/70 bg-pop/15 text-foreground"
                          : isFilled
                            ? "border-border bg-surface/80 text-foreground"
                            : "border-border/70 bg-surface/40 text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[0.6rem] tracking-wide uppercase",
                      justWrote ? "text-on-pop/80" : "text-muted",
                    )}
                  >
                    {tile.label}
                  </span>
                  <span className="mt-0.5 font-display text-xl font-bold tabular-nums tracking-tight sm:text-2xl">
                    {isFilled ? (
                      <motion.span
                        key={`${tile.label}-w${i}-${writtenCount > i}`}
                        initial={reduce ? false : { scale: 1.35, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 28,
                        }}
                      >
                        {tile.value}
                      </motion.span>
                    ) : (
                      <span className="text-muted/50">—</span>
                    )}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted">{i}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-1 grid gap-1.5" style={cols} aria-hidden>
          {tiles.map((_, i) => (
            <div
              key={`w-${i}`}
              className="flex h-7 flex-col items-center justify-start"
            >
              {writeIndex === i ? (
                <motion.div
                  layoutId={`${rowId}-write`}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="flex flex-col items-center"
                >
                  <UpArrow color="var(--pop)" />
                  <span className="font-mono text-[10px] font-semibold text-pop">
                    write
                  </span>
                </motion.div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
