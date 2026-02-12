"use client";

import { useRef, useEffect } from "react";
import { useNowPlaying } from "@/context/now-playing";

/**
 * Hidden <audio> element driven by now-playing context.
 * Plays when isPlaying and currentTrack.audioUrl are set; updates playback position.
 */
export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastAudioUrlRef = useRef<string | null>(null);
  const {
    currentTrack,
    isPlaying,
    setPlaying,
    setPlaybackPositionSeconds,
    setLoadingAudio,
  } = useNowPlaying();

  const audioUrl = currentTrack?.audioUrl ?? null;

  // Sync src and play/pause when track or isPlaying changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioUrl) {
      lastAudioUrlRef.current = null;
      setPlaying(false);
      setLoadingAudio(false);
      return;
    }

    if (lastAudioUrlRef.current !== audioUrl) {
      lastAudioUrlRef.current = audioUrl;
      audio.pause();
      audio.removeAttribute("src");
      audio.src = audioUrl;
      audio.load();
      setPlaybackPositionSeconds(0);
    }

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise?.then) {
        playPromise.then(() => setLoadingAudio(false)).catch((err: unknown) => {
          console.warn("Audio play failed:", err);
          setPlaying(false);
          setLoadingAudio(false);
        });
      } else {
        setLoadingAudio(false);
      }
    } else {
      audio.pause();
      setLoadingAudio(false);
    }
  }, [audioUrl, isPlaying, setPlaying, setPlaybackPositionSeconds, setLoadingAudio]);

  // Reset position when track is cleared
  useEffect(() => {
    if (!currentTrack) {
      setPlaybackPositionSeconds(0);
    }
  }, [currentTrack, setPlaybackPositionSeconds]);

  return (
    <audio
      key={audioUrl ?? "no-track"}
      ref={audioRef}
      className="hidden"
      onTimeUpdate={(e) => {
        const t = (e.target as HTMLAudioElement).currentTime;
        if (Number.isFinite(t)) setPlaybackPositionSeconds(t);
      }}
      onEnded={() => {
        setPlaying(false);
        setLoadingAudio(false);
      }}
      onError={() => {
        setPlaying(false);
        setLoadingAudio(false);
      }}
    />
  );
}
