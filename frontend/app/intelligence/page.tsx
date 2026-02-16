"use client";

import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "@/state/global.store";
import { getPosts } from "@/services/api/posts.api";

export default function IntelligencePage() {
  const activeBrandId = useGlobalStore((s) => s.activeBrand);

  const { data: posts = [] } = useQuery({
    queryKey: ["posts", activeBrandId],
    queryFn: () => getPosts(activeBrandId?.id as string),
    enabled: !!activeBrandId,
  });

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
          title="Optimization Signals"
          value="3 Active"
        />
      </div>
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
    <div className="p-4 border rounded-xl bg-white dark:bg-gray-900">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-semibold">{value}</h2>
    </div>
  );
}