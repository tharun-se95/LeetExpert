"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { PanelSplit } from "@/components/problems/PanelSplit";
import { coachColumnFits, lengthToPx } from "@/lib/coach/coachColumn";
import { CoachOverlay } from "./CoachOverlay";
import { CoachPanel } from "./CoachPanel";
import { useCoach } from "./CoachProvider";
import { CoachStrip } from "./CoachStrip";

/**
 * The sandbox with its coach. On a workspace wide enough to hold it
 * (lib/coach/coachColumn.ts) the coach is a column beside the editor,
 * collapsible to a strip; otherwise it floats over the IDE. The sandbox is
 * PanelSplit's primary in every layout, so switching never remounts it and
 * wipes run results.
 * Spec: docs/superpowers/specs/2026-09-17-coach-column-design.md
 */
export function IdeWithCoach({ sandbox }: { sandbox: ReactNode }) {
  const { layout, setLayout, open } = useCoach();
  const rootRef = useRef<HTMLDivElement>(null);

  // A layout effect, so a wide workspace never paints the floating launcher
  // first. Observed on the whole workspace row: the column's own width is not
  // in it, so switching layout cannot feed back into the measurement.
  useLayoutEffect(() => {
    const workspace = rootRef.current?.closest<HTMLElement>("[data-problem-workspace]");
    if (!workspace) return;
    const measure = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      const rootPx = parseFloat(rootStyle.fontSize) || 16;
      const description = workspace.querySelector<HTMLElement>(".problem-description-pane");
      const handle = workspace.querySelector<HTMLElement>("[data-split-handle]");
      const fits = coachColumnFits({
        workspace: workspace.getBoundingClientRect().width,
        descriptionCap: description ? parseFloat(getComputedStyle(description).maxWidth) : NaN,
        editorMin: lengthToPx(rootStyle.getPropertyValue("--ide-editor-min"), rootPx),
        coachMin: lengthToPx(rootStyle.getPropertyValue("--coach-column-min"), rootPx),
        handle: handle?.getBoundingClientRect().width ?? NaN,
      });
      setLayout(fits ? "column" : "floating");
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(workspace);
    return () => observer.disconnect();
  }, [setLayout]);

  const column = layout === "column";

  return (
    <div ref={rootRef} className="h-full min-h-0 min-w-0 overflow-hidden">
      <PanelSplit
        orientation="horizontal"
        sizedPane="secondary"
        storageKey="dsa:coach:column-width"
        resizable={column && open}
        resizeLabel="Resize editor and coach"
        primary={sandbox}
        primaryClassName={column ? "ide-editor-pane" : undefined}
        secondary={column ? open ? <CoachPanel variant="column" /> : <CoachStrip /> : null}
        secondaryClassName={column && open ? "coach-column" : undefined}
      />
      {column ? null : <CoachOverlay />}
    </div>
  );
}
