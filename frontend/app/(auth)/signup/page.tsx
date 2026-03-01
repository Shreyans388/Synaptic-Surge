// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Brain, Rocket, Zap, Github } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgentPersonaCard } from "@/components/onboarding/AgentPersonaCard";
import { signupUser } from "@/services/api/auth.api";
import { createBrand } from "@/services/api/brand.api";
import { useGlobalStore } from "@/state/global.store";

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

export default function SignUp() {
  const router = useRouter();
  const setAuth = useGlobalStore((state) => state.setAuth);
  const setActiveBrand = useGlobalStore((state) => state.setActiveBrand);

  const [selectedPersona, setSelectedPersona] = useState("growth");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [brandName, setBrandName] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [brandStyle, setBrandStyle] = useState("");
  const [brandText, setBrandText] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [ctaStyle, setCtaStyle] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("top-right");

  const mutation = useMutation({
    mutationFn: async () => {
      const user = await signupUser(`${firstName} ${lastName}`.trim(), email, password);

      if (brandName.trim()) {
        const brand = await createBrand({
          name: brandName.trim(),
          brandColors: brandColors
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          brandStyle: brandStyle.trim() || undefined,
          brandText: brandText.trim() || undefined,
          brandVoice: brandVoice.trim() || undefined,
          ctaStyle: ctaStyle.trim() || undefined,
          logoUrl: logoUrl.trim() || undefined,
          logoPosition,
          description: brandText.trim() || undefined,
          logo: logoUrl.trim() || undefined,
        });

        return { user, brand };
      }

      return { user, brand: null };
    },
    onSuccess: ({ user, brand }) => {
      setAuth({ id: user._id, name: user.fullName, email: user.email });
      if (brand) {
        setActiveBrand({ id: brand._id, name: brand.name });
      }
      router.push("/dashboard");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#030712]">
      <div className="hidden md:flex md:w-1/3 flex-col justify-between border-r border-gray-200 bg-gray-50 p-12 dark:border-gray-800 dark:bg-[#0B0E14]">
        <div>
          <div className="flex items-center gap-2 text-2xl font-black tracking-tighter dark:text-white">
            <div className="h-8 w-8 rounded-lg bg-sky-600" /> LOOMIN
          </div>
          <h2 className="mt-20 text-3xl font-bold leading-tight dark:text-white">
            Your AI workforce is <br /> ready to deploy.
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Join 10,000+ creators who have automated their social presence with agentic workflows.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900/50">
          <p className="text-sm italic text-gray-600 dark:text-gray-300">
            &quot;Loomin did not just schedule my posts; it found a trending topic on X and wrote a thread that got 50k views while I was at dinner.&quot;
          </p>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-sky-600">- Alex R., Founder</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-20">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-2 text-3xl font-bold dark:text-white">Create your account</h1>
          <p className="mb-6 text-gray-500">Set up your account and onboarding brand profile.</p>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AgentPersonaCard
              title="Growth Agent"
              description="Optimized for reach, virality, and aggressive trend-jacking."
              icon={Rocket}
              selected={selectedPersona === "growth"}
              onClick={() => setSelectedPersona("growth")}
            />
            <AgentPersonaCard
              title="Thought Leader"
              description="Deep-dive analysis and long-form content in your unique voice."
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
                className="w-full rounded-xl border border-gray-200 bg-transparent p-4 outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-transparent p-4 outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
                required
              />
            </div>
            <input
              type="email"
              placeholder="Work Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-transparent p-4 outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-transparent p-4 outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
              minLength={6}
              required
            />

            <div className="mt-6 rounded-2xl border border-[var(--border)] p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Brand onboarding</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Brand Name (required for onboarding)"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
                />
                <input
                  type="text"
                  placeholder="Brand Colors (comma separated, e.g. #0ea5e9,#111827,#f8fafc)"
                  value={brandColors}
                  onChange={(e) => setBrandColors(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
                />
                <input
                  type="text"
                  placeholder="Brand Style (modern, clean, minimal)"
                  value={brandStyle}
                  onChange={(e) => setBrandStyle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
                />
                <textarea
                  placeholder="Brand Text"
                  value={brandText}
                  onChange={(e) => setBrandText(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Brand Voice"
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
                />
                <input
                  type="text"
                  placeholder="CTA Style"
                  value={ctaStyle}
                  onChange={(e) => setCtaStyle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    type="url"
                    placeholder="Logo URL"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
                  />
                  <select
                    value={logoPosition}
                    onChange={(e) => setLogoPosition(e.target.value as LogoPosition)}
                    className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-gray-800"
                  >
                    <option value="top-left">Logo Top Left</option>
                    <option value="top-right">Logo Top Right</option>
                    <option value="bottom-left">Logo Bottom Left</option>
                    <option value="bottom-right">Logo Bottom Right</option>
                    <option value="center">Logo Center</option>
                  </select>
                </div>
              </div>
            </div>

            {mutation.isError ? (
              <p className="text-sm text-red-500">{mutation.error.message}</p>
            ) : null}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-xl bg-sky-600 py-4 font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-700 disabled:opacity-70"
            >
              {mutation.isPending ? "Creating account..." : "Initialize Loomin Agent"}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </span>
            <span className="relative bg-white px-4 text-sm text-gray-500 dark:bg-[#030712]">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 p-4 opacity-60 dark:border-gray-800" disabled>
              <Github size={20} /> <span className="text-sm font-medium">GitHub</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 p-4 opacity-60 dark:border-gray-800" disabled>
              <Zap size={20} className="text-yellow-500" /> <span className="text-sm font-medium">Google</span>
            </button>
          </div>

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
