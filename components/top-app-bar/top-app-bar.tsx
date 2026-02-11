export default function TopAppBar() {
    return (<div className="mb-4 flex items-center justify-between gap-3 text-sm text-neutral-200">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-neutral-100 hover:bg-white/10"
          aria-label="Go back"
        >
          <span className="inline-block translate-x-[1px] text-lg">
            ‹
          </span>
        </button>
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-400/90">
            Playing from Musix
          </span>
          <span className="mt-0.5 text-xs font-medium tracking-wide text-neutral-50">
            For You
          </span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-neutral-100 hover:bg-white/10">
          <span className="text-[10px] tracking-wide">M</span>
        </div>
      </div>)
}