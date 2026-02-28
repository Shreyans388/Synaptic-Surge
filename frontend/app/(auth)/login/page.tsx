"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/services/api/auth.api";
import { useGlobalStore } from "@/state/global.store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const setAuth = useGlobalStore((s) => s.setAuth);

  const mutation = useMutation({
    mutationFn: () => loginUser(email, password),
    onSuccess: (user) => {
      setAuth(
        {
          id: user._id,
          name: user.fullName,
          email: user.email,
        },
        null
      );
      setError(null);
      router.push("/dashboard");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || mutation.isPending) return;
    mutation.mutate();
  };

  return (
    <div className="app-grid flex min-h-screen items-center justify-center p-4">
      <div className="surface w-full max-w-md rounded-2xl p-8 shadow-sm">
        
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Synaptic Surge</p>
          <h1 className="mt-2 text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Sign in to continue managing your content workspace.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
          >
            {mutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-500">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
