"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateDraft } from "@/services/api/posts.api";
import { useGlobalStore } from "@/state/global.store";

export default function StudioPage() {
  const activeBrandId = useGlobalStore((s) => s.activeBrand);
  const queryClient = useQueryClient();

  const [topic, setTopic] = useState("");

  const mutation = useMutation({
    mutationFn: (topic: string) =>
      generateDraft(activeBrandId?.id as string, topic),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts", activeBrandId],
      });
      setTopic("");
    },
  });

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">
        Content Studio
      </h1>

      <input
        type="text"
        placeholder="Enter topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      />

      <button
        onClick={() => mutation.mutate(topic)}
        disabled={!topic || mutation.isPending}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        {mutation.isPending ? "Generating..." : "Generate Draft"}
      </button>
    </div>
  );
}