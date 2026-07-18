import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { getAudioDuration } from "../../lib/get-audio-duration";
import { timeBeats, activeBeatIndex } from "../../lib/beats";
import { CinematicBackground, ChapterMark, WordStamp } from "../../lib/cinematic";
import { WipeFlash } from "../../lib/wipe";
import { OutroCard } from "../../lib/shared";
import { COLORS } from "../../lib/theme";
import { Constellation } from "./Constellation";
import { WindowSlide } from "./WindowSlide";
import { KeywordMorph, pairCount } from "./KeywordMorph";
import { DualHome } from "./DualHome";

export const AUDIO_SRC = staticFile("voiceover/ch03-pattern-recognition.mp3");

const INTRO_FRAMES = 20;
const OUTRO_FRAMES = 75;
const FPS = 30;
const ACCENT = COLORS.accent;

const BEATS = [
  "Thousands of interview questions. Only seven families.",
  "Longest substring, max sum of size K, fruits in baskets — different stories, same move underneath: keep a window, and slide it.",
  "That's the whole idea behind pattern recognition. Once you name the family, the shape of the solution is basically decided.",
  "Think of it like a map with seven biomes. A new question shows up — first ask which biome you're in, then open that walkthrough.",
  "Contiguous stretch with a rule? Sliding window. Sorted array, ends walking inward? Two pointers. Nodes and edges, friends and roads? Graph traversal. Overlapping smaller answers? Dynamic programming.",
  "Read the question twice. Once for the story. Once for the structure. Structure wins, every time.",
  "Some questions honestly sit on two patterns at once. Top K Frequent: a hash map counts, a heap picks the winners. Learn it deep once, in one home — then just remember where the other pattern helps.",
  "You're not inventing a famous algorithm under pressure. You're searching a small catalog you already know — and picking the one that fits.",
];

const Ch03Scenes: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const beats = timeBeats(
    BEATS.map((text) => ({ text })),
    durationInFrames - INTRO_FRAMES - OUTRO_FRAMES,
    INTRO_FRAMES,
  );
  const idx = activeBeatIndex(beats, frame);

  const windowStart = beats[1].from;
  const windowEnd = beats[1].from + beats[1].durationInFrames;
  const mapRevealStart = beats[3].from;
  const mapRevealEnd = beats[3].from + beats[3].durationInFrames;
  const morphStart = beats[4].from;
  const morphEnd = beats[4].from + beats[4].durationInFrames;
  const dualStart = beats[6].from;
  const dualEnd = beats[7].from;

  const mapActiveIndex =
    frame < mapRevealStart
      ? -1
      : frame < mapRevealEnd
        ? Math.floor(
            interpolate(frame, [mapRevealStart, mapRevealEnd], [0, 6.9], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          )
        : 7;

  const morphProgress = interpolate(frame, [morphStart, morphEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const morphPair = Math.min(pairCount - 1, Math.floor(morphProgress * pairCount));
  const morphLocal = (morphProgress * pairCount) % 1;

  const showConstellation =
    frame < windowStart ||
    (frame >= windowEnd && frame < morphStart) ||
    (frame >= morphEnd && frame < dualStart) ||
    frame >= dualEnd;

  return (
    <>
      {showConstellation ? (
        <Constellation
          activeIndex={
            frame >= dualEnd
              ? 7
              : frame >= mapRevealStart
                ? mapActiveIndex
                : -1
          }
        />
      ) : null}

      {frame < windowStart ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 720,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <WordStamp
            text="ONLY SEVEN FAMILIES"
            from={INTRO_FRAMES + 4}
            durationInFrames={windowStart - INTRO_FRAMES - 4}
            fontSize={56}
            gradient
          />
        </div>
      ) : null}

      {frame >= windowStart && frame < windowEnd ? (
        <WindowSlide accent={ACCENT} />
      ) : null}

      {frame >= morphStart && frame < morphEnd ? (
        <KeywordMorph pairIndex={morphPair} local={morphLocal} />
      ) : null}

      {frame >= dualStart && idx === 6 ? <DualHome /> : null}

      <WipeFlash at={windowStart} />
      <WipeFlash at={windowEnd} />
      <WipeFlash at={morphStart} />
      <WipeFlash at={dualStart} />
      <WipeFlash at={dualEnd} />
    </>
  );
};

const Ch03Body: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <CinematicBackground accent={ACCENT} />
      <ChapterMark
        part="Part 1 — Foundations"
        chapter="Ch 3 · Pattern Recognition"
        accent={ACCENT}
      />
      <Ch03Scenes durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};

export const Ch03PatternRecognition: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence from={INTRO_FRAMES} layout="none">
        <Audio src={AUDIO_SRC} />
      </Sequence>
      <Sequence  durationInFrames={durationInFrames - OUTRO_FRAMES}>
        <Ch03Body />
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

export const ch03CalculateMetadata: CalculateMetadataFunction<
  Record<string, unknown>
> = async () => {
  const durationInSeconds = await getAudioDuration(AUDIO_SRC);
  const audioFrames = Math.ceil(durationInSeconds * FPS);
  return {
    durationInFrames: INTRO_FRAMES + audioFrames + OUTRO_FRAMES,
  };
};
