"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "@/state/global.store";
import { getPosts } from "@/services/api/posts.api";
import { syncAnalyticsNotifications } from "@/services/api/notifications.api";
import PostAnalyticsDashboard from "@/components/PostAnalyticsDashboard";

export default function IntelligencePage() {
  const activeBrand = useGlobalStore((s) => s.activeBrand);

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

  const engagementScore =
    posts.length > 0
      ? Math.round(
          (posts.filter((p) => p.overallStatus === "published")
            .length /
            posts.length) *
            100
        )
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
        />
        <InsightCard
          title="Published Posts"
          value={
            posts.filter(
              (p) => p.overallStatus === "published"
            ).length
          }
        />
        <InsightCard
          title="AI-Analyzed Posts"
          value={posts.filter((p) => !!p.aiResponse).length}
        />
      </div>

      <PostAnalyticsDashboard posts={posts} />
    </div>
  );
}

function InsightCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="p-4 border rounded-xl bg-[var(--surface)]">
      <p className="text-sm text-[var(--muted)]">{title}</p>
      <h2 className="text-xl font-semibold">{value}</h2>
    </div>
  );
}
