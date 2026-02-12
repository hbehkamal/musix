"use client";

import Image from "next/image";
import { useRef, useState, useCallback } from "react";
import { Play, Pause, ChevronUp, Loader2 } from "lucide-react";
import { useNowPlaying } from "@/context/now-playing";
import { Cover, Info, ProgressBar, Controls } from "@/components/player";

const BAR_HEIGHT_PX = 64;

export function PlayerBottomSheet() {
  const {
    currentTrack,
    isPlaying,
    isExpanded,
    isLoadingAudio,
    setExpanded,
    setPlaying,
    toggleExpanded,
    playbackPositionSeconds,
  } = useNowPlaying();
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef(0);
  const dragStartExpanded = useRef(false);
  const didDrag = useRef(false);
  const pointerDownTarget = useRef<EventTarget | null>(null);
  const DRAG_THRESHOLD_PX = 10;

  const handleDragStart = useCallback(
    (clientY: number) => {
      dragStartY.current = clientY;
      dragStartExpanded.current = isExpanded;
      didDrag.current = false;
    },
    [isExpanded]
  );

  const handleDragMove = useCallback(
    (clientY: number) => {
      const delta = dragStartY.current - clientY; // drag up = positive
      if (Math.abs(delta) > DRAG_THRESHOLD_PX) didDrag.current = true;
      if (dragStartExpanded.current) {
        setDragOffset(Math.max(0, delta));
      } else {
        setDragOffset(Math.min(0, delta));
      }
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    const threshold = 80;
    if (dragStartExpanded.current) {
      setExpanded(dragOffset > threshold ? false : true);
    } else {
      setExpanded(dragOffset < -threshold ? true : false);
    }
    setDragOffset(0);
  }, [dragOffset, setExpanded]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!currentTrack) return;
      pointerDownTarget.current = e.target;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      handleDragStart(e.clientY);
    },
    [currentTrack, handleDragStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.buttons !== 1) return;
      handleDragMove(e.clientY);
    },
    [handleDragMove]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const wasButton = (pointerDownTarget.current as HTMLElement)?.closest?.(
        "button"
      );
      handleDragEnd();
      // Tap (no drag): toggle expand. Works for both mouse and touch.
      if (!didDrag.current && !wasButton) {
        toggleExpanded();
      }
    },
    [handleDragEnd, toggleExpanded]
  );

  if (!currentTrack) return null;

  const duration =
    currentTrack.durationSeconds > 0 ? currentTrack.durationSeconds : 1;
  const progress = Math.min(100, (playbackPositionSeconds / duration) * 100);

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <button
          type="button"
          aria-label="Close player"
          className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setExpanded(false)}
        />
      )}

      <div
        className="absolute bottom-0 left-0 right-0 z-50 flex flex-col overflow-hidden rounded-t-2xl border-t border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl transition-[height] duration-300 ease-out"
        style={{
          height: isExpanded
            ? `calc(100% - ${dragOffset}px)`
            : `${BAR_HEIGHT_PX - dragOffset}px`,
             marginBottom: isExpanded ? 0 : '69px'
        }}
      >
        {/* Minimal bar (always visible at top of sheet); acts as drag handle when expanded */}
        <div
          className="flex shrink-0 items-center gap-3 px-4 py-2"
          style={{ height: BAR_HEIGHT_PX }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleExpanded();
            }
          }}
          aria-label={isExpanded ? "Drag down to minimize" : "Drag up to expand"}
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
            {currentTrack.coverUrl ? (
              <Image
                src={currentTrack.coverUrl}
                alt=""
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-neutral-700" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {currentTrack.title}
            </p>
            <p className="truncate text-xs text-neutral-400">
              {currentTrack.artist}
            </p>
          </div>
          {isExpanded && (
            <div className="flex shrink-0 items-center justify-center">
              <ChevronUp className="h-5 w-5 rotate-180 text-neutral-400" strokeWidth={2} />
            </div>
          )}
          {!isExpanded && (
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-black hover:bg-emerald-300 disabled:opacity-80"
              aria-label={isLoadingAudio ? "Loading" : isPlaying ? "Pause" : "Play"}
              disabled={isLoadingAudio}
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoadingAudio) setPlaying(!isPlaying);
              }}
            >
              {isLoadingAudio ? (
                <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Play className="h-5 w-5 ml-0.5" strokeWidth={2} fill="currentColor" />
              )}
            </button>
          )}
        </div>

        {/* Full player (visible when expanded) */}
        {isExpanded && (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6">
            <div className="space-y-4 pt-2">
              <Cover
                coverUrl={currentTrack.coverUrl}
                title={currentTrack.title}
              />
              <Info
                title={currentTrack.title}
                artist={currentTrack.artist}
              />
              <ProgressBar
                progress={progress}
                positionSeconds={playbackPositionSeconds}
                durationSeconds={currentTrack.durationSeconds}
              />
              <Controls />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
