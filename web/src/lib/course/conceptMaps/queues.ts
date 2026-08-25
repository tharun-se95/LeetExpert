import type { MindMapNode } from "./types";

/**
 * Concept map for the Queues module. Hand-authored from the module's
 * 3-lesson structure (course/queues/*.md). Curriculum-designer review
 * recommended stripping the Monotonic Deque out of this module and
 * relocating it (with Sliding Window Maximum) to "Module 10 (Two
 * Pointers & Sliding Window)" — rejected after checking manifest.ts:
 * Two Pointers (10) and Sliding Window (11) are separate modules, and
 * Sliding Window's actual scope (window-boundary invariants) doesn't fit
 * the deque-based technique; the lesson already frames Sliding Window
 * Maximum as this module's deliberate capstone.
 */
export const queuesConceptMap: MindMapNode = {
  id: "queues",
  label: "Queues",
  children: [
    {
      id: "fifo-mechanics",
      label: "FIFO & Queue Mechanics",
      children: [
        { id: "fifo-opposite", label: "Add at the back, remove from the front — fair work, arrival order" },
        { id: "fifo-front-problem", label: "The array's front is its bad end — pop(0)/shift() is O(n), shifts everything" },
        { id: "fifo-head-index", label: "SimpleQueue trick: advance a head index instead of shifting — redefines where the front is" },
        { id: "fifo-tail-asymmetry", label: "A singly linked list's tail pointer only pays off paired with head-side removal — the reverse needs an O(n) search for the new tail" },
      ],
    },
    {
      id: "ring-buffer",
      label: "Build a Ring Buffer",
      children: [
        { id: "ring-clock", label: "Fixed-size array, front and back wrap via index arithmetic mod capacity — the mod-as-clock model, structural" },
        { id: "ring-tie-break", label: "head==tail aliases both empty and full — broken by a size counter or a sacrificed slot" },
        { id: "ring-derived-tail", label: "tail = (head + size) % capacity is derived, not stored — one fewer variable to desync" },
        { id: "ring-worst-case", label: "O(1) worst case, not amortized — no operation ever spikes, which is why real-time systems use rings" },
      ],
    },
    {
      id: "deques-monotonic",
      label: "Deques & the Monotonic Deque",
      children: [
        { id: "deque-both-ends", label: "Push/pop at either end, O(1) — subsumes stack and queue, its own identity when both ends are active" },
        { id: "deque-monotonic-repair", label: "Monotonic deque repairs Min Stack's trick for windows — the minimum can expire out the front" },
        { id: "deque-two-jobs", label: "Back does usefulness-filtering (dominance); front does expiry (position) — indices, not values, because expiry is a position check" },
        { id: "deque-both-necessary", label: "Unreachable by either parent alone — a stack can't expire, a queue can't evict dominated backs" },
      ],
    },
  ],
};
