"use client";

import { useDebounce } from "@/hooks/useDebounce";
import {
  useSongs,
  flattenSongsPages,
  type SongsPageResult,
} from "@/hooks/useSongs";
import {
  usePlaylists,
  flattenPlaylistsPages,
  useAddSongToPlaylist,
  type PlaylistsPageResult,
} from "@/hooks/usePlaylists";
import type { Playlist } from "@/types/playlist";
import { getDurationDisplay, type Song } from "@/types/song";
import { useRef, useEffect, useState } from "react";
import { Search, Download, ListMusic, Loader2 } from "lucide-react";
import { useNowPlaying } from "@/context/now-playing";

const PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_COVER = "/default-cover.jpeg";

function SongRow({
  song,
  onPlay,
  playlists,
  onAddToPlaylist,
  addToPlaylistState,
}: {
  song: Song;
  onPlay: (song: Song) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: number, songId: number) => void;
  addToPlaylistState?: { playlistId: number; songId: number } | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasDownload = song.id != null;
  const duration = getDurationDisplay(song);
  const songId = typeof song.id === "number" ? song.id : parseInt(String(song.id), 10);
  const isAdding =
    addToPlaylistState?.songId === songId && Number.isFinite(songId);

  return (
    <div
      className="flex items-center gap-2 border-b border-white/5 py-2.5 last:border-0"
      onClick={() => onPlay(song)}
    >
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
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
          className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-400 hover:bg-emerald-500/30"
          aria-label={`Add ${song.title} to playlist`}
        >
          <ListMusic className="h-4 w-4" strokeWidth={2} />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              aria-hidden
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-1 max-h-48 min-w-[160px] overflow-y-auto rounded-lg border border-white/10 bg-black/90 py-1 shadow-xl backdrop-blur-md">
              {playlists.length === 0 ? (
                <p className="px-3 py-2 text-xs text-neutral-500">
                  No playlists. Create one first.
                </p>
              ) : (
                playlists.map((pl) => {
                  const adding = isAdding && addToPlaylistState?.playlistId === pl.id;
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlaylist(pl.id, songId);
                        setMenuOpen(false);
                      }}
                      disabled={isAdding}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      {adding ? (
                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                      ) : (
                        <span className="w-3.5 shrink-0" />
                      )}
                      <span className="truncate">{pl.title || "Untitled"}</span>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
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

  const { data: playlistsData } = usePlaylists({ perPage: 50 });
  const playlists = flattenPlaylistsPages(
    playlistsData as { pages: PlaylistsPageResult[] } | undefined
  );
  const addToPlaylist = useAddSongToPlaylist();

  const songs = flattenSongsPages(
    data as { pages: SongsPageResult[] } | undefined
  );

  const handlePlay = (song: Song) => {
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
              <span className="w-16 shrink-0 text-right">Actions</span>
            </div>
            {songs.map((song) => (
              <SongRow
                key={String(song.id)}
                song={song}
                onPlay={handlePlay}
                playlists={playlists}
                onAddToPlaylist={(playlistId, songId) =>
                  addToPlaylist.mutate({ playlistId, songId })
                }
                addToPlaylistState={
                  addToPlaylist.isPending && addToPlaylist.variables
                    ? addToPlaylist.variables
                    : null
                }
              />
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
