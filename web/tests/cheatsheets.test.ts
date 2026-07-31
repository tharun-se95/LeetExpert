import { describe, it, expect } from "vitest";
import {
  CHEATSHEETS,
  GOLD_MODULE_SLUGS,
  getCheatsheet,
  practiceModuleSlugs,
} from "../src/lib/course/cheatsheets/registry";
import { DIAGRAM_IDS, type DiagramId } from "../src/lib/course/cheatsheets/types";

const diagramSet = new Set<string>(DIAGRAM_IDS);

describe("practice cheatsheets registry", () => {
  it("covers every practice-bearing module exactly once", () => {
    const needed = practiceModuleSlugs().sort();
    const have = Object.keys(CHEATSHEETS).sort();
    expect(have).toEqual(needed);
  });

  it("gold tier matches the promoted high-traffic set", () => {
    const gold = Object.values(CHEATSHEETS)
      .filter((s) => s.tier === "gold")
      .map((s) => s.moduleSlug)
      .sort();
    expect(gold).toEqual([...GOLD_MODULE_SLUGS].sort());
  });

  it("every sheet meets the shape bar", () => {
    const bad: string[] = [];
    for (const slug of practiceModuleSlugs()) {
      const sheet = getCheatsheet(slug);
      if (sheet.moduleSlug !== slug) bad.push(`${slug}: moduleSlug mismatch`);
      if (!sheet.tagline.trim()) bad.push(`${slug}: empty tagline`);
      const minPatterns = sheet.tier === "gold" ? 4 : 3;
      if (sheet.patterns.length < minPatterns) {
        bad.push(`${slug}: need ≥${minPatterns} patterns`);
      }
      if (sheet.complexity.length < 2) bad.push(`${slug}: need ≥2 complexity rows`);
      if (sheet.smells.length < 2) bad.push(`${slug}: need ≥2 smells`);
      if (sheet.traps.length < 1) bad.push(`${slug}: need ≥1 trap`);
      if (!sheet.patterns.some((p) => p.diagram)) {
        bad.push(`${slug}: need ≥1 diagram on a pattern`);
      }
      for (const p of sheet.patterns) {
        if (!p.title.trim() || !p.summary.trim()) {
          bad.push(`${slug}: empty pattern title/summary`);
        }
        if (p.diagram && !diagramSet.has(p.diagram)) {
          bad.push(`${slug}: unknown diagram ${p.diagram}`);
        }
      }
      for (const trap of sheet.traps) {
        if (!trap.title.trim() || !trap.detail.trim()) {
          bad.push(`${slug}: empty trap`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("gold sheets meet depth thresholds", () => {
    const bad: string[] = [];
    for (const slug of GOLD_MODULE_SLUGS) {
      const sheet = getCheatsheet(slug);
      if (sheet.tier !== "gold") bad.push(`${slug}: expected gold tier`);
      if (sheet.smells.length < 4) bad.push(`${slug}: gold needs ≥4 smells`);
      if (sheet.traps.length < 2) bad.push(`${slug}: gold needs ≥2 traps`);
      const withDiagram = sheet.patterns.filter((p) => p.diagram).length;
      if (withDiagram < 3) bad.push(`${slug}: gold needs ≥3 diagrammed patterns`);
      const missingSmell = sheet.patterns.filter((p) => !p.smell?.trim());
      if (missingSmell.length > 0) {
        bad.push(`${slug}: gold patterns need card-level smells`);
      }
      const short = sheet.patterns.filter((p) => p.summary.trim().length < 60);
      if (short.length > 0) {
        bad.push(`${slug}: gold summaries should be ≥60 chars (got thin: ${short.map((p) => p.title).join(", ")})`);
      }
      const diagramIds = new Set(
        sheet.patterns.map((p) => p.diagram).filter(Boolean) as DiagramId[],
      );
      if (diagramIds.size < 2) {
        bad.push(`${slug}: gold needs ≥2 distinct DiagramIds (visual variety)`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("template sheets carry a second trap and pattern smells", () => {
    const bad: string[] = [];
    for (const sheet of Object.values(CHEATSHEETS)) {
      if (sheet.tier !== "template") continue;
      if (sheet.traps.length < 2) {
        bad.push(`${sheet.moduleSlug}: template needs ≥2 traps`);
      }
      const withoutSmell = sheet.patterns.filter((p) => !p.smell?.trim());
      if (withoutSmell.length > 0) {
        bad.push(
          `${sheet.moduleSlug}: template patterns need smells (${withoutSmell.map((p) => p.title).join(", ")})`,
        );
      }
    }
    expect(bad).toEqual([]);
  });

  it("registers every DiagramId at least once across sheets", () => {
    const used = new Set<string>();
    for (const sheet of Object.values(CHEATSHEETS)) {
      for (const p of sheet.patterns) {
        if (p.diagram) used.add(p.diagram);
      }
    }
    const unused = DIAGRAM_IDS.filter((id) => !used.has(id));
    expect(unused).toEqual([]);
  });

  it("getCheatsheet throws for unknown modules", () => {
    expect(() => getCheatsheet("getting-started")).toThrow(/Missing practice cheatsheet/);
  });
});
