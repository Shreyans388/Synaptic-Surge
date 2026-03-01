// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Github, Zap, ArrowRight, Mail, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/api/auth.api";
import { useGlobalStore } from "@/state/global.store";

export default function Login() {
  const router = useRouter();
  const setAuth = useGlobalStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => loginUser(email, password),
    onSuccess: (user) => {
      setAuth({ id: user._id, name: user.fullName, email: user.email });
      router.push("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#030712]">
      <div className="hidden md:flex md:w-1/3 bg-gray-50 dark:bg-[#0B0E14] border-r border-gray-200 dark:border-gray-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full" />

        <div className="relative z-10">
          <Link href="/" className="text-2xl font-black tracking-tighter dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">L</span>
            </div>
            LOOMIN
          </Link>
          <h2 className="mt-20 text-3xl font-bold leading-tight dark:text-white">
            Resume your <br /> command center.
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            While you were away, your agents have been analyzing 4,200+ data points to optimize your reach.
          </p>
        </div>

        <div className="relative z-10 p-5 bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-sky-600">
            <Sparkles size={12} /> Live Agent Status
          </div>
          <div className="space-y-2">
            <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 w-[75%] animate-pulse" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              Agent &quot;Growth-1&quot; found 3 viral hooks...
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 md:p-20 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-3xl font-bold dark:text-white mb-2">Welcome Back</h1>
            <p className="text-gray-500">Enter your credentials to manage your agents.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button type="button" className="flex items-center justify-center gap-2 p-3.5 border border-gray-200 dark:border-gray-800 rounded-xl opacity-60" disabled>
              <Github size={20} className="dark:text-white" />
              <span className="text-sm font-medium dark:text-white">GitHub</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2 p-3.5 border border-gray-200 dark:border-gray-800 rounded-xl opacity-60" disabled>
              <Zap size={20} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium dark:text-white">Google</span>
            </button>
          </div>

          <div className="relative mb-8 text-center">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </span>
            <span className="relative px-4 bg-white dark:bg-[#030712] text-xs text-gray-500 uppercase font-bold tracking-widest">
              or use email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition"
                required
              />
            </div>

            {mutation.isError ? (
              <p className="text-sm text-red-500">{mutation.error.message}</p>
            ) : null}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {mutation.isPending ? "Signing in..." : "Resume Command"}
              {!mutation.isPending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-sky-600 font-bold hover:underline">
              Start your free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
