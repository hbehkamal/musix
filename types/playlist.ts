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

/** Raw song item inside GET /playlist/<id> result.songs[]. */
export interface PlaylistSongItemApi {
  id: number;
  title?: string;
  artist_name?: string;
  album_name?: string;
  duration?: string | number;
  file?: string;
  [key: string]: unknown;
}

/** Single playlist API response (GET /playlist/<id>). */
export interface PlaylistDetailResponse {
  ok?: boolean;
  result?: {
    id: number;
    title?: string;
    cover?: string;
    created_at?: string;
    updated_at?: string;
    songs?: PlaylistSongItemApi[];
  };
  [key: string]: unknown;
}

/** Normalized playlist with songs for detail view. */
export interface PlaylistDetail extends Playlist {
  songs: import("@/types/song").Song[];
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

function mapPlaylistSongItem(item: PlaylistSongItemApi): import("@/types/song").Song {
  const duration =
    typeof item.duration === "number"
      ? item.duration
      : parseFloat(String(item.duration || 0)) || undefined;
  return {
    id: item.id,
    title: item.title ?? "",
    artist: item.artist_name ?? "",
    album: item.album_name,
    duration,
    download_url: item.file,
  };
}

export function normalizePlaylistDetailResponse(
  raw: PlaylistDetailResponse
): PlaylistDetail | null {
  const r = raw.result;
  if (!r) return null;
  const items = Array.isArray(r.songs) ? r.songs : [];
  const songs = items.map((item) => mapPlaylistSongItem(item));
  return {
    id: r.id,
    title: r.title ?? "",
    cover: r.cover,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    songs,
  };
}
