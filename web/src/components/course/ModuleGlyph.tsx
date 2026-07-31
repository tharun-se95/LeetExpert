import { cn } from "@/lib/utils";

type GlyphProps = { className?: string };

/** Shared stroke look for module diagrams — inherits accent via currentColor. */
function Svg({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 120 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full text-accent", className)}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Cell({
  x,
  y,
  w = 14,
  h = 14,
  fill = false,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  fill?: boolean;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={2}
      className={fill ? "fill-current" : "stroke-current"}
      strokeWidth={fill ? 0 : 1.5}
      opacity={fill ? 0.85 : 0.9}
    />
  );
}

function ArraysGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Cell key={i} x={12 + i * 16} y={29} fill={i === 2 || i === 3} />
      ))}
      <path
        d="M12 52 H108"
        className="stroke-current"
        strokeWidth={1}
        opacity={0.35}
      />
    </Svg>
  );
}

function StacksGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      {[0, 1, 2, 3].map((i) => (
        <Cell
          key={i}
          x={42}
          y={48 - i * 12}
          w={36}
          h={10}
          fill={i === 3}
        />
      ))}
      <path
        d="M62 8 V18"
        className="stroke-current"
        strokeWidth={1.5}
        opacity={0.7}
      />
      <path
        d="M56 14 L62 8 L68 14"
        className="stroke-current"
        strokeWidth={1.5}
        opacity={0.7}
      />
    </Svg>
  );
}

function QueuesGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      {[0, 1, 2, 3].map((i) => (
        <Cell key={i} x={22 + i * 18} y={29} w={16} h={14} fill={i === 0} />
      ))}
      <path
        d="M10 36 H18 M102 36 H110"
        className="stroke-current"
        strokeWidth={1.5}
        opacity={0.6}
      />
      <path
        d="M14 30 L10 36 L14 42 M106 30 L110 36 L106 42"
        className="stroke-current"
        strokeWidth={1.5}
        opacity={0.6}
      />
    </Svg>
  );
}

function LinkedListsGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={14 + i * 34}
            y={26}
            width={22}
            height={20}
            rx={3}
            className="stroke-current"
            strokeWidth={1.5}
            opacity={0.9}
          />
          <line
            x1={28 + i * 34}
            y1={26}
            x2={28 + i * 34}
            y2={46}
            className="stroke-current"
            strokeWidth={1}
            opacity={0.4}
          />
          {i < 2 ? (
            <>
              <path
                d={`M${36 + i * 34} 36 H${44 + i * 34}`}
                className="stroke-current"
                strokeWidth={1.5}
                opacity={0.8}
              />
              <path
                d={`M${40 + i * 34} 32 L${46 + i * 34} 36 L${40 + i * 34} 40`}
                className="stroke-current"
                strokeWidth={1.5}
                opacity={0.8}
              />
            </>
          ) : null}
        </g>
      ))}
      <circle cx={102} cy={36} r={3} className="fill-current" opacity={0.5} />
    </Svg>
  );
}

function HashTablesGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          <rect
            x={18}
            y={10 + row * 14}
            width={18}
            height={12}
            rx={2}
            className="stroke-current"
            strokeWidth={1.25}
            opacity={0.7}
          />
          {[0, 1, 2].slice(0, row === 1 ? 3 : row === 2 ? 2 : 1).map((c) => (
            <circle
              key={c}
              cx={50 + c * 16}
              cy={16 + row * 14}
              r={4.5}
              className={c === 0 && row === 1 ? "fill-current" : "stroke-current"}
              strokeWidth={1.25}
              opacity={0.85}
            />
          ))}
        </g>
      ))}
    </Svg>
  );
}

function StringsGlyph({ className }: GlyphProps) {
  const chars = ["c", "o", "d", "e"];
  return (
    <Svg className={className}>
      {chars.map((ch, i) => (
        <g key={ch}>
          <Cell x={28 + i * 18} y={26} w={16} h={20} fill={i === 0} />
          <text
            x={36 + i * 18}
            y={40}
            textAnchor="middle"
            fontSize="9"
            className="font-mono"
            fill={i === 0 ? "var(--on-pop)" : "currentColor"}
            opacity={i === 0 ? 1 : 0.75}
          >
            {ch}
          </text>
        </g>
      ))}
    </Svg>
  );
}

function TwoPointersGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Cell key={i} x={18 + i * 18} y={28} fill={i === 0 || i === 4} />
      ))}
      <path d="M25 22 L25 26" className="stroke-current" strokeWidth={1.5} />
      <path d="M21 22 L25 18 L29 22" className="stroke-current" strokeWidth={1.5} />
      <text x={25} y={16} textAnchor="middle" className="fill-current font-mono" fontSize="8">
        L
      </text>
      <path d="M97 22 L97 26" className="stroke-current" strokeWidth={1.5} />
      <path d="M93 22 L97 18 L101 22" className="stroke-current" strokeWidth={1.5} />
      <text x={97} y={16} textAnchor="middle" className="fill-current font-mono" fontSize="8">
        R
      </text>
    </Svg>
  );
}

function SlidingWindowGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Cell key={i} x={12 + i * 16} y={30} />
      ))}
      <rect
        x={26}
        y={24}
        width={50}
        height={26}
        rx={3}
        className="stroke-current"
        strokeWidth={2}
        opacity={0.9}
      />
    </Svg>
  );
}

function PrefixSumGlyph({ className }: GlyphProps) {
  const hs = [10, 18, 28, 22, 34];
  return (
    <Svg className={className}>
      {hs.map((h, i) => (
        <rect
          key={i}
          x={22 + i * 16}
          y={52 - h}
          width={12}
          height={h}
          rx={2}
          className="fill-current"
          opacity={0.25 + i * 0.15}
        />
      ))}
      <path
        d="M20 52 H100"
        className="stroke-current"
        strokeWidth={1}
        opacity={0.35}
      />
    </Svg>
  );
}

function BinarySearchGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Cell
          key={i}
          x={10 + i * 14}
          y={30}
          w={12}
          fill={i >= 2 && i <= 4}
        />
      ))}
      <path
        d="M38 22 H66"
        className="stroke-current"
        strokeWidth={1.5}
        opacity={0.7}
      />
      <circle cx={52} cy={16} r={3} className="fill-current" />
    </Svg>
  );
}

function SortingGlyph({ className }: GlyphProps) {
  const before = [28, 14, 34, 20, 24];
  const after = [14, 20, 24, 28, 34];
  return (
    <Svg className={className}>
      {before.map((h, i) => (
        <rect
          key={`b${i}`}
          x={10 + i * 10}
          y={52 - h}
          width={8}
          height={h}
          rx={1.5}
          className="fill-current"
          opacity={0.35}
        />
      ))}
      <path
        d="M64 36 H74"
        className="stroke-current"
        strokeWidth={1.5}
        opacity={0.6}
      />
      <path
        d="M70 30 L76 36 L70 42"
        className="stroke-current"
        strokeWidth={1.5}
        opacity={0.6}
      />
      {after.map((h, i) => (
        <rect
          key={`a${i}`}
          x={82 + i * 10}
          y={52 - h}
          width={8}
          height={h}
          rx={1.5}
          className="fill-current"
          opacity={0.85}
        />
      ))}
    </Svg>
  );
}

function MatrixGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <Cell
            key={`${r}${c}`}
            x={30 + c * 16}
            y={8 + r * 14}
            w={13}
            h={11}
            fill={r === 1 && c === 2}
          />
        )),
      )}
    </Svg>
  );
}

function BinaryTreesGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <circle cx={60} cy={14} r={7} className="fill-current" opacity={0.9} />
      <path d="M60 21 L36 38 M60 21 L84 38" className="stroke-current" strokeWidth={1.5} opacity={0.7} />
      <circle cx={36} cy={44} r={7} className="stroke-current" strokeWidth={1.5} />
      <circle cx={84} cy={44} r={7} className="stroke-current" strokeWidth={1.5} />
      <path d="M36 51 L24 64 M36 51 L48 64 M84 51 L72 64 M84 51 L96 64" className="stroke-current" strokeWidth={1.25} opacity={0.5} />
      {[24, 48, 72, 96].map((x) => (
        <circle key={x} cx={x} cy={66} r={4} className="stroke-current" strokeWidth={1.25} opacity={0.6} />
      ))}
    </Svg>
  );
}

function BstGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <circle cx={60} cy={16} r={8} className="fill-current" />
      <text
        x={60}
        y={19}
        textAnchor="middle"
        className="font-mono"
        fontSize="8"
        fill="var(--on-pop)"
      >
        8
      </text>
      <path d="M60 24 L36 40 M60 24 L84 40" className="stroke-current" strokeWidth={1.5} opacity={0.7} />
      <circle cx={36} cy={48} r={8} className="stroke-current" strokeWidth={1.5} />
      <text x={36} y={51} textAnchor="middle" className="fill-current font-mono" fontSize="8">
        3
      </text>
      <circle cx={84} cy={48} r={8} className="stroke-current" strokeWidth={1.5} />
      <text x={84} y={51} textAnchor="middle" className="fill-current font-mono" fontSize="8">
        12
      </text>
    </Svg>
  );
}

function HeapsGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <circle cx={60} cy={14} r={7} className="fill-current" />
      <path d="M60 21 L38 40 M60 21 L82 40" className="stroke-current" strokeWidth={1.5} opacity={0.75} />
      <circle cx={38} cy={46} r={7} className="stroke-current" strokeWidth={1.5} />
      <circle cx={82} cy={46} r={7} className="stroke-current" strokeWidth={1.5} />
      <path d="M38 53 L28 66 M38 53 L48 66" className="stroke-current" strokeWidth={1.25} opacity={0.55} />
      <circle cx={28} cy={66} r={4} className="stroke-current" strokeWidth={1.2} opacity={0.6} />
      <circle cx={48} cy={66} r={4} className="stroke-current" strokeWidth={1.2} opacity={0.6} />
    </Svg>
  );
}

function TriesGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <circle cx={60} cy={10} r={5} className="fill-current" />
      <path d="M60 15 L40 32 M60 15 L80 32" className="stroke-current" strokeWidth={1.4} opacity={0.7} />
      <circle cx={40} cy={36} r={5} className="stroke-current" strokeWidth={1.4} />
      <circle cx={80} cy={36} r={5} className="stroke-current" strokeWidth={1.4} />
      <path d="M40 41 L28 58 M40 41 L52 58 M80 41 L80 58" className="stroke-current" strokeWidth={1.3} opacity={0.6} />
      <circle cx={28} cy={62} r={4} className="stroke-current" strokeWidth={1.2} />
      <circle cx={52} cy={62} r={4} className="fill-current" opacity={0.8} />
      <circle cx={80} cy={62} r={4} className="stroke-current" strokeWidth={1.2} />
    </Svg>
  );
}

function GraphsGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <path
        d="M36 24 L60 14 L88 28 L78 52 L42 56 Z M60 14 L78 52 M36 24 L78 52"
        className="stroke-current"
        strokeWidth={1.4}
        opacity={0.65}
      />
      {[
        [36, 24],
        [60, 14],
        [88, 28],
        [78, 52],
        [42, 56],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={6}
          className={i === 1 ? "fill-current" : "stroke-current"}
          strokeWidth={1.5}
        />
      ))}
    </Svg>
  );
}

function RecursionGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <rect x={42} y={6} width={36} height={14} rx={2} className="fill-current" opacity={0.9} />
      <path d="M60 20 V28" className="stroke-current" strokeWidth={1.4} opacity={0.6} />
      <rect x={20} y={28} width={32} height={12} rx={2} className="stroke-current" strokeWidth={1.4} />
      <rect x={68} y={28} width={32} height={12} rx={2} className="stroke-current" strokeWidth={1.4} />
      <path d="M36 40 V48 M84 40 V48" className="stroke-current" strokeWidth={1.3} opacity={0.5} />
      <rect x={12} y={48} width={24} height={10} rx={2} className="stroke-current" strokeWidth={1.2} opacity={0.7} />
      <rect x={40} y={48} width={24} height={10} rx={2} className="stroke-current" strokeWidth={1.2} opacity={0.7} />
      <rect x={76} y={48} width={24} height={10} rx={2} className="stroke-current" strokeWidth={1.2} opacity={0.7} />
    </Svg>
  );
}

function DpGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4].map((c) => (
          <rect
            key={`${r}${c}`}
            x={18 + c * 17}
            y={8 + r * 14}
            width={14}
            height={11}
            rx={2}
            className={
              (r === 2 && c <= 2) || (r === 3 && c <= 3)
                ? "fill-current"
                : "stroke-current"
            }
            strokeWidth={1.2}
            opacity={r === 2 && c <= 2 ? 0.55 + c * 0.1 : 0.75}
          />
        )),
      )}
    </Svg>
  );
}

function IntervalsGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <path d="M12 36 H108" className="stroke-current" strokeWidth={1} opacity={0.3} />
      <rect x={18} y={24} width={36} height={10} rx={2} className="fill-current" opacity={0.85} />
      <rect x={48} y={38} width={40} height={10} rx={2} className="stroke-current" strokeWidth={1.5} />
      <rect x={78} y={24} width={28} height={10} rx={2} className="fill-current" opacity={0.45} />
    </Svg>
  );
}

function GreedyGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      {[18, 28, 14, 34, 22].map((h, i) => (
        <rect
          key={i}
          x={20 + i * 16}
          y={52 - h}
          width={12}
          height={h}
          rx={2}
          className={i === 3 ? "fill-current" : "stroke-current"}
          strokeWidth={1.4}
          opacity={i === 3 ? 0.9 : 0.65}
        />
      ))}
      <path
        d="M74 10 L74 16"
        className="stroke-current"
        strokeWidth={1.5}
      />
      <path
        d="M70 14 L74 8 L78 14"
        className="stroke-current"
        strokeWidth={1.5}
      />
    </Svg>
  );
}

function BigOGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <path d="M16 56 H104 M16 56 V12" className="stroke-current" strokeWidth={1.2} opacity={0.35} />
      <path
        d="M20 52 Q40 48 52 36 T84 12"
        className="stroke-current"
        strokeWidth={2}
        opacity={0.9}
      />
      <path
        d="M20 52 L100 40"
        className="stroke-current"
        strokeWidth={1.25}
        opacity={0.4}
        strokeDasharray="3 3"
      />
    </Svg>
  );
}

function MathGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <text
        x={60}
        y={44}
        textAnchor="middle"
        className="fill-current font-mono"
        fontSize="28"
        opacity={0.9}
      >
        Σ
      </text>
      <path
        d="M28 20 H48 M88 20 H108"
        className="stroke-current"
        strokeWidth={1.5}
        opacity={0.45}
      />
    </Svg>
  );
}

function GettingStartedGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <rect
        x={34}
        y={12}
        width={52}
        height={48}
        rx={3}
        className="stroke-current"
        strokeWidth={1.5}
      />
      <path d="M60 12 V60" className="stroke-current" strokeWidth={1.25} opacity={0.5} />
      <path
        d="M42 24 H54 M42 32 H52 M66 24 H78 M66 32 H76 M66 40 H74"
        className="stroke-current"
        strokeWidth={1.5}
        opacity={0.7}
      />
    </Svg>
  );
}

const GLYPHS: Record<string, (props: GlyphProps) => React.ReactElement> = {
  "getting-started": GettingStartedGlyph,
  "big-o": BigOGlyph,
  "math-for-dsa": MathGlyph,
  arrays: ArraysGlyph,
  strings: StringsGlyph,
  "hash-tables": HashTablesGlyph,
  "linked-lists": LinkedListsGlyph,
  stacks: StacksGlyph,
  queues: QueuesGlyph,
  "two-pointers": TwoPointersGlyph,
  "sliding-window": SlidingWindowGlyph,
  "prefix-sum": PrefixSumGlyph,
  "binary-search": BinarySearchGlyph,
  sorting: SortingGlyph,
  matrix: MatrixGlyph,
  "recursion-backtracking": RecursionGlyph,
  "binary-trees": BinaryTreesGlyph,
  bst: BstGlyph,
  heaps: HeapsGlyph,
  tries: TriesGlyph,
  intervals: IntervalsGlyph,
  greedy: GreedyGlyph,
  graphs: GraphsGlyph,
  "dynamic-programming": DpGlyph,
};

/** Flat diagram for a course module — used on the curriculum map cards. */
export function ModuleGlyph({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Glyph = GLYPHS[slug] ?? ArraysGlyph;
  return <Glyph className={className} />;
}
