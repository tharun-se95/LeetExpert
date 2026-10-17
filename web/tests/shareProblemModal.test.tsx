// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  ShareProblemModal,
  formatTargetComplexity,
  buildTwitterShareUrl,
  buildLinkedInShareUrl,
  buildChallengePrompt,
  getChallengeUrl,
} from "@/components/problems/ShareProblemModal";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("ShareProblemModal helper functions", () => {
  it("formats target complexity correctly", () => {
    expect(formatTargetComplexity({ time: "O(n)", space: "O(1)" })).toBe(
      "O(n) time & O(1) space",
    );
    expect(formatTargetComplexity({ time: "O(log n)" })).toBe("O(log n) time");
    expect(formatTargetComplexity({ space: "O(n)" })).toBe("O(n) space");
    expect(formatTargetComplexity(null)).toBe("optimal time & space");
    expect(formatTargetComplexity(undefined)).toBe("optimal time & space");
    expect(formatTargetComplexity({ time: "", space: "" })).toBe("optimal time & space");
  });

  it("builds Twitter share URL with pre-filled challenge text", () => {
    const url = "https://www.leetexpert.com/courses/dsa/problems/two-sum";
    const tweetUrl = buildTwitterShareUrl("Two Sum", "O(n) time & O(1) space", url);
    expect(tweetUrl).toContain("https://twitter.com/intent/tweet?");
    expect(tweetUrl).toContain(encodeURIComponent('Can you solve "Two Sum" in O(n) time & O(1) space? ⚡'));
    expect(tweetUrl).toContain(encodeURIComponent(url));
  });

  it("builds LinkedIn share URL", () => {
    const url = "https://www.leetexpert.com/courses/dsa/problems/two-sum";
    const linkedInUrl = buildLinkedInShareUrl(url);
    expect(linkedInUrl).toContain("https://www.linkedin.com/sharing/share-offsite/?url=");
    expect(linkedInUrl).toContain(encodeURIComponent(url));
  });

  it("builds chat challenge prompt", () => {
    const url = "https://www.leetexpert.com/courses/dsa/problems/two-sum";
    const prompt = buildChallengePrompt("Two Sum", "O(n) time & O(1) space", url);
    expect(prompt).toContain('Can you solve "Two Sum" in O(n) time & O(1) space? ⚡');
    expect(prompt).toContain(`Test your code in the live sandbox on leetExpert: ${url}`);
  });

  it("resolves challenge URL", () => {
    const challengeUrl = getChallengeUrl("two-sum");
    expect(challengeUrl).toContain("/courses/dsa/problems/two-sum");
  });
});

describe("ShareProblemModal component", () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root!.unmount();
      });
    }
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it("does not render dialog content when open is false", () => {
    act(() => {
      root!.render(
        <ShareProblemModal
          open={false}
          onClose={() => {}}
          problemTitle="Two Sum"
          lessonSlug="two-sum"
        />,
      );
    });

    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("renders problem title, difficulty, and complexity when open", () => {
    act(() => {
      root!.render(
        <ShareProblemModal
          open={true}
          onClose={() => {}}
          problemTitle="Two Sum"
          lessonSlug="two-sum"
          difficulty="Easy"
          complexity={{ time: "O(n)", space: "O(1)" }}
        />,
      );
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-label")).toBe("Share Challenge");
    expect(dialog?.textContent).toContain("Two Sum");
    expect(dialog?.textContent).toContain("Easy");
    expect(dialog?.textContent).toContain("O(n)");
    expect(dialog?.textContent).toContain("O(1)");
    expect(dialog?.textContent).toContain("Share on X");
    expect(dialog?.textContent).toContain("Share on LinkedIn");
  });

  it("copies challenge link to clipboard and displays toast notification", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    act(() => {
      root!.render(
        <ShareProblemModal
          open={true}
          onClose={() => {}}
          problemTitle="Two Sum"
          lessonSlug="two-sum"
          difficulty="Easy"
          complexity={{ time: "O(n)", space: "O(1)" }}
        />,
      );
    });

    const copyBtn = document.querySelector('button[aria-label="Copy challenge link"]') as HTMLButtonElement;
    expect(copyBtn).not.toBeNull();

    await act(async () => {
      copyBtn.click();
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock.mock.calls[0][0]).toContain("/courses/dsa/problems/two-sum");

    // Toast check
    const toast = document.querySelector('[role="status"]');
    expect(toast).not.toBeNull();
    expect(toast?.textContent).toContain("Challenge link copied to clipboard!");
  });

  it("copies prompt for Slack/Discord and displays toast notification", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    act(() => {
      root!.render(
        <ShareProblemModal
          open={true}
          onClose={() => {}}
          problemTitle="Two Sum"
          lessonSlug="two-sum"
          difficulty="Easy"
          complexity={{ time: "O(n)", space: "O(1)" }}
        />,
      );
    });

    const promptBtn = document.querySelector(
      'button[aria-label="Copy challenge prompt for Slack or Discord"]',
    ) as HTMLButtonElement;
    expect(promptBtn).not.toBeNull();

    await act(async () => {
      promptBtn.click();
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock.mock.calls[0][0]).toContain('Can you solve "Two Sum" in O(n) time & O(1) space?');

    // Toast check
    const toast = document.querySelector('[role="status"]');
    expect(toast).not.toBeNull();
    expect(toast?.textContent).toContain("Challenge prompt copied to clipboard!");
  });

  it("triggers onClose when close button is clicked", () => {
    const onCloseMock = vi.fn();

    act(() => {
      root!.render(
        <ShareProblemModal
          open={true}
          onClose={onCloseMock}
          problemTitle="Two Sum"
          lessonSlug="two-sum"
        />,
      );
    });

    const closeBtn = document.querySelector('button[aria-label="Close dialog"]') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();

    act(() => {
      closeBtn.click();
    });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
