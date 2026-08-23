---
title: "Collision Resolution: Open Addressing"
type: concept
---

## Blueprint: the spilling row

Two lessons ago you watched the clerk survive a double-booking by
installing a hook and letting packages queue up — chaining. There's a
second way the clerk could have handled that first collision, one that
never uses a hook at all. In this blueprint, the clerk refuses to let two
packages share a slot, period — every slot holds exactly one package.
When Bob's package is called to Slot 4 but Alice is already sitting
there, the clerk doesn't hang it behind hers. Instead they say: "walk
down the row and take the very next empty slot you find." Bob's package
spills into Slot 5.

In hash-table terms: entries are stored directly in the bucket array, and
on collision you **probe** for the next free slot by a fixed rule (linear
probing: try i+1, i+2, …). This is denser and more cache-friendly than
chaining — no per-entry list nodes scattered across memory, so it leans
on the Arrays module's locality argument. You already built the chaining
version; this is the alternative design, not a replacement for it —
Python's `dict` and most modern language runtimes actually use open
addressing, while textbook implementations often chain because the code
is simpler.

## The cost of density: clustering

Density is the whole appeal of open addressing, and it's also where the
cost hides. As the row fills up, you get long, uninterrupted blocks of
occupied slots. A new package that lands in the middle of one of these
blocks has to walk all the way to the far end before it finds space — and
every insert into an occupied run extends that run by one, so future
collisions landing anywhere inside it have to probe past the whole thing.
Runs snowball, and performance degrades sharply as α → 1.

This is exactly why open-addressed tables resize earlier than chained
ones — commonly α ≈ 0.5–0.7, versus chaining's 0.75–1. A chained table can
tolerate a fuller cabinet because a longer hook is still just a longer
hook; an open-addressed table's cost curve steepens far more sharply
because a longer run blocks *every* probe that has to cross it, not just
the packages hanging on it.

## Deletion gets subtle: tombstones

Say Alice leaves Slot 4 empty again. Now picture the clerk searching for
Bob, who's sitting in Slot 5 because Slot 4 was taken when he arrived.
The clerk checks Slot 4 first, finds it empty, and — reasonably — assumes
nobody ever passed through here, so Bob must not exist. The search stops
early, and Bob becomes unfindable even though his package is sitting
right there in Slot 5. Emptying a slot can break the probe path that runs
*through* it.

The fix is a **tombstone**: instead of leaving Slot 4 looking brand new,
the clerk leaves a marker — an orange traffic cone — that says "nothing
here right now, but keep probing, someone used to park here." A lookup
treats a tombstone as "keep going"; an insert treats it as "free to
reuse." Reachability survives the deletion because every slot along the
original probe path still *looks* like it was once occupied.

```complexity
{
  "operations": [
    { "name": "insert / lookup / delete", "time": "O(1) average", "why": "expected probe length stays near the load factor α while α is kept low — same premises as chaining, plus a tighter α to stay ahead of clustering" },
    { "name": "same, worst case", "time": "O(n)", "why": "a badly clustered table (or an adversarial key set) can force a probe across most of the array" },
    { "name": "space", "time": "O(m)", "why": "entries live directly IN the m-slot array — there's no separate per-entry list node, unlike chaining's O(n + m)" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "In open addressing, why can't delete simply mark a slot empty?",
      "options": [
        "A later key may have probed PAST this slot at insert time; a hole would stop lookups early and make that key unfindable — hence tombstones ('keep probing')",
        "Because the slot is shared by a chain — open addressing still keeps a linked list of colliding entries at each index behind the scenes, so clearing the slot would only remove the chain's head",
        "It can — that's how it works; open addressing tables are designed so that lookups always restart from a fresh probe sequence, unaffected by holes left behind by earlier deletions"
      ],
      "answer": 0,
      "explanation": "Probe sequences are paths; an entry's reachability depends on every slot along its path staying non-empty-looking. Tombstones preserve paths while freeing slots for reuse."
    },
    {
      "question": "What is clustering in open addressing, and why does it make searches slower as the table fills up?",
      "options": [
        "Long, uninterrupted runs of occupied slots form; a new key landing inside one has to probe past the whole run before finding a free slot, so search length grows with run length",
        "Keys that hash to nearby slots are physically moved next to each other in memory to improve cache locality, which is a deliberate optimization rather than a cost",
        "A specialized hash function detects structurally similar keys (like anagrams) and deliberately routes them to adjacent slots so they can be searched together in one cache line"
      ],
      "answer": 0,
      "explanation": "Every insert into an occupied run extends it by one, and every future collision that lands anywhere inside that run has to probe past the whole thing. This is exactly why open-addressed tables resize earlier (α ≈ 0.5–0.7) than chained ones — clustering makes the cost curve much steeper as the table fills."
    },
    {
      "question": "Chaining's space cost is O(n + m); open addressing's is O(m). Why does open addressing drop the n term?",
      "options": [
        "Open addressing entries live directly in the bucket array's own m slots — there's no separate list node per entry to account for, so the array's size alone bounds the space",
        "It doesn't really — the O(m) figure ignores the entries themselves and only counts empty overhead, which understates the true cost compared to chaining's more honest accounting",
        "Open addressing tables are always resized to exactly n slots before this cost is measured, so m and n become the same number and one term absorbs the other"
      ],
      "answer": 0,
      "explanation": "Chaining pays for n entries (the list nodes) PLUS m buckets (the array holding the list heads) — two separate allocations. Open addressing has only one allocation, the m-slot array, and the entries occupy slots that were already being paid for either way."
    }
  ]
}
```
