"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * `className` overrides the default square 32px treatment (the landing header
 * passes a round 40px one). It goes on the pre-mount placeholder too, or the
 * override would pop in after hydration.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-[length:var(--radius-md)] border border-border",
          className,
        )}
        aria-label="Toggle theme"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-[length:var(--radius-md)] border border-border text-muted transition hover:bg-surface hover:text-foreground",
        className,
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
