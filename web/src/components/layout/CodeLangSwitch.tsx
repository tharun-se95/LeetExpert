"use client";

import { useRef, type KeyboardEvent } from "react";
import { LanguageMark } from "@/components/kit/languageMarks";
import { useCodeLang } from "@/lib/codeLang";
import { cn } from "@/lib/utils";

interface CodeLangSwitchProps {
  className?: string;
}

/**
 * Global code language switch in the application header.
 * Allows switching between Python and JavaScript, immediately updating
 * all code blocks, the sandbox editor, and interactive solutions app-wide.
 */
export function CodeLangSwitch({ className }: CodeLangSwitchProps) {
  const [preferred, setPreferred] = useCodeLang();
  const pyRef = useRef<HTMLButtonElement>(null);
  const jsRef = useRef<HTMLButtonElement>(null);

  const isPython = preferred === "python";
  const isJs = preferred === "javascript" || preferred === "typescript";

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    current: "python" | "javascript",
  ) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      if (current === "python") {
        setPreferred("javascript");
        jsRef.current?.focus();
      } else {
        setPreferred("python");
        pyRef.current?.focus();
      }
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Code language"
      className={cn(
        "inline-flex h-9 items-center rounded-full border border-border/80 bg-surface/80 p-0.5 text-xs font-medium shadow-elevation",
        className,
      )}
    >
      <button
        ref={pyRef}
        type="button"
        role="radio"
        aria-checked={isPython}
        aria-label="Python"
        tabIndex={isPython ? 0 : -1}
        onClick={() => setPreferred("python")}
        onKeyDown={(e) => handleKeyDown(e, "python")}
        className={cn(
          "inline-flex h-full items-center gap-1.5 rounded-full px-2 sm:px-2.5 text-xs transition-all duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer",
          isPython
            ? "border border-accent/25 bg-elevated text-foreground shadow-elevation font-semibold"
            : "border border-transparent text-muted hover:text-foreground",
        )}
      >
        <span className={cn("inline-flex items-center justify-center", isPython && "lang-icon-glow")}>
          <LanguageMark language="python" />
        </span>
        <span className="hidden sm:inline">Python</span>
      </button>

      <button
        ref={jsRef}
        type="button"
        role="radio"
        aria-checked={isJs}
        aria-label="JavaScript"
        tabIndex={isJs ? 0 : -1}
        onClick={() => setPreferred("javascript")}
        onKeyDown={(e) => handleKeyDown(e, "javascript")}
        className={cn(
          "inline-flex h-full items-center gap-1.5 rounded-full px-2 sm:px-2.5 text-xs transition-all duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer",
          isJs
            ? "border border-accent/25 bg-elevated text-foreground shadow-elevation font-semibold"
            : "border border-transparent text-muted hover:text-foreground",
        )}
      >
        <span className={cn("inline-flex items-center justify-center", isJs && "lang-icon-glow")}>
          <LanguageMark language="javascript" />
        </span>
        <span className="hidden sm:inline">JS</span>
      </button>
    </div>
  );
}
