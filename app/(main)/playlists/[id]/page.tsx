"use client";

import {
  usePlaylist,
  useRemoveSongFromPlaylist,
} from "@/hooks/usePlaylists";
import type { PlaylistDetail } from "@/types/playlist";
import type { Song } from "@/types/song";
import { getDurationDisplay } from "@/types/song";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChevronLeft, Trash2, Loader2, Play } from "lucide-react";
import { useNowPlaying } from "@/context/now-playing";

const DEFAULT_COVER = "/default-cover.jpeg";

function getPlaylistCoverUrl(cover: string | undefined): string {
  if (!cover?.trim()) return DEFAULT_COVER;
  if (cover.startsWith("http://") || cover.startsWith("https://")) return cover;
  const base = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";
  return `${base}/${cover}`.replace(/\/+/g, "/");
}

function PlaylistSongRow({
  song,
  playlistId,
  onRemove,
  isRemoving,
  onPlay,
}: {
  song: Song;
  playlistId: number;
  onRemove: (songId: number) => void;
  isRemoving: boolean;
  onPlay: (song: Song) => void;
}) {
  const duration = getDurationDisplay(song);
  const songId = typeof song.id === "string" ? parseInt(song.id, 10) : song.id;

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
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(songId);
        }}
        disabled={isRemoving}
        className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
        aria-label={`Remove ${song.title} from playlist`}
      >
        {isRemoving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" strokeWidth={2} />
        )}
      </button>
    </div>
  );
}

export default function PlaylistDetailPage() {
  const params = useParams();
  const idParam = params?.id;
  const resolvedId =
    typeof idParam === "string" ? parseInt(idParam, 10) : null;
  const validId = resolvedId !== null && !Number.isNaN(resolvedId) ? resolvedId : null;

  const { data: playlist, isLoading, isError, error } = usePlaylist(validId);
  const removeSong = useRemoveSongFromPlaylist(validId);
  const { setCurrentTrack, setPlaying, setLoadingAudio } = useNowPlaying();

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
    setPlaying(Boolean(audioUrl));
    if (audioUrl) setLoadingAudio(true);
  };

  if (validId == null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="py-8 text-center text-sm text-neutral-400">
          Loading…
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/playlists"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white"
            aria-label="Back to playlists"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
        </div>
        <div className="py-8 text-center text-sm text-neutral-400">
          Loading playlist…
        </div>
      </div>
    );
  }

  if (isError || !playlist) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/playlists"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white"
            aria-label="Back to playlists"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
        </div>
        <div className="py-8 text-center text-sm text-red-400">
          {error?.message ?? "Playlist not found"}
        </div>
      </div>
    );
  }

  const coverUrl = getPlaylistCoverUrl(playlist.cover);
  const songs = (playlist as PlaylistDetail).songs ?? [];
  const firstSong = songs[0];
  const canPlay = firstSong != null && firstSong.id != null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-2">
        <Link
          href="/playlists"
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white"
          aria-label="Back to playlists"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <h2 className="text-sm font-semibold tracking-tight text-white">
          {playlist.title || "Untitled"}
        </h2>
      </div>

      <div className="flex gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white/10">
          <Image
            src={coverUrl}
            alt=""
            width={96}
            height={96}
            className="object-cover"
            unoptimized={coverUrl.startsWith("http") || coverUrl !== DEFAULT_COVER}
          />
          {canPlay && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay(firstSong);
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100 focus:opacity-100 focus:outline-none"
              aria-label="Play playlist"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                <Play className="h-6 w-6" strokeWidth={2} fill="currentColor" />
              </span>
            </button>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-neutral-400">
            {songs.length} {songs.length === 1 ? "song" : "songs"}
          </p>
          {canPlay && (
            <button
              type="button"
              onClick={() => handlePlay(firstSong)}
              className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              <Play className="h-4 w-4" strokeWidth={2} fill="currentColor" />
              Play
            </button>
          )}
        </div>
      </div>

      <div className="min-h-[220px] flex-1 min-w-0 overflow-x-hidden overflow-y-auto rounded-xl border border-white/5 bg-black/30 px-2">
        {songs.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-400">
            No songs in this playlist yet. Add tracks from Discover.
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 flex gap-2 border-b border-white/10 bg-black/50 py-2 text-[10px] uppercase tracking-wider text-neutral-500 backdrop-blur-sm">
              <span className="flex-1">Title / Artist</span>
              <span className="w-10 shrink-0 text-right">Time</span>
              <span className="w-10 shrink-0 text-right" />
            </div>
            {songs.map((song) => (
              <PlaylistSongRow
                key={String(song.id)}
                song={song}
                playlistId={playlist.id}
                onRemove={(songId) => removeSong.mutate(songId)}
                isRemoving={
                  removeSong.isPending &&
                  removeSong.variables === (typeof song.id === "string" ? parseInt(song.id, 10) : song.id)
                }
                onPlay={handlePlay}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
