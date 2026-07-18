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
import { CinematicBackground, ChapterMark } from "../../lib/cinematic";
import { WipeFlash } from "../../lib/wipe";
import { OutroCard } from "../../lib/shared";
import { COLORS } from "../../lib/theme";
import { type SceneProps } from "./bits";
import { S01TitleStorm, S02FreezeLock, S03PipelineWhip } from "./scenes-intro";
import {
  S04Crush,
  S05Loader,
  S06DoubleWork,
  S07Choke,
  S08Select,
  S09MapFlash,
  S10WindowWhip,
} from "./scenes-method";
import {
  S11TwoSumIntro,
  S12PairStorm,
  S13Counter,
  S14Questions,
  S15MapSnap,
  S16OnePass,
} from "./scenes-twosum";
import {
  S17Alarm,
  S18Glitch,
  S19Broken,
  S20Distill,
  S21ZoomOut,
} from "./scenes-trap";
import timing from "./timing.json";

export const AUDIO_SRC = staticFile("voiceover/ch01-solving-problems.mp3");

const INTRO_FRAMES = 20;
const OUTRO_FRAMES = 75;
const FPS = 30;
const ACCENT = COLORS.accent;

// Shot list, in narration order. Timing comes entirely from timing.json
// (word-level Scribe transcription of the real voiceover) — index i here
// must line up 1:1 with timing.sceneStartSec[i].
const SCENES: React.FC<SceneProps>[] = [
  S01TitleStorm,
  S02FreezeLock,
  S03PipelineWhip,
  S04Crush,
  S05Loader,
  S06DoubleWork,
  S07Choke,
  S08Select,
  S09MapFlash,
  S10WindowWhip,
  S11TwoSumIntro,
  S12PairStorm,
  S13Counter,
  S14Questions,
  S15MapSnap,
  S16OnePass,
  S17Alarm,
  S18Glitch,
  S19Broken,
  S20Distill,
  S21ZoomOut,
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

const Ch01Body: React.FC = () => {
  const windows = layoutScenes();

  return (
    <AbsoluteFill>
      <CinematicBackground accent={ACCENT} />
      <ChapterMark
        part="Part 1 — Foundations"
        chapter="Ch 1 · Solving Problems"
        accent={ACCENT}
      />
      {windows.map(({ from, dur, Comp }, i) => (
        <Sequence key={i} from={from} durationInFrames={dur}>
          <Comp dur={dur} />
        </Sequence>
      ))}
      <WipeFlash at={windows[3].from} />
      <WipeFlash at={windows[10].from} />
      <WipeFlash at={windows[16].from} />
      <WipeFlash at={windows[20].from} />
    </AbsoluteFill>
  );
};

export const Ch01SolvingProblems: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence from={INTRO_FRAMES} layout="none">
        <Audio src={AUDIO_SRC} />
      </Sequence>
      <Sequence durationInFrames={durationInFrames - OUTRO_FRAMES}>
        <Ch01Body />
      </Sequence>
      <Sequence
        from={durationInFrames - OUTRO_FRAMES}
        durationInFrames={OUTRO_FRAMES}
      >
        <OutroCard accent={ACCENT} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const ch01CalculateMetadata: CalculateMetadataFunction<
  Record<string, unknown>
> = async () => {
  const durationInSeconds = await getAudioDuration(AUDIO_SRC);
  const audioFrames = Math.ceil(durationInSeconds * FPS);
  return {
    durationInFrames: INTRO_FRAMES + audioFrames + OUTRO_FRAMES,
  };
};
