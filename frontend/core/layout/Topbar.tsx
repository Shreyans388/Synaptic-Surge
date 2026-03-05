"use client";

import { useBrandStore } from "@/state/brand.store";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/studio": "Content Studio",
  "/intelligence": "Intelligence Center",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export default function Topbar() {
  const pathname = usePathname();

  const brands = useBrandStore((state) => state.brands);
  const activeBrand = useBrandStore((state) => state.activeBrand);
  const setActiveBrand = useBrandStore((state) => state.setActiveBrand);

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 py-4 backdrop-blur-md md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Workspace
          </p>
          <h2 className="text-lg font-semibold">
            {TITLES[pathname] ?? "LOOMIN"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--muted)] sm:flex">
            <select
              value={activeBrand?._id ?? ""}
              onChange={(e) => {
                const selected = brands.find(
                  (brand) => brand._id === e.target.value
                );
                if (selected) {
                  setActiveBrand(selected._id);
                }
              }}
              className="ui-select py-1.5 text-xs"
            >
              <option value="">None</option>

              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}