"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="app-grid flex min-h-screen items-center justify-center p-4">
      <div className="surface w-full max-w-md rounded-2xl p-8 shadow-sm">
        
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Synaptic Surge</p>
          <h1 className="mt-2 text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Sign in to continue managing your content workspace.</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
            Login
          </button>
        </div>

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
