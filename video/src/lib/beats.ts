export interface Beat {
  text: string;
}

export interface TimedBeat extends Beat {
  from: number;
  durationInFrames: number;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Distributes `availableFrames` across beats proportionally to each beat's
 * word count. This is a lightweight stand-in for word-level ASR timing: the
 * narration audio and the beat text come from the same script, so word-count
 * weighting tracks spoken duration closely enough for caption-sized text.
 */
export function timeBeats(
  beats: Beat[],
  availableFrames: number,
  startFrame: number,
): TimedBeat[] {
  const counts = beats.map((b) => wordCount(b.text));
  const total = counts.reduce((a, b) => a + b, 0);

  let cursor = startFrame;
  return beats.map((beat, i) => {
    const durationInFrames = Math.round(
      (counts[i] / total) * availableFrames,
    );
    const timed = { ...beat, from: cursor, durationInFrames };
    cursor += durationInFrames;
    return timed;
  });
}

/** Index of the beat active at `frame` (clamped to the last beat once finished). */
export function activeBeatIndex(beats: TimedBeat[], frame: number): number {
  const idx = beats.findIndex(
    (b) => frame >= b.from && frame < b.from + b.durationInFrames,
  );
  if (idx !== -1) return idx;
  return frame < beats[0].from ? 0 : beats.length - 1;
}
