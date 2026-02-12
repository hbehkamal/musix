"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  Playlist,
  PlaylistsResponse,
  PlaylistDetail,
  PlaylistDetailResponse,
} from "@/types/playlist";
import {
  normalizePlaylistsResponse,
  normalizePlaylistDetailResponse,
} from "@/types/playlist";

const DEFAULT_PER_PAGE = 15;

export interface UsePlaylistsParams {
  perPage?: number;
}

export interface PlaylistsPageResult {
  playlists: Playlist[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

async function fetchPlaylistsPage({
  pageParam = 1,
  perPage = DEFAULT_PER_PAGE,
}: {
  pageParam?: number;
  perPage?: number;
}): Promise<PlaylistsPageResult> {
  const params = new URLSearchParams();
  params.set("page", String(pageParam));
  params.set("per-page", String(perPage));

  const res = await fetch(`/api/playlist?${params.toString()}`);
  const data: PlaylistsResponse = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? "Failed to fetch playlists"
    );
  }
  return normalizePlaylistsResponse(data);
}

export function usePlaylists(params: UsePlaylistsParams = {}) {
  const { perPage = DEFAULT_PER_PAGE } = params;

  return useInfiniteQuery({
    queryKey: ["playlists", perPage],
    queryFn: ({ pageParam }) =>
      fetchPlaylistsPage({ pageParam, perPage }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage >= lastPage.lastPage) return undefined;
      return lastPage.currentPage + 1;
    },
  });
}

export function flattenPlaylistsPages(
  data: { pages?: PlaylistsPageResult[] } | undefined | null
): Playlist[] {
  if (!data?.pages?.length) return [];
  return data.pages.flatMap((p) => p.playlists);
}

/** Upload playlist cover image. Returns the filename from the API. */
export async function uploadPlaylistCover(file: File): Promise<{ filename: string }> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/uploader/playlist-cover", {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? "Failed to upload cover"
    );
  }
  const result = (data as { result?: string | { filename?: string } }).result;
  const filename =
    typeof result === "string"
      ? result
      : (data as { filename?: string }).filename ?? result?.filename;
  if (typeof filename !== "string") {
    throw new Error("Upload response missing filename");
  }
  return { filename };
}

/** Create playlist with title and optional cover filename. */
export async function createPlaylist(body: {
  title: string;
  cover?: string;
}): Promise<unknown> {
  const res = await fetch("/api/playlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? "Failed to create playlist"
    );
  }
  return data;
}

/** Update playlist (title and/or cover). */
export async function updatePlaylist(
  id: number,
  body: { title?: string; cover?: string }
): Promise<unknown> {
  const res = await fetch(`/api/playlist/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? "Failed to update playlist"
    );
  }
  return data;
}

/** Delete playlist. */
export async function deletePlaylist(id: number): Promise<void> {
  const res = await fetch(`/api/playlist/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? "Failed to delete playlist"
    );
  }
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number; title?: string; cover?: string }) =>
      updatePlaylist(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

/** Fetch a single playlist with its songs (GET /playlist/<id>). */
async function fetchPlaylist(id: number): Promise<PlaylistDetail | null> {
  const res = await fetch(`/api/playlist/${id}`);
  const data: PlaylistDetailResponse = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? "Failed to fetch playlist"
    );
  }
  const detail = normalizePlaylistDetailResponse(data);
  if (!detail) throw new Error("Invalid playlist response");
  return detail;
}

export function usePlaylist(id: number | null) {
  return useQuery({
    queryKey: ["playlist", id],
    queryFn: () => fetchPlaylist(id!),
    enabled: id != null,
  });
}

/** Add a song to a playlist. */
export async function addSongToPlaylist(
  playlistId: number,
  songId: number
): Promise<unknown> {
  const res = await fetch(`/api/playlist/add-song/${playlistId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ song_id: songId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? "Failed to add song to playlist"
    );
  }
  return data;
}

/** Remove a song from a playlist. */
export async function removeSongFromPlaylist(
  playlistId: number,
  songId: number
): Promise<void> {
  const res = await fetch(`/api/playlist/remove-song/${playlistId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ song_id: songId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? "Failed to remove song from playlist"
    );
  }
}

export function useAddSongToPlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      playlistId,
      songId,
    }: {
      playlistId: number;
      songId: number;
    }) => addSongToPlaylist(playlistId, songId),
    onSuccess: (_data, { playlistId }) => {
      void queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Added to playlist");
    },
  });
}

export function useRemoveSongFromPlaylist(playlistId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (songId: number) =>
      removeSongFromPlaylist(playlistId!, songId),
    onSuccess: () => {
      if (playlistId != null) {
        void queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
      }
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Removed from playlist");
    },
  });
}
