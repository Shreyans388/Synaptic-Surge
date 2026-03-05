"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useGlobalStore } from "@/state/global.store";
import { useAuthStore } from "@/state/auth.store";
import { generateDraftPost, getPosts, publishDraftPost } from "@/services/api/posts.api";
import { getBrandConnections } from "@/services/api/brand.api";
import { Post } from "@/types/domain.type";

type PublishPlatform = "linkedin" | "instagram";

interface FormState {
  topic: string;
  tone: string;
  postDetails: string;
  context: string;
  imagePreference: "use_image" | "generate_new" | "use_reference" | "no_image";
  imagePrompt: string;
  referenceImageUrl: string;
}

const initialState: FormState = {
  topic: "",
  tone: "Casual",
  postDetails: "",
  context: "",
  imagePreference: "use_reference",
  imagePrompt: "Nice Technical",
  referenceImageUrl: "",
};

export default function StudioPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const activeBrand = useGlobalStore((s) => s.activeBrand);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialState);
  const [scheduleByPost, setScheduleByPost] = useState<Record<string, string>>({});
  const [selectedPlatformsByPost, setSelectedPlatformsByPost] = useState<
    Record<string, PublishPlatform[]>
  >({});
  const generatingToastIdRef = useRef<string | number | null>(null);

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["posts", activeBrand?._id],
    queryFn: () => getPosts(activeBrand?._id as string),
    enabled: !!activeBrand?._id,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["brand-connections", activeBrand?._id],
    queryFn: () => getBrandConnections(activeBrand!._id),
    enabled: Boolean(activeBrand?._id),
  });

  const connectedPublishPlatforms = useMemo(() => {
    const connectedSet = new Set(connections.map((connection) => connection.platform));
    const platforms: PublishPlatform[] = [];
    if (connectedSet.has("linkedin")) platforms.push("linkedin");
    if (connectedSet.has("instagram")) platforms.push("instagram");
    return platforms;
  }, [connections]);

  const draftPosts = useMemo(
    () => posts.filter((post) => post.overallStatus !== "published"),
    [posts]
  );

  const getAvailablePlatformsForPost = (post: Post): PublishPlatform[] => {
    const inDraft = new Set(post.platformDrafts.map((draft) => draft.platform));
    return connectedPublishPlatforms.filter((platform) => inDraft.has(platform));
  };

  useEffect(() => {
    setSelectedPlatformsByPost((prev) => {
      const next: Record<string, PublishPlatform[]> = {};
      for (const post of draftPosts) {
        const available = getAvailablePlatformsForPost(post);
        if (available.length === 0) {
          next[post.id] = [];
          continue;
        }

        const existing = prev[post.id] ?? available;
        const filtered = existing.filter((platform) => available.includes(platform));
        next[post.id] = filtered.length > 0 ? filtered : available;
      }
      return next;
    });
  }, [draftPosts, connectedPublishPlatforms]);

  const canSubmit =
    !!activeBrand &&
    form.topic.trim().length > 0 &&
    form.tone.trim().length > 0 &&
    form.context.trim().length > 0;

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!activeBrand) {
        throw new Error("Please select a brand first");
      }

      return generateDraftPost({
        userId: user?._id ?? "123",
        userEmail: user?.email ?? "",
        brand_name: activeBrand.name,
        topic: form.topic.trim(),
        tone: form.tone.trim(),
        post_details: form.postDetails.trim(),
        context: form.context.trim(),
        image_preference: form.imagePreference,
        image_prompt: form.imagePrompt.trim(),
        reference_image_url: form.referenceImageUrl.trim(),
      });
    },
    onMutate: () => {
      setOpen(false);
      generatingToastIdRef.current = toast.loading("Post is generating...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setForm(initialState);
      toast.success("Draft generated successfully.", {
        id: generatingToastIdRef.current ?? undefined,
      });
      generatingToastIdRef.current = null;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate draft.", {
        id: generatingToastIdRef.current ?? undefined,
      });
      generatingToastIdRef.current = null;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async ({
      postId,
      scheduledAt,
    }: {
      postId: string;
      scheduledAt?: string;
    }) => {
      const scheduledIso = scheduledAt ? new Date(scheduledAt).toISOString() : null;
      return publishDraftPost(postId, scheduledIso);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Content Studio</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Generate drafts with Workflow 1 now, and publish selected drafts later with your chosen schedule.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <Plus size={16} /> Generate Draft
        </button>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold">Current Context</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Active brand: {activeBrand?.name ?? "None selected"}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Signed-in user: {user?.email ?? "Not available"}</p>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <h2 className="text-lg font-semibold">Draft Queue</h2>
        {draftPosts.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No draft posts available.</p>
        ) : (
          <div className="space-y-3">
            {draftPosts.map((post) => {
              const availablePlatforms = getAvailablePlatformsForPost(post);
              const selectedPlatforms = selectedPlatformsByPost[post.id] ?? [];
              return (
                <div
                  key={post.id}
                  className="rounded-xl border border-[var(--border)] bg-transparent p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{post.masterBrief.topic}</p>
                      <p className="text-xs text-[var(--muted)] capitalize">Status: {post.overallStatus}</p>
                    </div>
                    <span className="text-xs text-[var(--muted)]">
                      {post.platformDrafts.map((d) => d.platform).join(", ")}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--muted)] line-clamp-2">{post.platformDrafts[0]?.content}</p>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[var(--muted)]">Publish platforms</p>
                    {availablePlatforms.length === 0 ? (
                      <p className="text-xs text-amber-600">
                        Connect LinkedIn or Instagram in Settings to publish this draft.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {availablePlatforms.map((platform) => (
                          <label key={platform} className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedPlatforms.includes(platform)}
                              onChange={(e) => {
                                setSelectedPlatformsByPost((prev) => {
                                  const current = prev[post.id] ?? [];
                                  if (e.target.checked) {
                                    return {
                                      ...prev,
                                      [post.id]: Array.from(new Set([...current, platform])),
                                    };
                                  }

                                  return {
                                    ...prev,
                                    [post.id]: current.filter((item) => item !== platform),
                                  };
                                });
                              }}
                            />
                            <span className="capitalize">{platform}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-[var(--muted)] flex items-center gap-1">
                        <CalendarClock size={14} /> Scheduled time (optional)
                      </span>
                      <input
                        type="datetime-local"
                        value={scheduleByPost[post.id] ?? ""}
                        onChange={(e) =>
                          setScheduleByPost((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        publishMutation.mutate({
                          postId: post.id,
                          scheduledAt: scheduleByPost[post.id],
                        })
                      }
                      disabled={publishMutation.isPending || selectedPlatforms.length === 0}
                      className="self-end inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
                    >
                      <Send size={14} />
                      {publishMutation.isPending ? "Publishing..." : "Publish"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h3 className="text-lg font-semibold">Create Workflow 1 Payload</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-[var(--border)] p-2 hover:border-[var(--border-strong)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto px-5 py-4">
              <label className="space-y-1 block">
                <span className="text-sm font-medium">Topic</span>
                <input
                  value={form.topic}
                  onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Startup growth strategies"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium">Tone</span>
                  <input
                    value={form.tone}
                    onChange={(e) => setForm((prev) => ({ ...prev, tone: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Casual"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Image preference</span>
                  <select
                    value={form.imagePreference}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        imagePreference: e.target.value as FormState["imagePreference"],
                      }))
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="use_image">use_image</option>
                    <option value="generate_new">generate_new</option>
                    <option value="use_reference">use_reference</option>
                    <option value="no_image">no_image</option>
                  </select>
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="text-sm font-medium">Post details</span>
                <textarea
                  value={form.postDetails}
                  onChange={(e) => setForm((prev) => ({ ...prev, postDetails: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Keep it friendly, motivational, and easy to read"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-sm font-medium">Context</span>
                <textarea
                  value={form.context}
                  onChange={(e) => setForm((prev) => ({ ...prev, context: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="We help startups scale using AI automation and data-driven strategies"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium">Image prompt</span>
                  <input
                    value={form.imagePrompt}
                    onChange={(e) => setForm((prev) => ({ ...prev, imagePrompt: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Nice Technical"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Reference image URL</span>
                  <input
                    value={form.referenceImageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, referenceImageUrl: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => generateMutation.mutate()}
                disabled={!canSubmit || generateMutation.isPending}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-70"
              >
                {generateMutation.isPending ? "Generating..." : "Generate Draft"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
