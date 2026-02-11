import { formatTime } from "@/utils"

import { ProgressBarType } from "./progress-bar.type"

export default function ProgressBar({progress, positionSeconds, durationSeconds}: ProgressBarType) {
    return (<div className="space-y-1.5 px-1">
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>{formatTime(positionSeconds)}</span>
          <span>{formatTime(durationSeconds)}</span>
        </div>
      </div>)
}