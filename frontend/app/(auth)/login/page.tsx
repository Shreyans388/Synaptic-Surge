"use client";

import { useState } from "react";
import { ArrowRight, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/state/auth.store";

export default function Login() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <div className="hidden md:flex md:w-1/3 flex-col justify-between border-r border-zinc-800 bg-zinc-950 p-12">
        <div>
          <div className="flex items-center gap-2 text-2xl font-black tracking-tighter">
            <div className="h-8 w-8 rounded-lg bg-sky-600" /> LOOMIN
          </div>
          <h2 className="mt-20 text-3xl font-bold leading-tight">
            Welcome back to your <br /> content operations hub.
          </h2>
          <p className="mt-4 text-zinc-400">
            Sign in to continue managing drafts, campaigns, and brand workflows.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-20">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-2 text-3xl font-bold">Sign in to your account</h1>
          <p className="mb-6 text-sm text-zinc-400">
            Use your email and password to access your workspace.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="email"
                placeholder="Work Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black pl-12 pr-4 py-4 text-white placeholder:text-zinc-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black pl-12 pr-4 py-4 text-white placeholder:text-zinc-500"
                required
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-xl bg-sky-600 py-4 font-bold text-white transition hover:bg-sky-700 disabled:opacity-70 inline-flex items-center justify-center gap-2"
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
              {!isLoggingIn && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-sky-400 hover:text-sky-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
