// app/page.tsx
import { Bot, Gauge, Radar, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Hero from "@/components/Hero";
import AgentPreview from "@/components/AgentPreview";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  {
    title: "Autonomous Research",
    description:
      "Continuously scans your niche for trends, timing windows, and conversation shifts.",
    icon: Radar,
  },
  {
    title: "Voice Matching",
    description:
      "Learns your tone and structure, then drafts content that still sounds like you.",
    icon: Bot,
  },
  {
    title: "Execution Engine",
    description:
      "Schedules and iterates posts automatically using performance feedback loops.",
    icon: Gauge,
  },
  {
    title: "Guardrails",
    description:
      "Policy checks and approval stages protect your brand before anything is published.",
    icon: ShieldCheck,
  },
];

const stats = [
  { label: "Avg lift in engagement", value: "+42%" },
  { label: "Time saved per week", value: "11 hrs" },
  { label: "Agent actions/day", value: "18k+" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between p-6">
        <div className="flex items-center gap-2 text-xl font-black text-[var(--foreground)]">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500" />
          LOOMIN
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--border-strong)]"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
          >
            Sign up
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <Hero />
      <AgentPreview />

      <section className="mx-auto mt-16 grid w-full max-w-7xl gap-4 px-6 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-3xl font-extrabold text-[var(--foreground)]">{item.value}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-16 w-full max-w-7xl px-6 pb-20">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">Capabilities</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            Built for full-funnel content ops
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--border-strong)]"
            >
              <div className="mb-3 inline-flex rounded-lg bg-sky-500/10 p-2 text-sky-600 dark:text-sky-300">
                <feature.icon size={18} />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
