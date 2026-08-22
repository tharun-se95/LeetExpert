# Analogy Style Guide — Course Explanations

This is pasted as the first source into every NotebookLM notebook used to
draft course explanations. It is the one place tone rules live — update it
here, not per-module, when the approach changes.

## What a good lesson analogy does

- **One analogy per lesson, sustained end to end.** Hash Tables proved the
  pattern: mailroom -> collision -> chaining ("overstuffed cubby") -> open
  addressing ("hot potato parking lot") -> tombstones ("orange traffic
  cone") is ONE scene that grows, not five unrelated ones. A new analogy
  per paragraph is worse than no analogy — it adds vocabulary instead of
  removing it.
- **Physical and everyday**, not abstract or technical-adjacent. "A
  warehouse with numbered cubbies" beats "a directory service." If a
  9-year-old hasn't encountered the object (a mailroom, a parking lot, a
  coat check, a library return slot), don't use it.
- **Introduces the idea before naming it.** Tell the story, let the reader
  feel *why* the problem is real, then attach the vocabulary word
  (collision, load factor, amortized). Never open with the term.
- **Motivates every "why," never just the "what."** If the lesson's
  existing prose asserts a claim, the analogy's job is to make that claim
  feel obvious before the reader sees the formal reasoning.

## Hard rules for the analogy pass specifically

- No equations, no Greek letters, no Big-O notation inside the analogy
  itself. Save all of that for the section that follows.
- No named algorithms or CS jargon inside the analogy's own sentences
  (the mailroom clerk doesn't "hash," they "do a quick trick").
- Plain spoken language — the kind you'd use explaining something to a
  smart friend over coffee, not a textbook register.

## What must survive the analogy pass unchanged

- The lesson keeps its existing derivation / proof / complexity argument
  — it moves to a section AFTER the analogy, introduced as "here's why
  that's actually true" or similar, translated back into the analogy's
  own nouns where possible (e.g., "the clerk's rule" instead of "the hash
  function", the first time; the formal term follows in parentheses).
- Diagrams (` ```diagram `), visualizations (` ```viz `), complexity
  tables (` ```complexity `), and quizzes (` ```quiz `) are structural —
  do not ask NotebookLM to touch these. They're edited by hand afterward
  only if the surrounding prose changes what they reference.
- Frontmatter (`title`, `type`) never changes.

## The diagram/viz reconciliation rule

Every `diagram` and `viz` fence in a lesson is a shared React component
driven by literal JSON props sitting right in the markdown — it renders
whatever data that JSON contains, independent of the surrounding prose.
NotebookLM never sees these props (they're not pasted in as source text),
so any analogy it drafts has no idea what a diagram actually shows. This
caused a real bug on the pilot module: the rewritten prose invented "Alice
and Bob collide at Slot 4," while the actual `bucket-layout` diagram right
below it showed "dog" and "god" colliding at Slot 2 — a reader would see
text and picture disagree on the same page.

Before finalizing any lesson rewrite:

1. Find every `diagram`/`viz` fence in the file and read its JSON props
   directly (capacity, bucket contents, key labels, hash values, etc.).
2. If the props encode specific hash-mod arithmetic (e.g. a `hashValue`
   and `capacity` that together determine a slot), compute the actual
   slot the component will render — do not guess or invent a
   different-sounding number for the story.
3. Prefer rewriting the *story* to use the diagram's existing example
   data (its key names, its slot numbers) rather than inventing new
   names and then trying to make the JSON match — the diagram is often
   already reusable across other lessons/modules, so changing its
   component code is out of scope, but editing the JSON literal in
   *this one lesson's* fence is fine and sometimes the right call if the
   story genuinely needs different numbers.
4. A diagram/viz block with no example data specific enough to
   contradict a story (e.g. generic labeled cards) needs no reconciliation
   — only flag ones that assert concrete keys, slots, or counts.

## The standing prose-style rule (already in force)

Lessons expand ideas in plain language — they do not compress into terse
phrases or metaphor-shorthand. An analogy is not a substitute for
explaining the mechanism; it's the on-ramp to explaining it fully.
