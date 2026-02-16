"use client";

import Link from "next/link";
import { useGlobalStore } from "@/state/global.store";

export default function LandingPage() {
  const theme = useGlobalStore((state) => state.theme);
  const setTheme = useGlobalStore((state) => state.setTheme);

  return (
    <div className="app-grid min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <nav className="surface rounded-2xl px-5 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">Synaptic Surge</h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="focus-ring rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--border-strong)]"
              >
                {theme === "light" ? "Dark" : "Light"} mode
              </button>
              <Link href="/login" className="text-sm font-medium hover:underline">
                Login
              </Link>
              <Link
                href="/signup"
                className="focus-ring rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-strong)]"
              >
                Get started
              </Link>
            </div>
          </div>
        </nav>

        <section className="surface rounded-3xl p-8 md:p-12">
          <p className="mb-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            AI Content Operations
          </p>
          <h2 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            Run a complete content pipeline from one intelligent SaaS workspace
          </h2>
          <p className="mt-4 max-w-2xl text-base text-[var(--muted)] md:text-lg">
            Generate campaigns, review drafts, and monitor performance with a unified interface built for modern marketing teams.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="focus-ring rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-strong)]"
            >
              Start free trial
            </Link>
            <Link
              href="/dashboard"
              className="focus-ring rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--border-strong)]"
            >
              Explore dashboard
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="Studio Workflows"
            desc="Create platform-specific drafts with clear structure and reusable brand context."
          />
          <FeatureCard
            title="Review Governance"
            desc="Move posts from AI generation to human approval with full visibility across the queue."
          />
          <FeatureCard
            title="Performance Intelligence"
            desc="Track publish velocity and engagement signals to optimize upcoming campaigns."
          />
        </section>

        <footer className="pb-2 text-center text-sm text-[var(--muted)]">
          Copyright 2026 Synaptic Surge. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="surface rounded-2xl p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{desc}</p>
    </div>
  );
}
