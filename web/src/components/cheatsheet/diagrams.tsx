import type { DiagramId } from "@/lib/course/cheatsheets/types";
import { cn } from "@/lib/utils";

function Frame({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 160 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      className={cn("h-full w-full", className)}
    >
      {children}
    </svg>
  );
}

function Cell({
  x,
  y,
  w = 16,
  h = 16,
  tone = "stroke",
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  tone?: "stroke" | "accent" | "good" | "warn" | "bad" | "muted" | "mark";
}) {
  const cls =
    tone === "stroke"
      ? "stroke-current text-foreground/70"
      : tone === "accent"
        ? "fill-accent/80"
        : tone === "good"
          ? "fill-good/70"
          : tone === "warn"
            ? "fill-warn/70"
            : tone === "bad"
              ? "fill-bad/70"
              : tone === "mark"
                ? "fill-mark/70"
                : "fill-muted/40";
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={2}
      className={cls}
      fill={tone === "stroke" ? "none" : undefined}
      strokeWidth={tone === "stroke" ? 1.4 : 0}
    />
  );
}

/** Inline arrowhead — avoids duplicate SVG marker ids across cards. */
function ArrowHead({
  x,
  y,
  tone = "accent",
}: {
  x: number;
  y: number;
  tone?: "accent" | "good" | "mark";
}) {
  const cls =
    tone === "good" ? "fill-good" : tone === "mark" ? "fill-mark" : "fill-accent";
  return <path d={`M${x} ${y - 3} L${x + 6} ${y} L${x} ${y + 3} Z`} className={cls} />;
}

function ArrayCells() {
  return (
    <Frame label="Array cells with a highlighted write region">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Cell
          key={i}
          x={14 + i * 22}
          y={26}
          tone={i < 3 ? "accent" : "stroke"}
        />
      ))}
      <path d="M36 50 H78" className="stroke-accent" strokeWidth={1.5} />
      <ArrowHead x={78} y={50} />
      <text
        x={58}
        y={64}
        textAnchor="middle"
        className="fill-muted font-mono"
        fontSize="8"
      >
        write region
      </text>
    </Frame>
  );
}

function TwoPointers() {
  return (
    <Frame label="Two pointers advancing from opposite ends">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Cell key={i} x={14 + i * 22} y={26} tone="stroke" />
      ))}
      <path d="M22 18 V24" className="stroke-accent" strokeWidth={2} />
      <path d="M132 18 V24" className="stroke-good" strokeWidth={2} />
      <text x={22} y={14} textAnchor="middle" className="fill-accent font-mono" fontSize="9">
        L
      </text>
      <text x={132} y={14} textAnchor="middle" className="fill-good font-mono" fontSize="9">
        R
      </text>
      <path
        d="M30 54 H48"
        className="stroke-accent"
        strokeWidth={1.2}
      />
      <ArrowHead x={48} y={54} />
      <path
        d="M130 54 H112"
        className="stroke-good"
        strokeWidth={1.2}
      />
      <path d="M112 51 L106 54 L112 57" className="fill-good" />
    </Frame>
  );
}

function SlidingWindow() {
  return (
    <Frame label="Sliding window spanning a contiguous subarray">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Cell
          key={i}
          x={14 + i * 22}
          y={28}
          tone={i >= 1 && i <= 3 ? "mark" : "stroke"}
        />
      ))}
      <rect
        x={34}
        y={24}
        width={70}
        height={24}
        rx={3}
        className="stroke-accent"
        strokeWidth={1.6}
        strokeDasharray="3 2"
      />
      <text x={40} y={18} className="fill-accent font-mono" fontSize="8">
        L
      </text>
      <text x={96} y={18} className="fill-good font-mono" fontSize="8">
        R
      </text>
      <text x={69} y={64} textAnchor="middle" className="fill-accent font-mono" fontSize="8">
        window
      </text>
    </Frame>
  );
}

function HashBuckets() {
  return (
    <Frame label="Hash map buckets with keys landing in slots">
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={18 + i * 34}
            y={18}
            width={28}
            height={38}
            rx={2}
            fill="none"
            className="stroke-current text-foreground/60"
            strokeWidth={1.3}
          />
          <text
            x={32 + i * 34}
            y={16}
            textAnchor="middle"
            className="fill-muted font-mono"
            fontSize="7"
          >
            {i}
          </text>
          <Cell
            x={24 + i * 34}
            y={24}
            w={16}
            h={10}
            tone={i === 1 || i === 3 ? "accent" : "muted"}
          />
          {i === 1 ? (
            <Cell x={24 + i * 34} y={38} w={16} h={10} tone="good" />
          ) : null}
        </g>
      ))}
    </Frame>
  );
}

