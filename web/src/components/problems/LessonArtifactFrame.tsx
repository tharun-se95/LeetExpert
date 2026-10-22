"use client";

import { ArtifactFrame } from "@/components/course/ArtifactFrame";
import type { LessonArtifact } from "@/lib/course/lessonArtifacts";

/**
 * Shows a lesson's interactive artifact inside the problem workspace tab.
 */
export function LessonArtifactFrame({ artifact }: { artifact: LessonArtifact }) {
  return <ArtifactFrame src={artifact.src} title={artifact.title} />;
}

/**
 * The workspace tab panel that holds the frame.
 */
export function LessonArtifactPanel({
  artifact,
  id,
  labelledBy,
}: {
  artifact: LessonArtifact;
  id: string;
  labelledBy: string;
}) {
  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      className="min-h-0 flex-1 overflow-hidden"
    >
      <LessonArtifactFrame artifact={artifact} />
    </div>
  );
}
