/** Raw playlist item from GET /playlist API. */
export interface PlaylistItemApi {
  id: number;
  title: string;
  /** Full URL (e.g. http://host/upload/xxx.jpeg) or filename. */
  cover?: string;
  created_at?: string;
  updated_at?: string;
  songs?: unknown[];
  [key: string]: unknown;
}

/** Normalized playlist for UI. */
export interface Playlist {
  id: number;
  title: string;
  /** Full URL or filename for cover image. */
  cover?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaylistsResponse {
  ok?: boolean;
  result?: {
    items?: PlaylistItemApi[];
    _meta?: {
      totalCount?: number;
      pageCount?: number;
      currentPage?: number;
      perPage?: number;
    };
    _links?: unknown;
  };
  [key: string]: unknown;
}

export function normalizePlaylistsResponse(raw: PlaylistsResponse): {
  playlists: Playlist[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
} {
  const items = raw.result?.items ?? [];
  const meta = raw.result?._meta ?? {};
  const playlists: Playlist[] = Array.isArray(items)
    ? items.map((item) => ({
        id: item.id,
        title: item.title ?? "",
        cover: item.cover,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }))
    : [];
  return {
    playlists,
    currentPage: meta.currentPage ?? 1,
    lastPage: meta.pageCount ?? 1,
    perPage: meta.perPage ?? 15,
    total: meta.totalCount ?? 0,
  };
}
