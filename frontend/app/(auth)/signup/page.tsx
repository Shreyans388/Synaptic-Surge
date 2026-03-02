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
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#030712]">

      {/* LEFT PANEL — unchanged */}
      <div className="hidden md:flex md:w-1/3 flex-col justify-between border-r border-gray-200 bg-gray-50 p-12 dark:border-gray-800 dark:bg-[#0B0E14]">
        <div>
          <div className="flex items-center gap-2 text-2xl font-black tracking-tighter dark:text-white">
            <div className="h-8 w-8 rounded-lg bg-sky-600" /> LOOMIN
          </div>
          <h2 className="mt-20 text-3xl font-bold leading-tight dark:text-white">
            Your AI workforce is <br /> ready to deploy.
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Join 10,000+ creators who have automated their social presence.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 overflow-y-auto p-8 md:p-20">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-2 text-3xl font-bold dark:text-white">
            Create your account
          </h1>
          

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AgentPersonaCard
              title="Growth Agent"
              description="Optimized for reach & virality."
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
                className="w-full rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                required
              />
            </div>

            <input
              type="email"
              placeholder="Work Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              minLength={6}
              required
            />

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full rounded-xl bg-sky-600 py-4 font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-700 disabled:opacity-70"
            >
              {isSigningUp ? "Creating account..." : "Continue →"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-sky-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}