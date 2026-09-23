"use client";

import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import {
  CornersOut,
  Pause,
  Play,
  SpeakerHigh,
  SpeakerX,
} from "@phosphor-icons/react/dist/ssr";

interface VideoPlayerProps {
  src: string;
  ariaLabel: string;
  /**
   * Fill a positioned, fixed-aspect parent (the module hero) instead of sizing
   * to the video. The video covers the box, so a box that is not exactly 16:9
   * trims a sliver rather than showing letterbox bars.
   */
  fill?: boolean;
  /**
   * Shown over the video until playback first starts — the module art, whose
   * light/dark pair is switched in CSS, which a `<video poster>` URL cannot do.
   */
  poster?: ReactNode;
  /** Accessible name for the centre play button; defaults to "Play video". */
  playLabel?: string;
  /** Visible text of the corner play control shown with the poster. */
  posterCta?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * A minimal custom player: native browser chrome is hidden in favor of a
 * center play affordance and a hover-revealed control bar, matching the
 * site's flat, no-shadow visual language. Controls float over the video
 * itself, so this is one of the few places white/black are used directly
 * rather than through design tokens — see design-tokens.test.ts's allowlist
 * rationale for the same call made in ModuleMedia.tsx.
 */
export function VideoPlayer({
  src,
  ariaLabel,
  fill = false,
  poster,
  playLabel = "Play video",
  posterCta = "Play video",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function toggleFullscreen() {
    videoRef.current?.requestFullscreen?.();
  }

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = Number(e.target.value) * duration;
  }

  function onLoadedMetadata(e: SyntheticEvent<HTMLVideoElement>) {
    setDuration(e.currentTarget.duration);
  }

  // A server-rendered <video> starts fetching its metadata before hydration.
  // When that wins the race, `loadedmetadata` has already fired with no
  // listener attached and onLoadedMetadata never runs — measured on the module
  // hero: readyState 4, duration 82.77, yet no running time shown. Read the
  // value straight from the element once, on mount.
  useEffect(() => {
    const v = videoRef.current;
    if (v && v.readyState >= 1) setDuration(v.duration);
  }, []);

  const progress = duration ? currentTime / duration : 0;

  return (
    <div
      className={
        fill
          ? "group absolute inset-0 overflow-hidden bg-black"
          : "group relative overflow-hidden rounded-[length:var(--radius-md)] bg-black"
      }
    >
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        className={
          fill
            ? "block h-full w-full cursor-pointer object-cover"
            : "block max-h-[70vh] w-full cursor-pointer"
        }
        aria-label={ariaLabel}
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      />

      {poster && !started ? (
        <>
          {/* Before the first play the art IS the page hero: no dim, nothing
              centred over it. Clicking anywhere on it plays — a mouse
              convenience; the corner control below is the keyboard path. */}
          <div
            aria-hidden
            className="absolute inset-0 cursor-pointer"
            onClick={togglePlay}
          >
            {poster}
          </div>
          {/* Sits in the art's empty lower-left margin. Its accessible name
              starts with the visible text (WCAG 2.5.3), so a voice-control
              user can say what they see.
              Focus ring: the global :focus-visible outline, recoloured black
              and pulled just INSIDE the white pill. Outside, it sat on the art
              — an accent ring measured 3.10:1 on the dark plate and a gold
              family accent would fail — while black on white clears it for
              every module. It stays an outline rather than a `ring-*` utility,
              because rings draw with the shadow property and the unlayered
              .shadow-elevation rule overwrites it — that left the focused pill
              with no visible ring at all (measured).
              The `!`s are needed because globals.css's :focus-visible rule is
              unlayered, and its `border-radius: 2px` squared the pill's
              corners on focus. `transition-colors`, not bare `transition`,
              which also animated outline-color from the text colour. */}
          <button
            type="button"
            onClick={togglePlay}
            className="absolute bottom-5 left-5 inline-flex items-center gap-2.5 rounded-full bg-white/95 py-1.5 pr-4 pl-1.5 text-black shadow-elevation transition-colors hover:bg-white focus-visible:rounded-full! focus-visible:-outline-offset-2! focus-visible:outline-black! motion-reduce:transition-none"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
              <Play weight="fill" className="ml-0.5 h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-medium">{posterCta}</span>
            <span className="sr-only">: {ariaLabel}</span>
            {duration ? (
              <span className="font-mono text-xs tabular-nums text-black/60">
                {formatTime(duration)}
              </span>
            ) : null}
          </button>
        </>
      ) : null}

      {!playing && !(poster && !started) ? (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playLabel}
          className="absolute inset-0 flex items-center justify-center bg-black/15 transition hover:bg-black/25"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-black">
            <Play weight="fill" className="ml-0.5 h-6 w-6" />
          </span>
        </button>
      ) : null}

      {poster && !started ? null : (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2 pt-8 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="text-white"
          >
            {playing ? (
              <Pause weight="fill" className="h-4 w-4" />
            ) : (
              <Play weight="fill" className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={onSeek}
            aria-label="Seek"
            className="h-1 flex-1 cursor-pointer accent-white"
          />
          <span className="font-mono text-[11px] tabular-nums text-white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="text-white"
          >
            {muted ? (
              <SpeakerX weight="bold" className="h-4 w-4" />
            ) : (
              <SpeakerHigh weight="bold" className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            className="text-white"
          >
            <CornersOut weight="bold" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
