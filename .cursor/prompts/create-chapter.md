# Prompt: Create Chapter

Copy this into chat, fill in `<PATTERN>` and `<FAMILY FILE>`, and send it.

---

Write the full handbook section for the pattern **<PATTERN>** inside
`part-2-pattern-families/<FAMILY FILE>`.

Follow every project rule automatically applied in this workspace
(`writing.mdc`, `diagrams.mdc`, `handbook-style.mdc`, `dsa-quality.mdc`,
`markdown-format.mdc`) — in particular:

- Use the exact required section structure (Purpose, Recognition Clues,
  Mental Model, Visualization, Generic Template, Complexity, Common Mistakes,
  Classic Interview Questions, Engineering Connections, Summary)
- Build the explanation up through: problem -> naive solution -> why it's slow
  -> better idea -> pattern -> algorithm -> complexity -> analogy ->
  engineering application
- Include at least one Mermaid diagram, fully explained in prose
- Pull the classic questions from `QUESTION_BANK.md` (3 easy, 3 medium, 2 hard)
- Keep each pattern section to **~800–1,200 words** plus diagrams
- Append this section to the family file rather than replacing existing
  pattern sections already in it

After writing, update `HANDBOOK_PLAN.md` to mark this pattern `[~]` (drafted,
needs review).
