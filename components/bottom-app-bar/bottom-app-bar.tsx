"use client";

import { Compass, Menu, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomAppBar() {
  const pathname = usePathname();
  const isDiscover = pathname === "/" || pathname === "/discovery";

  return (
    <nav className="relative z-0 mt-auto flex shrink-0 items-center justify-between rounded-2xl bg-black/40 px-4 py-2.5 text-[11px] text-neutral-400 backdrop-blur-md">
      <Link
        href="/"
        className={`flex flex-1 flex-col items-center gap-0.5 ${isDiscover ? "text-emerald-400" : ""}`}
      >
        <Compass className="h-5 w-5" strokeWidth={2} />
        <span className="text-[10px] font-medium tracking-wide">Discover</span>
      </Link>
      <button
        type="button"
        className="flex flex-1 flex-col items-center gap-0.5"
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
        <span className="text-[10px] font-medium tracking-wide">Library</span>
      </button>
      <button
        type="button"
        className="flex flex-1 flex-col items-center gap-0.5"
      >
        <User className="h-5 w-5" strokeWidth={2} />
        <span className="text-[10px] font-medium tracking-wide">Profile</span>
      </button>
    </nav>
  );
}