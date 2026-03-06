"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/types/domain.type";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { Activity, TrendingUp, Sparkles, Hash } from "lucide-react";

interface Props {
  posts: Post[];
}

type PlatformScores = Record<string, number>;

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const asNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
};

const asString = (value: unknown, fallback = "N/A"): string => {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
};

const hasMeaningfulValue = (value: unknown): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulValue(item));
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((item) => hasMeaningfulValue(item));
  }
  return false;
};

const hasUsableAiResponse = (value: unknown): boolean => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return hasMeaningfulValue(value);
};

export default function PostAnalyticsDashboard({ posts }: Props) {
  const postsWithAi = useMemo(
    () => posts.filter((post) => hasUsableAiResponse(post.aiResponse)),
    [posts]
  );
  const [selectedPostId, setSelectedPostId] = useState<string>("");

  if (!postsWithAi.length) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold">AI Analytics</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          No AI analytics available yet. Analytics appears after your 48-hour tracking cycle updates each post.
        </p>
      </section>
    );
  }

  const selectedPost = postsWithAi.find((post) => post.id === selectedPostId) ?? postsWithAi[0];
  const aiResponse = asRecord(selectedPost.aiResponse) ?? {};
  const summary = asRecord(aiResponse.summary) ?? {};
  const graphData = asRecord(aiResponse.graph_data) ?? {};
  const platformScores =
    (asRecord(aiResponse.platform_scores) as PlatformScores | null) ??
    (asRecord(aiResponse.platform_scores_raw) as PlatformScores | null) ??
    {};

  const timestamps = Array.isArray(graphData.timestamps) ? graphData.timestamps : [];
  const linkedinLikes = Array.isArray(graphData.linkedin_likes) ? graphData.linkedin_likes : [];
  const linkedinComments = Array.isArray(graphData.linkedin_comments) ? graphData.linkedin_comments : [];
  const instagramReach = Array.isArray(graphData.instagram_reach) ? graphData.instagram_reach : [];
  const redditUpvotes = Array.isArray(graphData.reddit_upvotes) ? graphData.reddit_upvotes : [];

  const trendSeries = Array.from(
    { length: Math.max(timestamps.length, linkedinLikes.length, linkedinComments.length, instagramReach.length, redditUpvotes.length) },
    (_, idx) => ({
      label:
        typeof timestamps[idx] === "string" && timestamps[idx]
          ? new Date(timestamps[idx] as string).toLocaleDateString()
          : `T${idx + 1}`,
      linkedinLikes: asNumber(linkedinLikes[idx]),
      linkedinComments: asNumber(linkedinComments[idx]),
      instagramReach: asNumber(instagramReach[idx]),
      redditUpvotes: asNumber(redditUpvotes[idx]),
    })
  );

  const radarData = Object.entries(platformScores).map(([platform, score]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    score: asNumber(score),
    fullMark: 100,
  }));

  const recommendations = asStringArray(aiResponse.recommendations);
  const insights = asStringArray(aiResponse.insights);
  const hashtags = asStringArray(aiResponse.recommended_hashtags);
  const prediction = asString(aiResponse.prediction);
  const overallPerformance = asString(summary.overall_performance);
  const bestPlatform = asString(summary.best_platform);
  const growthDirection = asString(summary.growth_direction);
  const confidence =
    asNumber(summary.confidence_score) ||
    asNumber(aiResponse.confidence_score) ||
    asNumber(aiResponse.confidence);

  return (
    <section className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">AI Analytics</p>
          <h2 className="text-2xl font-bold">Post Intelligence</h2>
        </div>
        <div className="w-full md:w-96">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Select Post
          </label>
          <select
            value={selectedPost.id}
            onChange={(e) => setSelectedPostId(e.target.value)}
            className="ui-select"
          >
            {postsWithAi.map((post) => (
              <option key={post.id} value={post.id}>
                {post.masterBrief.topic} ({new Date(post.createdAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Performance" value={overallPerformance.replaceAll("_", " ")} icon={<Activity size={16} />} />
        <StatCard title="Best Platform" value={bestPlatform} icon={<TrendingUp size={16} />} />
        <StatCard title="Growth" value={growthDirection.replaceAll("_", " ")} icon={<Sparkles size={16} />} />
        <StatCard title="Confidence" value={`${confidence}%`} icon={<Hash size={16} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Cross-Platform Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 10 }}
                  labelStyle={{ color: "#d4d4d8" }}
                />
                <Line type="monotone" dataKey="linkedinLikes" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="linkedinComments" stroke="#a78bfa" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="instagramReach" stroke="#34d399" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="redditUpvotes" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
          <h3 className="mb-4 text-lg font-semibold">Platform Score</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="platform" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Radar dataKey="score" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
          <h3 className="text-lg font-semibold">Recommendations</h3>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            {recommendations.length ? (
              recommendations.map((item, idx) => <li key={`${item}-${idx}`}>• {item}</li>)
            ) : (
              <li>• No recommendations available yet.</li>
            )}
          </ul>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
          <h3 className="text-lg font-semibold">Insights & Prediction</h3>
          <p className="mt-3 text-sm text-[var(--foreground)]">{prediction}</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            {insights.length ? (
              insights.slice(0, 4).map((item, idx) => <li key={`${item}-${idx}`}>• {item}</li>)
            ) : (
              <li>• No insights available yet.</li>
            )}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {hashtags.slice(0, 8).map((tag) => (
              <span key={tag} className="rounded-full border border-sky-700/40 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
                #{tag.replace(/^#/, "")}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
      <div className="mb-2 inline-flex rounded-lg bg-sky-500/10 p-2 text-sky-400">{icon}</div>
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">{title}</p>
      <p className="mt-1 text-lg font-semibold capitalize">{value}</p>
    </article>
  );
}
