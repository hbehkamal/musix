export default function BottomAppBar() {
    return (<nav className="mt-4 flex items-center justify-between rounded-2xl bg-black/40 px-4 py-2.5 text-[11px] text-neutral-400 backdrop-blur-md">
        <button
          type="button"
          className="flex flex-1 flex-col items-center gap-0.5 text-emerald-400"
        >
          <span className="text-base">⌂</span>
          <span className="text-[10px] font-medium tracking-wide">
            Home
          </span>
        </button>
        <button
          type="button"
          className="flex flex-1 flex-col items-center gap-0.5"
        >
          <span className="text-base">⌕</span>
          <span className="text-[10px] font-medium tracking-wide">
            Search
          </span>
        </button>
        <button
          type="button"
          className="flex flex-1 flex-col items-center gap-0.5"
        >
          <span className="text-base">☰</span>
          <span className="text-[10px] font-medium tracking-wide">
            Library
          </span>
        </button>
        <button
          type="button"
          className="flex flex-1 flex-col items-center gap-0.5"
        >
          <span className="text-base">●</span>
          <span className="text-[10px] font-medium tracking-wide">
            Profile
          </span>
        </button>
      </nav>)
}