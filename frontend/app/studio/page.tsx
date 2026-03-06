"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, ChevronDown, ChevronUp, Plus, Send, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useGlobalStore } from "@/state/global.store";
import { useAuthStore } from "@/state/auth.store";
import {
  generateDraftPost,
  getPosts,
  publishDraftPost,
  type GenerateWorkflow1Payload,
  type Workflow1OutputPayload,
  type Workflow2OutputPayload,
} from "@/services/api/posts.api";
import { getBrandConnections } from "@/services/api/brand.api";
import { Post } from "@/types/domain.type";

type PublishPlatform = "linkedin" | "instagram";

interface FormState {
  topic: string;
  tone: string;
  postDetails: string;
  context: string;
  platforms: PublishPlatform[];
  imagePreference: "" | "use_image" | "generate_new" | "use_reference" | "no_image";
  imagePrompt: string;
  referenceImageUrl: string;
}

const initialState: FormState = {
  topic: "",
  tone: "",
  postDetails: "",
  context: "",
  platforms: [],
  imagePreference: "",
  imagePrompt: "",
  referenceImageUrl: "",
};

const extractSuccessfulPublishPlatforms = (
  workflow2: Workflow2OutputPayload | undefined
): PublishPlatform[] => {
  const successful = new Set<PublishPlatform>();

  for (const result of workflow2?.results ?? []) {
    if (
      (result.platform === "linkedin" || result.platform === "instagram") &&
      result.success === true
    ) {
      successful.add(result.platform);
    }
  }

  const platformPosts = workflow2?.platform_posts ?? {};
  for (const platform of ["linkedin", "instagram"] as const) {
    const postId = platformPosts[platform];
    if (typeof postId === "string" && postId.trim().length > 0) {
      successful.add(platform);
    }
  }

  return Array.from(successful);
};

