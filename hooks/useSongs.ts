"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { Song, SongsResponse } from "@/types/song";
import { normalizeSongsResponse } from "@/types/song";

const DEFAULT_PER_PAGE = 20;

export interface UseSongsParams {
  /** Filter by title (uses filter[title][like]=term) */
  searchTerm?: string;
  perPage?: number;
}

export interface SongsPageResult {
  songs: Song[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

async function fetchSongsPage({
  pageParam = 1,
  searchTerm = "",
  perPage = DEFAULT_PER_PAGE,
}: {
  pageParam?: number;
  searchTerm?: string;
  perPage?: number;
}): Promise<SongsPageResult> {
  const params = new URLSearchParams();
  params.set("page", String(pageParam));
  params.set("per-page", String(perPage));
  if (searchTerm.trim()) {
    params.set("filter[title][like]", searchTerm.trim());
  }
  const res = await fetch(`/api/songs?${params.toString()}`);
  const data: SongsResponse = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error ?? "Failed to fetch songs");
  }
  return normalizeSongsResponse(data);
}

export function useSongs(params: UseSongsParams = {}) {
  const { searchTerm = "", perPage = DEFAULT_PER_PAGE } = params;

  return useInfiniteQuery({
    queryKey: ["songs", searchTerm, perPage],
    queryFn: ({ pageParam }) =>
      fetchSongsPage({ pageParam, searchTerm, perPage }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage >= lastPage.lastPage) return undefined;
      return lastPage.currentPage + 1;
    },
  });
}

/** Flatten all pages into a single list of songs for display. */
export function flattenSongsPages(
  data: { pages?: SongsPageResult[] } | undefined | null
): Song[] {
  if (!data?.pages?.length) return [];
  return data.pages.flatMap((p) => p.songs);
}
