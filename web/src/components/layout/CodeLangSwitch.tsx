"use client";

import { useRef, type KeyboardEvent } from "react";
import { LanguageMark } from "@/components/kit/languageMarks";
import { ROUND_CONTROL } from "@/components/layout/headerChrome";
import { useCodeLang, type CodeLang } from "@/lib/codeLang";
import { cn } from "@/lib/utils";

const OPTIONS: { value: CodeLang; label: string; mark: string }[] = [
  { value: "python", label: "Python", mark: "python" },
  { value: "js", label: "JS/TS", mark: "javascript" },
];

/**
 * The header's code-language pill (≥ 640px): one round hairline pill, like
 * search and the theme toggle beside it, split between the two languages. The
 * chosen side takes the header's hover fill (--surface) and ink; the other
 * stays muted. Focus is the global :focus-visible outline (headerChrome.ts).
 * Props-only so it renders in tests without the store.
 */
export function CodeLangSwitchView({
  value,
  onChange,
}: {
  value: CodeLang;
  onChange: (next: CodeLang) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = value === "js" ? 1 : 0;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % OPTIONS.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + OPTIONS.length) % OPTIONS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = OPTIONS.length - 1;
    else return;
    event.preventDefault();
    onChange(OPTIONS[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Code language"
      onKeyDown={onKeyDown}
      className="hidden h-10 items-center gap-0.5 rounded-full border border-border p-0.5 sm:inline-flex"
    >
      {OPTIONS.map((option, i) => {
        const checked = i === index;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-full items-center gap-1.5 rounded-full px-3 text-sm transition-colors",
              checked ? "bg-surface font-medium text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            <LanguageMark language={option.mark} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The phone toggle (< 640px): the nav row has no room for the pill (measured
 * 2026-09-15), so one round control beside search shows the current mark and
 * switches on tap.
 */
export function CodeLangToggleView({
  value,
  onChange,
}: {
  value: CodeLang;
  onChange: (next: CodeLang) => void;
}) {
  const current = OPTIONS[value === "js" ? 1 : 0];
  const other = OPTIONS[value === "js" ? 0 : 1];
  return (
    <button
      type="button"
      onClick={() => onChange(other.value)}
      aria-label={`Code language: ${current.label}. Switch to ${other.label}`}
      className={cn(ROUND_CONTROL, "h-11 w-11 sm:hidden")}
    >
      <LanguageMark language={current.mark} />
    </button>
  );
}

export function CodeLangSwitch() {
  const [value, setValue] = useCodeLang();
  return <CodeLangSwitchView value={value} onChange={setValue} />;
}

export function CodeLangToggle() {
  const [value, setValue] = useCodeLang();
  return <CodeLangToggleView value={value} onChange={setValue} />;
}
