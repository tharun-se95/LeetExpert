import { TreeStructure } from "@phosphor-icons/react/dist/ssr";
import { ConceptMindMap } from "@/components/course/ConceptMindMap";
import type { MindMapNode } from "@/lib/course/conceptMaps/types";

interface ModuleMediaProps {
  conceptMap?: MindMapNode;
  moduleTitle: string;
}

/**
 * The module's concept map from the analogy rewrite's NotebookLM pass —
 * orientation before diving into individual lessons. Per-lesson videos live
 * behind a "Watch this lesson" link in each lesson's header (see
 * WatchLessonLink); this section is the concept map's own full-width home,
 * sized to be read comfortably.
 */
export function ModuleMedia({ conceptMap, moduleTitle }: ModuleMediaProps) {
  if (!conceptMap) return null;

  return (
    <div className="mt-8 print:hidden">
      <div className="rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation p-5">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
          <TreeStructure weight="bold" className="h-4 w-4 text-accent" />
          Concept map
        </p>
        <div className="mt-4">
          <ConceptMindMap root={conceptMap} label={moduleTitle} size="lg" />
        </div>
      </div>
    </div>
  );
}
