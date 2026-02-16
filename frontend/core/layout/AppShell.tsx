"use client";

import { usePathname } from "next/navigation";
import AppLayout from "@/core/layout/AppLayout";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicRoute =
    !!pathname && Array.from(PUBLIC_ROUTES).some((route) => pathname === route);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
