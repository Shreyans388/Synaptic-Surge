"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/state/auth.store";
import { useBrandStore } from "@/state/brand.store";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const fetchBrands = useBrandStore((s) => s.fetchBrands);

  useEffect(() => {
    if (user) {
      fetchBrands();
    }
  }, [user, fetchBrands]);

  return (
    <div>
      {children}
    </div>
  );
}