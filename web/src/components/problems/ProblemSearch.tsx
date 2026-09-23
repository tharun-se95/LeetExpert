import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/** The practice list's search box, on the practice page and the landing page's Practice window. */
export function ProblemSearch({
  query,
  onQueryChange,
  className,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-[length:var(--radius-lg)] border border-border bg-elevated px-4 py-3",
        "transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none",
        "focus-within:border-accent/45 focus-within:bg-accent/[0.04]",
        className,
      )}
    >
      <MagnifyingGlass className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search by problem, module, or difficulty…"
        aria-label="Search problems"
        className="min-w-0 flex-1 appearance-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-xs font-medium text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-foreground motion-reduce:transition-none"
        >
          Clear
        </button>
      ) : null}
    </label>
  );
}
