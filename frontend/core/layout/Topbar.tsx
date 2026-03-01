"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "@/state/global.store";
import { getBrands } from "@/services/api/brand.api";

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
  const setActiveBrand = useGlobalStore((state) => state.setActiveBrand);

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

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
          <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--muted)] sm:flex">
            <span>Brand</span>
            <select
              value={activeBrand?.id ?? ""}
              onChange={(e) => {
                const selected = brandsQuery.data?.find((brand) => brand._id === e.target.value);
                if (selected) {
                  setActiveBrand({ id: selected._id, name: selected.name });
                }
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--foreground)]"
            >
              <option value="">{brandsQuery.isLoading ? "Loading..." : "None"}</option>
              {(brandsQuery.data ?? []).map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>
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
