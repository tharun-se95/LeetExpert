"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react/dist/ssr";

interface AudioMiniProps {
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
 * An inline, borderless audio control sized to sit in the lesson header's
 * meta row (next to the type badge and reading time) instead of its own
 * card — "listen to this lesson" as a lightweight affordance, not a widget.
 */
export function AudioMini({ src, ariaLabel }: AudioMiniProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  }

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const a = audioRef.current;
    if (!a || !duration) return;
    a.currentTime = Number(e.target.value) * duration;
  }

  const progress = duration ? currentTime / duration : 0;

  return (
    <span className="inline-flex items-center gap-2">
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        aria-label={ariaLabel}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        className="hidden"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause lesson audio" : "Listen to this lesson"}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent transition hover:bg-accent/10"
      >
        {playing ? (
          <Pause weight="fill" className="h-3 w-3" />
        ) : (
          <Play weight="fill" className="ml-0.5 h-3 w-3" />
        )}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={progress}
        onChange={onSeek}
        aria-label="Seek audio"
        className="h-1 w-24 cursor-pointer accent-accent sm:w-32"
      />
      <span className="font-mono text-xs tabular-nums text-muted">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </span>
  );
}
