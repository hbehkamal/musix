"use client";

import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat } from "lucide-react";
import { useNowPlaying } from "@/context/now-playing";

export default function Controls() {
  const { isPlaying, setPlaying } = useNowPlaying();

  return (
    <div className="flex items-center justify-between px-3 pt-1 text-neutral-100">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 hover:bg-white/5"
        aria-label="Shuffle"
      >
        <Shuffle className="h-4 w-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-200 hover:bg-white/5"
        aria-label="Previous"
      >
        <SkipBack className="h-5 w-5" strokeWidth={2} />
      </button>
      <button
        type="button"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-black shadow-[0_10px_30px_rgba(34,197,94,0.5)] hover:bg-emerald-300"
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={() => setPlaying(!isPlaying)}
      >
        {isPlaying ? (
          <Pause className="h-7 w-7" strokeWidth={2} />
        ) : (
          <Play className="h-7 w-7 ml-0.5" strokeWidth={2} fill="currentColor" />
        )}
      </button>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-200 hover:bg-white/5"
        aria-label="Next"
      >
        <SkipForward className="h-5 w-5" strokeWidth={2} />
      </button>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 hover:bg-white/5"
        aria-label="Repeat"
      >
        <Repeat className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}