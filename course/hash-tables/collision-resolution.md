---
title: Collisions, Load Factor & Resizing
type: concept
---

## Blueprint 1: the hanging hook

Remember the mailroom clerk from the last lesson, and remember that
double-bookings are guaranteed — sooner or later two packages get called
out to the same slot. Watch it happen: a package labeled "dog" comes in
and the clerk's trick sends it to Slot 2. Later, a package labeled "god"
— same three letters, different order — comes in, and by pure chance the
trick sends it to Slot 2 as well. Here's the clerk's first fix: they
don't panic and don't turn either package away. They install a small
metal hook inside Slot 2. "Dog" goes on the hook first. "God" arrives
next for the same slot, so the clerk simply hangs it right behind "dog"
— a growing chain of packages, all sharing one slot, one hook. Meanwhile
"cat" and "emu," which landed in their own slots with no company, just
sit there each on their own single-package hook.

In the language of hash tables: each bucket holds a **list** of the
entries that hashed there. Insert appends to the bucket's list (after
checking for the key); lookup scans only that one list — the clerk
doesn't check every hook in the cabinet, just the one hook the trick
pointed them to.

```diagram
{
  "id": "bucket-layout",
  "capacity": 8,
  "buckets": [
    { "index": 0, "entries": ["cat, 3"] },
    { "index": 2, "entries": ["dog, 1", "god, 7"] },
    { "index": 4, "entries": ["emu, 9"] }
  ]
}
```

The cost of any operation is the length of one hook's chain. So the whole
performance question becomes: *how many packages, on average, end up
sharing a hook?*

## Why "O(1) on average" is an honest claim, not a slogan

Here's the intuition first: if you have 10 slots and 10 packages spread
out reasonably evenly, the average hook only has about 1 package hanging
on it. The clerk almost never has to flip through more than one or two
items to find what they're looking for. That ratio — packages per slot —
is the whole story.

Formally, define the **load factor** α = n / m (entries per bucket).
Under uniform hashing, each of the n keys lands in a given bucket with
probability 1/m, so the **expected** chain length is exactly α. Keep α
bounded by a constant (say ≤ 1) — keep the mailroom from getting too
crowded — and the expected work per operation is O(1 + α) = **O(1)**. Two
premises make this true, and you now know both:

