"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/studio", label: "Studio" },
  { href: "/review", label: "Review Queue" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-[var(--border)] bg-[var(--surface)] p-5 lg:block">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Synaptic Surge
        </p>
        <h1 className="mt-2 text-xl font-semibold">Control Center</h1>
      </div>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
