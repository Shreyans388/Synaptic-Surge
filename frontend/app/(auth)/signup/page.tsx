"use client";

import { useState } from "react";
import { Brain, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgentPersonaCard } from "@/components/onboarding/AgentPersonaCard";
import { useAuthStore } from "@/state/auth.store";

export default function SignUp() {
  const router = useRouter();
  const { signup, isSigningUp } = useAuthStore();

  const [selectedPersona, setSelectedPersona] = useState("growth");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signup({
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        password,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
            Your AI workforce is <br /> ready to deploy.
          </h2>
          <p className="mt-4 text-zinc-400">
            Join teams automating social operations with AI.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-20">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-2 text-3xl font-bold">Create your account</h1>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AgentPersonaCard
              title="Growth Agent"
              description="Optimized for reach and virality."
              icon={Rocket}
              selected={selectedPersona === "growth"}
              onClick={() => setSelectedPersona("growth")}
            />
            <AgentPersonaCard
              title="Thought Leader"
              description="Deep-dive long-form content."
              icon={Brain}
              selected={selectedPersona === "thought"}
              onClick={() => setSelectedPersona("thought")}
            />
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white placeholder:text-zinc-500"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white placeholder:text-zinc-500"
                required
              />
            </div>

            <input
              type="email"
              placeholder="Work Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white placeholder:text-zinc-500"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black p-4 text-white placeholder:text-zinc-500"
              minLength={6}
              required
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full rounded-xl bg-sky-600 py-4 font-bold text-white transition hover:bg-sky-700 disabled:opacity-70"
            >
              {isSigningUp ? "Creating account..." : "Continue ->"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-sky-400 hover:text-sky-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
