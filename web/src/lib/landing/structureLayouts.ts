import type { Rgb } from "@/lib/visual/palette";

/**
 * The landing page's backdrop: nine floating data points that gather into an
 * array, a linked list, a hash table, a binary search tree, a matrix and a
 * graph, then scatter and gather into the next, on their own slow clock
 * (owner, 2026-09-20). Points and lines only — no values are drawn. Each
 * structure is painted in the family colour of the module that teaches it.
 *
 * The structures are still derived from a hidden seed rather than
 * hand-placed, so the drawing cannot claim a shape those values don't form:
 * the tree is the BST they build, the chains are real `v % BUCKETS` buckets.
 * landingStory.test.tsx rebuilds each one independently and compares.
 * Spec: docs/superpowers/specs/2026-09-15-landing-product-page-design.md §15
 */

/** Nine, so the matrix is a full 3×3. Never rendered. */
export const STRUCTURE_VALUES: readonly number[] = [5, 3, 8, 1, 4, 7, 9, 2, 6];
export const BUCKETS = 4;
export const STAGE_NAMES = ["array", "linked list", "hash table", "binary search tree", "matrix", "graph"] as const;
export const ARRAY_STAGE = 0;
export const LIST_STAGE = 1;
export const HASH_STAGE = 2;
export const TREE_STAGE = 3;
export const MATRIX_STAGE = 4;
export const GRAPH_STAGE = 5;
const STAGES = STAGE_NAMES.length;

/**
 * The course module that teaches each structure, in stage order; its family
 * colour paints the structure. Registry ids: landingStory.test.tsx checks each
 * against the manifest.
 */
export const STAGE_MODULES = ["arrays", "linked-lists", "hash-tables", "bst", "matrix", "graphs"] as const;

export const VIEW_W = 440;
export const VIEW_H = 360;
/** A data point's radius: large for the drawing, which now fills only the free space beside the text. */
export const POINT_R = 9;

export type Point = { x: number; y: number };
/** An undirected edge between two indices into STRUCTURE_VALUES. */
export type Edge = readonly [number, number];

const N = STRUCTURE_VALUES.length;
const byValue = (v: number) => STRUCTURE_VALUES.indexOf(v);

// --- array ---------------------------------------------------------------
/** Tighter than the list: an array is one contiguous block. */
const ARRAY_STEP = 32;
const CAPSULE_PAD = 18;

function arrayLayout(): Point[] {
  const x0 = VIEW_W / 2 - ((N - 1) * ARRAY_STEP) / 2;
  return STRUCTURE_VALUES.map((_, i) => ({ x: x0 + i * ARRAY_STEP, y: VIEW_H / 2 }));
}

/** The outline around the array's row, the block the points sit in. */
export const ARRAY_CAPSULE = (() => {
  const row = arrayLayout();
  const x = row[0]!.x - CAPSULE_PAD;
  const width = row[N - 1]!.x - row[0]!.x + 2 * CAPSULE_PAD;
  const height = 2 * CAPSULE_PAD;
  return { x, y: VIEW_H / 2 - CAPSULE_PAD, width, height, rx: CAPSULE_PAD };
})();

// --- linked list ---------------------------------------------------------
/** Points in array order, spread wider than the array and set on a gentle wave. */
export const LIST_WAVE = 28;

function listLayout(): Point[] {
  const step = (VIEW_W - 60) / (N - 1);
  return STRUCTURE_VALUES.map((_, i) => ({ x: 30 + i * step, y: VIEW_H / 2 + (i % 2 ? LIST_WAVE : -LIST_WAVE) }));
}

/** next pointers: each point to the one after it in the array. */
function listEdges(): Edge[] {
  return STRUCTURE_VALUES.slice(1).map((_, i) => [i, i + 1] as const);
}

// --- hash table ----------------------------------------------------------
/** The bucket array is a vertical spine; each non-empty bucket has a stub to its chain. */
export const HASH_SPINE_X = 90;
export const HASH_CHAIN_X0 = 160;
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

/** How many values each bucket holds — an empty bucket draws no stub. */
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

const TREE_TOP = 60;

function treeLayout(): Point[] {
  const { depth } = bst();
  // Levels share the height the seed actually needs, so a deeper tree still fits.
  const levelStep = (VIEW_H - 2 * TREE_TOP) / Math.max(1, ...depth);
  // In-order position = rank among the sorted values, which is what makes the
  // left-to-right order of a BST drawing read as sorted.
  const sorted = [...STRUCTURE_VALUES].sort((a, b) => a - b);
  const step = (VIEW_W - 100) / (N - 1);
  return STRUCTURE_VALUES.map((v, i) => ({
    x: 50 + sorted.indexOf(v) * step,
    y: TREE_TOP + depth[i]! * levelStep,
  }));
}

function treeEdges(): Edge[] {
  const { parent } = bst();
  return parent.flatMap((p, i) => (p === -1 ? [] : [[p, i] as const]));
}

// --- matrix --------------------------------------------------------------
/** Row-major, MATRIX_COLS wide; nine points make it square. */
export const MATRIX_COLS = 3;
const MATRIX_STEP = 96;

function matrixLayout(): Point[] {
  const rows = Math.ceil(N / MATRIX_COLS);
  const x0 = VIEW_W / 2 - ((MATRIX_COLS - 1) * MATRIX_STEP) / 2;
  const y0 = VIEW_H / 2 - ((rows - 1) * MATRIX_STEP) / 2;
  return STRUCTURE_VALUES.map((_, i) => ({
    x: x0 + (i % MATRIX_COLS) * MATRIX_STEP,
    y: y0 + Math.floor(i / MATRIX_COLS) * MATRIX_STEP,
  }));
}

