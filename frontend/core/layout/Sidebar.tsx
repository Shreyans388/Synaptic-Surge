"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio", label: "Studio", icon: PenSquare },
  { href: "/intelligence", label: "Intelligence", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5 lg:block">
      <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          LOOMIN
        </p>
        <h1 className="mt-2 text-xl font-semibold">Operations Hub</h1>
      </div>

      <nav className="space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
        <p className="text-xs text-[var(--muted)]">Workspace status</p>
        <p className="mt-1 text-sm font-medium">All systems operational</p>
      </div>
    </aside>
  );
}
