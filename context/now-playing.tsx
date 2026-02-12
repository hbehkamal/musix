"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { NowPlayingTrack } from "@/types/now-playing";

type NowPlayingContextValue = {
  currentTrack: NowPlayingTrack | null;
  isPlaying: boolean;
  isExpanded: boolean;
  /** True while audio is loading after user requested play */
  isLoadingAudio: boolean;
  /** Current playback position in seconds (updated by audio element) */
  playbackPositionSeconds: number;
  setCurrentTrack: (track: NowPlayingTrack | null) => void;
  setPlaying: (playing: boolean) => void;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
  setLoadingAudio: (loading: boolean) => void;
  setPlaybackPositionSeconds: (seconds: number) => void;
};

const NowPlayingContext = createContext<NowPlayingContextValue | null>(null);

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<NowPlayingTrack | null>(null);
  const [isPlaying, setPlaying] = useState(false);
  const [isExpanded, setExpanded] = useState(false);
  const [isLoadingAudio, setLoadingAudio] = useState(false);
  const [playbackPositionSeconds, setPlaybackPositionSeconds] = useState(0);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const value: NowPlayingContextValue = {
    currentTrack,
    isPlaying,
    isExpanded,
    isLoadingAudio,
    playbackPositionSeconds,
    setCurrentTrack,
    setPlaying,
    setExpanded,
    toggleExpanded,
    setLoadingAudio,
    setPlaybackPositionSeconds,
  };

  return (
    <NowPlayingContext.Provider value={value}>
      {children}
    </NowPlayingContext.Provider>
  );
}

export function useNowPlaying() {
  const ctx = useContext(NowPlayingContext);
  if (!ctx) {
    throw new Error("useNowPlaying must be used within NowPlayingProvider");
  }
  return ctx;
}
