import { describe, it, expect } from "vitest";
import { COURSES } from "../src/lib/courses/registry";

describe("COURSES registry", () => {
  it("includes a dsa entry with the required fields", () => {
    const dsa = COURSES.find((c) => c.slug === "dsa");
    expect(dsa).toBeDefined();
    expect(dsa!.title).toBe("Data Structures & Algorithms");
    expect(dsa!.status).toBe("available");
    expect(dsa!.href).toBe("/courses/dsa");
  });

  it("every entry has a unique slug", () => {
    const slugs = COURSES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every entry's href matches its slug", () => {
    for (const c of COURSES) {
      expect(c.href).toBe(`/courses/${c.slug}`);
    }
  });
});
