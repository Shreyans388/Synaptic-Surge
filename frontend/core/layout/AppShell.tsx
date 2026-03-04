"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AppLayout from "@/core/layout/AppLayout";
import { useAuthStore } from "@/state/auth.store";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    isCheckingAuth,
    checkAuth,
    logout,
  } = useAuthStore();

  const isPublicRoute =
    !!pathname && PUBLIC_ROUTES.has(pathname);

  useEffect(() => {
    if (isPublicRoute) return;
    checkAuth();
  }, [checkAuth, isPublicRoute]);

  useEffect(() => {
    if (isCheckingAuth) return;

    if (!user && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (user && (pathname === "/login" || pathname === "/signup")) {
      router.replace("/dashboard");
    }
  }, [user, isCheckingAuth, isPublicRoute, pathname, router]);

  if (isCheckingAuth && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        Loading workspace...
      </div>
    );
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
