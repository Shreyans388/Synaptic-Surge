"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPosts, approvePost } from "@/services/api/posts.api";
import { useGlobalStore } from "@/state/global.store";
import { Post } from "@/types/domain.type";
import { StatusBadge } from "@/modules/dashboard/StatusBadge";
import { Rocket, CheckCircle, Clock, Sparkles, LayoutGrid, List } from "lucide-react";
import PostAnalyticsDashboard from "@/components/PostAnalyticsDashboard";

export default function DashboardPage() {
  const activeBrandId = useGlobalStore((state) => state.activeBrand);
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["posts", activeBrandId],
    queryFn: () => getPosts(activeBrandId?.id as string),
    enabled: !!activeBrandId,
  });

  const approveMutation = useMutation({
    mutationFn: approvePost,
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts", activeBrandId] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts", activeBrandId]);
      queryClient.setQueryData<Post[]>(["posts", activeBrandId], (old = []) =>
        old.map((p) => (p.id === postId ? { ...p, overallStatus: "published" } : p))
      );
      return { previousPosts };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPosts) queryClient.setQueryData(["posts", activeBrandId], context.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", activeBrandId] });
    },
  });

  if (!activeBrandId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center animate-bounce">
          <LayoutGrid className="text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">Select a brand from the sidebar to initialize your agent.</p>
      </div>
    );
  }

  // Derived Metrics for SummaryCards
  const metrics = [
    { title: "Total Fleet", value: posts.length, icon: Rocket, color: "text-blue-500" },
    { title: "Deploys", value: posts.filter(p => p.overallStatus === "published").length, icon: CheckCircle, color: "text-green-500" },
    { title: "In Review", value: posts.filter(p => p.overallStatus === "awaiting_review").length, icon: Clock, color: "text-sky-500" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight dark:text-white flex items-center gap-3">
            Agent Command <span className="text-sm font-mono font-normal px-2 py-1 bg-sky-500/10 text-sky-500 rounded border border-sky-500/20 leading-none">v1.0.4</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time content intelligence for <span className="font-bold text-gray-900 dark:text-gray-200">{activeBrandId.name}</span></p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
          <Sparkles size={16} className="text-sky-500" />
          Force Agent Research
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="group p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14] hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300">
             <div className="flex justify-between items-start">
               <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{m.title}</p>
                  <h3 className="text-4xl font-black dark:text-white">{m.value}</h3>
               </div>
               <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 ${m.color}`}>
                  <m.icon size={24} />
               </div>
             </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <h2 className="font-bold text-lg dark:text-white flex items-center gap-2">
            <List size={20} className="text-sky-500" />
            Current Dispatches
          </h2>
          <div className="text-xs text-gray-400 font-mono italic">Sorted by &quot;Recency Resonance&quot;</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group relative p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14] hover:border-sky-500/50 transition-all overflow-hidden"
            >
            
              <div className={`absolute top-0 left-0 w-1 h-full ${post.overallStatus === 'published' ? 'bg-green-500' : 'bg-sky-500 animate-pulse'}`} />
              
              <div className="flex justify-between items-start mb-3">
                <StatusBadge status={post.overallStatus} />
                <span className="text-[10px] font-mono text-gray-400">ID: {post.id.slice(0,8)}</span>
              </div>

              <h2 className="font-bold text-lg dark:text-white group-hover:text-sky-500 transition-colors mb-2 leading-tight">
                {post.masterBrief.topic}
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                Objective: {post.masterBrief.targetAudience}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                <div className="flex -space-x-2">
                   {/* Mock avatars for platforms */}
                   <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900" title="LinkedIn" />
                   <div className="w-6 h-6 rounded-full bg-black border-2 border-white dark:border-gray-900" title="X" />
                </div>

                {post.overallStatus !== "published" && (
                  <button
                    onClick={() => approveMutation.mutate(post.id)}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 transition shadow-lg shadow-sky-500/20"
                  >
                    {approveMutation.isPending ? (
                      "Initializing Deploy..."
                    ) : (
                      <>Deploy Post <ArrowRight size={14} /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <PostAnalyticsDashboard /> {/* New Analytics Dashboard Component */}
    </div>
  );
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
  );
}
