import { Cover, Info, ProgressBar, Controls } from "@/components/player";

const mockCurrentTrack = {
  title: "Late Night Vibes",
  artist: "Various Artists",
  coverUrl: "/default-cover.jpeg",
  positionSeconds: 42,
  durationSeconds: 205,
};

const progress =
  (mockCurrentTrack.positionSeconds / mockCurrentTrack.durationSeconds) * 100;

export default function Home() {
  return (
    <div>
      <div className="space-y-4">
        <Cover
          coverUrl={mockCurrentTrack.coverUrl}
          title={mockCurrentTrack.title}
        />
        <Info title={mockCurrentTrack.title} artist={mockCurrentTrack.artist} />
        <ProgressBar
          progress={progress}
          positionSeconds={mockCurrentTrack.positionSeconds}
          durationSeconds={mockCurrentTrack.durationSeconds}
        />
        <Controls />
      </div>
    </div>
  );
}
