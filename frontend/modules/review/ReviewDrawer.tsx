"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approvePost } from "@/services/api/posts.api";
import { Post } from "@/types/domain.type";
import { useGlobalStore } from "@/state/global.store";

interface Props {
  post: Post;
  onClose: () => void;
}

export default function ReviewDrawer({ post, onClose }: Props) {
  const activeBrandId = useGlobalStore((s) => s.activeBrand);
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: approvePost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts", activeBrandId],
      });
      onClose();
    },
  });

  return (
    <div className="fixed top-0 right-0 w-[400px] h-full bg-white dark:bg-gray-900 border-l shadow-lg p-6 overflow-y-auto">
      <button
        onClick={onClose}
        className="mb-4 text-sm text-gray-500"
      >
        Close
      </button>

      <h2 className="text-lg font-semibold mb-4">
        {post.masterBrief.topic}
      </h2>

      {post.platformDrafts.map((draft, i) => (
        <div key={i} className="mb-4">
          <h3 className="text-sm font-medium capitalize">
            {draft.platform}
          </h3>
          <p className="text-sm mt-2">{draft.content}</p>
        </div>
      ))}

      <button
        onClick={() => approveMutation.mutate(post.id)}
        className="mt-4 w-full bg-indigo-600 text-white py-2 rounded"
      >
        Approve & Publish
      </button>
    </div>
  );
}