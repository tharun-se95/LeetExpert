import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

/**
 * The lesson-artifacts rollout ledger stays in step with the course.
 *
 * `ledger.py check` compares `lesson-artifacts/ledger.json` with the app's own manifest
 * (through `manifest-dump.ts`): every lesson appears exactly once, no row names a lesson
 * the app does not have, every gate is a known gate, and every artifact folder is built.
 * Adding or removing a lesson therefore fails CI until `ledger.py sync` is run.
 * Spec: docs/superpowers/specs/2026-09-24-lesson-artifacts-rollout-design.md §6.
 */
const LEDGER_PY = join(__dirname, "..", "lesson-artifacts", "ledger.py");

describe("lesson artifacts ledger", () => {
  it("lists every lesson in the app exactly once, with only known gates", () => {
    const run = spawnSync("python3", [LEDGER_PY, "check"], { encoding: "utf8" });
    expect(run.stdout + run.stderr).toMatch(/^ledger ok: /m);
    expect(run.status).toBe(0);
  });
});
