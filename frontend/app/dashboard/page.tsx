"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/services/api/posts.api";
import { getBrandConnections } from "@/services/api/brand.api";
import { useBrandStore } from "@/state/brand.store";
import { Post } from "@/types/domain.type";
import {
  Rocket,
  CheckCircle,
  LayoutGrid,
  Plus,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import PostAnalyticsDashboard from "@/components/PostAnalyticsDashboard";
import CreateBrandForm from "@/components/CreateBrandForm";
import SocialConnections from "@/components/SocialConnections";


export default function DashboardPage() {
  const {
    activeBrand,
    brands,
    fetchBrands,
  } = useBrandStore();

  const [showCreateBrand, setShowCreateBrand] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // POSTS QUERY
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["posts", activeBrand?._id],
    queryFn: () => getPosts(activeBrand?._id as string),
    enabled: !!activeBrand?._id,
  });

  // CONNECTIONS QUERY
  const { data: connections = [] } = useQuery({
    queryKey: ["brand-connections", activeBrand?._id],
    queryFn: () => getBrandConnections(activeBrand?._id as string),
    enabled: !!activeBrand?._id,
  });

  if (!activeBrand && brands.length === 0 && !showCreateBrand) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <LayoutGrid className="w-14 h-14 text-gray-400" />
        <h2 className="text-xl font-bold dark:text-white">
          No brands yet
        </h2>
        <p className="text-gray-500">
          Create your first brand to activate your AI agents.
        </p>
        <button
          onClick={() => setShowCreateBrand(true)}
          className="ui-btn-primary px-6 py-3"
        >
          + Create Brand
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black dark:text-white">
          Agent Command
        </h1>

        <button
          onClick={() => setShowCreateBrand(!showCreateBrand)}
          className="ui-btn-primary font-bold"
        >
          <Plus size={16} />
          {showCreateBrand ? "Close" : "Create Brand"}
        </button>
      </div>

      {showCreateBrand ? (
        <div className="ui-dialog-backdrop">
          <div className="ui-dialog-panel max-w-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h3 className="text-lg font-semibold">Create Brand</h3>
              <button
                type="button"
                onClick={() => setShowCreateBrand(false)}
                className="ui-btn-secondary rounded-lg p-2"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <CreateBrandForm onSuccess={() => setShowCreateBrand(false)} onCancel={() => setShowCreateBrand(false)} />
            </div>
          </div>
        </div>
      ) : null}

      {/* ACTIVE BRAND CONTENT */}
      {activeBrand && (
        <>
          {/* SOCIAL CONNECTIONS (ONLY IF NONE CONNECTED) */}
          {connections.length === 0 && (
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14] p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold dark:text-white">
                  Connect your social platforms
                </h2>
                <p className="text-sm text-gray-500">
                  Connect LinkedIn, Instagram, or Twitter to start publishing content.
                </p>
              </div>

              <SocialConnections brandId={activeBrand._id} />
            </div>
          )}

          {/* METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard
              title="Total Fleet"
              value={posts.length}
              icon={Rocket}
              color="text-blue-500"
            />
            <MetricCard
              title="Deploys"
              value={posts.filter(p => p.overallStatus === "published").length}
              icon={CheckCircle}
              color="text-green-500"
            />
          </div>

          {/* ANALYTICS */}
          <PostAnalyticsDashboard posts={posts} />
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14]">
      <div className="flex justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">
            {title}
          </p>
          <h3 className="text-3xl font-black dark:text-white">
            {value}
          </h3>
        </div>

        <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