/** Grid neighbours: each cell to the cell on its right and the cell below it. */
function matrixEdges(): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < N; i++) {
    if ((i + 1) % MATRIX_COLS !== 0 && i + 1 < N) edges.push([i, i + 1]);
    if (i + MATRIX_COLS < N) edges.push([i, i + MATRIX_COLS]);
  }
  return edges;
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
  listLayout(),
  hashLayout(),
  treeLayout(),
  matrixLayout(),
  graphLayout(),
];

export const STAGE_EDGES: readonly (readonly Edge[])[] = [
  [],
  listEdges(),
  hashEdges(),
  treeEdges(),
  matrixEdges(),
  graphEdges(),
];

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

// --- clouds and float ----------------------------------------------------
/** Small deterministic PRNG (mulberry32): the server and client draw the same cloud. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CLOUD_MARGIN = 30;

/** One scatter per structure: CLOUDS[k] is the cloud that gathers into stage k. */
export const CLOUDS: readonly (readonly Point[])[] = LAYOUTS.map((_, k) => {
  const rand = seeded(1009 + k * 7919);
  return STRUCTURE_VALUES.map(() => ({
    x: CLOUD_MARGIN + rand() * (VIEW_W - 2 * CLOUD_MARGIN),
    y: CLOUD_MARGIN + rand() * (VIEW_H - 2 * CLOUD_MARGIN),
  }));
});

/** Float amplitude, in drawing units: wide while scattered, a breath while formed. */
export const CLOUD_FLOAT = 14;
export const FORMED_FLOAT = 4;

/** Each point's own slow path: periods of 9–16 s, seeded phases. */
const FLOAT_PATHS = (() => {
  const rand = seeded(424242);
  return STRUCTURE_VALUES.map(() => ({
    wx: (2 * Math.PI) / (9 + rand() * 7),
    wy: (2 * Math.PI) / (9 + rand() * 7),
    px: rand() * 2 * Math.PI,
    py: rand() * 2 * Math.PI,
  }));
})();

/** Point i's float offset at `seconds`, at unit amplitude (each axis within ±1). */
export function floatOffset(i: number, seconds: number): Point {
  const p = FLOAT_PATHS[i]!;
  return { x: Math.sin(seconds * p.wx + p.px), y: Math.sin(seconds * p.wy + p.py) };
}

// --- the loop ------------------------------------------------------------
/** One glide, into a structure or out to a cloud. */
export const MORPH_MS = 3000;
export const HOLD_MS = 5000;
export const FLOAT_MS = 4000;
/** Assemble and hold, then release and float. */
export const FORMED_MS = MORPH_MS + HOLD_MS;
export const STAGE_MS = FORMED_MS + MORPH_MS + FLOAT_MS;

export type Target = { kind: "structure"; stage: number } | { kind: "cloud"; cloud: number };

/** Where the points are headed `ms` into the loop. Before the loop starts they rest on CLOUDS[0]. */
export function backdropTarget(ms: number): Target {
  const k = Math.floor(Math.max(0, ms) / STAGE_MS);
  const into = Math.max(0, ms) - k * STAGE_MS;
  return into < FORMED_MS
    ? { kind: "structure", stage: k % STAGES }
    : { kind: "cloud", cloud: (k + 1) % STAGES };
}

export function sameTarget(a: Target, b: Target): boolean {
  if (a.kind === "structure") return b.kind === "structure" && a.stage === b.stage;
  return b.kind === "cloud" && a.cloud === b.cloud;
}

/** Everything the drawing tweens: positions, each edge's and extra's presence (0–1), float amplitude. */
export type Frame = {
  points: readonly Point[];
  /** The ink, channels 0–1. */
  colour: Rgb;
  edges: readonly number[];
  capsule: number;
  spine: number;
  float: number;
};

/**
 * The frame a target rests on. `colours` holds one ink per stage; a cloud
 * already wears the colour of the structure it will gather into, so the hue
 * shifts while the points scatter, not while they form.
 */
export function frameFor(target: Target, colours: readonly Rgb[]): Frame {
  if (target.kind === "cloud") {
    return {
      points: CLOUDS[target.cloud]!,
      colour: colours[target.cloud]!,
      edges: ALL_EDGES.map(() => 0),
      capsule: 0,
      spine: 0,
      float: CLOUD_FLOAT,
    };
  }
  const s = target.stage;
  return {
    points: LAYOUTS[s]!,
    colour: colours[s]!,
    edges: ALL_EDGES.map(({ stages }) => (stages.includes(s) ? 1 : 0)),
    capsule: s === ARRAY_STAGE ? 1 : 0,
    spine: s === HASH_STAGE ? 1 : 0,
    float: FORMED_FLOAT,
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** `from` → `to` a fraction `t` of the way (already eased). */
export function mixFrames(from: Frame, to: Frame, t: number): Frame {
  return {
    points: from.points.map((p, i) => ({ x: lerp(p.x, to.points[i]!.x, t), y: lerp(p.y, to.points[i]!.y, t) })),
    colour: [lerp(from.colour[0], to.colour[0], t), lerp(from.colour[1], to.colour[1], t), lerp(from.colour[2], to.colour[2], t)],
    edges: from.edges.map((e, i) => lerp(e, to.edges[i]!, t)),
    capsule: lerp(from.capsule, to.capsule, t),
    spine: lerp(from.spine, to.spine, t),
    float: lerp(from.float, to.float, t),
  };
}

/** Slow in, slow out: each glide reads as deliberate and lands still. */
export function easeInOut(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2;
}
