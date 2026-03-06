"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Stores
import { useGlobalStore } from "@/state/global.store";
import { useAuthStore } from "@/state/auth.store";

// API Services
import { logoutUser } from "@/services/api/auth.api";
import {
  createBrand,
  getBrandConnections,
  getBrands,
  updateBrand,
  type BrandRecord,
} from "@/services/api/brand.api";
import SocialConnections from "@/components/SocialConnections";

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

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
  const [isBrandProfileOpen, setIsBrandProfileOpen] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

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

  const selectedBrandRecord =
    activeBrand?._id && brandsQuery.data
      ? brandsQuery.data.find((brand) => brand._id === activeBrand._id) ?? null
      : null;

  const connectedPlatforms = useMemo(
    () => new Set((connectionsQuery.data ?? []).map((item) => item.platform)),
    [connectionsQuery.data]
  );
  const userInitials = useMemo(() => {
    const name = user?.fullName?.trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [user?.fullName]);

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

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      logout();
      router.push("/login");
    },
  });

  return (
    <div className="max-w-4xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-500/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-14 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold tracking-wide">
              {userInitials}
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.18em] text-sky-200/90">User Profile</p>
              <h2 className="text-xl font-semibold leading-tight">{user?.fullName ?? "Your account"}</h2>
              <p className="text-sm text-slate-200">{user?.email ?? "No email available"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              <p className="text-lg font-semibold">{brandsQuery.data?.length ?? 0}</p>
              <p className="text-xs text-slate-300">Brands</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              <p className="text-lg font-semibold">{connectedPlatforms.size}</p>
              <p className="text-xs text-slate-300">Connected</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              <p className="truncate text-sm font-medium">{activeBrand?.name ?? "None"}</p>
              <p className="text-xs text-slate-300">Active Brand</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ui-panel space-y-4 p-5">
        <div>
          <h2 className="text-lg font-semibold">Brands</h2>
          <p className="text-sm text-[var(--muted)]">Select the active brand used across dashboard, studio, and social connections.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(brandsQuery.data ?? []).map((brand) => (
            <button
              key={brand._id}
              onClick={() => setActiveBrand({ _id: brand._id, name: brand.name })}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                activeBrand?._id === brand._id
                  ? "border-sky-500 bg-sky-500/10 text-sky-300"
                  : "border-[var(--border)] bg-[var(--surface-elevated)] hover:border-sky-500/45"
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
            className="ui-btn-primary"
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
              className="ui-input flex-1"
            />
            <button
              type="submit"
              disabled={createBrandMutation.isPending}
              className="ui-btn-primary"
            >
              <Plus size={16} /> Save
            </button>
            <button
              type="button"
              onClick={() => {
                setNewBrandName("");
                setIsAddBrandOpen(false);
              }}
              className="ui-btn-secondary"
            >
              Cancel
            </button>
          </form>
        )}
      </section>

      <section className="ui-panel space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Brand Profile</h2>
            <p className="text-sm text-[var(--muted)]">Save voice and creative metadata for this brand.</p>
          </div>
          {activeBrand && selectedBrandRecord ? (
            <button
              type="button"
              onClick={() => setIsBrandProfileOpen((prev) => !prev)}
              className="ui-btn-secondary"
            >
              <Pencil size={14} />
              {isBrandProfileOpen ? "Close" : "Edit Profile"}
            </button>
          ) : null}
        </div>

        {!activeBrand || !selectedBrandRecord ? (
          <p className="text-sm text-[var(--muted)]">Create or select a brand first.</p>
        ) : !isBrandProfileOpen ? (
          <p className="text-sm text-[var(--muted)]">Brand profile is collapsed. Click Edit Profile to open it.</p>
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
                className="ui-input"
              />
              <input
                name="brandStyle"
                defaultValue={selectedBrandRecord.brandStyle ?? ""}
                placeholder="Brand style"
                className="ui-input"
              />
              <input
                name="brandVoice"
                defaultValue={selectedBrandRecord.brandVoice ?? ""}
                placeholder="Brand voice"
                className="ui-input"
              />
              <input
                name="ctaStyle"
                defaultValue={selectedBrandRecord.ctaStyle ?? ""}
                placeholder="CTA style"
                className="ui-input"
              />
              <input
                name="logoUrl"
                defaultValue={selectedBrandRecord.logoUrl ?? selectedBrandRecord.logo ?? ""}
                placeholder="Logo URL"
                className="ui-input"
              />
              <select
                name="logoPosition"
                defaultValue={(selectedBrandRecord.logoPosition as LogoPosition | undefined) ?? "top-right"}
                className="ui-select"
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
              className="ui-input w-full"
            />

            {profileSaveError ? (
              <p className="text-sm text-red-400">{profileSaveError}</p>
            ) : null}

            <button
              type="submit"
              disabled={saveProfileMutation.isPending}
              className="ui-btn-primary"
            >
              {saveProfileMutation.isPending ? "Saving..." : "Save Brand Profile"}
            </button>
          </form>
        )}
      </section>

     <section className="ui-panel space-y-4 p-5">
  <div>
    <h2 className="text-lg font-semibold">Social Connections</h2>
    <p className="text-sm text-[var(--muted)]">
      Connect LinkedIn, Instagram, and Twitter for your active brand.
    </p>
  </div>

  <SocialConnections
    brandId={activeBrand?._id}
    oauthStatus={oauthStatus}
    oauthProvider={oauthProvider}
  />
</section>
      <section className="ui-panel space-y-3 p-5">
        <h2 className="text-lg font-semibold">Account</h2>
        <button
          onClick={() => logoutMutation.mutate()}
          className="ui-btn-danger"
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </button>
      </section>
    </div>
  );
}
