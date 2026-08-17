import { describe, it, expect } from "vitest";
import {
  PYTHON_BOOT_MS,
  runnerBudgetMs,
  runnerTimeoutMessage,
} from "../src/lib/sandbox/runnerTimeout";

/**
 * The 23s "infinite loop" diagnosis was a lie: Python's cold Pyodide boot
 * was folded into the same timer as the learner's code. Boot and execute
 * must be separate budgets, and only execute may talk about a loop.
 */

describe("runnerBudgetMs", () => {
  it("gives JavaScript only the authored case budget", () => {
    expect(runnerBudgetMs("javascript", 3000, "running")).toBe(3000);
  });

  it("does not charge a cold Python boot against the case budget", () => {
    expect(runnerBudgetMs("python", 3000, "booting")).toBe(PYTHON_BOOT_MS);
    expect(PYTHON_BOOT_MS).toBeGreaterThan(20_000);
  });

  it("gives a booted Python run only the authored case budget, not 23s", () => {
    expect(runnerBudgetMs("python", 3000, "running")).toBe(3000);
    expect(runnerBudgetMs("python", 3000, "running")).not.toBe(23_000);
  });
});

describe("runnerTimeoutMessage", () => {
  it("does not call a boot failure an infinite loop", () => {
    const message = runnerTimeoutMessage("booting", 60_000);
    expect(message).toMatch(/python/i);
    expect(message).not.toMatch(/infinite loop/i);
  });

  it("still names an execute timeout as a likely infinite loop", () => {
    expect(runnerTimeoutMessage("running", 3000)).toBe(
      "Timed out after 3s — likely an infinite loop. The run was stopped.",
    );
  });
});
