/**
 * Practice chapters keep a short playbook, then a Problems heading.
 * The cheatsheet renders between them, so we split the markdown body
 * on an exact ATX `## Problems` line and re-emit that heading in React.
 */
export function splitPracticeBody(markdown: string): {
  intro: string;
  hadProblemsHeading: boolean;
} {
  const lines = markdown.split("\n");
  const idx = lines.findIndex((line) => line.trim() === "## Problems");
  if (idx === -1) {
    return { intro: markdown.replace(/\s+$/, ""), hadProblemsHeading: false };
  }
  const intro = lines.slice(0, idx).join("\n").replace(/\s+$/, "");
  return { intro, hadProblemsHeading: true };
}
