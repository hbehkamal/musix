import { TrackInfoProps } from "./info.type";

export default function Info({ title, artist }: TrackInfoProps) {
    return (<div className="space-y-0.5 px-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-wide">
              {title}
            </p>
            <p className="truncate text-xs text-neutral-400">
              {artist}
            </p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[11px] text-emerald-400 hover:bg-white/10"
            aria-label="Like this track"
          >
            ♥
          </button>
        </div>
      </div>
    )
}