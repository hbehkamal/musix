"use client";

import { useDebounce } from "@/hooks/useDebounce";
import {
  useSongs,
  flattenSongsPages,
  type SongsPageResult,
} from "@/hooks/useSongs";
import { getDurationDisplay, type Song } from "@/types/song";
import { useRef, useEffect, useState } from "react";
import { Search, Play, Download, Plus } from "lucide-react";
import { useNowPlaying } from "@/context/now-playing";

const PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_COVER = "/default-cover.jpeg";

function SongRow({
  song,
  onPlay,
}: {
  song: Song;
  onPlay: (song: Song) => void;
}) {
  const hasDownload = song.id != null;
  const duration = getDurationDisplay(song);

  return (
    <div className="flex items-center gap-2 border-b border-white/5 py-2.5 last:border-0"
    onClick={() => onPlay(song)}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{song.title}</p>
        <p className="truncate text-xs text-neutral-400">
          {song.artist}
          {song.album ? ` · ${song.album}` : ""}
        </p>
      </div>
      <span className="shrink-0 text-[11px] text-neutral-500 tabular-nums">
        {duration}
      </span>
      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 rounded-lg bg-emerald-500/20 p-1.5 text-emerald-400 hover:bg-emerald-500/30"
        aria-label={`Play ${song.title}`}
      >
        <Plus className="h-4 w-4" strokeWidth={2} fill="currentColor" />
      </button>
      {hasDownload ? (
        <a
          href={`/api/songs/download/${song.id}`}
          download
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 rounded-lg bg-emerald-500/20 px-2 py-1.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/30"
        >
          <Download className="h-4 w-4" strokeWidth={2} fill="currentColor" />
        </a>
      ) : (
        <span className="w-14 shrink-0" />
      )}
    </div>
  );
}

function LoadMoreSentinel({
  onVisible,
  hasNextPage,
  isFetchingNextPage,
}: {
  onVisible: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onVisible();
      },
      { rootMargin: "100px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, hasNextPage, isFetchingNextPage]);

  if (!hasNextPage) return null;
  return <div ref={ref} className="h-4" aria-hidden />;
}

export default function HomePage() {
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);
  const { setCurrentTrack, setPlaying, setLoadingAudio } = useNowPlaying();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSongs({ searchTerm, perPage: PER_PAGE });

  const songs = flattenSongsPages(
    data as { pages: SongsPageResult[] } | undefined
  );

  const handlePlay = (song: Song) => {
    console.log("🔴🔴🔴 handlePlay", song);
    const durationSeconds = typeof song.duration === "number" ? song.duration : 0;
    const audioUrl =
      song.id != null ? `/api/songs/download/${song.id}` : undefined;
    setCurrentTrack({
      title: song.title,
      artist: song.artist,
      coverUrl: DEFAULT_COVER,
      positionSeconds: 0,
      durationSeconds: durationSeconds || 0,
      audioUrl,
    });
    const willPlay = Boolean(audioUrl);
    setPlaying(willPlay);
    if (willPlay) setLoadingAudio(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold tracking-tight text-white">
          Discover
        </h2>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
          strokeWidth={2}
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title…"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
          aria-label="Search songs by title"
        />
      </div>

      <div className="min-h-[220px] flex-1 min-w-0 overflow-x-hidden overflow-y-auto rounded-xl border border-white/5 bg-black/30 px-2">
        {isLoading && (
          <div className="flex items-center justify-center py-8 text-sm text-neutral-400">
            Loading…
          </div>
        )}
        {isError && (
          <div className="py-4 text-center text-sm text-red-400">
            {error?.message ?? "Failed to load songs"}
          </div>
        )}
        {!isLoading && !isError && songs.length === 0 && (
          <div className="py-8 text-center text-sm text-neutral-400">
            No songs found.
          </div>
        )}
        {!isLoading && !isError && songs.length > 0 && (
          <>
            <div className="sticky top-0 z-10 flex gap-2 border-b border-white/10 bg-black/50 py-2 text-[10px] uppercase tracking-wider text-neutral-500 backdrop-blur-sm">
              <span className="flex-1">Title / Artist</span>
              <span className="w-10 shrink-0 text-right">Time</span>
              <span className="w-16 shrink-0 text-right">Download</span>
            </div>
            {songs.map((song) => (
              <SongRow key={String(song.id)} song={song} onPlay={handlePlay} />
            ))}
            <LoadMoreSentinel
              onVisible={() => fetchNextPage()}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
            {isFetchingNextPage && (
              <div className="py-2 text-center text-[11px] text-neutral-500">
                Loading more…
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
