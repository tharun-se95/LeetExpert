---
title: "Collision Resolution: Separate Chaining"
type: concept
---

## Blueprint: the hanging hook

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

Chaining is one way to survive a double-booking — never turn a package
away, just grow the hook. The next lesson builds the clerk's system in
code; the one after that covers a completely different way to handle a
collision, one that never uses a hook at all.

```complexity
{
  "operations": [
    { "name": "insert / lookup / delete", "time": "O(1) average", "why": "expected chain length is the load factor α, held constant by resizing — premises: uniform hash + bounded α" },
    { "name": "same, worst case", "time": "O(n)", "why": "all keys in one chain — bad hash, adversarial keys, or plain bad luck" },
    { "name": "insert incl. rehash", "time": "O(1) amortized", "why": "doubling: total rehash work over n inserts is < n (the dynamic-array theorem, reused)" },
    { "name": "iterate all entries", "time": "O(n + m)", "why": "must walk every bucket, occupied or not" },
    { "name": "space", "time": "O(n + m)", "why": "n entries stored across the chains, plus m bucket slots allocated whether occupied or not" }
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
