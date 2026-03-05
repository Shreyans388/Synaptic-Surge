"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Plus, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { getBrandConnections } from "@/services/api/brand.api";
import {
  generateDraftPost,
  getPosts,
  publishDraftPost,
  type Workflow1OutputPayload,
  type Workflow2OutputPayload,
} from "@/services/api/posts.api";
import { useAuthStore } from "@/state/auth.store";
import { useBrandStore } from "@/state/brand.store";
import { useGlobalStore } from "@/state/global.store";
import { Post } from "@/types/domain.type";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PublishPlatform = "linkedin" | "instagram";

interface FormState {
  topic: string;
  tone: string;
  postDetails: string;
  context: string;
  platforms: PublishPlatform[];
  imagePreference: "use_image" | "generate_new" | "use_reference" | "no_image";
  imagePrompt: string;
  referenceImageUrl: string;
}

const initialState: FormState = {
  topic: "",
  tone: "Casual",
  postDetails: "",
  context: "",
  platforms: ["linkedin", "instagram"],
  imagePreference: "use_reference",
  imagePrompt: "Nice Technical",
  referenceImageUrl: "",
};

const extractSuccessfulPublishPlatforms = (
  workflow2: Workflow2OutputPayload | undefined,
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
  const activeBrand = useBrandStore((s) => s.activeBrand);
  const addNotification = useGlobalStore((s) => s.addNotification);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialState);
  const [scheduleByPost, setScheduleByPost] = useState<Record<string, string>>({});
  const [selectedPlatformsByPost, setSelectedPlatformsByPost] = useState<Record<string, PublishPlatform[]>>({});
  const generatingToastIdRef = useRef<string | number | null>(null);

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
    const connectedSet = new Set(connections.map((c) => c.platform));
    const platforms: PublishPlatform[] = [];
    if (connectedSet.has("linkedin")) platforms.push("linkedin");
    if (connectedSet.has("instagram")) platforms.push("instagram");
    return platforms;
  }, [connections]);

  const draftPosts = useMemo(
    () => posts.filter((post) => post.overallStatus !== "published"),
    [posts],
  );

  const getAvailablePlatformsForPost = (post: Post): PublishPlatform[] => {
    const inDraft = new Set(post.platformDrafts.map((d) => d.platform));
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
        const filtered = existing.filter((p) => available.includes(p));
        next[post.id] = filtered.length > 0 ? filtered : available;
      }

      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, [draftPosts, connectedPublishPlatforms]);

  const canSubmit =
    !!activeBrand &&
    form.topic.trim() &&
    form.tone.trim() &&
    form.context.trim() &&
    form.platforms.length > 0;

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!activeBrand) throw new Error("Please select a brand first");

      return generateDraftPost({
        userId: user?._id ?? "123",
        userEmail: user?.email ?? "",
        brand_name: activeBrand.name,
        topic: form.topic.trim(),
        tone: form.tone.trim(),
        post_details: form.postDetails.trim(),
        context: form.context.trim(),
        platforms: form.platforms,
        image_preference: form.imagePreference,
        image_prompt: form.imagePrompt.trim(),
        reference_image_url: form.referenceImageUrl.trim(),
      });
    },
    onMutate: () => {
      closeDialog();
      generatingToastIdRef.current = toast.loading("Post is generating...");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Draft generated successfully.", { id: generatingToastIdRef.current ?? undefined });
      generatingToastIdRef.current = null;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate draft.", { id: generatingToastIdRef.current ?? undefined });
      generatingToastIdRef.current = null;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async ({ postId, scheduledAt, workflow1Output }: any) => {
      const scheduledIso = scheduledAt ? new Date(scheduledAt).toISOString() : null;
      return publishDraftPost(postId, scheduledIso, workflow1Output);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      const successfulPlatforms = extractSuccessfulPublishPlatforms(response.workflow2);

      if (successfulPlatforms.length > 0) {
        const pretty = successfulPlatforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ");
        const message = `Post published on ${pretty}.`;

        toast.success(message);

        addNotification({
          id: crypto.randomUUID?.() ?? `${Date.now()}-${variables.postId}`,
          message,
          type: "success",
        });

        return;
      }

      toast.success("Publish request completed.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish post.");
    },
  });

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Content Studio</h1>
          <p className="text-sm text-[var(--muted)]">
            Generate drafts with Workflow 1 now, and publish later.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button onClick={openDialog} className="ui-btn-primary">
              <Plus size={16} /> Generate Draft
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-3xl p-0">
            <div className="flex justify-between border-b px-5 py-4">
              <DialogTitle>Create Workflow 1 Payload</DialogTitle>
              
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto px-5 py-4">

              <label className="space-y-1 block">
                <span className="text-sm font-medium">Topic</span>
                <input value={form.topic} onChange={(e)=>setForm((p)=>({...p,topic:e.target.value}))} className="ui-input"/>
              </label>

              <div className="grid gap-4 md:grid-cols-2">

                <label className="space-y-1">
                  <span className="text-sm font-medium">Tone</span>
                  <input value={form.tone} onChange={(e)=>setForm((p)=>({...p,tone:e.target.value}))} className="ui-input"/>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Image preference</span>
                  <select value={form.imagePreference} onChange={(e)=>setForm((p)=>({...p,imagePreference:e.target.value as any}))} className="ui-select">
                    <option value="use_image">Use Existing Image</option>
                    <option value="generate_new">Generate New Image</option>
                    <option value="use_reference">Use Reference Image</option>
                    <option value="no_image">No Image</option>
                  </select>
                </label>

              </div>

              <label className="space-y-1 block">
                <span className="text-sm font-medium">Post details</span>
                <textarea value={form.postDetails} onChange={(e)=>setForm((p)=>({...p,postDetails:e.target.value}))} className="ui-input"/>
              </label>

              <label className="space-y-1 block">
                <span className="text-sm font-medium">Context</span>
                <textarea value={form.context} onChange={(e)=>setForm((p)=>({...p,context:e.target.value}))} className="ui-input"/>
              </label>

              <div className="grid gap-4 md:grid-cols-2">

                <label className="space-y-1">
                  <span className="text-sm font-medium">Image prompt</span>
                  <input value={form.imagePrompt} onChange={(e)=>setForm((p)=>({...p,imagePrompt:e.target.value}))} className="ui-input"/>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Reference image URL</span>
                  <input value={form.referenceImageUrl} onChange={(e)=>setForm((p)=>({...p,referenceImageUrl:e.target.value}))} className="ui-input"/>
                </label>

              </div>

            </div>

            <div className="flex justify-end gap-3 border-t px-5 py-4">
              <button onClick={closeDialog} className="ui-btn-secondary">
                Cancel
              </button>

              <button onClick={()=>generateMutation.mutate()} disabled={!canSubmit} className="ui-btn-primary">
                Generate Draft
              </button>
            </div>

          </DialogContent>
        </Dialog>

      </div>

      {/* DRAFT QUEUE */}

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <h2 className="text-lg font-semibold">Draft Queue</h2>

        {draftPosts.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No draft posts available.
          </p>
        ) : (
          <div className="space-y-3">
            {draftPosts.map((post) => {
              const availablePlatforms = getAvailablePlatformsForPost(post);
              const selectedPlatforms = selectedPlatformsByPost[post.id] ?? [];

              return (
                <div key={post.id} className="rounded-xl border border-[var(--border)] bg-transparent p-4 space-y-3">

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{post.masterBrief.topic}</p>
                      <p className="text-xs text-[var(--muted)] capitalize">
                        Status: {post.overallStatus}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--muted)]">
                      {post.platformDrafts.map((d) => d.platform).join(", ")}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--muted)] line-clamp-2">
                    {post.platformDrafts[0]?.content}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[var(--muted)]">
                      Publish platforms
                    </p>

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
                        className="ui-input"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const selectedContent = post.platformDrafts
                          .filter((draft) =>
                            selectedPlatforms.includes(draft.platform as PublishPlatform),
                          )
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
                      disabled={selectedPlatforms.length === 0}
                      className="self-end inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                    >
                      <Send size={14} />
                      Publish
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
}