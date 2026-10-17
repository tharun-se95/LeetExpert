"use client";

import { useState, useEffect, useRef, useId, useCallback } from "react";
import {
  ShareNetwork,
  X,
  Copy,
  Check,
  XLogo,
  LinkedinLogo,
  Clock,
  Cpu,
  ChatCircleText,
} from "@phosphor-icons/react";
import { Dialog } from "@/components/ui/Dialog";
import {
  difficultyBadgeClass,
  type Difficulty,
} from "@/lib/course/problemDifficulty";
import { problemHref } from "@/lib/course/nav";
import { SITE_ORIGIN } from "@/lib/seo/site";
import { cn } from "@/lib/utils";

export interface ShareProblemModalProps {
  open: boolean;
  onClose: () => void;
  problemTitle: string;
  lessonSlug: string;
  moduleSlug?: string;
  difficulty?: Difficulty;
  complexity?: { time?: string; space?: string } | null;
}

/**
 * Formats time and space complexity into an enticing target string.
 * e.g. "O(n) time & O(1) space", "O(log n) time", or "optimal time & space".
 */
export function formatTargetComplexity(
  complexity?: { time?: string; space?: string } | null,
): string {
  const time = complexity?.time?.trim();
  const space = complexity?.space?.trim();
  if (time && space) return `${time} time & ${space} space`;
  if (time) return `${time} time`;
  if (space) return `${space} space`;
  return "optimal time & space";
}

/**
 * Resolves the absolute URL for the problem challenge.
 */
export function getChallengeUrl(lessonSlug: string): string {
  if (typeof window !== "undefined" && window.location) {
    const origin = window.location.origin;
    return `${origin}${problemHref(lessonSlug)}`;
  }
  return `${SITE_ORIGIN}${problemHref(lessonSlug)}`;
}

/**
 * Enticing pre-filled copy for Twitter / X.
 */
export function buildTwitterShareUrl(
  title: string,
  complexityStr: string,
  url: string,
): string {
  const text = `Can you solve "${title}" in ${complexityStr}? ⚡\n\nTest your code in the live sandbox on @leetExpert:\n`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

/**
 * Pre-filled share URL for LinkedIn.
 */
export function buildLinkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

/**
 * Formats a ready-to-paste challenge prompt for team chats (Slack, Discord, Teams).
 */
export function buildChallengePrompt(
  title: string,
  complexityStr: string,
  url: string,
): string {
  return `Can you solve "${title}" in ${complexityStr}? ⚡\nTest your code in the live sandbox on leetExpert: ${url}`;
}

/**
 * Copy text with fallback for strict browser sandboxes / older environments.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Proceed to fallback
  }

  try {
    if (typeof document !== "undefined") {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      textArea.remove();
      return successful;
    }
  } catch {
    /* ignore */
  }

  return false;
}

/**
 * High-converting 'Share & Challenge a Friend' modal.
 * Designed with Space Mono displays, Space Grotesk UI, and token-based contrast.
 */
