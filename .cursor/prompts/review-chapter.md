# Prompt: Review Chapter

Copy this into chat, point it at a specific chapter/section, and send it.

---

Review the **<PATTERN>** section in `<FILE PATH>` against
`HANDBOOK_STYLE_GUIDE.md` and the project rules.

Check specifically for:

- Missing or reordered sections (must match `handbook-style.mdc` exactly)
- Explanation depth — does it actually walk through naive solution -> why
  it's slow -> better idea, or does it jump straight to the answer?
- Weak or missing analogies
- Missing or under-explained diagrams
- Incorrect or unjustified time/space complexity
- Grammar, repetition, and filler sentences
- Whether the "Common Mistakes" are real beginner mistakes, not generic filler
- Whether the "Engineering Connections" point to a real, specific system
  (not a vague "used in many systems")
- Length budget: about **800–1,200 words** per pattern (plus diagrams) — trim
  fluff or expand thin sections to fit

Fix everything you find directly in the file. Summarize what changed in your
response. If the chapter passes with no changes needed, update
`HANDBOOK_PLAN.md` to mark it `[x]` (done).
