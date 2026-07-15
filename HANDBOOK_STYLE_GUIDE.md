# Handbook Style Guide

The constitution of this project. Every chapter must follow this — no exceptions.
This document is the human-readable version of the rules enforced automatically
via `.cursor/rules/`.

## Voice & Audience

Write like a **patient older sibling** explaining ideas to a curious beginner —
not like a college textbook, and not like a jargon dump.

The reader:

- Knows basic programming, but may have forgotten most algorithm concepts
- Wants to master DSA for interviews **and** become a better engineer
- Would rather understand *why* something works than memorize *that* it works

**Teach like you're helping a smart kid who asks "but why?":**

- Short sentences. Everyday words. Friendly tone.
- On first use of any jargon (Big O, heap, DP, …), define it in plain English
  in the same breath
- Prefer kid-friendly analogies: toy boxes, lines at school, video games,
  treasure maps, sorting a messy room
- Stay accurate — simple is not wrong, and not baby-talk nonsense

Every section should implicitly answer: **Why? How? When? Where is it used?**

## Required Chapter Structure (Part 2 patterns)

Every individual pattern (not family — each pattern inside a family) must contain
exactly these sections, in this order:

1. **Purpose** — what problem does this solve?
2. **Recognition Clues** — typical interview wording ("longest substring", "top K")
3. **Mental Model** — the intuition, explained before any implementation
4. **Visualization** — a Mermaid or ASCII diagram, always explained in prose
5. **Generic Template** — language-independent pseudocode, never a specific language
6. **Complexity** — time and space, with a one-line justification for each
7. **Common Mistakes** — the mistakes beginners actually make
8. **Classic Interview Questions** — 3 easy, 3 medium, 2 hard
9. **Engineering Connections** — where this pattern shows up in real production
   systems (Redis, browsers, schedulers, search engines, etc.)
10. **Summary** — 3-5 bullet takeaways

Do not skip sections. Do not reorder them.

## DSA Explanation Depth

Never explain an algorithm by jumping straight to code or pseudocode. Always walk
through, in order:

1. The problem
2. The naive/brute-force solution
3. Why it's too slow (be concrete: what's the actual bottleneck?)
4. The better idea (the insight that unlocks the pattern)
5. The pattern name
6. The algorithm (template)
7. Complexity
8. A real-world analogy
9. A real engineering application

## Length Budget

- Each pattern chapter: **~800–1,200 words** (plus diagrams) — enough for the
  mental model and template without novel-length prose
- Each family file may bundle multiple patterns, but each pattern still gets its
  own full section following the structure above
- Foundations chapters: 3-4 pages each

## Diagrams

- Prefer **Mermaid** diagrams; fall back to ASCII art only when Mermaid can't
  express the idea cleanly (e.g. array index pointers)
- Every diagram must be explained in the surrounding prose — never assume a
  visual is self-explanatory
- Store reusable Mermaid sources in `assets/diagrams/*.mmd`

## Callout Boxes

Use these consistently, as Markdown blockquotes:

| Box                       | Use for                                                |
| ------------------------- | ------------------------------------------------------ |
| 💡 Intuition              | The "aha" moment behind the pattern                    |
| ⚠️ Common Mistake         | A specific bug or misconception                        |
| 🚀 Interview Tip          | Phrasing, follow-ups, or edge cases interviewers probe |
| 🏗️ Engineering Connection | Where this shows up in real software                   |
| 🧠 Pattern Recognition    | The keyword/phrase that should trigger this pattern    |

Example:

```markdown
> 💡 **Intuition:** A sliding window avoids recomputing the same subarray sum
> from scratch by reusing the work already done for the previous window.
```

## Formatting Rules

- Markdown only, no raw HTML
- Proper heading hierarchy (`#` per file, `##` per major section, `###` for
  sub-points) — never skip a level
- Max line length: ~100 characters for prose
- Use tables for comparisons, bullet lists for enumerations
- Horizontal rules (`---`) between major sections
- No placeholders, no "TODO" markers in _finished_ content — draft files use
  `> Status: not yet written` until a full pass is done

## Quality Bar

```
Understanding → Pattern Recognition → Implementation → Optimization
```

...never just **Memorization**. If a section could be replaced by "memorize this
solution," rewrite it until it teaches recognition instead.
