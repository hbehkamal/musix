"use client";

import { useRegisterMutation } from "@/hooks";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const registerMutation = useRegisterMutation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    registerMutation.mutate({
      first_name: firstName,
      last_name: lastName,
      username,
      password,
    });
  }

  const error = registerMutation.isError ? registerMutation.error?.message : "";
  const loading = registerMutation.isPending;

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Create account
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Sign up for Musix
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="register-first-name"
              className="mb-1 block text-xs font-medium text-neutral-400"
            >
              First name
            </label>
            <input
              id="register-first-name"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
              placeholder="Jane"
            />
          </div>
          <div>
            <label
              htmlFor="register-last-name"
              className="mb-1 block text-xs font-medium text-neutral-400"
            >
              Last name
            </label>
            <input
              id="register-last-name"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-username"
            className="mb-1 block text-xs font-medium text-neutral-400"
          >
            Username
          </label>
          <input
            id="register-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            placeholder="janedoe"
          />
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="mb-1 block text-xs font-medium text-neutral-400"
          >
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-400 hover:text-emerald-300"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
