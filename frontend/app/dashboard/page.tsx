"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPosts, approvePost } from "@/services/api/posts.api";
import { useGlobalStore } from "@/state/global.store";
import { Post } from "@/types/domain.type";
import { StatusBadge } from "@/modules/dashboard/StatusBadge";
import SummaryCard from "@/modules/dashboard/SummaryCard";

export default function DashboardPage() {
  const activeBrandId = useGlobalStore((state) => state.activeBrand);
  const queryClient = useQueryClient();

  // -----------------------
  // Fetch Posts
  // -----------------------
  const {
    data: posts = [],
    isLoading,
    isError,
  } = useQuery<Post[]>({
    queryKey: ["posts", activeBrandId],
    queryFn: () => getPosts(activeBrandId as string),
    enabled: !!activeBrandId,
  });

  // -----------------------
  // Approve Mutation
  // -----------------------
  const approveMutation = useMutation({
    mutationFn: approvePost,

    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({
        queryKey: ["posts", activeBrandId],
      });

      const previousPosts = queryClient.getQueryData<Post[]>([
        "posts",
        activeBrandId,
      ]);

      queryClient.setQueryData<Post[]>(
        ["posts", activeBrandId],
        (old = []) =>
          old.map((p) =>
            p.id === postId
              ? { ...p, overallStatus: "published" }
              : p
          )
      );

      return { previousPosts };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(
          ["posts", activeBrandId],
          context.previousPosts
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts", activeBrandId],
      });
    },
  });

  // -----------------------
  // Derived Dashboard Metrics
  // -----------------------
  const totalPosts = posts.length;
  const publishedPosts = posts.filter(
    (p) => p.overallStatus === "published"
  ).length;
  const awaitingReview = posts.filter(
    (p) => p.overallStatus === "awaiting_review"
  ).length;

  // -----------------------
  // UI States
  // -----------------------
  if (!activeBrandId) {
    return <div className="p-6">Select a brand to continue.</div>;
  }

  if (isLoading) {
    return <div className="p-6">Loading posts...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Error loading posts.</div>;
  }

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Total Posts" value={totalPosts} />
        <SummaryCard title="Published" value={publishedPosts} />
        <SummaryCard title="Awaiting Review" value={awaitingReview} />
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
          >
            <h2 className="font-medium text-lg">
              {post.masterBrief.topic}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Target: {post.masterBrief.targetAudience}
            </p>

            <p className="mt-2 text-sm">
              Status:{" "}
              <StatusBadge status={post.overallStatus} />
            </p>

            {post.overallStatus !== "published" && (
              <button
                onClick={() => approveMutation.mutate(post.id)}
                disabled={approveMutation.isPending}
                className="mt-3 px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {approveMutation.isPending
                  ? "Publishing..."
                  : "Approve & Publish"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}