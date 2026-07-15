# Prompt: Create Diagrams

Copy this into chat, point it at a chapter, and send it.

---

Generate Mermaid diagrams for every section in `<FILE PATH>` that currently
uses only prose or is missing a visual.

Rules:

- Prefer `flowchart` for decision logic, simple `graph`/box diagrams for data
  structures, ASCII art only when Mermaid genuinely can't express the idea
  (e.g. index pointers into an array)
- One diagram per idea — don't merge unrelated steps into a single diagram
- Immediately follow each diagram with 1-3 sentences explaining what it shows
  (never leave a diagram unexplained)
- Save each diagram's Mermaid source as its own file in
  `assets/diagrams/<pattern-name>-<short-description>.mmd` and reference it
  inline in the chapter

Return a summary listing which sections got new diagrams.
