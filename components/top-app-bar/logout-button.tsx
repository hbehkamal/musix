"use client";

import { useLogoutMutation } from "@/hooks";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const logoutMutation = useLogoutMutation();

  return (
    <button
      type="button"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-neutral-100 hover:bg-white/10 disabled:opacity-50"
      aria-label="Log out"
      title="Log out"
    >
      <LogOut className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}
