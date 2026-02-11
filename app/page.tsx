import { Cover, Info, ProgressBar, Controls } from "@/components/player";

const mockCurrentTrack = {
  title: "Late Night Vibes",
  artist: "Various Artists",
  coverUrl:
    "/default-cover.jpeg",
  positionSeconds: 42,
  durationSeconds: 205,
};

const progress =
(mockCurrentTrack.positionSeconds / mockCurrentTrack.durationSeconds) * 100;
export default function Home() {
  return (
    <div>

      {/* Now playing section */}
      <div className="space-y-4">
        {/* Cover art */}
        <Cover coverUrl={mockCurrentTrack.coverUrl} title={mockCurrentTrack.title} />
        

        {/* Track info */}
        <Info title={mockCurrentTrack.title} artist={mockCurrentTrack.artist} />
        

        {/* Progress bar */}
        <ProgressBar progress={progress} positionSeconds={mockCurrentTrack.positionSeconds} durationSeconds={mockCurrentTrack.durationSeconds} />

        {/* Playback controls */}
        <Controls />
      </div>

      {/* Bottom app bar */}
                
    </div>
  );
}
