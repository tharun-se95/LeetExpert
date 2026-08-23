---
title: "Keys, Immutability & Cryptographic Hashing"
type: concept
---

## The label can't move once it's filed

Back in Lesson 1, "deterministic" was one of three rules a good word-trick
must satisfy: run it on "dog" today, get Slot 6; run it tomorrow, get
Slot 6 again. That rule has a quiet requirement hiding inside it — the
*label itself* has to stay put. If a package's name could change while it
sat in the cabinet, the clerk's trick would compute a different slot the
next time someone asked for it, and the package would effectively
vanish: still physically in the cabinet, permanently unreachable, because
nobody would ever compute the right address to find it again.

This is why a hash table's key must be **immutable**: the promise
`hash(key)` makes is not "correct once," it's "correct forever, for as
long as this key sits in the table." Change anything the hash function
reads, and you silently break that promise. Python enforces this at the
type level — a `list` can't key a `dict` (`TypeError: unhashable type`)
because a list can be appended to after the fact, but a `tuple` can,
because a tuple's contents are frozen the moment it's built. JavaScript
doesn't enforce it: nothing stops you from mutating an object that's
currently a `Map` key, so the language hands you the same footgun Python
refuses to sell you. The rule is universal even where the guardrail
isn't — treat anything you use as a key as frozen the instant you insert
it, or the table quietly starts lying to you.

## The reference trap

There's a second, sneakier way to break "same key, same slot" — not by
mutating a key, but by handing the table two keys that *look* identical
without *being* identical. In JavaScript, this is the single most common
hash-table bug:

```javascript
const seen = new Map();
seen.set({ x: 1, y: 2 }, "first visit");
seen.get({ x: 1, y: 2 }); // undefined — not what you expected
```

`Map` compares object keys by **reference**, not by structure. Two object
literals with identical properties are still two different objects in
memory, the same way two people who happen to share a name are still two
different people — the clerk's cabinet files them under different slots
because the trick runs on the object's *identity*, not what it currently
contains. The fix is to canonicalize: build a plain string from the
values you actually care about — `` `${x},${y}` `` — and key on that
string instead. Strings in JavaScript compare by value, so two
identical-looking coordinates now really do collide into the same slot.
(Python sidesteps this specific trap because tuples hash by content, not
identity — one more reason `(x, y)` is the idiomatic Python key for
exactly this situation.)

```quiz
{
  "questions": [
    {
      "question": "You insert a mutable object as a dict key, then change one of its fields that the hash function reads. What actually happens?",
      "options": [
        "Nothing breaks — the table recomputes the hash on every lookup anyway, so a changed key is found under its new hash automatically",
        "The entry silently becomes unreachable: it's still physically stored in its OLD slot, but a lookup with the (now-different) key computes a NEW slot and finds nothing there",
        "The runtime raises an error the moment the key object is mutated, since every hash table tracks which of its keys are currently 'live' and rejects illegal mutations"
      ],
      "answer": 1,
      "explanation": "The slot was computed once, at insert time, from the key's contents at that moment. Nothing re-files the entry when the key changes later — the address and the object simply drift apart, silently."
    },
    {
      "question": "Why does `new Map().set({x:1,y:2}, v).get({x:1,y:2})` return undefined in JavaScript?",
      "options": [
        "Map compares object keys by reference — two structurally-identical object literals are still two different objects, so the second call looks up a key that was never inserted",
        "Map keys expire after a single lookup by design, so retrieving a value removes it — a second `.get()` for any key would return undefined",
        "Object literals can't be Map keys at all in strict mode; the `.set()` call silently no-ops instead of throwing"
      ],
      "answer": 0,
      "explanation": "Two `{x:1,y:2}` literals are two allocations. Map's key equality is reference (`===`) equality for objects — the fix is a canonical primitive key, like a joined string, which compares by value."
    },
    {
      "question": "Our clerk's polynomial hash needs to be fast and uniform, nothing more. What extra property must SHA-256 have that the clerk's word-trick does NOT?",
      "options": [
        "Determinism — SHA-256 must produce the same digest for the same input every time, a property the clerk's trick doesn't need to bother with",
        "Collision resistance against a DELIBERATE search — it must be computationally infeasible for someone to go looking for two different inputs that hash to the same digest ON PURPOSE",
        "Speed — SHA-256 needs to run faster than the clerk's polynomial hash so it can process large files without becoming a bottleneck"
      ],
      "answer": 1,
      "explanation": "Determinism is shared by both (option A is a distractor — everything needs it). The polynomial hash's collisions are expected, harmless accidents the mailroom manages with chaining. A cryptographic hash's collisions must be practically unfindable on purpose, because someone finding one can forge data — a completely different, much harder engineering goal."
    }
  ]
}
```

## Two different kinds of "hard to reverse"

Imagine a bank vault that seals a package the same way our clerk files
one — run a quick trick on the contents, get back a short code. Nobody
would trust that vault if "quick" is all the trick promised. A thief who
can also run the trick could try billions of tampered packages a second,
looking for ANY one that produces the same seal as the original — and if
the trick is as fast and simple as the clerk's polynomial hash, they'd
find one. The mailroom's hash function and a security seal's hash
function share a name and a shape (input in, fixed-size output out), but
they're built to survive completely different kinds of pressure:

- **Our clerk's hash** (and every hash table's hash function) only needs
  to be **fast** and **uniform** — nobody in the mailroom is deliberately
  trying to trick the clerk. A collision is a random, harmless event the
  chaining or probing machinery absorbs without anyone noticing.
- **A cryptographic hash function** (SHA-256, for example — MD5 and SHA-1
  are the industry's cautionary tales, both broken because researchers
  found deliberate collisions) has to survive an *adversary* actively
  hunting for a way to break it:
  - **Preimage resistance** — given a digest, you can't work backward to
    find *any* input that produces it.
  - **Collision resistance** — you can't *deliberately search* for two
    different inputs sharing a digest. (Contrast this with the birthday
    paradox from Lesson 1: our clerk's *accidental* collisions are
    expected and fine; a cryptographic hash's collisions must be
    practically unfindable *on purpose*.)
  - **The avalanche effect** — changing one bit of the input scrambles
    roughly half the output bits, so no partial progress toward a match
    is possible.

That extra resistance costs speed on purpose — a cryptographic hash is
built to be *slow enough* that trying billions of guesses a second stays
impractical, which is exactly backwards from what a hash table wants.
This is why you'll see SHA-256 (or similar) behind password storage
(salted, so identical passwords don't produce identical digests), file
integrity checks, and digital signatures — and why you'd never use it to
pick a bucket index in a `dict`: it would make every single insert and
lookup in your program deliberately, unnecessarily slow. Same word,
same-shaped machine, opposite job.
