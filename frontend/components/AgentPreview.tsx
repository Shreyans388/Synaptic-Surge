"use client";

import { Terminal, CheckCircle2, Search, Zap } from "lucide-react";

export default function AgentPreview() {
  const logs = [
    {
      icon: <Search size={14} />,
      text: "Scanning LinkedIn for 'SaaS Growth' hooks...",
      color: "text-blue-500",
    },
    {
      icon: <Zap size={14} />,
      text: "Trend detected: 'Agentic Workflows'. Creating draft...",
      color: "text-yellow-500",
    },
    {
      icon: <CheckCircle2 size={14} />,
      text: "Post optimized for 2:15 PM EST (Peak Resonance)",
      color: "text-green-500",
    },
  ];

  return (
    <div className="mx-auto mt-12 max-w-4xl rounded-2xl bg-gradient-to-b from-gray-200 to-transparent p-1 dark:from-gray-800 dark:to-transparent">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#0B0E14]">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
            <Terminal size={12} /> loomin_core_v1.0.0
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Active Intelligence</h4>
              {logs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800/50 dark:bg-gray-900/50"
                >
                  <span className={log.color}>{log.icon}</span>
                  <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{log.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
              <p className="mb-2 text-xs italic text-gray-500">Agent Draft Preview:</p>
              <p className="font-medium leading-relaxed text-gray-800 dark:text-gray-200">
                &quot;The biggest shift in 2026 is not AI writing your posts, it is AI choosing what to write based on real-time market sentiment.&quot;
              </p>
              <div className="mt-4 flex gap-2">
                <button className="rounded-md border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] text-green-600">
                  Approve
                </button>
                <button className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] text-red-600">
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
