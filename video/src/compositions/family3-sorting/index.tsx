import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { getAudioDuration } from "../../lib/get-audio-duration";
import { BrutalBackground, BrutalChapterMark, BrutalOutroCard, SlamCut } from "../../lib/brutalist";
import { BRUTAL } from "../../lib/theme";
import { type SceneProps } from "./bits";
import { S01Hook, S02Title } from "./scenes-hook";
import { S03BlocksAppear, S04OverlapGlow } from "./scenes-problem";
import { S05NaiveWeb, S06FortyFive, S07FiftyMillion, S08CantSee } from "./scenes-naive";
import {
  S09Align,
  S10SortSnap,
  S11NeighborsOnly,
  S12WalkCursor,
  S13Merge,
  S14NewBlock,
  S15Done,
} from "./scenes-click";
import {
  S16Pipeline,
  S17Anagram,
  S18TwoPointer,
  S19ColorsShuffle,
  S20ColorsPartition,
} from "./scenes-generalize";
import {
  S21Warning,
  S22HashMapSetup,
  S23WastedTax,
  S24BinaryIntro,
  S25SpeedExample,
  S26NotSortScan,
  S27Staircase,
} from "./scenes-misuse";
import { S28NotMemorizing, S29OrderWins } from "./scenes-outro";
import timing from "./timing.json";

export const AUDIO_SRC = staticFile("voiceover/family3-sorting.mp3");

const INTRO_FRAMES = 20;
const OUTRO_FRAMES = 75;
const FPS = 30;
const ACCENT = BRUTAL.accent;

// Shot list, in narration order. Timing comes entirely from timing.json
// (word-level Scribe transcription of the real voiceover) — index i here
// must line up 1:1 with timing.sceneStartSec[i].
const SCENES: React.FC<SceneProps>[] = [
  S01Hook,
  S02Title,
  S03BlocksAppear,
  S04OverlapGlow,
  S05NaiveWeb,
  S06FortyFive,
  S07FiftyMillion,
  S08CantSee,
  S09Align,
  S10SortSnap,
  S11NeighborsOnly,
  S12WalkCursor,
  S13Merge,
  S14NewBlock,
  S15Done,
  S16Pipeline,
  S17Anagram,
  S18TwoPointer,
  S19ColorsShuffle,
  S20ColorsPartition,
  S21Warning,
  S22HashMapSetup,
  S23WastedTax,
  S24BinaryIntro,
  S25SpeedExample,
  S26NotSortScan,
  S27Staircase,
  S28NotMemorizing,
  S29OrderWins,
];

function layoutScenes() {
  const frames = timing.sceneStartSec.map(
    (s) => INTRO_FRAMES + Math.round(s * FPS),
  );
  const audioEndFrame = INTRO_FRAMES + Math.round(timing.audioEndSec * FPS);
  return SCENES.map((Comp, i) => ({
    from: frames[i],
    dur: (i === SCENES.length - 1 ? audioEndFrame : frames[i + 1]) - frames[i],
    Comp,
  }));
}

const Family3SortingBody: React.FC = () => {
  const windows = layoutScenes();

  // Hard cuts at each section's opening scene: problem, naive, click, generalize, misuse, outro.
  const cutIndices = [2, 4, 8, 15, 20, 27];

  return (
    <AbsoluteFill>
      <BrutalBackground accent={ACCENT} />
      <BrutalChapterMark
        part="Part 2 — Pattern Families"
        chapter="Family 3 · Sorting"
        accent={ACCENT}
      />
      {windows.map(({ from, dur, Comp }, i) => (
        <Sequence key={i} from={from} durationInFrames={dur}>
          <Comp dur={dur} />
        </Sequence>
      ))}
      {cutIndices.map((idx) => (
        <SlamCut key={idx} at={windows[idx].from} />
      ))}
    </AbsoluteFill>
  );
};

export const Family3Sorting: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence from={INTRO_FRAMES} layout="none">
        <Audio src={AUDIO_SRC} />
      </Sequence>
      <Sequence durationInFrames={durationInFrames - OUTRO_FRAMES}>
        <Family3SortingBody />
      </Sequence>
      <Sequence
        from={durationInFrames - OUTRO_FRAMES}
        durationInFrames={OUTRO_FRAMES}
      >
        <BrutalOutroCard accent={ACCENT} subtitle="Sorting — Family 3, Ordering & Search" />
      </Sequence>
    </AbsoluteFill>
  );
};

export const family3SortingCalculateMetadata: CalculateMetadataFunction<
  Record<string, unknown>
> = async () => {
  const durationInSeconds = await getAudioDuration(AUDIO_SRC);
  const audioFrames = Math.ceil(durationInSeconds * FPS);
  return {
    durationInFrames: INTRO_FRAMES + audioFrames + OUTRO_FRAMES,
  };
};
