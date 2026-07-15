import { FAMILIES } from "@/lib/content/manifest";
import { createPlaceholderDemo } from "@/lib/visual/placeholderDemo";
import type { PatternDemoModule } from "@/lib/visual/types";
import {
  binarySearchDemo,
  hashMapsDemo,
  slidingWindowDemo,
  twoPointersDemo,
} from "@/components/lab/demos/flagships";
import { family1to3Demos } from "@/components/lab/demos/family1to3";
import { family4to7Demos } from "@/components/lab/demos/family4to7";

const registry: Record<string, PatternDemoModule> = {};

for (const family of FAMILIES) {
  for (const pattern of family.patterns) {
    const id = `${family.id}/${pattern.slug}`;
    registry[id] = createPlaceholderDemo(id, pattern.title);
  }
}

const curated: PatternDemoModule[] = [
  hashMapsDemo,
  slidingWindowDemo,
  twoPointersDemo,
  binarySearchDemo,
  ...family1to3Demos,
  ...family4to7Demos,
];

for (const d of curated) {
  registry[d.id] = d;
}

export function registerDemos(demos: PatternDemoModule[]) {
  for (const d of demos) {
    registry[d.id] = d;
  }
}

export function getDemo(
  familyId: string,
  patternSlug: string,
): PatternDemoModule | undefined {
  return registry[`${familyId}/${patternSlug}`];
}

export function getAllRegisteredDemoIds(): string[] {
  return Object.keys(registry);
}
