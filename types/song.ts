/** Raw song item from GET /song API (result.items[]. */
export interface SongItemApi {
  id: number;
  album_name: string;
  artist_name: string;
  duration: string;
  title: string;
  year: string;
  file: string;
  format: string;
}

/** Normalized song for UI (title, artist, album, duration, download_url). */
export interface Song {
  id: number | string;
  title: string;
  artist: string;
  album?: string;
  duration?: number; // seconds
  duration_formatted?: string;
  download_url?: string;
  [key: string]: unknown;
}

export interface SongsResponse {
  ok?: boolean;
  result?: {
    items?: SongItemApi[];
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

export function normalizeSongsResponse(raw: SongsResponse): {
  songs: Song[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
} {
  const items = raw.result?.items ?? [];
  const meta = raw.result?._meta ?? {};
  const songs: Song[] = Array.isArray(items)
    ? items.map((item) => ({
        id: item.id,
        title: item.title,
        artist: item.artist_name,
        album: item.album_name || undefined,
        duration: parseFloat(item.duration) || undefined,
        duration_formatted: formatDurationSeconds(parseFloat(item.duration)),
        download_url: item.file,
      }))
    : [];
  return {
    songs,
    currentPage: meta.currentPage ?? 1,
    lastPage: meta.pageCount ?? 1,
    perPage: meta.perPage ?? 15,
    total: meta.totalCount ?? 0,
  };
}

function formatDurationSeconds(seconds: number): string {
  if (!Number.isFinite(seconds)) return "–";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getDownloadUrl(song: Song): string | null {
  return song.download_url ?? null;
}

export function getDurationDisplay(song: Song): string {
  if (song.duration_formatted) return song.duration_formatted;
  if (typeof song.duration === "number") {
    const m = Math.floor(song.duration / 60);
    const s = Math.floor(song.duration % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  return "–";
}
