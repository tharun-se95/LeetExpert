"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { PanelSplit } from "@/components/problems/PanelSplit";
import { coachColumnFits, lengthToPx } from "@/lib/coach/coachColumn";
import { CoachOverlay } from "./CoachOverlay";
import { CoachPanel } from "./CoachPanel";
import { useCoach } from "./CoachProvider";

/**
 * The sandbox with its coach. On a workspace wide enough to hold it
 * (lib/coach/coachColumn.ts) the coach is a column beside the editor. Collapsed,
 * it leaves the layout and the floating launcher brings it back (a strip at the
 * edge was tried and withdrawn, owner 2026-09-17); on a narrower workspace the
 * coach floats over the IDE as before. The sandbox is
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
    // The browser's default text size (font-size: medium), which the app's
    // root equals on its roomiest layout. Read once: it changes only in the
    // browser's own settings, which reload the page.
    const probe = document.createElement("div");
    probe.style.fontSize = "medium";
    document.body.append(probe);
    const defaultRootPx = parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    const measure = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      const rootPx = parseFloat(rootStyle.fontSize);
      const description = workspace.querySelector<HTMLElement>(".problem-description-pane");
      const handle = workspace.querySelector<HTMLElement>("[data-split-handle]");
      const fits = coachColumnFits({
        workspace: workspace.getBoundingClientRect().width,
        rootPx,
        defaultRootPx,
        descriptionCap: description ? parseFloat(getComputedStyle(description).maxWidth) : NaN,
        codeSize: lengthToPx(rootStyle.getPropertyValue("--code-size"), rootPx),
        editorColumns: Number(rootStyle.getPropertyValue("--ide-editor-columns")),
        coachMinRem: lengthToPx(rootStyle.getPropertyValue("--coach-column-min"), 1),
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
        resizeLabel="Resize editor and coach"
        primary={sandbox}
        primaryClassName={column && open ? "ide-editor-pane" : undefined}
        secondary={column && open ? <CoachPanel variant="column" /> : null}
        secondaryClassName="coach-column"
      />
      {/*
        Always mounted: it shows the launcher whenever the coach is closed and
        the floating panel only in floating layout (CoachOverlay).
      */}
      <CoachOverlay />
    </div>
  );
}
