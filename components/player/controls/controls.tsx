export default function Controls({}){
    return (<div className="flex items-center justify-between px-3 pt-1 text-neutral-100">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs text-neutral-300 hover:bg-white/5"
          aria-label="Shuffle"
        >
          ⤨
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm text-neutral-200 hover:bg-white/5"
          aria-label="Previous"
        >
          ‹‹
        </button>
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-lg font-semibold text-black shadow-[0_10px_30px_rgba(34,197,94,0.5)] hover:bg-emerald-300"
          aria-label="Play or pause"
        >
          ▌▌
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm text-neutral-200 hover:bg-white/5"
          aria-label="Next"
        >
          ››
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs text-neutral-300 hover:bg-white/5"
          aria-label="Repeat"
        >
          ⟲
        </button>
      </div>)
}