export default function StudioPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const activeBrand = useGlobalStore((s) => s.activeBrand);
  const addNotification = useGlobalStore((s) => s.addNotification);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialState);
  const [scheduleByPost, setScheduleByPost] = useState<Record<string, string>>({});
  const [selectedPlatformsByPost, setSelectedPlatformsByPost] = useState<
    Record<string, PublishPlatform[]>
  >({});
  const [expandedByPost, setExpandedByPost] = useState<Record<string, boolean>>({});
  const generatingToastIdRef = useRef<string | number | null>(null);
  const publishingToastIdRef = useRef<string | number | null>(null);

  const resetDialogForm = () => setForm(initialState);
  const openDialog = () => {
    resetDialogForm();
    setOpen(true);
  };
  const closeDialog = () => {
    setOpen(false);
    resetDialogForm();
  };

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

  const getSelectedPlatformsForPost = (post: Post): PublishPlatform[] => {
    const available = getAvailablePlatformsForPost(post);
    if (available.length === 0) return [];
    const existing = selectedPlatformsByPost[post.id] ?? available;
    const filtered = existing.filter((platform) => available.includes(platform));
    return filtered.length > 0 ? filtered : available;
  };

  const canSubmit =
    !!user?._id &&
    !!user?.email &&
    form.topic.trim().length > 0 &&
    form.tone.trim().length > 0 &&
    form.context.trim().length > 0 &&
    form.platforms.length > 0;

  const generateMutation = useMutation({
    mutationFn: async (payload: GenerateWorkflow1Payload) => {
      return generateDraftPost(payload);
    },
    onMutate: () => {
      closeDialog();
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

  const handleGenerateDraft = () => {
    if (!activeBrand) {
      toast.error("Please select a brand first.");
      return;
    }
    if (!user?._id || !user?.email) {
      toast.error("Please log in again to generate drafts.");
      return;
    }

    const payload: GenerateWorkflow1Payload = {
      brandId: activeBrand._id,
      userId: user._id,
      userEmail: user.email,
      brand_name: activeBrand.name?.trim() ?? "",
      topic: form.topic.trim(),
      tone: form.tone.trim(),
      post_details: form.postDetails.trim(),
      context: form.context.trim(),
      platforms: form.platforms,
      image_preference: form.imagePreference,
      image_prompt: form.imagePrompt.trim(),
      reference_image_url: form.referenceImageUrl.trim(),
    };

    generateMutation.mutate(payload);
  };

  const publishMutation = useMutation({
    mutationFn: async ({
      postId,
      scheduledAt,
      workflow1Output,
    }: {
      postId: string;
      scheduledAt?: string;
      workflow1Output?: Workflow1OutputPayload;
    }) => {
      const scheduledIso = scheduledAt ? new Date(scheduledAt).toISOString() : null;
      return publishDraftPost(postId, scheduledIso, workflow1Output);
    },
    onMutate: () => {
      publishingToastIdRef.current = toast.loading("Publishing post...");
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", activeBrand?._id] });

      const successfulPlatforms = extractSuccessfulPublishPlatforms(response.workflow2);
      if (successfulPlatforms.length > 0) {
        const prettyPlatforms = successfulPlatforms
          .map((platform) => platform.charAt(0).toUpperCase() + platform.slice(1))
          .join(", ");
        const message = `Post published on ${prettyPlatforms}.`;
        toast.success(message, {
          id: publishingToastIdRef.current ?? undefined,
        });
        addNotification({
          id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${variables.postId}`,
          message,
          type: "success",
        });
        publishingToastIdRef.current = null;
        return;
      }

      toast.success("Publish request completed.", {
        id: publishingToastIdRef.current ?? undefined,
      });
      publishingToastIdRef.current = null;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish post.", {
        id: publishingToastIdRef.current ?? undefined,
      });
      publishingToastIdRef.current = null;
    },
  });

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Content Studio</h1>
          <p className="mt-1 text-sm text-muted">
            Generate drafts with Workflow 1 now, and publish selected drafts later with your chosen schedule.
          </p>
        </div>
        <button
          onClick={openDialog}
          className="ui-btn-primary"
        >
          <Plus size={16} /> Generate Draft
        </button>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">Current Context</h2>
        <p className="mt-2 text-sm text-">Active brand: {activeBrand?.name ?? "None selected"}</p>
        <p className="mt-1 text-sm text-muted">Signed-in user: {user?.email ?? "Not available"}</p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 space-y-4">
        <h2 className="text-lg font-semibold">Draft Queue</h2>
        {draftPosts.length === 0 ? (
          <p className="text-sm text-muted">No draft posts available.</p>
        ) : (
          <div className="space-y-3">
            {draftPosts.map((post) => {
              const availablePlatforms = getAvailablePlatformsForPost(post);
              const selectedPlatforms = getSelectedPlatformsForPost(post);
              const isExpanded = Boolean(expandedByPost[post.id]);
              return (
                <div
                  key={post.id}
                  className="rounded-xl border border-border bg-transparent p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{post.masterBrief.topic}</p>
                      <p className="text-xs text-muted capitalize">Status: {post.overallStatus}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted">
                        {post.platformDrafts.map((d) => d.platform).join(", ")}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedByPost((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }))
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted transition hover:text-foreground"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? "Collapse" : "Expand"}
                      </button>
                    </div>
                  </div>

                  {!isExpanded ? (
                    <p className="text-sm text-muted line-clamp-2">{post.platformDrafts[0]?.content}</p>
                  ) : null}

                  {isExpanded ? (
                    <>
                      {post.imageUrl ? (
                        <div className="overflow-hidden rounded-xl border border-border bg-black/10">
                          <Image
                            src={post.imageUrl}
                            alt={`Draft image for ${post.masterBrief.topic}`}
                            width={1200}
                            height={675}
                            unoptimized
                            className="h-auto w-full object-contain"
                          />
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted">
                          Complete Draft Content
                        </p>
                        {post.platformDrafts.map((draft) => (
                          <article
                            key={`${post.id}-${draft.platform}`}
                            className="rounded-lg border border-border bg-surface p-3"
                          >
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                              {draft.platform}
                            </p>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                              {draft.content}
                            </p>
                          </article>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted">Publish platforms</p>
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
                          <span className="text-xs font-medium text-muted flex items-center gap-1">
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
                            className="ui-input"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const selectedContent = post.platformDrafts
                              .filter((draft) => selectedPlatforms.includes(draft.platform as PublishPlatform))
                              .reduce<NonNullable<Workflow1OutputPayload["content"]>>((acc, draft) => {
                                acc[draft.platform] = draft.content;
                                return acc;
                              }, {});

                            publishMutation.mutate({
                              postId: post.id,
                              scheduledAt: scheduleByPost[post.id],
                              workflow1Output: {
                                content: selectedContent,
                                platforms: selectedPlatforms,
                              },
                            });
                          }}
                          disabled={publishMutation.isPending || selectedPlatforms.length === 0}
                          className="self-end inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-65"
                        >
                          <Send size={14} />
                          Publish
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {open ? (
        <div className="ui-dialog-backdrop">
          <div className="ui-dialog-panel max-w-3xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-lg font-semibold">Create Workflow 1 Payload</h3>
              <button
                onClick={closeDialog}
                className="ui-btn-secondary rounded-lg p-2"
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
                  className="ui-input"
                  placeholder="Startup growth strategies"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium">Tone</span>
                  <input
                    value={form.tone}
                    onChange={(e) => setForm((prev) => ({ ...prev, tone: e.target.value }))}
                    className="ui-input"
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
                    className="ui-select"
                  >
                    <option value="">Select preference</option>
                    <option value="use_image">use_image</option>
                    <option value="generate_new">generate_new</option>
                    <option value="use_reference">use_reference</option>
                    <option value="no_image">no_image</option>
                  </select>
                </label>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Platforms</span>
                <div className="flex flex-wrap gap-4">
                  {(["linkedin", "instagram"] as const).map((platform) => (
                    <label key={platform} className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.platforms.includes(platform)}
                        onChange={(e) =>
                          setForm((prev) => {
                            if (e.target.checked) {
                              return {
                                ...prev,
                                platforms: Array.from(new Set([...prev.platforms, platform])),
                              };
                            }
                            return {
                              ...prev,
                              platforms: prev.platforms.filter((item) => item !== platform),
                            };
                          })
                        }
                      />
                      <span className="capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="space-y-1 block">
                <span className="text-sm font-medium">Post details</span>
                <textarea
                  value={form.postDetails}
                  onChange={(e) => setForm((prev) => ({ ...prev, postDetails: e.target.value }))}
                  rows={3}
                  className="ui-input"
                  placeholder="Keep it friendly, motivational, and easy to read"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-sm font-medium">Context</span>
                <textarea
                  value={form.context}
                  onChange={(e) => setForm((prev) => ({ ...prev, context: e.target.value }))}
                  rows={3}
                  className="ui-input"
                  placeholder="We help startups scale using AI automation and data-driven strategies"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium">Image prompt</span>
                  <input
                    value={form.imagePrompt}
                    onChange={(e) => setForm((prev) => ({ ...prev, imagePrompt: e.target.value }))}
                    className="ui-input"
                    placeholder="Nice Technical"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Reference image URL</span>
                  <input
                    value={form.referenceImageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, referenceImageUrl: e.target.value }))}
                    className="ui-input"
                    placeholder="https://images.unsplash.com/..."
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] px-5 py-4">
              <button
                type="button"
                onClick={closeDialog}
                className="ui-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateDraft}
                disabled={!canSubmit || generateMutation.isPending}
                className="ui-btn-primary"
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
