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
 * An inline audio control sized to sit in the lesson header's meta row
 * (next to the type badge and reading time) instead of its own card — but
 * deliberately given its own accent-tinted pill, not folded into the plain
 * meta text, since "listen to this lesson" is a selling point worth
 * noticing, not a footnote. Text stays `text-mark` (AA-safe body ink) per
 * the design system; only the icon fill and pill chrome carry `--accent`.
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
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.08] py-1 pr-3 pl-1 transition hover:border-accent/50 hover:bg-accent/[0.14]">
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
        className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-on-pop transition hover:scale-105 motion-reduce:hover:scale-100"
      >
        {playing ? (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-accent/50 motion-reduce:hidden"
          />
        ) : null}
        {playing ? (
          <Pause weight="fill" className="h-3.5 w-3.5" />
        ) : (
          <Play weight="fill" className="ml-0.5 h-3.5 w-3.5" />
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
      <span className="font-mono text-xs font-medium tabular-nums text-mark">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </span>
  );
}
