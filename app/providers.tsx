"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState, type ReactNode } from "react";

/** Stale-while-revalidate: show cached data immediately, refetch in background */
const defaultQueryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 min: data treated as fresh, no refetch
      gcTime: 5 * 60 * 1000, // 5 min: keep unused data in cache
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
};

function makeQueryClient() {
  return new QueryClient(defaultQueryClientOptions);
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (browserQueryClient == null) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "rgb(38 38 38)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white",
          },
        }}
      />
    </QueryClientProvider>
  );
}
