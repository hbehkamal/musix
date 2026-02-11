import Image from "next/image";
import { CoverProps } from "./cover.type";

export default function Cover({ coverUrl, title }: CoverProps) {
    return (<div className="relative overflow-hidden rounded-3xl bg-neutral-900/80">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`${title} cover`}
            width={600}
            height={600}
            className="h-64 w-full object-cover sm:h-72"
            priority
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-emerald-500/40 via-emerald-800/40 to-black/80 sm:h-72">
            <div className="h-16 w-16 rounded-full border border-white/20 bg-black/40 shadow-[0_0_40px_rgba(34,197,94,0.7)]" />
          </div>
        )}
      </div>
    )
}