/**
 * Property checks, for problems whose answer is genuinely not unique.
 *
 * Three lessons state in their own problem text that several answers are
 * correct: Delete Node in a BST may promote the inorder successor or the
 * predecessor, Convert Sorted Array accepts any height-balanced BST whose
 * inorder is `nums`, and Course Schedule II accepts any valid topological
 * order. Pinning one answer would fail a correct learner, which is worse for
 * them than having no test at all — so the expectation is a property of the
 * answer rather than the answer itself.
 *
 * These run on the MAIN THREAD, like `compare`: the workers hand back the
 * serialised result and the decision is made here, once, for both runtimes.
 * A property implemented twice would be two chances to disagree.
 */

/** A property receives the serialised result and the case's own arguments. */
export type Property = (result: unknown, args: unknown[]) => string | null;

interface Tree {
  val: number;
  left: Tree | null;
  right: Tree | null;
}

/** Level-order-with-nulls back to a tree, mirroring the runners' buildTree. */
function fromLevelOrder(values: unknown): Tree | null {
  if (!Array.isArray(values) || values.length === 0 || values[0] === null) {
    return null;
  }
  const root: Tree = { val: values[0] as number, left: null, right: null };
  const queue: Tree[] = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const node = queue.shift()!;
    for (const side of ["left", "right"] as const) {
      if (i >= values.length) break;
      const v = values[i++];
      if (v !== null && v !== undefined) {
        const child: Tree = { val: v as number, left: null, right: null };
        node[side] = child;
        queue.push(child);
      }
    }
  }
  return root;
}

function inorder(node: Tree | null, out: number[] = []): number[] {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.val);
  inorder(node.right, out);
  return out;
}

function height(node: Tree | null): number {
  return node ? 1 + Math.max(height(node.left), height(node.right)) : 0;
}

function isBalanced(node: Tree | null): boolean {
  if (!node) return true;
  return (
    Math.abs(height(node.left) - height(node.right)) <= 1 &&
    isBalanced(node.left) &&
    isBalanced(node.right)
  );
}

/** Strictly increasing inorder is exactly the BST invariant. */
function isBst(node: Tree | null): boolean {
  const seq = inorder(node);
  for (let i = 1; i < seq.length; i++) if (seq[i] <= seq[i - 1]) return false;
  return true;
}

function sorted(xs: number[]): number[] {
  return [...xs].sort((a, b) => a - b);
}

const PROPERTIES: Record<string, Property> = {
  /**
   * Delete Node in a BST — args [tree, key]. Promoting the successor and
   * promoting the predecessor give different trees, both correct, so the
   * claim is: still a BST, holding exactly the original values minus the key.
   */
  "bst-minus-key": (result, args) => {
    const before = inorder(fromLevelOrder(args[0]));
    const key = args[1] as number;
    const after = inorder(fromLevelOrder(result));
    if (!isBst(fromLevelOrder(result))) return "the result is not a valid BST";
    const want = sorted(before.filter((v) => v !== key));
    const got = sorted(after);
    if (JSON.stringify(want) !== JSON.stringify(got)) {
      return `the remaining values should be ${JSON.stringify(want)}, not ${JSON.stringify(got)}`;
    }
    return null;
  },

  /**
   * Convert Sorted Array to BST — args [nums]. Any height-balanced BST whose
   * inorder walk is `nums` is accepted, which is what the lesson says.
   */
  "balanced-bst-of-nums": (result, args) => {
    const nums = args[0] as number[];
    const tree = fromLevelOrder(result);
    const walk = inorder(tree);
    if (JSON.stringify(walk) !== JSON.stringify(nums)) {
      return `an inorder walk should give back ${JSON.stringify(nums)}, not ${JSON.stringify(walk)}`;
    }
    if (!isBalanced(tree)) {
      return "the tree is a BST but not height-balanced";
    }
    return null;
  },

  /**
   * Course Schedule II — args [numCourses, prerequisites]. Any order that
   * satisfies every prerequisite is accepted; `[]` means "impossible", which
   * is only right when the graph really does have a cycle.
   */
  "topological-order": (result, args) => {
    const n = args[0] as number;
    const prereqs = args[1] as [number, number][];
    if (!Array.isArray(result)) return "the result should be an array";
    const order = result as number[];

    // Is a valid order even possible? Kahn's algorithm answers that, and the
    // empty result is only correct when the answer is no.
    const indeg = new Array(n).fill(0);
    const adj: number[][] = Array.from({ length: n }, () => []);
    for (const [a, b] of prereqs) {
      adj[b].push(a);
      indeg[a] += 1;
    }
    const queue: number[] = [];
    for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);
    let settled = 0;
    while (queue.length) {
      const node = queue.pop()!;
      settled += 1;
      for (const next of adj[node]) if (--indeg[next] === 0) queue.push(next);
    }
    const possible = settled === n;

    if (order.length === 0) {
      return possible
        ? "a valid order exists, so returning [] is wrong"
        : null;
    }
    if (!possible) return "this graph has a cycle, so the answer should be []";

    if (order.length !== n) {
      return `the order should list all ${n} courses, not ${order.length}`;
    }
    const position = new Map<number, number>();
    order.forEach((course, i) => position.set(course, i));
    if (position.size !== n) return "the order repeats or skips a course";
    for (const [a, b] of prereqs) {
      if (position.get(b)! > position.get(a)!) {
        return `course ${b} must come before ${a}`;
      }
    }
    return null;
  },
};

export function propertyNames(): string[] {
  return Object.keys(PROPERTIES);
}

/**
 * Returns null when the answer satisfies the property, or a learner-facing
 * reason why it does not. An unknown name is an authoring error, so it fails
 * loudly rather than silently passing everything.
 */
export function checkProperty(
  name: string,
  result: unknown,
  args: unknown[],
): string | null {
  const property = PROPERTIES[name];
  if (!property) return `unknown property "${name}"`;
  return property(result, args);
}
