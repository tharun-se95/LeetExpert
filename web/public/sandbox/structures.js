/**
 * Structure codec for the JavaScript runner.
 *
 * Linked lists, trees and graphs are objects pointing at each other; the
 * markdown carries plain JSON. This turns one into the other and back, so a
 * lesson author writes `[1,2,3]` and the learner's function receives real
 * `ListNode`s — exactly what they'd get in an interview.
 *
 * The array forms are the conventional ones learners already know: a list is
 * its values in order, a tree is level-order with `null` for absent
 * children, a graph is an adjacency list.
 *
 * Loaded via importScripts by js-runner.js. The Python runner carries its
 * own implementation of the same contract; the two are kept in step by the
 * reference-solution tests, which run every case through both.
 */

class ListNode {
  constructor(val, next) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

class TreeNode {
  constructor(val, left, right) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }
}

function buildList(values) {
  // Cycle problems need a tail that points back into the list, which a plain
  // array of values cannot express. `{ values, pos }` is the form learners
  // already meet: `pos` is the index the tail links to, -1 for an open list.
  let pos = -1;
  if (values && !Array.isArray(values) && typeof values === "object") {
    pos = values.pos === undefined ? -1 : values.pos;
    values = values.values;
  }
  if (!Array.isArray(values) || values.length === 0) return null;
  const head = new ListNode(values[0]);
  const nodes = [head];
  let tail = head;
  for (let i = 1; i < values.length; i++) {
    tail.next = new ListNode(values[i]);
    tail = tail.next;
    nodes.push(tail);
  }
  // A pos past the end is an authoring mistake; failing loudly beats silently
  // handing the learner an open list and marking their correct answer wrong.
  if (pos >= 0) {
    if (pos >= nodes.length) {
      throw new Error("cycle pos " + pos + " is past the end of the list");
    }
    tail.next = nodes[pos];
  }
  return head;
}

function serializeList(node) {
  const out = [];
  // Guard against a learner's bug creating a cycle: without this the
  // serialiser would hang and the run would look like an infinite loop in
  // their algorithm rather than in the harness.
  const seen = new Set();
  let cur = node;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    out.push(cur.val);
    cur = cur.next;
  }
  if (cur) out.push("…cycle");
  return out;
}

/** Level-order with nulls, the shape lesson authors already write. */
function buildTree(values) {
  if (!Array.isArray(values) || values.length === 0 || values[0] === null) {
    return null;
  }
  const root = new TreeNode(values[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const node = queue.shift();
    if (i < values.length) {
      const v = values[i++];
      if (v !== null && v !== undefined) {
        node.left = new TreeNode(v);
        queue.push(node.left);
      }
    }
    if (i < values.length) {
      const v = values[i++];
      if (v !== null && v !== undefined) {
        node.right = new TreeNode(v);
        queue.push(node.right);
      }
    }
  }
  return root;
}

function serializeTree(root) {
  if (!root) return [];
  const out = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (node) {
      out.push(node.val);
      queue.push(node.left, node.right);
    } else {
      out.push(null);
    }
  }
  // Trailing nulls carry no information and would make every expected value
  // in the markdown noisier than the tree it describes.
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function decodeArg(value, shape) {
  if (shape === "list") return buildList(value);
  if (shape === "tree") return buildTree(value);
  return value; // "graph" is already an adjacency list; "value" is plain JSON
}

function encodeResult(value, shape) {
  if (shape === "list") return serializeList(value);
  if (shape === "tree") return serializeTree(value);
  return value;
}

/** Depth-first search for the node carrying `val`. Values are unique. */
function findNode(root, val) {
  if (!root) return null;
  if (root.val === val) return root;
  return findNode(root.left, val) || findNode(root.right, val);
}

/**
 * Resolves `node` arguments, which a lesson author writes as a plain value.
 *
 * Lowest Common Ancestor takes two TreeNodes, and case JSON cannot express a
 * reference — so the value names the node and the learner receives the node
 * itself, as they would in an interview. This runs after every argument is
 * decoded because the node must come from the very tree the learner is
 * handed: resolving against a second copy would make the identity
 * comparisons these problems are built on (`node is p`) silently false.
 */
function resolveNodeArgs(built, raw, shape) {
  if (!shape) return;
  let root = null;
  for (const key of Object.keys(shape)) {
    if (shape[key] === "tree") {
      root = built[Number(key)];
      break;
    }
  }
  for (const key of Object.keys(shape)) {
    if (shape[key] !== "node") continue;
    const idx = Number(key);
    const found = findNode(root, raw[idx]);
    if (found === null) {
      throw new Error(
        `no node with value ${JSON.stringify(raw[idx])} in the tree`,
      );
    }
    built[idx] = found;
  }
}

self.SANDBOX_STRUCTURES = {
  ListNode,
  TreeNode,
  buildList,
  serializeList,
  buildTree,
  serializeTree,
  decodeArg,
  encodeResult,
  resolveNodeArgs,
};
