"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBrandStore } from "@/state/brand.store";
import { getPosts } from "@/services/api/posts.api";
import { syncAnalyticsNotifications } from "@/services/api/notifications.api";
import PostAnalyticsDashboard from "@/components/PostAnalyticsDashboard";
import { LucideIcon, Gauge, Send, Brain } from "lucide-react";



const hasMeaningfulValue = (value: unknown): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulValue(item));
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((item) =>
      hasMeaningfulValue(item)
    );
  }
  return false;
};

const hasUsableAiResponse = (value: unknown): boolean => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return hasMeaningfulValue(value);
};

/* ---------- Page ---------- */

export default function IntelligencePage() {
  const { activeBrand, fetchBrands } = useBrandStore();

  // Ensure brands are loaded
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const { data: posts = [] } = useQuery({
    queryKey: ["posts", activeBrand?._id],
    queryFn: () => getPosts(activeBrand?._id as string),
    enabled: !!activeBrand?._id,
  });

  useEffect(() => {
    if (!activeBrand?._id) return;

    syncAnalyticsNotifications(activeBrand._id).catch((error) => {
      console.error("Failed to sync analytics notifications:", error);
    });
  }, [activeBrand?._id]);

  const publishedPosts = posts.filter(
    (p) => p.overallStatus === "published"
  ).length;

  const aiAnalyzedPosts = posts.filter((p) =>
    hasUsableAiResponse(p.aiResponse)
  ).length;

  const engagementScore =
    posts.length > 0
      ? Math.round((publishedPosts / posts.length) * 100)
      : 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Intelligence Center
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        <InsightCard
          title="Engagement Score"
          value={`${engagementScore}%`}
          icon={Gauge}
        />

        <InsightCard
          title="Published Posts"
          value={publishedPosts}
          icon={Send}
        />

        <InsightCard
          title="AI-Analyzed Posts"
          value={aiAnalyzedPosts}
          icon={Brain}
        />
      </div>

      <PostAnalyticsDashboard posts={posts} />
    </div>
  );
}

/* ---------- UI Card ---------- */

function InsightCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-xl bg-[var(--surface)]">
      <div>
        <p className="text-sm text-[var(--muted)]">{title}</p>
        <h2 className="text-xl font-semibold">{value}</h2>
      </div>

      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
        <Icon size={20} className="opacity-80" />
      </div>
    </div>
  );
}