function StackLifo() {
  return (
    <Frame label="Stack growing upward with LIFO top highlighted">
      {[0, 1, 2, 3].map((i) => (
        <Cell
          key={i}
          x={58}
          y={52 - i * 12}
          w={40}
          h={10}
          tone={i === 3 ? "accent" : i === 2 ? "mark" : "stroke"}
        />
      ))}
      <path d="M108 16 H98" className="stroke-accent" strokeWidth={1.3} />
      <ArrowHead x={92} y={16} />
      <text x={110} y={18} className="fill-accent font-mono" fontSize="8">
        top / push
      </text>
      <text x={48} y={66} textAnchor="middle" className="fill-muted font-mono" fontSize="7">
        LIFO
      </text>
    </Frame>
  );
}

function QueueFifo() {
  return (
    <Frame label="Queue with front and back ends labelled">
      {[0, 1, 2, 3, 4].map((i) => (
        <Cell
          key={i}
          x={20 + i * 24}
          y={26}
          w={20}
          h={16}
          tone={i === 0 ? "good" : i === 4 ? "accent" : "stroke"}
        />
      ))}
      <path d="M18 50 H28" className="stroke-good" strokeWidth={1.2} />
      <path d="M28 47 L34 50 L28 53" className="fill-good" />
      <text x={30} y={64} textAnchor="middle" className="fill-good font-mono" fontSize="8">
        front · pop
      </text>
      <path d="M142 50 H132" className="stroke-accent" strokeWidth={1.2} />
      <path d="M132 47 L126 50 L132 53" className="fill-accent" />
      <text x={128} y={64} textAnchor="middle" className="fill-accent font-mono" fontSize="8">
        back · push
      </text>
    </Frame>
  );
}

function LinkedList() {
  return (
    <Frame label="Linked list nodes with next pointers; last link cut for reverse">
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={12 + i * 36}
            y={24}
            width={24}
            height={22}
            rx={3}
            fill={i === 0 ? undefined : "none"}
            className={
              i === 0
                ? "stroke-accent fill-accent/20"
                : "stroke-current text-foreground/70"
            }
            strokeWidth={1.4}
          />
          {i < 3 ? (
            <>
              <path
                d={`M${36 + i * 36} 35 H${44 + i * 36}`}
                className={i === 0 ? "stroke-good" : "stroke-accent"}
                strokeWidth={1.5}
              />
              <ArrowHead
                x={44 + i * 36}
                y={35}
                tone={i === 0 ? "good" : "accent"}
              />
            </>
          ) : (
            <circle cx={148} cy={35} r={3} className="fill-muted" />
          )}
        </g>
      ))}
      <text x={24} y={60} textAnchor="middle" className="fill-accent font-mono" fontSize="7">
        head
      </text>
      <path
        d="M48 18 H72"
        className="stroke-warn"
        strokeWidth={1.2}
        strokeDasharray="2 2"
      />
      <text x={60} y={14} textAnchor="middle" className="fill-warn font-mono" fontSize="7">
        rewire
      </text>
    </Frame>
  );
}

function FastSlowList() {
  return (
    <Frame label="Linked list with fast and slow pointers">
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x={10 + i * 28}
            y={28}
            width={20}
            height={18}
            rx={3}
            fill="none"
            className="stroke-current text-foreground/70"
            strokeWidth={1.3}
          />
          {i < 4 ? (
            <path
              d={`M${30 + i * 28} 37 H${34 + i * 28}`}
              className="stroke-muted"
              strokeWidth={1.3}
            />
          ) : null}
        </g>
      ))}
      <path d="M20 22 V28" className="stroke-good" strokeWidth={2} />
      <text x={20} y={16} textAnchor="middle" className="fill-good font-mono" fontSize="8">
        S
      </text>
      <path d="M104 22 V28" className="stroke-accent" strokeWidth={2} />
      <text x={104} y={16} textAnchor="middle" className="fill-accent font-mono" fontSize="8">
        F
      </text>
      <text x={80} y={64} textAnchor="middle" className="fill-muted font-mono" fontSize="7">
        slow +1 · fast +2
      </text>
    </Frame>
  );
}

