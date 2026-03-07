"use client";

import { Zap } from "lucide-react";

export function LoominLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: "h-6 w-6 rounded-lg",
    md: "h-8 w-8 rounded-xl",
    lg: "h-12 w-12 rounded-2xl",
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 24,
  };

  return (
    <div className="flex items-center gap-3 group">
      <div className={`relative flex items-center justify-center overflow-hidden bg-linear-to-br from-sky-400 to-indigo-600 shadow-[0_0_16px_-6px_rgba(14,165,233,0.35)] transition-transform group-hover:scale-105 ${dimensions[size]}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.24),transparent_75%)] opacity-30" />
        
        <Zap 
          size={iconSizes[size]} 
          className="relative z-10 text-white drop-shadow-md" 
          fill="currentColor" 
        />
        
        <div className="absolute inset-0 h-full w-full -translate-y-full bg-linear-to-b from-transparent via-white/6 to-transparent animate-[scan_3s_linear_infinite]" />
      </div>
      <span className={size === "lg" ? "text-2xl font-black tracking-tighter" : "text-sm font-black tracking-tighter uppercase"}>
        Loomin <span className="text-sky-500">AI</span>
      </span>
    </div>
  );
}

