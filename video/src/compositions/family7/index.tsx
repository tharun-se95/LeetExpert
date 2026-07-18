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
import { S01TitleStorm, S02RuleHook, S03RuleClick } from "./scenes-intro";
import {
  S04PlatesForm,
  S05PlateDrop,
  S06SymbolsFeed,
  S07CountCheck,
  S08OrderBroken,
  S09StackResolves,
} from "./scenes-stack";
import {
  S10LineForms,
  S11FrontServed,
  S12NoCutting,
  S13UseCases,
  S14FifoExit,
} from "./scenes-queue";
import {
  S15ShelfForms,
  S16TopBest,
  S17ChallengerEnters,
  S18WeakestOut,
  S19SortXHeapGlow,
} from "./scenes-heap";
import {
  S20RowForms,
  S21TallerStepsIn,
  S22ShortersWaiting,
  S23PopResolve,
  S24SweepDone,
} from "./scenes-mono";
import {
  S25TreeForms,
  S26SharedBranch,
  S27WalkHighlight,
  S28FullScanX,
  S29SinglePathLit,
} from "./scenes-trie";
import { S30RecapRow, S31MatchShape, S32FinalStamp } from "./scenes-outro";
import timing from "./timing.json";

export const AUDIO_SRC = staticFile("voiceover/family7-priority-structures.mp3");

const INTRO_FRAMES = 20;
const OUTRO_FRAMES = 75;
const FPS = 30;
const ACCENT = BRUTAL.accent;

// Shot list, in narration order. Timing comes entirely from timing.json
// (word-level Scribe transcription of the real voiceover) — index i here
// must line up 1:1 with timing.sceneStartSec[i].
const SCENES: React.FC<SceneProps>[] = [
  S01TitleStorm,
  S02RuleHook,
  S03RuleClick,
  S04PlatesForm,
  S05PlateDrop,
  S06SymbolsFeed,
  S07CountCheck,
  S08OrderBroken,
  S09StackResolves,
  S10LineForms,
  S11FrontServed,
  S12NoCutting,
  S13UseCases,
  S14FifoExit,
  S15ShelfForms,
  S16TopBest,
  S17ChallengerEnters,
  S18WeakestOut,
  S19SortXHeapGlow,
  S20RowForms,
  S21TallerStepsIn,
  S22ShortersWaiting,
  S23PopResolve,
  S24SweepDone,
  S25TreeForms,
  S26SharedBranch,
  S27WalkHighlight,
  S28FullScanX,
  S29SinglePathLit,
  S30RecapRow,
  S31MatchShape,
  S32FinalStamp,
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

const Family7Body: React.FC = () => {
  const windows = layoutScenes();

  // Hard cuts at each pattern's opening scene: Stack, Queue, Heap, Mono, Trie, recap.
  const cutIndices = [3, 9, 14, 19, 24, 29];

  return (
    <AbsoluteFill>
      <BrutalBackground accent={ACCENT} />
      <BrutalChapterMark
        part="Part 2 — Pattern Families"
        chapter="Family 7 · Priority Structures"
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

export const Family7PriorityStructures: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence from={INTRO_FRAMES} layout="none">
        <Audio src={AUDIO_SRC} />
      </Sequence>
      <Sequence durationInFrames={durationInFrames - OUTRO_FRAMES}>
        <Family7Body />
      </Sequence>
      <Sequence
        from={durationInFrames - OUTRO_FRAMES}
        durationInFrames={OUTRO_FRAMES}
      >
        <BrutalOutroCard accent={ACCENT} subtitle="Priority Structures — Family 7" />
      </Sequence>
    </AbsoluteFill>
  );
};

export const family7CalculateMetadata: CalculateMetadataFunction<
  Record<string, unknown>
> = async () => {
  const durationInSeconds = await getAudioDuration(AUDIO_SRC);
  const audioFrames = Math.ceil(durationInSeconds * FPS);
  return {
    durationInFrames: INTRO_FRAMES + audioFrames + OUTRO_FRAMES,
  };
};
