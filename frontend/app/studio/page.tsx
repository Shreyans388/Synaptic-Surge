"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useGlobalStore } from "@/state/global.store";
import { submitPostToN8N, type N8NPlatform } from "@/services/api/n8n.api";

const PLATFORM_OPTIONS: N8NPlatform[] = ["linkedin", "instagram", "reddit", "twitter"];

interface FormState {
  titleDefault: string;
  titleReddit: string;
  description: string;
  imageUrl: string;
  tagsInput: string;
  scheduledAt: string;
  platforms: N8NPlatform[];
  content: Record<N8NPlatform, string>;
}

const initialState: FormState = {
  titleDefault: "",
  titleReddit: "",
  description: "",
  imageUrl: "",
  tagsInput: "",
  scheduledAt: "",
  platforms: ["linkedin", "instagram"],
  content: {
    linkedin: "",
    instagram: "",
    reddit: "",
    twitter: "",
  },
};

export default function StudioPage() {
  const queryClient = useQueryClient();
  const user = useGlobalStore((s) => s.user);
  const activeBrand = useGlobalStore((s) => s.activeBrand);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialState);

  const canSubmit =
    form.titleDefault.trim().length > 0 &&
    form.platforms.length > 0 &&
    form.description.trim().length > 0;

  const mutation = useMutation({
    mutationFn: async () => {
      const tags = form.tagsInput
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);

      const content = form.platforms.reduce<Partial<Record<N8NPlatform, string>>>((acc, platform) => {
        const value = form.content[platform].trim() || form.description.trim();
        acc[platform] = value;
        return acc;
      }, {});

      return submitPostToN8N({
        user_id: user?.id ?? "123",
        image_url: form.imageUrl.trim(),
        content,
        title: {
          default: form.titleDefault.trim(),
          ...(form.titleReddit.trim() ? { reddit: form.titleReddit.trim() } : {}),
        },
        tags,
        platforms: form.platforms,
        scheduled_time: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setForm(initialState);
      setOpen(false);
    },
  });

  const selectedPlatformsLabel = useMemo(() => {
    if (form.platforms.length === 0) return "No platform selected";
    return form.platforms.join(", ");
  }, [form.platforms]);

  const togglePlatform = (platform: N8NPlatform) => {
    setForm((prev) => {
      const exists = prev.platforms.includes(platform);
      return {
        ...prev,
        platforms: exists
          ? prev.platforms.filter((p) => p !== platform)
          : [...prev.platforms, platform],
      };
    });
  };

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Content Studio</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Build a full post payload and send it to your n8n workflow for generation, scheduling, and publishing.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <Plus size={16} /> New Post Request
        </button>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold">Current Context</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Active brand: {activeBrand?.name ?? "None selected"}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Signed-in user: {user?.email ?? "Not available"}</p>
      </section>

      {mutation.isSuccess ? (
        <p className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
          Request sent to n8n successfully.
        </p>
      ) : null}

      {mutation.isError ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {mutation.error.message}
        </p>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h3 className="text-lg font-semibold">Create Post Payload</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-[var(--border)] p-2 hover:border-[var(--border-strong)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto px-5 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium">Title (default)</span>
                  <input
                    value={form.titleDefault}
                    onChange={(e) => setForm((prev) => ({ ...prev, titleDefault: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="My SaaS Launch"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Reddit title (optional)</span>
                  <input
                    value={form.titleReddit}
                    onChange={(e) => setForm((prev) => ({ ...prev, titleReddit: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="I built this automation tool, need feedback"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Describe what should be posted and the message objective"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium">Image URL</span>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="https://..."
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Tags (comma-separated)</span>
                  <input
                    value={form.tagsInput}
                    onChange={(e) => setForm((prev) => ({ ...prev, tagsInput: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="ai, automation, launch"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map((platform) => {
                      const selected = form.platforms.includes(platform);
                      return (
                        <button
                          type="button"
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            selected
                              ? "border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                              : "border-[var(--border)] text-[var(--muted)]"
                          }`}
                        >
                          {platform}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[var(--muted)]">Selected: {selectedPlatformsLabel}</p>
                </div>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Scheduled time (optional)</span>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Platform-specific content (optional)</p>
                <p className="text-xs text-[var(--muted)]">
                  If blank, description will be used for selected platforms.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {PLATFORM_OPTIONS.map((platform) => (
                    <label key={platform} className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{platform}</span>
                      <textarea
                        value={form.content[platform]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            content: { ...prev.content, [platform]: e.target.value },
                          }))
                        }
                        rows={3}
                        className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder={`Custom ${platform} content`}
                      />
                    </label>
                  ))}
                </div>
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
                onClick={() => mutation.mutate()}
                disabled={!canSubmit || mutation.isPending}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-70"
              >
                {mutation.isPending ? "Sending to n8n..." : "Send to n8n"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