function BinarySearch() {
  return (
    <Frame label="Binary search discarding the left half of the search space">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Cell
          key={i}
          x={10 + i * 20}
          y={28}
          w={16}
          h={16}
          tone={i < 3 ? "muted" : i === 4 ? "accent" : "stroke"}
        />
      ))}
      <path
        d="M14 52 H66"
        className="stroke-bad"
        strokeWidth={1.3}
        strokeDasharray="2 2"
      />
      <text x={40} y={64} textAnchor="middle" className="fill-bad font-mono" fontSize="7">
        discard
      </text>
      <path d="M74 20 H150" className="stroke-good" strokeWidth={1.4} />
      <text x={112} y={16} textAnchor="middle" className="fill-good font-mono" fontSize="8">
        keep
      </text>
      <text x={98} y={64} textAnchor="middle" className="fill-accent font-mono" fontSize="7">
        mid
      </text>
    </Frame>
  );
}

function PrefixBar() {
  return (
    <Frame label="Prefix sums building left to right">
      {[8, 18, 28, 40, 34, 48].map((h, i) => (
        <rect
          key={i}
          x={16 + i * 22}
          y={56 - h}
          width={14}
          height={h}
          rx={1.5}
          className={i === 3 ? "fill-accent/80" : "fill-mark/45"}
        />
      ))}
      <path d="M12 56 H148" className="stroke-muted" strokeWidth={1} />
      <text x={80} y={68} textAnchor="middle" className="fill-muted font-mono" fontSize="7">
        pref[i]
      </text>
    </Frame>
  );
}

function BfsLayers() {
  return (
    <Frame label="BFS expanding in layers from a source">
      <circle cx={28} cy={36} r={8} className="fill-accent/80" />
      <text x={28} y={39} textAnchor="middle" className="fill-background font-mono" fontSize="7">
        0
      </text>
      {[0, 1, 2].map((i) => (
        <circle
          key={`a-${i}`}
          cx={70}
          cy={16 + i * 20}
          r={7}
          className="stroke-good fill-good/20"
          strokeWidth={1.3}
        />
      ))}
      {[0, 1].map((i) => (
        <circle
          key={`b-${i}`}
          cx={118}
          cy={22 + i * 28}
          r={7}
          className="stroke-mark fill-mark/15"
          strokeWidth={1.3}
        />
      ))}
      <path
        d="M36 36 H62 M36 36 L62 16 M36 36 L62 56 M78 16 L110 22 M78 36 L110 50"
        className="stroke-muted"
        strokeWidth={1.1}
      />
      <text x={70} y={68} textAnchor="middle" className="fill-good font-mono" fontSize="7">
        L1
      </text>
      <text x={118} y={68} textAnchor="middle" className="fill-mark font-mono" fontSize="7">
        L2
      </text>
    </Frame>
  );
}

function DpTable() {
  return (
    <Frame label="DP table cell depending on prior cells">
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4].map((c) => {
          const hot = r === 2 && c === 3;
          const dep = (r === 2 && c === 2) || (r === 1 && c === 3);
          return (
            <rect
              key={`${r}-${c}`}
              x={20 + c * 24}
              y={8 + r * 14}
              width={20}
              height={12}
              rx={1.5}
              fill={hot || dep ? undefined : "none"}
              className={
                hot
                  ? "fill-accent/85"
                  : dep
                    ? "fill-good/50"
                    : "stroke-current text-foreground/40"
              }
              strokeWidth={hot ? 0 : 1}
            />
          );
        }),
      )}
      <path
        d="M92 42 H104 M104 28 V36"
        className="stroke-warn"
        strokeWidth={1.2}
      />
      <text x={130} y={66} textAnchor="end" className="fill-muted font-mono" fontSize="7">
        deps → state
      </text>
    </Frame>
  );
}

function TreeLevels() {
  return (
    <Frame label="Binary tree levels from root downward">
      <circle cx={80} cy={14} r={7} className="fill-accent/85" />
      <circle cx={50} cy={36} r={7} className="stroke-good fill-good/25" strokeWidth={1.3} />
      <circle cx={110} cy={36} r={7} className="stroke-good fill-good/25" strokeWidth={1.3} />
      <circle cx={34} cy={58} r={6} className="stroke-mark fill-mark/20" strokeWidth={1.2} />
      <circle cx={66} cy={58} r={6} className="stroke-mark fill-mark/20" strokeWidth={1.2} />
      <circle cx={110} cy={58} r={6} className="stroke-muted fill-muted/25" strokeWidth={1.2} />
      <path
        d="M74 20 L56 30 M86 20 L104 30 M44 42 L38 52 M56 42 L66 52 M110 43 V52"
        className="stroke-muted"
        strokeWidth={1.2}
      />
    </Frame>
  );
}

