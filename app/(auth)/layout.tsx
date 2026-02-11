export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black" />
      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-black/75 p-6 shadow-2xl backdrop-blur-2xl">
        {children}
      </div>
    </div>
  );
}
