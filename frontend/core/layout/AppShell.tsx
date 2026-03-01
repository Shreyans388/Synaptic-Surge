"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/core/layout/AppLayout";
import { checkAuth } from "@/services/api/auth.api";
import { useGlobalStore } from "@/state/global.store";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const setAuth = useGlobalStore((state) => state.setAuth);
  const logout = useGlobalStore((state) => state.logout);
  const isPublicRoute =
    !!pathname && Array.from(PUBLIC_ROUTES).some((route) => pathname === route);

  useEffect(() => {
    let mounted = true;
    const syncAuth = async () => {
      const user = await checkAuth();
      if (!mounted) return;

      if (user) {
        setAuth({
          id: user._id,
          name: user.fullName,
          email: user.email,
        });
        if (isPublicRoute && (pathname === "/login" || pathname === "/signup")) {
          router.replace("/dashboard");
        }
      } else {
        logout();
        if (!isPublicRoute) {
          router.replace("/login");
        }
      }

      setAuthChecked(true);
    };

    syncAuth();
    return () => {
      mounted = false;
    };
  }, [isPublicRoute, logout, pathname, router, setAuth]);

  if (!authChecked && !isPublicRoute) {
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
