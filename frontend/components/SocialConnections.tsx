"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Linkedin, Instagram, Twitter } from "lucide-react";
import type { ComponentType } from "react";

import {
  buildOauthConnectUrl,
  disconnectPlatform,
  getBrandConnections,
  type SocialProvider,
} from "@/services/api/brand.api";

const PROVIDERS: Array<{
  key: SocialProvider;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}> = [
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "twitter", label: "Twitter / X", icon: Twitter },
];

interface Props {
  brandId?: string;
  oauthStatus?: string | null;
  oauthProvider?: string | null;
}

export default function SocialConnections({
  brandId,
  oauthStatus,
  oauthProvider,
}: Props) {
  const queryClient = useQueryClient();
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  const connectionsQuery = useQuery({
    queryKey: ["brand-connections", brandId],
    queryFn: () => getBrandConnections(brandId!),
    enabled: Boolean(brandId),
  });

  const connectedPlatforms = useMemo(
    () => new Set((connectionsQuery.data ?? []).map((item) => item.platform)),
    [connectionsQuery.data]
  );

  const disconnectMutation = useMutation({
    mutationFn: ({ provider }: { provider: SocialProvider }) =>
      disconnectPlatform(brandId!, provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-connections", brandId] });
    },
  });

  const handleOAuthConnect = (providerKey: SocialProvider) => {
    if (!brandId) return alert("Please select a brand first.");

    try {
      setConnectingProvider(providerKey);
      const url = buildOauthConnectUrl(providerKey, brandId);
      window.location.assign(url);
    } catch (error) {
      console.error(error);
      setConnectingProvider(null);
    }
  };

  if (!brandId) {
    return <p className="text-sm text-(--muted)">Create or select a brand first.</p>;
  }

  return (
    <>
      {oauthStatus && (
        <p
          className={`text-sm ${
            oauthStatus === "connected" || oauthStatus === "true"
              ? "text-green-600"
              : "text-amber-600"
          }`}
        >
          OAuth {oauthProvider ? `(${oauthProvider}) ` : ""}status:{" "}
          {oauthStatus === "true" ? "connected" : oauthStatus}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {PROVIDERS.map((provider) => {
          const Icon = provider.icon;
          const isConnected = connectedPlatforms.has(provider.key);
          const isConnectingThis = connectingProvider === provider.key;

          return (
            <article
              key={provider.key}
              className="rounded-xl border border-(--border) bg-(--surface-elevated) p-4"
            >
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
                  onClick={() =>
                    disconnectMutation.mutate({ provider: provider.key })
                  }
                  disabled={disconnectMutation.isPending}
                  className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/20"
                >
                  {disconnectMutation.isPending
                    ? "Disconnecting..."
                    : "Disconnect"}
                </button>
              ) : (
                <button
                  onClick={() => handleOAuthConnect(provider.key)}
                  disabled={isConnectingThis}
                  className="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  {isConnectingThis
                    ? "Redirecting..."
                    : `Connect ${provider.label}`}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}