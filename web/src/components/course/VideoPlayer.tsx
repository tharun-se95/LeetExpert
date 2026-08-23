"use client";

import { useRef, useState, type SyntheticEvent } from "react";
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
export function VideoPlayer({ src, ariaLabel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
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

  const progress = duration ? currentTime / duration : 0;

  return (
    <div className="group relative overflow-hidden rounded-[length:var(--radius-md)] bg-black">
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        className="block max-h-[70vh] w-full cursor-pointer"
        aria-label={ariaLabel}
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      />

      {!playing ? (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-black/15 transition hover:bg-black/25"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-black">
            <Play weight="fill" className="ml-0.5 h-6 w-6" />
          </span>
        </button>
      ) : null}

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
    </div>
  );
}
