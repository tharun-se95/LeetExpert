import { MODULES } from "@/lib/course/manifest";
import { GOLD_SHEETS } from "./content/gold";
import { TEMPLATE_SHEETS } from "./content/templates";
import type { ModuleCheatsheet } from "./types";

const ALL_SHEETS: ModuleCheatsheet[] = [...GOLD_SHEETS, ...TEMPLATE_SHEETS];

export const CHEATSHEETS: Record<string, ModuleCheatsheet> = Object.fromEntries(
  ALL_SHEETS.map((sheet) => [sheet.moduleSlug, sheet]),
);

/** Module slugs that ship a Practice chapter (and therefore need a cheatsheet). */
export function practiceModuleSlugs(): string[] {
  return MODULES.filter((m) => m.lessons.some((l) => l.type === "practice")).map(
    (m) => m.slug,
  );
}

export function getCheatsheet(moduleSlug: string): ModuleCheatsheet {
  const sheet = CHEATSHEETS[moduleSlug];
  if (!sheet) {
    throw new Error(
      `Missing practice cheatsheet for module "${moduleSlug}". Add it under web/src/lib/course/cheatsheets/content/.`,
    );
  }
  return sheet;
}

export const GOLD_MODULE_SLUGS = [
  "arrays",
  "strings",
  "hash-tables",
  "two-pointers",
  "sliding-window",
  "linked-lists",
  "stacks",
  "binary-search",
  "graphs",
] as const;
