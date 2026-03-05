"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Linkedin, Instagram, Twitter, Plus, Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAuthStore } from "@/state/auth.store";
import {
  buildOauthConnectUrl,
  createBrand,
  disconnectPlatform,
  getBrandConnections,
  getBrands,
  updateBrand,
  type BrandRecord,
  type SocialProvider,
} from "@/services/api/brand.api";

import SocialConnections from "@/components/SocialConnections";
import { useBrandStore } from "@/state/brand.store";
import { logoutUser } from "@/services/api/auth.api";

type LogoPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

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

  const activeBrand = useBrandStore((s) => s.activeBrand);
  const setActiveBrand = useBrandStore((s) => s.setActiveBrand);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [newBrandName, setNewBrandName] = useState("");
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isBrandProfileOpen, setIsBrandProfileOpen] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  const oauthStatus =
    searchParams.get("status") || searchParams.get("linkedin_connected");
  const oauthProvider = searchParams.get("oauth") || "linkedin";

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const connectionsQuery = useQuery({
    queryKey: ["brand-connections", activeBrand?._id],
    queryFn: () => getBrandConnections(activeBrand!._id),
    enabled: Boolean(activeBrand?._id),
  });

  useEffect(() => {
    if (activeBrand || !brandsQuery.data?.length) return;
    setActiveBrand(brandsQuery.data[0]._id);
  }, [activeBrand, brandsQuery.data, setActiveBrand]);

  const selectedBrandRecord =
    activeBrand?._id && brandsQuery.data
      ? brandsQuery.data.find((b) => b._id === activeBrand._id) ?? null
      : null;

  const connectedPlatforms = useMemo(
    () => new Set((connectionsQuery.data ?? []).map((c) => c.platform)),
    [connectionsQuery.data]
  );

  const createBrandMutation = useMutation({
    mutationFn: () => createBrand({ name: newBrandName.trim() }),
    onSuccess: (brand: BrandRecord) => {
      setNewBrandName("");
      setIsAddBrandOpen(false);
      setActiveBrand(brand._id);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const brandId = activeBrand?._id ?? selectedBrandRecord?._id;
      if (!brandId) throw new Error("No active brand selected");

      const brandColors = String(formData.get("brandColors") ?? "")
        .split(",")
        .map((i) => i.trim())
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
      setProfileSaveError(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      logout();
      router.push("/login");
    },
  });

  const handleOAuthConnect = async (providerKey: string) => {
    if (!activeBrand?._id) return alert("Please select a brand first.");

    try {
      setConnectingProvider(providerKey);
      const url = buildOauthConnectUrl(providerKey as SocialProvider, activeBrand._id);
      window.location.assign(url);
    } catch {
      alert(`Could not initiate ${providerKey} connection.`);
      setConnectingProvider(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Brands */}
      <section className="ui-panel space-y-4 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Brands</h2>
            <p className="text-sm text-[var(--muted)]">
              Select the active brand used across dashboard, studio, and social connections.
            </p>
          </div>

          {!isAddBrandOpen && (
            <button
              onClick={() => setIsAddBrandOpen(true)}
              className="ui-btn-primary"
            >
              <Plus size={16} /> Add Brand
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(brandsQuery.data ?? []).map((brand) => (
            <button
              key={brand._id}
              onClick={() => setActiveBrand(brand._id)}
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

        {isAddBrandOpen && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newBrandName.trim()) return;
              createBrandMutation.mutate();
            }}
            className="flex gap-2 max-w-md"
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
  <div className="flex items-start justify-between">
    <div>
      <h2 className="text-lg font-semibold">Brand Profile</h2>
      <p className="text-sm text-[var(--muted)]">
        Save voice and creative metadata for this brand.
      </p>
    </div>

    {activeBrand && selectedBrandRecord && (
      <Dialog>
        <DialogTrigger asChild>
          <button className="ui-btn-secondary">
            <Pencil size={14} />
            Edit Profile
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Brand Profile</DialogTitle>
          </DialogHeader>

          <form
            key={selectedBrandRecord._id}
            className="space-y-4"
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
                defaultValue={
                  selectedBrandRecord.logoUrl ??
                  selectedBrandRecord.logo ??
                  ""
                }
                placeholder="Logo URL"
                className="ui-input"
              />

              <select
                name="logoPosition"
                defaultValue={
                  (selectedBrandRecord.logoPosition as LogoPosition) ??
                  "top-right"
                }
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

            {profileSaveError && (
              <p className="text-sm text-red-400">{profileSaveError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={saveProfileMutation.isPending}
                className="ui-btn-primary"
              >
                {saveProfileMutation.isPending
                  ? "Saving..."
                  : "Save Profile"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )}
  </div>

  <p className="text-sm text-[var(--muted)]">
    Edit profile to configure brand voice, colors, and logo metadata.
  </p>
</section>
      {/* Social Connections */}
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

      {/* Account */}
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