1. **uniformity** — the hash spreads keys evenly (last lesson's job);
2. **bounded load factor** — the table resizes before α grows (this
   lesson's job).

But imagine a prankster who brings in 100 packages, every single one
addressed with a name that the clerk's trick maps to Slot 4. The instant
lookup collapses — the clerk has to flip through all 100 packages on that
one hook, one at a time, exactly like the lost-and-found closet from the
first lesson. An adversary (or a genuinely bad hash function) can always
force this: put all n keys in one chain → O(n) per operation. When you
quote "hash lookup is O(1)," you are quoting the average case under the
two premises above, not a guarantee that survives a hostile or unlucky
set of keys — the Big O module's case-discipline, applied.

## Moving day: the dynamic array trick, again

To keep the mailroom from turning back into a giant unsorted pile, the
clerk has a standing rule: the moment the cabinet gets too crowded (α
crosses a threshold, commonly 0.75–1), shut down for the day, wheel in a
brand-new cabinet with **twice as many slots**, and re-run the word-trick
on every single package to re-file it into the roomier cabinet. Because
the number of slots changed, a package's slot is `hash mod m`, and m just
changed — so *almost every package moves to a new hook* (a full O(n)
**rehash**).

Sound familiar? It's the dynamic array's growth policy with a rename, and
the same amortized argument applies verbatim: doubling means the rare
"moving day" costs 1 + 2 + 4 + ⋯ + n/2 < n total spread across n regular
deliveries, so insert stays **O(1) amortized** on top of O(1) average.

One practical corollary: if you walk down the cabinet's slots after a
moving day, you'll see packages in a completely different order than
before — iteration order can change after any insert that triggers a
rehash. That's one reason you never rely on bucket order. (Python dicts
and JS Maps *do* guarantee insertion order — a deliberate extra mechanism
layered on top, not a property of hashing.)

Watch a chain form, the load factor cross 0.75, and every surviving key
get re-filed under the doubled modulus — including one that collides
again at the new size, because doubling reduces collisions statistically,
not individually:

```viz
{ "id": "hash-buckets", "keys": [10, 3, 18, 7, 25, 11], "capacity": 4 }
```

## Blueprint 2: the spilling row

There's a second way the clerk could have handled that first
double-booking, one that never uses a hook at all. In this blueprint, the
clerk refuses to let two packages share a slot, period — every slot holds
exactly one package. When Bob's package is called to Slot 4 but Alice is
already sitting there, the clerk doesn't hang it behind hers. Instead
they say: "walk down the row and take the very next empty slot you
find." Bob's package spills into Slot 5.

In hash-table terms: entries are stored directly in the bucket array, and
on collision you **probe** for the next free slot by a fixed rule (linear
probing: try i+1, i+2, …). This is denser and more cache-friendly than
chaining — no per-entry lists, so it leans on the Arrays module's
locality argument — but two costs appear:

- **Clustering.** As the row fills up, you get long, uninterrupted blocks
  of occupied slots. A new package that lands in the middle of one of
  these blocks has to walk all the way to the far end before it finds
  space, so runs of occupied slots snowball and performance degrades
  sharply as α → 1 (open-addressed tables resize earlier, α ≈ 0.5–0.7, to
  stay ahead of this).
- **Deletion gets subtle.** Say Alice leaves Slot 4 empty again. Now
  picture the clerk searching for Bob, who's sitting in Slot 5 because
  Slot 4 was taken when he arrived. The clerk checks Slot 4 first, finds
  it empty, and — reasonably — assumes nobody ever passed through here,
  so Bob must not exist. The search stops early, and Bob becomes
  unfindable even though his package is sitting right there in Slot 5.
  Emptying a slot can break the probe path that runs *through* it. The
  fix is a **tombstone**: instead of leaving Slot 4 looking brand new,
  the clerk leaves a marker — an orange traffic cone — that says "nothing
  here right now, but keep probing, someone used to park here."

Python's dict and most modern runtimes use open addressing; textbook
implementations mostly chain because the code is simpler. We build the
chaining version next lesson; the complexity story is the same for both.

```complexity
{
  "operations": [
    { "name": "insert / lookup / delete", "time": "O(1) average", "why": "expected chain (or probe) length is the load factor α, held constant by resizing — premises: uniform hash + bounded α" },
    { "name": "same, worst case", "time": "O(n)", "why": "all keys in one chain — bad hash, adversarial keys, or plain bad luck" },
    { "name": "insert incl. rehash", "time": "O(1) amortized", "why": "doubling: total rehash work over n inserts is < n (the dynamic-array theorem, reused)" },
    { "name": "iterate all entries", "time": "O(n + m)", "why": "must walk every bucket, occupied or not" },
    { "name": "space", "time": "O(n + m)", "why": "n entries stored, plus m bucket slots allocated whether occupied or not — same n and m the time bounds above are quoted in terms of" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "What EXACTLY does the load factor α = n/m measure, and why does keeping it constant make lookups O(1) on average?",
      "options": [
        "Entries per bucket. Under a uniform hash, expected chain length equals α — so bounded α means each operation scans an expected-constant number of entries",
        "The fraction of memory used; smaller is faster — α measures how much of the allocated table capacity sits empty, and a sparser table always means less work per lookup",
        "The probability of any collision existing — α directly gives the chance that at least one pair of keys shares a bucket, so keeping it low is about avoiding collisions rather than bounding their cost"
      ],
      "answer": 0,
      "explanation": "The average-case theorem is literally 'expected chain length = α'. Both premises matter: uniformity spreads keys; resizing bounds α. Break either and the average degrades."
    },
    {
      "question": "Why does doubling the bucket count force re-hashing every stored entry?",
      "options": [
        "Slots are computed as hash(key) mod m — changing m changes almost every key's slot, so entries must be re-filed under the new modulus",
        "It doesn't; entries stay put — the new, larger bucket array is populated by copying each existing chain to the same index it already occupied, since the relative bucket structure is preserved",
        "To defragment memory — repeated inserts and deletes fragment the chains' underlying memory over time, and a full re-file during resize is really a cleanup pass rather than a consequence of the modulus changing"
      ],
      "answer": 0,
      "explanation": "The address was never stored WITH the entry — it's recomputed from the key each time. New m, new addresses. This is also why rehashing costs a full O(n)."
    },
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
      "question": "Iterating every entry in a hash table costs O(n + m), not O(n). Where does the extra +m come from?",
      "options": [
        "The iteration has to walk all m bucket slots to find the occupied ones — an empty bucket still costs a look, so the total is n entries plus m slots checked",
        "It doesn't come from anything real — O(n + m) and O(n) are the same complexity class whenever m is a constant, so the +m is just a stylistic way of writing the bound",
        "The +m accounts for re-hashing every entry once during the walk, as a safety check that no key's slot has drifted out of sync with its stored value"
      ],
      "answer": 0,
      "explanation": "Bucket count m isn't a function of n — a table can be mostly empty (large m, small n) right after a resize. Walking 'every bucket, occupied or not' really does cost m steps beyond the n entries themselves, so both terms are load-bearing, not decoration."
    }
  ]
}
```
