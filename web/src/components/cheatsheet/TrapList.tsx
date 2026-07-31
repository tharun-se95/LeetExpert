import { Warning, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { Trap } from "@/lib/course/cheatsheets/types";
import { cn } from "@/lib/utils";

export function TrapList({ traps }: { traps: Trap[] }) {
  return (
    <ul className="grid gap-2">
      {traps.map((trap) => {
        const Icon = trap.tone === "bad" ? WarningCircle : Warning;
        return (
          <li
            key={trap.title}
            className={cn(
              "flex gap-3 rounded-[length:var(--radius-md)] border border-l-4 px-4 py-3",
              trap.tone === "bad"
                ? "border-bad/40 border-l-bad bg-bad/5"
                : "border-warn/40 border-l-warn bg-warn/5",
            )}
          >
            <Icon
              weight="bold"
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                trap.tone === "bad" ? "text-bad" : "text-warn",
              )}
              aria-hidden
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "font-medium",
                  trap.tone === "bad" ? "text-bad" : "text-warn",
                )}
              >
                {trap.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                {trap.detail}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
