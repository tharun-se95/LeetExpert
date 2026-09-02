import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { COURSES } from "../src/lib/courses/registry";

const COURSES_ROOT = join(__dirname, "..", "..", "courses");

describe("every registered course has a non-empty content directory", () => {
  for (const course of COURSES) {
    it(`${course.slug} has content under courses/${course.slug}/`, () => {
      const dir = join(COURSES_ROOT, course.slug);
      expect(statSync(dir).isDirectory()).toBe(true);
      const entries = readdirSync(dir);
      expect(entries.length).toBeGreaterThan(0);
    });
  }
});