function HeapPyramid() {
  return (
    <Frame label="Binary heap shape with root priority highlighted">
      <circle cx={80} cy={14} r={8} className="fill-accent/85" />
      <circle cx={48} cy={38} r={7} className="fill-warn/55" />
      <circle cx={112} cy={38} r={7} className="fill-good/55" />
      <circle cx={28} cy={60} r={6} className="stroke-muted" strokeWidth={1.2} />
      <circle cx={68} cy={60} r={6} className="stroke-muted" strokeWidth={1.2} />
      <circle cx={96} cy={60} r={6} className="stroke-muted" strokeWidth={1.2} />
      <circle cx={132} cy={60} r={6} className="stroke-muted" strokeWidth={1.2} />
      <path
        d="M74 20 L54 32 M86 20 L106 32 M42 44 L32 54 M54 44 L64 54 M106 44 L100 54 M118 44 L128 54"
        className="stroke-muted"
        strokeWidth={1.1}
      />
      <text x={80} y={17} textAnchor="middle" className="fill-background font-mono" fontSize="7">
        min
      </text>
    </Frame>
  );
}

function IntervalSweep() {
  return (
    <Frame label="Intervals on a line with sweep overlap">
      <path d="M12 40 H148" className="stroke-muted" strokeWidth={1} />
      <rect x={20} y={26} width={50} height={8} rx={2} className="fill-accent/70" />
      <rect x={48} y={38} width={56} height={8} rx={2} className="fill-warn/70" />
      <rect x={90} y={50} width={44} height={8} rx={2} className="fill-good/60" />
      <path d="M70 16 V64" className="stroke-mark" strokeWidth={1.4} strokeDasharray="2 2" />
      <text x={70} y={12} textAnchor="middle" className="fill-mark font-mono" fontSize="8">
        sweep
      </text>
    </Frame>
  );
}

function MatrixGrid() {
  return (
    <Frame label="Matrix grid with a highlighted cell and neighbours">
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4].map((c) => {
          const hot = r === 1 && c === 2;
          const near =
            (r === 1 && (c === 1 || c === 3)) ||
            ((r === 0 || r === 2) && c === 2);
          return (
            <rect
              key={`${r}-${c}`}
              x={22 + c * 22}
              y={8 + r * 14}
              width={18}
              height={12}
              rx={1.5}
              fill={hot || near ? undefined : "none"}
              className={
                hot
                  ? "fill-accent/85"
                  : near
                    ? "fill-good/40"
                    : "stroke-current text-foreground/35"
              }
              strokeWidth={hot ? 0 : 1}
            />
          );
        }),
      )}
    </Frame>
  );
}

function RecursionTree() {
  return (
    <Frame label="Recursion call tree branching then returning">
      <circle cx={80} cy={12} r={6} className="fill-accent/85" />
      <circle cx={48} cy={34} r={6} className="fill-mark/60" />
      <circle cx={112} cy={34} r={6} className="fill-mark/60" />
      <circle cx={32} cy={56} r={5} className="fill-good/55" />
      <circle cx={64} cy={56} r={5} className="fill-good/55" />
      <circle cx={112} cy={56} r={5} className="fill-muted/50" />
      <path
        d="M74 17 L54 28 M86 17 L106 28 M42 40 L36 51 M54 40 L60 51 M112 40 V51"
        className="stroke-muted"
        strokeWidth={1.1}
      />
      {/* Return edges — dashed, distinguish from tree-levels */}
      <path
        d="M40 54 Q56 48 72 18"
        className="stroke-warn"
        strokeWidth={1.1}
        strokeDasharray="2 2"
        fill="none"
      />
      <text x={128} y={68} textAnchor="end" className="fill-warn font-mono" fontSize="7">
        return
      </text>
    </Frame>
  );
}

function SortBars() {
  return (
    <Frame label="Bars mid-sort with a pivot region marked">
      {[20, 36, 14, 44, 28, 40, 18].map((h, i) => (
        <rect
          key={i}
          x={14 + i * 20}
          y={56 - h}
          width={14}
          height={h}
          rx={1.5}
          className={i === 3 ? "fill-accent/85" : i < 3 ? "fill-good/50" : "fill-muted/45"}
        />
      ))}
      <text x={80} y={68} textAnchor="middle" className="fill-accent font-mono" fontSize="7">
        pivot
      </text>
    </Frame>
  );
}

