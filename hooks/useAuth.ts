"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export type LoginInput = { username: string; password: string };
export type RegisterInput = {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
};

async function loginFn(body: LoginInput) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error ?? "Login failed");
  }
  return data;
}

async function registerFn(body: RegisterInput) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error ?? "Registration failed");
  }
  return data;
}

async function logoutFn() {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) throw new Error("Logout failed");
}

export function useLoginMutation(redirectTo?: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: loginFn,
    onSuccess: () => {
      router.push(redirectTo ?? "/");
      router.refresh();
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: registerFn,
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
  });
}
