"use client";

import { usePathname } from "next/navigation";
import { useGlobalStore } from "@/state/global.store";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/studio": "Content Studio",
  "/review": "Review Queue",
  "/intelligence": "Intelligence Center",
  "/settings": "Settings",
};

export default function Topbar() {
  const pathname = usePathname();
  const theme = useGlobalStore((state) => state.theme);
  const setTheme = useGlobalStore((state) => state.setTheme);
  const activeBrand = useGlobalStore((state) => state.activeBrand);

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 py-4 backdrop-blur-md md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Workspace
          </p>
          <h2 className="text-lg font-semibold">
            {TITLES[pathname] ?? "Synaptic Surge"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--muted)] sm:block">
            Brand: <span className="font-medium text-[var(--foreground)]">{activeBrand?.name ?? "None"}</span>
          </div>

          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium hover:border-[var(--border-strong)]"
          >
            {theme === "light" ? "Dark" : "Light"} mode
          </button>
        </div>
      </div>
    </header>
  );
}