function TrieBranches() {
  return (
    <Frame label="Trie prefix branches from a root">
      <circle cx={80} cy={12} r={6} className="fill-accent/85" />
      <circle cx={50} cy={34} r={6} className="stroke-mark fill-mark/20" strokeWidth={1.2} />
      <circle cx={110} cy={34} r={6} className="stroke-good fill-good/25" strokeWidth={1.2} />
      <circle cx={36} cy={56} r={5} className="fill-good/60" />
      <circle cx={64} cy={56} r={5} className="fill-muted/50" />
      <circle cx={110} cy={56} r={5} className="fill-warn/55" />
      <path
        d="M74 17 L56 28 M86 17 L104 28 M44 40 L40 51 M56 40 L60 51 M110 40 V51"
        className="stroke-muted"
        strokeWidth={1.1}
      />
      <text x={50} y={32} textAnchor="middle" className="fill-mark font-mono" fontSize="6">
        c
      </text>
      <text x={36} y={70} textAnchor="middle" className="fill-muted font-mono" fontSize="7">
        a
      </text>
      <text x={110} y={70} textAnchor="middle" className="fill-warn font-mono" fontSize="7">
        end
      </text>
    </Frame>
  );
}

function GreedyChoice() {
  return (
    <Frame label="Greedy local choice highlighted among candidates">
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx={24 + i * 28}
          cy={36}
          r={10}
          fill={i === 2 ? undefined : "none"}
          className={
            i === 2
              ? "fill-accent/85"
              : "stroke-current text-foreground/45"
          }
          strokeWidth={i === 2 ? 0 : 1.3}
        />
      ))}
      <path d="M80 18 V24" className="stroke-good" strokeWidth={2} />
      <text x={80} y={14} textAnchor="middle" className="fill-good font-mono" fontSize="8">
        pick
      </text>
      <text x={24} y={58} textAnchor="middle" className="fill-muted font-mono" fontSize="7">
        5
      </text>
      <text x={80} y={58} textAnchor="middle" className="fill-accent font-mono" fontSize="7">
        2
      </text>
      <text x={136} y={58} textAnchor="middle" className="fill-muted font-mono" fontSize="7">
        7
      </text>
    </Frame>
  );
}

function UnionFind() {
  return (
    <Frame label="Union-Find parent pointers merging two components">
      {/* Component A */}
      <circle cx={36} cy={22} r={8} className="fill-accent/80" />
      <circle cx={20} cy={50} r={7} className="stroke-accent fill-accent/15" strokeWidth={1.3} />
      <circle cx={52} cy={50} r={7} className="stroke-accent fill-accent/15" strokeWidth={1.3} />
      <path
        d="M24 44 L32 28 M48 44 L40 28"
        className="stroke-accent"
        strokeWidth={1.3}
      />
      {/* Component B */}
      <circle cx={124} cy={22} r={8} className="fill-good/80" />
      <circle cx={108} cy={50} r={7} className="stroke-good fill-good/15" strokeWidth={1.3} />
      <circle cx={140} cy={50} r={7} className="stroke-good fill-good/15" strokeWidth={1.3} />
      <path
        d="M112 44 L120 28 M136 44 L128 28"
        className="stroke-good"
        strokeWidth={1.3}
      />
      {/* Union bridge */}
      <path
        d="M46 22 H112"
        className="stroke-mark"
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      <text x={80} y={16} textAnchor="middle" className="fill-mark font-mono" fontSize="7">
        union
      </text>
    </Frame>
  );
}

const DIAGRAMS: Record<DiagramId, () => React.ReactElement> = {
  "array-cells": ArrayCells,
  "two-pointers": TwoPointers,
  "sliding-window": SlidingWindow,
  "hash-buckets": HashBuckets,
  "stack-lifo": StackLifo,
  "queue-fifo": QueueFifo,
  "linked-list": LinkedList,
  "fast-slow-list": FastSlowList,
  "binary-search": BinarySearch,
  "prefix-bar": PrefixBar,
  "bfs-layers": BfsLayers,
  "dp-table": DpTable,
  "tree-levels": TreeLevels,
  "heap-pyramid": HeapPyramid,
  "interval-sweep": IntervalSweep,
  "matrix-grid": MatrixGrid,
  "recursion-tree": RecursionTree,
  "sort-bars": SortBars,
  "trie-branches": TrieBranches,
  "greedy-choice": GreedyChoice,
  "union-find": UnionFind,
};

export function CheatsheetDiagram({
  id,
  className,
}: {
  id: DiagramId;
  label?: string;
  className?: string;
}) {
  const Diagram = DIAGRAMS[id];
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[length:var(--radius-sm)] border border-border bg-background/80 p-2",
        className,
      )}
    >
      <div className="aspect-[160/72] w-full text-foreground">
        <Diagram />
      </div>
    </div>
  );
}
