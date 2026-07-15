import type { AnalogyDef } from "@/lib/visual/types";

/** Kid-simple captions keyed by `${familyId}/${patternSlug}` */
export const ANALOGIES: Record<string, AnalogyDef> = {
  "linear-traversal/arrays": {
    title: "Tiles in a row",
    caption:
      "Each box has an address. You walk them one by one — or swap two without building a new row.",
  },
  "linear-traversal/hash-maps": {
    title: "Magic lockers",
    caption:
      "Give a name, open the right locker instantly. That is a hash map.",
  },
  "linear-traversal/hash-sets": {
    title: "Seen-before stamps",
    caption: "A set only cares: have we stamped this ticket already?",
  },
  "linear-traversal/prefix-sum": {
    title: "Running bar heights",
    caption: "Add up as you go once. Later range sums are one quick subtract.",
  },
  "pointer-movement/two-pointers": {
    title: "Two fingers on a line",
    caption:
      "One finger at each end. They walk toward the middle until they agree.",
  },
  "pointer-movement/sliding-window": {
    title: "Breathing glass frame",
    caption:
      "A window grows right, shrinks left — never rebuild the whole view.",
  },
  "pointer-movement/fast-and-slow-pointers": {
    title: "Tortoise and hare",
    caption: "One slow hop, one fast hop. If they meet, there is a loop.",
  },
  "pointer-movement/linked-list-pointer-manipulation": {
    title: "Rewiring cables",
    caption:
      "Unplug arrows, plug them the other way. That is reversing a list.",
  },
  "ordering-search/sorting": {
    title: "Lined-up bars",
    caption: "Put pieces in order once — then every later hunt gets easier.",
  },
  "ordering-search/binary-search": {
    title: "Folding the ruler",
    caption: "Throw away half the line each time. Origami for numbers.",
  },
  "ordering-search/intervals": {
    title: "Timeline capsules",
    caption: "Overlapping time blocks melt into one. Meetings become clearer.",
  },
  "ordering-search/sweep-line": {
    title: "Laser scan",
    caption: "A vertical laser slides across events and counts what is alive.",
  },
  "recursive-exploration/dfs": {
    title: "Deep corridor",
    caption: "Go as deep as you can, then backtrack with ghost footprints.",
  },
  "recursive-exploration/tree-traversals": {
    title: "Tree walking order",
    caption: "Pre, in, or post — same tree, different visit songs.",
  },
  "recursive-exploration/divide-and-conquer": {
    title: "Split then stitch",
    caption: "Break the problem, solve crumbs, zip answers back up.",
  },
  "recursive-exploration/backtracking": {
    title: "Try, undo, try again",
    caption: "Grow a branch. Dead end? Erase it and pick another door.",
  },
  "state-transition/memoization": {
    title: "Sticky-note memory",
    caption: "Write the answer once. Next time, grab the sticky note.",
  },
  "state-transition/dynamic-programming": {
    title: "Light the switchboard",
    caption: "Fill cells left to right. Each cell borrows from older lights.",
  },
  "state-transition/greedy": {
    title: "Best bite now",
    caption: "Take the safe local bite — only when a short proof says it never hurts the whole meal.",
  },
  "relationships/bfs": {
    title: "Ripple rings",
    caption: "Visit level by level — like ripples on a pond.",
  },
  "relationships/graph-traversal": {
    title: "Map of roads",
    caption: "Same roads, different order: wide ripples or deep corridors.",
  },
  "relationships/union-find": {
    title: "Merging islands",
    caption: "Join two groups into one. Later, ask who shares an island.",
  },
  "relationships/topological-sort": {
    title: "Task conveyor",
    caption: "Only start jobs with no waiting parents. Order the day.",
  },
  "relationships/dijkstra": {
    title: "Cheapest path fog",
    caption: "Fog lifts from the cheapest node outward until the map is clear.",
  },
  "relationships/minimum-spanning-tree": {
    title: "Cheapest wires",
    caption: "Connect every island with the cheapest wires — no loops.",
  },
  "priority-structures/stack": {
    title: "Tray stack",
    caption: "Last tray on is first tray off. Matching pairs dissolve.",
  },
  "priority-structures/queue": {
    title: "Lunch line",
    caption: "First in line gets served first. Fair and level-by-level.",
  },
  "priority-structures/heap-priority-queue": {
    title: "Trophy shelf",
    caption: "Best trophy always on top. Insert, and it bubbles up.",
  },
  "priority-structures/monotonic-stack": {
    title: "Taller skyline",
    caption: "When a taller bar arrives, shorter hopes pop — answer ready.",
  },
  "priority-structures/trie": {
    title: "Letter hallway",
    caption: "Shared prefixes share a corridor. New endings branch off.",
  },
};

export function getAnalogy(
  familyId: string,
  patternSlug: string,
): AnalogyDef | undefined {
  return ANALOGIES[`${familyId}/${patternSlug}`];
}
