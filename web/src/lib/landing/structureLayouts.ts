/**
 * The landing page's one evolving structure: seven values drawn as an array,
 * a hash table, a binary search tree and a graph. EvolvingStructure animates
 * from one layout to the next as each chapter snaps into view.
 *
 * Every layout is derived from the values rather than hand-placed, so the
 * drawing cannot claim a structure the values don't actually form —
 * landingStory.test.tsx rebuilds each one independently and compares.
 * Spec: docs/superpowers/specs/2026-09-14-landing-rewrite-agentic-ai-design.md
 */

export const STRUCTURE_VALUES: readonly number[] = [5, 3, 8, 1, 4, 7, 9];
export const BUCKETS = 4;
export const STAGE_NAMES = ["array", "hash table", "binary search tree", "graph"] as const;
export const HASH_STAGE = 1;

export const VIEW_W = 440;
export const VIEW_H = 360;
/** Cell size in the array and hash stages; the circle diameter in the others. */
export const CELL = 36;

export type Point = { x: number; y: number };
/** An undirected edge between two indices into STRUCTURE_VALUES. */
export type Edge = readonly [number, number];

const N = STRUCTURE_VALUES.length;
const LAST_STAGE = STAGE_NAMES.length - 1;
const byValue = (v: number) => STRUCTURE_VALUES.indexOf(v);

// --- array ---------------------------------------------------------------
const ARRAY_GAP = 8;

function arrayLayout(): Point[] {
  const width = N * CELL + (N - 1) * ARRAY_GAP;
  const x0 = (VIEW_W - width) / 2 + CELL / 2;
  return STRUCTURE_VALUES.map((_, i) => ({ x: x0 + i * (CELL + ARRAY_GAP), y: VIEW_H / 2 }));
}

// --- hash table ----------------------------------------------------------
export const HASH_LABEL_X = 70;
export const HASH_CHAIN_X0 = 150;
const HASH_CHAIN_STEP = 70;
export const HASH_ROW_Y = (bucket: number) => 60 + bucket * 80;

/** Each value's bucket, and its position in that bucket's chain (array order). */
function hashSlots() {
  const filled = new Array<number>(BUCKETS).fill(0);
  return STRUCTURE_VALUES.map((v) => {
    const bucket = v % BUCKETS;
    const slot = filled[bucket] ?? 0;
    filled[bucket] = slot + 1;
    return { bucket, slot };
  });
}

/** How many values each bucket holds — empty buckets draw no chain stub. */
export const HASH_BUCKET_SIZES: readonly number[] = hashSlots().reduce(
  (sizes, { bucket }) => {
    sizes[bucket] = (sizes[bucket] ?? 0) + 1;
    return sizes;
  },
  new Array<number>(BUCKETS).fill(0),
);

function hashLayout(): Point[] {
  return hashSlots().map(({ bucket, slot }) => ({
    x: HASH_CHAIN_X0 + slot * HASH_CHAIN_STEP,
    y: HASH_ROW_Y(bucket),
  }));
}

/** Chain links: each value to the next value in the same bucket. */
function hashEdges(): Edge[] {
  const slots = hashSlots();
  const edges: Edge[] = [];
  slots.forEach(({ bucket, slot }, i) => {
    const next = slots.findIndex((s) => s.bucket === bucket && s.slot === slot + 1);
    if (next !== -1) edges.push([i, next]);
  });
  return edges;
}

// --- binary search tree --------------------------------------------------
/** Insert the values in array order; returns each node's parent and depth. */
function bst() {
  const left = new Array<number>(N).fill(-1);
  const right = new Array<number>(N).fill(-1);
  const parent = new Array<number>(N).fill(-1);
  const depth = new Array<number>(N).fill(0);
  for (let i = 1; i < N; i++) {
    let at = 0;
    for (;;) {
      const side = STRUCTURE_VALUES[i]! < STRUCTURE_VALUES[at]! ? left : right;
      const child = side[at]!;
      if (child === -1) {
        side[at] = i;
        parent[i] = at;
        depth[i] = depth[at]! + 1;
        break;
      }
      at = child;
    }
  }
  return { parent, depth };
}

function treeLayout(): Point[] {
  const { depth } = bst();
  // In-order position = rank among the sorted values, which is what makes the
  // left-to-right order of a BST drawing read as sorted.
  const sorted = [...STRUCTURE_VALUES].sort((a, b) => a - b);
  const step = (VIEW_W - 100) / (N - 1);
  return STRUCTURE_VALUES.map((v, i) => ({
    x: 50 + sorted.indexOf(v) * step,
    y: 60 + depth[i]! * 110,
  }));
}

function treeEdges(): Edge[] {
  const { parent } = bst();
  return parent.flatMap((p, i) => (p === -1 ? [] : [[p, i] as const]));
}

// --- graph ---------------------------------------------------------------
/** Cross links added to the tree; each closes a cycle. By value, not index. */
export const CROSS_LINKS: readonly (readonly [number, number])[] = [
  [1, 4],
  [4, 7],
  [7, 9],
];

function graphLayout(): Point[] {
  const r = 130;
  return STRUCTURE_VALUES.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
    return { x: VIEW_W / 2 + r * Math.cos(angle), y: VIEW_H / 2 + r * Math.sin(angle) };
  });
}

function graphEdges(): Edge[] {
  return [...treeEdges(), ...CROSS_LINKS.map(([a, b]) => [byValue(a), byValue(b)] as const)];
}

// --- stages --------------------------------------------------------------
export const LAYOUTS: readonly (readonly Point[])[] = [
  arrayLayout(),
  hashLayout(),
  treeLayout(),
  graphLayout(),
];

export const STAGE_EDGES: readonly (readonly Edge[])[] = [[], hashEdges(), treeEdges(), graphEdges()];

const edgeKey = ([a, b]: Edge) => (a < b ? `${a}-${b}` : `${b}-${a}`);

/**
 * Every distinct edge once, with the stages that draw it. Rendering one
 * element per edge (not per stage) is what lets a tree edge stay put when the
 * tree becomes a graph instead of fading out and back in.
 */
export const ALL_EDGES: readonly { edge: Edge; stages: readonly number[] }[] = (() => {
  const byKey = new Map<string, { edge: Edge; stages: number[] }>();
  STAGE_EDGES.forEach((edges, stage) => {
    for (const edge of edges) {
      const entry = byKey.get(edgeKey(edge)) ?? { edge, stages: [] };
      entry.stages.push(stage);
      byKey.set(edgeKey(edge), entry);
    }
  });
  return [...byKey.values()];
})();

/** A whole stage in range; the drawing only ever rests on real layouts. */
export function clampStage(stage: number): number {
  return Math.min(LAST_STAGE, Math.max(0, Math.round(stage)));
}

/** Square cells while the values sit in slots (array, hash); circles once they are nodes. */
export function cornerFor(stage: number): number {
  return clampStage(stage) >= 2 ? CELL / 2 : 6;
}

export function describeStage(stage: number): string {
  const name = STAGE_NAMES[clampStage(stage)]!;
  const article = name === "array" ? "an" : "a";
  const detail = name === "hash table" ? ` with ${BUCKETS} buckets` : "";
  return `The values ${STRUCTURE_VALUES.join(", ")} arranged as ${article} ${name}${detail}.`;
}
