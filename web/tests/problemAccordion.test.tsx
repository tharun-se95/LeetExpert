import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ProblemAccordion,
  cleanDescriptionSource,
  cleanExplanationSource,
  cleanSolutionSource,
} from "@/components/problems/ProblemAccordion";

describe("ProblemAccordion cleaning helpers", () => {
  it("strips redundant leading Problem headings", () => {
    expect(cleanDescriptionSource("## Problem\n\nGiven an array..."))
      .toBe("Given an array...");
    expect(cleanDescriptionSource("## The Problem\n\nGiven an array..."))
      .toBe("Given an array...");
    expect(cleanDescriptionSource("# Problem\n\nGiven an array..."))
      .toBe("Given an array...");
    expect(cleanDescriptionSource("### Problem\n\nGiven an array..."))
      .toBe("Given an array...");
    expect(cleanDescriptionSource("Given an array directly"))
      .toBe("Given an array directly");
  });

  it("strips redundant leading Explanation headings", () => {
    expect(cleanExplanationSource("## Explanation\n\nUse hash map..."))
      .toBe("Use hash map...");
    expect(cleanExplanationSource("## Intuition & Approach\n\nUse hash map..."))
      .toBe("Use hash map...");
    expect(cleanExplanationSource("### Intuition and Approach\n\nUse hash map..."))
      .toBe("Use hash map...");
    expect(cleanExplanationSource("Use hash map directly"))
      .toBe("Use hash map directly");
  });

  it("strips redundant leading Solution headings", () => {
    expect(cleanSolutionSource("## Solution\n\n```python\ndef f(): pass\n```"))
      .toBe("```python\ndef f(): pass\n```");
    expect(cleanSolutionSource("## Solutions\n\n```python\ndef f(): pass\n```"))
      .toBe("```python\ndef f(): pass\n```");
    expect(cleanSolutionSource("### Solution\n\n```python\ndef f(): pass\n```"))
      .toBe("```python\ndef f(): pass\n```");
    expect(cleanSolutionSource("```python\ndef f(): pass\n```"))
      .toBe("```python\ndef f(): pass\n```");
  });
});

describe("ProblemAccordion", () => {
  const defaultProps = {
    descriptionSource: "## Problem\n\nGiven an array of integers `nums`...",
    explanationSource: "## Explanation\n\nUse a hash map for O(n) lookup...",
    solutionSource: "## Solution\n\n```python\ndef solve(): pass\n```",
    highlightedBlocks: {},
    highlightedTabs: {},
  };

  it("renders all three section triggers: Description, Explanation, and Solution", () => {
    const html = renderToStaticMarkup(<ProblemAccordion {...defaultProps} />);

    expect(html).toContain("Description");
    expect(html).toContain("Explanation");
    expect(html).toContain("Solution");
    expect(html).toContain("accordion-trigger-description");
    expect(html).toContain("accordion-trigger-explanation");
    expect(html).toContain("accordion-trigger-solution");
  });

  it("defaults to Description open and others closed ('show one at a time')", () => {
    const html = renderToStaticMarkup(<ProblemAccordion {...defaultProps} />);

    // Description is open
    expect(html).toMatch(/id="accordion-trigger-description"[^>]*aria-expanded="true"/);
    expect(html).toContain('id="accordion-panel-description"');
    expect(html).toContain("Given an array of integers");

    // Redundant duplicate header is stripped
    expect(html).not.toContain('<h2 id="problem">Problem</h2>');

    // Explanation and Solution are closed
    expect(html).toMatch(/id="accordion-trigger-explanation"[^>]*aria-expanded="false"/);
    expect(html).toMatch(/id="accordion-trigger-solution"[^>]*aria-expanded="false"/);
    expect(html).not.toContain('id="accordion-panel-explanation"');
    expect(html).not.toContain('id="accordion-panel-solution"');
  });

  it("renders only Explanation when activeSection='explanation' with redundant heading stripped", () => {
    const html = renderToStaticMarkup(
      <ProblemAccordion {...defaultProps} activeSection="explanation" />,
    );

    expect(html).toMatch(/id="accordion-trigger-explanation"[^>]*aria-expanded="true"/);
    expect(html).toMatch(/id="accordion-trigger-description"[^>]*aria-expanded="false"/);
    expect(html).toMatch(/id="accordion-trigger-solution"[^>]*aria-expanded="false"/);

    expect(html).toContain('id="accordion-panel-explanation"');
    expect(html).toContain("Use a hash map for O(n) lookup");
    expect(html).not.toContain('<h2 id="explanation">Explanation</h2>');
    expect(html).not.toContain('id="accordion-panel-description"');
    expect(html).not.toContain('id="accordion-panel-solution"');
  });

  it("renders only Solution when activeSection='solution' with redundant heading stripped", () => {
    const html = renderToStaticMarkup(
      <ProblemAccordion {...defaultProps} activeSection="solution" />,
    );

    expect(html).toMatch(/id="accordion-trigger-solution"[^>]*aria-expanded="true"/);
    expect(html).toMatch(/id="accordion-trigger-description"[^>]*aria-expanded="false"/);
    expect(html).toMatch(/id="accordion-trigger-explanation"[^>]*aria-expanded="false"/);

    expect(html).toContain('id="accordion-panel-solution"');
    expect(html).not.toContain('<h2 id="solution">Solution</h2>');
    expect(html).not.toContain('id="accordion-panel-description"');
    expect(html).not.toContain('id="accordion-panel-explanation"');
  });

  it("protects solutions and hints with a blur overlay and reveal icon button", () => {
    const props = {
      ...defaultProps,
      solutionSource:
        "## Solution\n\n```reveal Solution — dummy head, splice don't copy\nHere is the direct explanation.\n```",
      activeSection: "solution" as const,
    };

    const html = renderToStaticMarkup(<ProblemAccordion {...props} />);

    // Content is rendered inside the blurred container
    expect(html).toContain("Here is the direct explanation.");
    expect(html).toContain("blur-[8px]");
    // Subtitle is cleanly displayed in the reveal card
    expect(html).toContain("dummy head, splice don&#x27;t copy");
    // Reveal trigger button with Eye icon is present
    expect(html).toContain("Reveal Solution");
    expect(html).toContain('aria-label="Click to reveal Solution — dummy head, splice don&#x27;t copy"');
  });

  it("renders rich metadata banner (difficulty, complexity, module title, solved) in Description", () => {
    const props = {
      ...defaultProps,
      difficulty: "Medium" as const,
      moduleTitle: "Arrays · Problem 2",
      complexity: { time: "O(n)", space: "O(1)" },
      isSolved: true,
      activeSection: "description" as const,
    };

    const html = renderToStaticMarkup(<ProblemAccordion {...props} />);

    expect(html).toContain("Medium");
    expect(html).toContain("Arrays · Problem 2");
    expect(html).toContain("O(n)");
    expect(html).toContain("O(1)");
    expect(html).toContain("Solved");
  });
});