export function ShareProblemModal({
  open,
  onClose,
  problemTitle,
  lessonSlug,
  difficulty,
  complexity,
}: ShareProblemModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = useId();

  const challengeUrl = getChallengeUrl(lessonSlug);
  const targetComplexity = formatTargetComplexity(complexity);
  const twitterUrl = buildTwitterShareUrl(problemTitle, targetComplexity, challengeUrl);
  const linkedInUrl = buildLinkedInShareUrl(challengeUrl);
  const challengePrompt = buildChallengePrompt(problemTitle, targetComplexity, challengeUrl);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(challengeUrl);
    if (ok) {
      setCopiedLink(true);
      showToast("Challenge link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyPrompt = async () => {
    const ok = await copyToClipboard(challengePrompt);
    if (ok) {
      setCopiedPrompt(true);
      showToast("Challenge prompt copied to clipboard!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleOpenSocial = (url: string) => {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        label="Share Challenge"
        className="max-w-lg p-0 overflow-hidden"
      >
        <div className="relative flex flex-col p-5 sm:p-6">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-[length:var(--radius-md)] text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close dialog"
          >
            <X size={16} weight="bold" />
          </button>

          {/* Modal header */}
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-accent uppercase tracking-wider">
            <ShareNetwork size={15} weight="bold" aria-hidden />
            <span>Peer Challenge</span>
          </div>

          <h2 className="mt-1 font-display text-lg font-bold tracking-tight uppercase sm:text-xl">
            Challenge a Peer
          </h2>

          <p className="mt-1 text-xs text-muted leading-relaxed sm:text-sm">
            Share this problem and challenge your peers to match or beat the optimal runtime complexity.
          </p>

          {/* Problem & Target Complexity Card */}
          <div className="mt-4 rounded-[length:var(--radius-md)] border border-border bg-surface p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-sm font-bold tracking-tight uppercase sm:text-base">
                {problemTitle}
              </span>
              {difficulty ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-[length:var(--radius-md)] border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider",
                    difficultyBadgeClass(difficulty),
                  )}
                >
                  {difficulty}
                </span>
              ) : null}
            </div>

            {/* Target complexity highlight */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-2.5 text-xs">
              <span className="text-[0.7rem] uppercase tracking-wider font-mono text-muted">
                Benchmark:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {complexity?.time ? (
                  <span className="inline-flex items-center gap-1 rounded-[length:var(--radius-sm)] bg-elevated px-2 py-0.5 font-mono text-xs font-medium text-foreground">
                    <Clock size={12} className="text-accent" aria-hidden />
                    {complexity.time}
                  </span>
                ) : null}
                {complexity?.space ? (
                  <span className="inline-flex items-center gap-1 rounded-[length:var(--radius-sm)] bg-elevated px-2 py-0.5 font-mono text-xs font-medium text-foreground">
                    <Cpu size={12} className="text-accent" aria-hidden />
                    {complexity.space}
                  </span>
                ) : null}
                {!complexity?.time && !complexity?.space ? (
                  <span className="rounded-[length:var(--radius-sm)] bg-elevated px-2 py-0.5 font-mono text-xs text-muted">
                    Optimal time & space
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* One-click Copy Challenge Link */}
          <div className="mt-4">
            <label
              htmlFor={inputId}
              className="block text-xs font-medium text-muted uppercase tracking-wider"
            >
              Challenge Link
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id={inputId}
                type="text"
                readOnly
                value={challengeUrl}
                onFocus={(e) => e.target.select()}
                className="h-10 min-w-0 flex-1 rounded-[length:var(--radius-md)] border border-border bg-code px-3 font-mono text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[length:var(--radius-md)] px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  copiedLink
                    ? "bg-good/15 text-good border border-good/30"
                    : "bg-pop text-on-pop hover:bg-pop/90",
                )}
                aria-label="Copy challenge link"
              >
                {copiedLink ? (
                  <>
                    <Check size={14} weight="bold" aria-hidden />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} weight="bold" aria-hidden />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share Grid */}
          <div className="mt-4">
            <span className="block text-xs font-medium text-muted uppercase tracking-wider">
              Share directly to peers
            </span>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {/* Twitter / X */}
              <button
                type="button"
                onClick={() => handleOpenSocial(twitterUrl)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[length:var(--radius-md)] border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-pop/40 hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Share challenge on X"
              >
                <XLogo size={15} weight="bold" aria-hidden />
                <span>Share on X</span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={() => handleOpenSocial(linkedInUrl)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[length:var(--radius-md)] border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-pop/40 hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Share challenge on LinkedIn"
              >
                <LinkedinLogo size={15} weight="bold" className="text-accent" aria-hidden />
                <span>Share on LinkedIn</span>
              </button>
            </div>
          </div>

          {/* Copy Prompt for Chat (Slack/Discord) */}
          <div className="mt-3">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className={cn(
                "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[length:var(--radius-md)] border border-border px-3 text-xs font-medium text-muted transition-colors hover:border-pop/40 hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                copiedPrompt && "border-good/30 bg-good/10 text-good hover:text-good",
              )}
              aria-label="Copy challenge prompt for Slack or Discord"
            >
              {copiedPrompt ? (
                <>
                  <Check size={13} weight="bold" aria-hidden />
                  <span>Prompt Copied!</span>
                </>
              ) : (
                <>
                  <ChatCircleText size={14} weight="bold" aria-hidden />
                  <span>Copy Challenge Prompt (Slack / Discord)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Floating Toast Notification */}
      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 rounded-[length:var(--radius-md)] border border-border bg-elevated px-4 py-2.5 shadow-elevation text-xs font-sans font-medium text-foreground animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <Check size={16} weight="bold" className="text-good shrink-0" aria-hidden />
          <span>{toastMessage}</span>
        </div>
      ) : null}
    </>
  );
}
