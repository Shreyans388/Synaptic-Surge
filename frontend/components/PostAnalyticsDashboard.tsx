"use client";
import React from 'react';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { TrendingUp, Target, MessageCircle, Zap, Hash, BarChart3, ChevronRight } from 'lucide-react';

const apiData = {
  summary: {
    overall_performance: "high_growth",
    best_platform: "linkedin",
    growth_direction: "upward",
    confidence_score: 88
  },
  platform_scores_raw: { "linkedin": 92, "instagram": 45, "reddit": 78 },
  trends: {
    linkedin: { "likes": "increasing", "comments": "steady", "shares": "high" }
  },
  prediction: {
    next_period_growth: "significant",
    viral_probability: 0.65
  },
  comment_analysis: {
    overall_sentiment: "positive",
    key_themes: ["Work-Life Balance", "Office Culture", "Tech Stack"]
  },
  content_strategy: {
    hashtag_strategy: {
      "recommended_hashtags": ["#FutureOfWork", "#RemoteJobs", "#TechTrends"],
      "reason": "High conversion in professional sectors."
    },
    "one_line_creator_advice": "Focus on storytelling rather than just data points for this topic."
  },
  graph_data: [
    { name: '0h', engagement: 100 },
    { name: '6h', engagement: 450 },
    { name: '12h', engagement: 800 },
    { name: '18h', engagement: 1200 },
    { name: '24h', engagement: 1100 },
  ]
};

const DarkDashboard = () => {
  const radarData = Object.entries(apiData.platform_scores_raw).map(([key, val]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    A: val,
    fullMark: 100
  }));

  return (
    <div className="p-4 md:p-8 bg-[#0B0F1A] min-h-screen font-sans text-slate-200">
      {/* HEADER SECTION */}
      <header className="mb-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {apiData.summary.overall_performance.replace('_', ' ')}
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-700" />
          <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            Predicted Growth: {apiData.prediction.next_period_growth}
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Post Insights</h1>
        <div className="bg-[#161B2A] border border-slate-800 p-5 rounded-2xl shadow-2xl flex items-center gap-4">
          {/* <div className="bg-indigo-600/20 p-3 rounded-xl border border-indigo-500/30">
             <Zap className="text-indigo-400" size={20} />
          </div> */}
          <p className="text-lg text-slate-300 font-medium italic">
            &quot;{apiData.content_strategy.one_line_creator_advice}&quot;
          </p>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Confidence" value={`${apiData.summary.confidence_score}%`} icon={<Target size={18}/>} color="text-blue-400" bgColor="bg-blue-400/10" />
        <KpiCard title="Best Platform" value={apiData.summary.best_platform} icon={<ChevronRight size={18}/>} color="text-yellow-400" bgColor="bg-yellow-400/10" />
        <KpiCard title="Viral Prob." value={`${apiData.prediction.viral_probability * 100}%`} icon={<TrendingUp size={18}/>} color="text-emerald-400" bgColor="bg-emerald-400/10" />
        <KpiCard title="Sentiment" value={apiData.comment_analysis.overall_sentiment} icon={<MessageCircle size={18}/>} color="text-purple-400" bgColor="bg-purple-400/10" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN CHART: ENGAGEMENT */}
        <div className="lg:col-span-2 bg-[#111625] p-8 rounded-3xl border border-slate-800/50 relative overflow-hidden">
          {/* <div className="absolute top-0 right-0 p-8 opacity-10">
            <BarChart3 size={120} />
          </div> */}
          <h3 className="font-bold text-white text-xl mb-8 flex items-center gap-2">Engagement Pulse</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={apiData.graph_data}>
                <defs>
                  <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="engagement" stroke="#818cf8" strokeWidth={4} fillOpacity={1} fill="url(#colorEngage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
        </div>

        {/* RADAR: PLATFORM STRENGTH */}
        <div className="bg-[#111625] p-8 rounded-3xl border border-slate-800/50">
          <h3 className="font-bold text-white text-xl mb-8">Platform Fit</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex flex-col gap-3">
             <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase tracking-tighter">LinkedIn Trends</span>
                <span className="text-indigo-400 font-bold italic">High Shares</span>
             </div>
             <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-500 uppercase tracking-tighter">Reddit Sentiment</span>
                <span className="text-emerald-400 font-bold italic">Stable Upvotes</span>
             </div>
          </div>
          
        </div>

        {/* BOTTOM SECTION: STRATEGY & THEMES */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="bg-[#111625] p-8 rounded-3xl border border-slate-800/50">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <MessageCircle size={16} className="text-indigo-400" /> Key Themes
                </h3>
                <div className="flex flex-wrap gap-3">
                    {apiData.comment_analysis.key_themes.map((theme) => (
                        <span key={theme} className="px-5 py-2 bg-[#1e293b] text-indigo-300 rounded-xl text-sm font-semibold border border-indigo-500/10">
                            {theme}
                        </span>
                    ))}
                </div>
            </div>

            <div className="bg-[#111625] p-8 rounded-3xl border border-slate-800/50 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                        <Hash size={16} className="text-indigo-400" /> Suggested Tags
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                        {apiData.content_strategy.hashtag_strategy.reason}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {apiData.content_strategy.hashtag_strategy.recommended_hashtags.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-white text-black rounded-lg text-xs font-bold font-mono uppercase tracking-tighter shadow-lg shadow-white/5">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* ACTION FOOTER */}
      <footer className="max-w-6xl mx-auto mt-10 rounded-3xl p-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/20">
        <div className="bg-[#0B0F1A] rounded-[22px] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
                <h4 className="text-indigo-400 font-black uppercase text-xs tracking-[.3em] mb-4">Final Strategy</h4>
                <p className="text-2xl font-bold text-white leading-tight">
                    This post is trending! Use the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 uppercase tracking-tighter underline decoration-indigo-500/50">High Growth</span> momentum to launch your next piece.
                </p>
            </div>
            <button className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10 flex items-center gap-2 whitespace-nowrap">
                Review Best Comments <ChevronRight size={18} strokeWidth={3} />
            </button>
        </div>
      </footer>
    </div>
  );
};

const KpiCard = ({ title, value, icon, color, bgColor }) => (
  <div className="bg-[#111625] p-6 rounded-3xl border border-slate-800/50 flex flex-col gap-4">
    <div className={`w-fit p-3 rounded-2xl ${bgColor} ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[.2em] mb-1">{title}</p>
      <p className="text-2xl font-black text-white capitalize tracking-tight">{value}</p>
    </div>
  </div>
);

export default DarkDashboard;