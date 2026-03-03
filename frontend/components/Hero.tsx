// components/Hero.tsx
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-20 pb-16 px-6 text-center">
      <div className="mx-auto mb-8 flex max-w-fit items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
        <Sparkles size={14} />
        The Agentic Social Era is Here
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
        Stop Scheduling. <br />
        <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
          Start Looming.
        </span>
      </h1>

      <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-10">
        Loomin agents don&apos;t just post content. They research trends, mimic your voice,
        and engage with your niche while you focus on building.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-xl bg-sky-600 px-8 py-4 font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-700"
        >
          Deploy Your Agent
        </Link>
        <button className="px-8 py-4 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
          Watch Demo
        </button>
      </div>
    </section>
  );
}
