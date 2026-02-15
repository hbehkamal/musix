# Musix

A web music player built with Next.js. Browse and play songs from a catalog, create and manage playlists, add or remove tracks, and control playback from a compact mobile-friendly UI.

### Features

- **Discover** — Search and stream songs from the catalog
- **Playlists** — Create playlists with custom covers, edit titles, and reorder or remove tracks
- **Play from playlist** — Start playback from a playlist or tap any track to play
- **Now playing** — In-app player with progress and controls

### Run locally

1. Copy `.env-sample` to `.env` and set `API_BASE_URL`.
2. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app expects a backend API for auth, songs, and playlists; see `.env-sample` for configuration.