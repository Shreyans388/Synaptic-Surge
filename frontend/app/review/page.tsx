"use client";

import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/services/api/posts.api";
import { useGlobalStore } from "@/state/global.store";
import { useState } from "react";
import ReviewDrawer from "@/modules/review/ReviewDrawer";
import { Post } from "@/types/domain.type";

export default function ReviewPage() {
  const activeBrand = useGlobalStore((s) => s.activeBrand);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["posts", activeBrand?._id],
    queryFn: () => getPosts(activeBrand?._id as string),
    enabled: !!activeBrand?._id,
  });

  if (isLoading) return <div className="p-6">Loading...</div>;

  const reviewQueue = posts.filter(
    (p) => p.overallStatus === "awaiting_review"
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Review Queue</h1>

      <div className="space-y-4">
        {reviewQueue.map((post) => (
          <div
            key={post.id}
            className="p-4 border rounded-xl cursor-pointer hover:shadow-sm"
            onClick={() => setSelectedPost(post)}
          >
            <h2>{post.masterBrief.topic}</h2>
            <p className="text-sm text-gray-500">
              Target: {post.masterBrief.targetAudience}
            </p>
          </div>
        ))}
      </div>

      {selectedPost && (
        <ReviewDrawer
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
