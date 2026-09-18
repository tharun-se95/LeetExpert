import type { AnonymousSummary } from "@/lib/progress/localStore";

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** One line for the merge prompt and the sign-out warning, so the two cannot count differently. */
export function summaryLine(summary: AnonymousSummary): string {
  return [
    plural(summary.visited, "lesson visited", "lessons visited"),
    plural(summary.solved, "problem solved", "problems solved"),
    plural(summary.drafts, "draft", "drafts"),
  ].join(" · ");
}
