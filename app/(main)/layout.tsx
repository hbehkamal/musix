import Image from "next/image";
import { BottomAppBar, TopAppBar } from "@/components/index";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative h-screen min-h-[600px] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/default-cover.jpeg"
          alt="Cover background"
          fill
          sizes="100vw"
          priority
          className="object-cover blur-3xl scale-110 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/60" />
      </div>

      <div className="flex h-full min-h-0 items-center justify-center px-4 py-8">
        <div className="relative mx-auto flex h-full max-h-[min(90vh,700px)] w-full max-w-sm flex-col">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2.6rem] border border-white/5 bg-black/40 shadow-[0_0_70px_rgba(0,0,0,0.9)] backdrop-blur-3xl" />

          <div className="flex min-h-0 flex-1 flex-col rounded-[2.2rem] border border-white/10 bg-black/75 p-4 pb-3 shadow-2xl backdrop-blur-2xl">
            <div className="mb-3 flex shrink-0 justify-center">
              <div className="h-1 w-16 rounded-full bg-white/20" />
            </div>

            <TopAppBar />

            {children}

            <BottomAppBar />
          </div>
        </div>
      </div>
    </div>
  );
}
