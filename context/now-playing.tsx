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
  setCurrentTrack: (track: NowPlayingTrack | null) => void;
  setPlaying: (playing: boolean) => void;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
};

const NowPlayingContext = createContext<NowPlayingContextValue | null>(null);

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<NowPlayingTrack | null>(null);
  const [isPlaying, setPlaying] = useState(false);
  const [isExpanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const value: NowPlayingContextValue = {
    currentTrack,
    isPlaying,
    isExpanded,
    setCurrentTrack,
    setPlaying,
    setExpanded,
    toggleExpanded,
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
