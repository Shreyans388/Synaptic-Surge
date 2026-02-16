"use client";

import { useGlobalStore } from "@/state/global.store";

export default function SettingsPage() {
  const theme = useGlobalStore((s) => s.theme);
  const setTheme = useGlobalStore((s) => s.setTheme);
  const logout = useGlobalStore((s) => s.logout);

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
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}