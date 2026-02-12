export interface NowPlayingTrack {
  title: string;
  artist: string;
  coverUrl: string;
  positionSeconds: number;
  durationSeconds: number;
  /** URL to stream or download the audio (e.g. /api/songs/download/:id) */
  audioUrl?: string;
}
