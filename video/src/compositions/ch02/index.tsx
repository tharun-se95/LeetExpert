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
import { GrowthRace, RaceCaption } from "./GrowthRace";
import { ScaleZoom } from "./ScaleZoom";
import { SpaceCargo } from "./SpaceCargo";
import { HiddenLoop } from "./HiddenLoop";

export const AUDIO_SRC = staticFile("voiceover/ch02-big-o.mp3");

const INTRO_FRAMES = 20;
const OUTRO_FRAMES = 75;
const FPS = 30;
const ACCENT = COLORS.accent;

const BEATS = [
  "Big O isn't a secret handshake. It's a capacity check: will this finish in time, for this input size?",
  "It measures how work grows as the input grows — not exact speed, just the shape of the curve.",
  "Picture four kinds of growth. Constant time — like opening a labeled toy box, you go straight there. Logarithmic — like guessing a number by always picking the middle, halving your search every time. Linear — like reading every email in your inbox, one by one. And quadratic — like every kid in a room shaking hands with every other kid. That last one explodes fast.",
  "Here's the gap that matters: linear and quadratic don't feel a little slower — they're a different universe. One walk down the line, versus walking the whole line again for every single person in it.",
  "A rule of thumb for interviews: if the input can be a hundred thousand items, aim for linear or n log n. If it's only twenty, trying everything might be fine.",
  "And don't forget space. Extra memory counts too — a hash map costs you room to save you time.",
  "One common trap: saying this is order n, while your code hides a nested loop inside it. Complexity is about what your code actually does — not the name of the pattern you meant to use.",
];

const Ch02Scenes: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const beats = timeBeats(
    BEATS.map((text) => ({ text })),
    durationInFrames - INTRO_FRAMES - OUTRO_FRAMES,
    INTRO_FRAMES,
  );
  const idx = activeBeatIndex(beats, frame);

  const raceStart = beats[0].from;
  const raceGrowStart = beats[2].from;
  const raceGrowEnd = beats[2].from + beats[2].durationInFrames;
  const gapStart = beats[3].from;
  const scaleStart = beats[4].from;
  const cargoStart = beats[5].from;
  const loopStart = beats[6].from;

  const raceN =
    frame < raceGrowStart
      ? 0
      : frame < raceGrowEnd
        ? interpolate(frame, [raceGrowStart, raceGrowEnd], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : 1;

  const gapLocal = frame - gapStart;
  const gapHighlight = Math.floor(gapLocal / 45) % 2 === 0 ? "linear" : "quad";

  const scaleN = interpolate(
    frame,
    [scaleStart, cargoStart - 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <>
      {frame < scaleStart ? (
        <>
          <GrowthRace n={raceN} highlightKey={idx === 3 ? gapHighlight : null} />
          {idx === 2 || idx === 3 ? (
            <RaceCaption
              text={idx === 3 ? "SAME SHAPE, DIFFERENT UNIVERSE" : "EXPLOSION"}
              color={idx === 3 ? ACCENT : COLORS.danger}
            />
          ) : null}
          {frame < raceStart + 40 ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 760,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <WordStamp
                text="CAPACITY CHECK"
                from={INTRO_FRAMES + 4}
                durationInFrames={raceStart + 40 - INTRO_FRAMES - 4}
                fontSize={56}
                gradient
              />
            </div>
          ) : null}
        </>
      ) : null}

      {frame >= scaleStart && frame < cargoStart ? (
        <ScaleZoom n={scaleN} accent={ACCENT} />
      ) : null}

      {frame >= cargoStart && frame < loopStart ? (
        <SpaceCargo accent={ACCENT} />
      ) : null}

      {frame >= loopStart ? <HiddenLoop accent={ACCENT} /> : null}

      <WipeFlash at={scaleStart} />
      <WipeFlash at={cargoStart} />
      <WipeFlash at={loopStart} />
    </>
  );
};

const Ch02Body: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <CinematicBackground accent={ACCENT} />
      <ChapterMark
        part="Part 1 — Foundations"
        chapter="Ch 2 · Big O"
        accent={ACCENT}
      />
      <Ch02Scenes durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};

export const Ch02BigO: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence from={INTRO_FRAMES} layout="none">
        <Audio src={AUDIO_SRC} />
      </Sequence>
      <Sequence  durationInFrames={durationInFrames - OUTRO_FRAMES}>
        <Ch02Body />
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

export const ch02CalculateMetadata: CalculateMetadataFunction<
  Record<string, unknown>
> = async () => {
  const durationInSeconds = await getAudioDuration(AUDIO_SRC);
  const audioFrames = Math.ceil(durationInSeconds * FPS);
  return {
    durationInFrames: INTRO_FRAMES + audioFrames + OUTRO_FRAMES,
  };
};
