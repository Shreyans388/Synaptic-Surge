"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Linkedin, Instagram, Twitter, Plus, Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Stores
import { useGlobalStore } from "@/state/global.store";
import { useAuthStore } from "@/state/auth.store";

// API Services
import { logoutUser } from "@/services/api/auth.api";
import axiosInstance from "@/services/axios"; // Adjust path if your axios instance is located elsewhere
import {
  createBrand,
  disconnectPlatform,
  getBrandConnections,
  getBrands,
  updateBrand,
  type BrandRecord,
  type SocialProvider,
} from "@/services/api/brand.api";

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

const PROVIDERS: Array<{
  key: SocialProvider;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}> = [
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "twitter", label: "Twitter / X", icon: Twitter },
];

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Global Store
  const activeBrand = useGlobalStore((s) => s.activeBrand);
  const setActiveBrand = useGlobalStore((s) => s.setActiveBrand);

  // Auth Store
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [newBrandName, setNewBrandName] = useState("");
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isBrandProfileOpen, setIsBrandProfileOpen] = useState(true);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  const oauthStatus = searchParams.get("status") || searchParams.get("linkedin_connected");
  const oauthProvider = searchParams.get("oauth") || "linkedin";

  // Queries
  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const connectionsQuery = useQuery({
    queryKey: ["brand-connections", activeBrand?._id],
    queryFn: () => getBrandConnections(activeBrand!._id),
    enabled: Boolean(activeBrand?._id),
  });

  // Effects & Computed Data
  useEffect(() => {
    if (activeBrand || !brandsQuery.data?.length) return;
    const first = brandsQuery.data[0];
    setActiveBrand({ _id: first._id, name: first.name });
  }, [activeBrand, brandsQuery.data, setActiveBrand]);

  useEffect(() => {
    if (activeBrand?._id) {
      setIsBrandProfileOpen(true);
    }
  }, [activeBrand?._id]);

  const selectedBrandRecord =
    activeBrand?._id && brandsQuery.data
      ? brandsQuery.data.find((brand) => brand._id === activeBrand._id) ?? null
      : null;

  const connectedPlatforms = useMemo(
    () => new Set((connectionsQuery.data ?? []).map((item) => item.platform)),
    [connectionsQuery.data]
  );

  // Mutations
  const createBrandMutation = useMutation({
    mutationFn: () => createBrand({ name: newBrandName.trim() }),
    onSuccess: (brand: BrandRecord) => {
      setNewBrandName("");
      setIsAddBrandOpen(false);
      setActiveBrand({ _id: brand._id, name: brand.name });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const brandId = activeBrand?._id ?? selectedBrandRecord?._id;
      if (!brandId) throw new Error("No active brand selected");

      const brandColors = String(formData.get("brandColors") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      return updateBrand(brandId, {
        brandColors,
        brandStyle: String(formData.get("brandStyle") ?? "").trim() || undefined,
        brandText: String(formData.get("brandText") ?? "").trim() || undefined,
        brandVoice: String(formData.get("brandVoice") ?? "").trim() || undefined,
        ctaStyle: String(formData.get("ctaStyle") ?? "").trim() || undefined,
        logoUrl: String(formData.get("logoUrl") ?? "").trim() || undefined,
        logo: String(formData.get("logoUrl") ?? "").trim() || undefined,
        logoPosition: String(formData.get("logoPosition") ?? "top-right") as LogoPosition,
        description: String(formData.get("brandText") ?? "").trim() || undefined,
      });
    },
    onSuccess: () => {
      setProfileSaveError(null);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsBrandProfileOpen(false);
      alert("Profile saved successfully!");
    },
    onError: (error: Error) => {
      setProfileSaveError(error.message || "Failed to save brand profile");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: ({ brandId, provider }: { brandId: string; provider: SocialProvider }) =>
      disconnectPlatform(brandId, provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-connections", activeBrand?._id] });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      logout();
      router.push("/login");
    },
  });

 // OAuth Connect Handler
  const handleOAuthConnect = async (providerKey: string) => {
    if (!user?._id) return alert("Please log in first.");
    if (!activeBrand?._id) return alert("Please select a brand first.");

    try {
      setConnectingProvider(providerKey);
      // Fetch the auth URL from your backend
      const res = await axiosInstance.get(`/auth/${providerKey}/url?userId=${user._id}&brandId=${activeBrand._id}`);
      
      if (res.data.url) {
        // FIX: Use .assign() instead of mutating .href directly
        window.location.assign(res.data.url); 
      }
    } catch (error) {
      console.error(`Failed to connect to ${providerKey}:`, error);
      alert(`Could not initiate ${providerKey} connection.`);
      setConnectingProvider(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="space-y-4 rounded-2xl border border-(--border) bg-(--surface) p-5">
        <div>
          <h2 className="text-lg font-semibold">Brands</h2>
          <p className="text-sm text-(--muted)">Select the active brand used across dashboard, studio, and social connections.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(brandsQuery.data ?? []).map((brand) => (
            <button
              key={brand._id}
              onClick={() => setActiveBrand({ _id: brand._id, name: brand.name })}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                activeBrand?._id === brand._id
                  ? "border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                  : "border-(--border) hover:border-(--border-strong)"
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>

        {!isAddBrandOpen ? (
          <button
            type="button"
            onClick={() => setIsAddBrandOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            <Plus size={16} /> Add Brand
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newBrandName.trim()) return;
              createBrandMutation.mutate();
            }}
            className="flex gap-2"
          >
            <input
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Add a new brand"
              className="flex-1 rounded-xl border border-(--border) bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={createBrandMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-70"
            >
              <Plus size={16} /> Save
            </button>
            <button
              type="button"
              onClick={() => {
                setNewBrandName("");
                setIsAddBrandOpen(false);
              }}
              className="rounded-xl border border-(--border) px-4 py-2 text-sm font-medium hover:border-(--border-strong)"
            >
              Cancel
            </button>
          </form>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-(--border) bg-(--surface) p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Brand Profile</h2>
            <p className="text-sm text-(--muted)">Save voice and creative metadata for this brand.</p>
          </div>
          {activeBrand && selectedBrandRecord ? (
            <button
              type="button"
              onClick={() => setIsBrandProfileOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-3 py-2 text-sm font-medium hover:border-(--border-strong)"
            >
              <Pencil size={14} />
              {isBrandProfileOpen ? "Close" : "Edit Profile"}
            </button>
          ) : null}
        </div>

        {!activeBrand || !selectedBrandRecord ? (
          <p className="text-sm text-(--muted)">Create or select a brand first.</p>
        ) : !isBrandProfileOpen ? (
          <p className="text-sm text-(--muted)">Brand profile is collapsed. Click "Edit Profile" to open it.</p>
        ) : (
          <form
            key={selectedBrandRecord._id}
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setProfileSaveError(null);
              saveProfileMutation.mutate(new FormData(e.currentTarget));
            }}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <input
                name="brandColors"
                defaultValue={(selectedBrandRecord.brandColors ?? []).join(", ")}
                placeholder="Brand colors (comma separated)"
                className="rounded-xl border border-(--border) bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                name="brandStyle"
                defaultValue={selectedBrandRecord.brandStyle ?? ""}
                placeholder="Brand style"
                className="rounded-xl border border-(--border) bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                name="brandVoice"
                defaultValue={selectedBrandRecord.brandVoice ?? ""}
                placeholder="Brand voice"
                className="rounded-xl border border-(--border) bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                name="ctaStyle"
                defaultValue={selectedBrandRecord.ctaStyle ?? ""}
                placeholder="CTA style"
                className="rounded-xl border border-(--border) bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                name="logoUrl"
                defaultValue={selectedBrandRecord.logoUrl ?? selectedBrandRecord.logo ?? ""}
                placeholder="Logo URL"
                className="rounded-xl border border-(--border) bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
              <select
                name="logoPosition"
                defaultValue={(selectedBrandRecord.logoPosition as LogoPosition | undefined) ?? "top-right"}
                className="rounded-xl border border-(--border) bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="top-left">Logo Top Left</option>
                <option value="top-right">Logo Top Right</option>
                <option value="bottom-left">Logo Bottom Left</option>
                <option value="bottom-right">Logo Bottom Right</option>
                <option value="center">Logo Center</option>
              </select>
            </div>

            <textarea
              name="brandText"
              defaultValue={selectedBrandRecord.brandText ?? ""}
              placeholder="Brand text"
              rows={4}
              className="w-full rounded-xl border border-(--border) bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
            />

            {profileSaveError ? (
              <p className="text-sm text-red-400">{profileSaveError}</p>
            ) : null}

            <button
              type="submit"
              disabled={saveProfileMutation.isPending}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-70"
            >
              {saveProfileMutation.isPending ? "Saving..." : "Save Brand Profile"}
            </button>
          </form>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-(--border) bg-(--surface) p-5">
        <div>
          <h2 className="text-lg font-semibold">Social Connections</h2>
          <p className="text-sm text-(--muted)">Connect LinkedIn, Instagram, and Twitter for your active brand.</p>
        </div>

        {!activeBrand ? (
          <p className="text-sm text-(--muted)">Create or select a brand first.</p>
        ) : (
          <>
            {oauthStatus && (
              <p className={`text-sm ${oauthStatus === "connected" || oauthStatus === "true" ? "text-green-600" : "text-amber-600"}`}>
                OAuth {oauthProvider ? `(${oauthProvider}) ` : ""}status: {oauthStatus === "true" ? "connected" : oauthStatus}
              </p>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              {PROVIDERS.map((provider) => {
                const Icon = provider.icon;
                const isConnected = connectedPlatforms.has(provider.key);
                const isConnectingThis = connectingProvider === provider.key;

                return (
                  <article key={provider.key} className="rounded-xl border border-(--border) bg-(--surface-elevated) p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold">
                        <Icon size={16} /> {provider.label}
                      </div>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          isConnected
                            ? "bg-green-500/10 text-green-700 dark:text-green-300"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {isConnected ? "Connected" : "Not connected"}
                      </span>
                    </div>

                    {isConnected ? (
                      <button
                        onClick={() => disconnectMutation.mutate({ brandId: activeBrand._id, provider: provider.key })}
                        disabled={disconnectMutation.isPending}
                        className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/20 disabled:opacity-50"
                      >
                        {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOAuthConnect(provider.key)}
                        disabled={isConnectingThis}
                        className="w-full rounded-lg bg-sky-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                      >
                        {isConnectingThis ? "Redirecting..." : `Connect ${provider.label}`}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-(--border) bg-(--surface) p-5">
        <h2 className="text-lg font-semibold">Account</h2>
        <button
          onClick={() => logoutMutation.mutate()}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </button>
      </section>
    </div>
  );
}
