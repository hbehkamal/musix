"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Playlist, PlaylistsResponse } from "@/types/playlist";
import { normalizePlaylistsResponse } from "@/types/playlist";

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
