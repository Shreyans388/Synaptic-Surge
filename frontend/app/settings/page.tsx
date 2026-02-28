"use client";

import { useGlobalStore } from "@/state/global.store";
import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "@/services/api/auth.api";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const theme = useGlobalStore((s) => s.theme);
  const setTheme = useGlobalStore((s) => s.setTheme);
  const logout = useGlobalStore((s) => s.logout);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      logout();
      router.push("/login");
    },
  });

  return (
    <div className="p-6 max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div>
        <h2 className="font-medium mb-2">Theme</h2>
        <button
          onClick={() =>
            setTheme(theme === "light" ? "dark" : "light")
          }
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Toggle Theme
        </button>
      </div>

      <div>
        <h2 className="font-medium mb-2">Account</h2>
        <button
          onClick={() => mutation.mutate()}
          className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-60"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}