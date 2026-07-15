"use client";

import { ArrayStrip } from "@/components/lab/primitives/ArrayStrip";
import { PointerMarkers } from "@/components/lab/primitives/PointerMarkers";
import type { PatternDemoModule } from "@/lib/visual/types";

const VALUES = [2, 7, 11, 15];

/**
 * Temporary flagship-shaped shell so every manifest pattern has a playable
 * Stage (≥4 steps, labeled cells, highlight motion) until storyboarded demos land.
 */
export function createPlaceholderDemo(
  id: string,
  title: string,
): PatternDemoModule {
  const steps = [
    {
      caption: `${title}: lay the input out as addressable tiles.`,
      announce: `Start with array ${VALUES.join(", ")}`,
    },
    {
      caption: "Visit by address — highlight the first useful cell.",
      announce: "Highlight index 0",
    },
    {
      caption: "Walk the highlight forward; each cell earns one look.",
      announce: "Highlight index 1",
    },
    {
      caption: "Mark a window over the slice that matters — idea locked.",
      announce: "Show window from 0 to 2 with left and right markers",
    },
  ];

  return {
    id,
    title,
    microExample: `arr = [${VALUES.join(", ")}]  ·  placeholder walkthrough`,
    steps,
    StepView: ({ step, accent }) => {
      const highlights =
        step <= 0 ? [] : step === 1 ? [0] : step === 2 ? [1] : [0, 1, 2];
      const win = step >= 3 ? { start: 0, end: 2 } : undefined;
      const pointers =
        step >= 3
          ? [
              { index: 0, label: "L", color: accent },
              { index: 2, label: "R", color: accent },
            ]
          : step === 1
            ? [{ index: 0, label: "i", color: accent }]
            : step === 2
              ? [{ index: 1, label: "i", color: accent }]
              : [];

      return (
        <div className="w-full max-w-md px-2">
          <ArrayStrip
            values={VALUES}
            highlights={highlights}
            window={win}
            accent={accent}
          />
          {pointers.length > 0 ? (
            <PointerMarkers
              length={VALUES.length}
              pointers={pointers}
              accent={accent}
            />
          ) : (
            <div className="h-9" aria-hidden />
          )}
        </div>
      );
    },
    StaticFrame: ({ accent }) => (
      <div className="w-full max-w-md px-2">
        <ArrayStrip
          values={VALUES}
          highlights={[0, 1, 2]}
          window={{ start: 0, end: 2 }}
          accent={accent}
        />
        <PointerMarkers
          length={VALUES.length}
          pointers={[
            { index: 0, label: "L", color: accent },
            { index: 2, label: "R", color: accent },
          ]}
          accent={accent}
        />
      </div>
    ),
  };
}
