import type { Metadata } from "next";
import Image from "next/image";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomAppBar, TopAppBar } from "@/components/index";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Musix Player",
  description: "A Spotify-inspired web music player.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-neutral-950 text-white`}
      >
        <div className="relative min-h-screen overflow-hidden">
          {/* Blurred background based on current track cover */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            
              <Image
                src={"/default-cover.jpeg"}
                alt="Cover background"
                fill
                sizes="100vw"
                priority
                className="object-cover blur-3xl scale-110 opacity-60"
              />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/60" />
          </div>

          {/* Centered mobile-like player shell */}
          <div className="flex min-h-screen items-center justify-center px-4 py-8">
            <div className="relative mx-auto w-full max-w-sm">
              {/* Device frame glow */}
              <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2.6rem] border border-white/5 bg-black/40 shadow-[0_0_70px_rgba(0,0,0,0.9)] backdrop-blur-3xl" />

              {/* Main card */}
              <div className="rounded-[2.2rem] border border-white/10 bg-black/75 p-4 pb-3 shadow-2xl backdrop-blur-2xl">
                {/* Top notch */}
                <div className="mb-3 flex justify-center">
                  <div className="h-1 w-16 rounded-full bg-white/20" />
                </div>

                {/* Top app bar */}
                <TopAppBar />

                {children}

                {/* Bottom app bar */}
                <BottomAppBar />

              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
