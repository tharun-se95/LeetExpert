import type { SandboxLang } from "@/components/sandbox/types";

/** Cold Pyodide download + WASM instantiate. Not learner-code time. */
export const PYTHON_BOOT_MS = 60_000;

export type RunnerTimeoutPhase = "booting" | "running";

/**
 * Boot and execute are separate clocks. Folding them together produced the
 * 23s "infinite loop" diagnosis on a slow first Python start.
 */
export function runnerBudgetMs(
  lang: SandboxLang,
  timeoutMs: number,
  phase: RunnerTimeoutPhase,
): number {
  if (lang === "python" && phase === "booting") return PYTHON_BOOT_MS;
  return timeoutMs;
}

export function runnerTimeoutMessage(
  phase: RunnerTimeoutPhase,
  budgetMs: number,
): string {
  const seconds = (budgetMs / 1000).toFixed(0);
  if (phase === "booting") {
    return `Python took too long to start (${seconds}s). The runtime may still be downloading — try Run again.`;
  }
  return `Timed out after ${seconds}s — likely an infinite loop. The run was stopped.`;
}
