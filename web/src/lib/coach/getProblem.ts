import "server-only";
import corpus from "./corpus.generated.json";
import type { CoachProblem } from "./types";

const CORPUS = corpus as Record<string, CoachProblem>;

export function getCoachProblem(sandboxId: string): CoachProblem | null {
  return CORPUS[sandboxId] ?? null;
}
