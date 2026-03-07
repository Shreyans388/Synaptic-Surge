"use client";

import { useAuthStore } from "@/state/auth.store";
import { Zap, Rocket, Brain, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AgentPersonaCard } from "@/components/onboarding/AgentPersonaCard";

export default function SignUp() {
  const router = useRouter();
  const { signup, isSigningUp } = useAuthStore();
  const [selectedPersona, setSelectedPersona] = useState("growth");
  

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      
      <div className="hidden md:flex w-1/3 flex-col justify-between border-r border-white/5 bg-[#080808] p-12">
        <div className="space-y-12">
          <Link href="/" className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-linear-to-br from-sky-400 to-indigo-600 flex items-center justify-center">
               <svg
  xmlns="http://www.w3.org/2000/svg"
  width={20}
  height={20}
  viewBox="0 0 24 24"
  className="text-white"
  fill="currentColor"
>
  <path d="M7.361 16.596q-.861.721-1.795.646t-1.61-.64t-.913-1.482q-.235-.916.336-1.866l1.952-3.235q-.606-.453-.969-1.155T4 7.346q0-1.4.973-2.373T7.346 4t2.373.973t.973 2.373T9.72 9.72t-2.373.973q-.302 0-.584-.044t-.54-.152L4.24 13.785q-.352.585-.214 1.148t.56.913t1.006.4t1.125-.399l9.942-8.448q.838-.721 1.758-.653q.919.068 1.62.633q.7.564.948 1.482t-.343 1.886L18.669 14q.606.454.969 1.142T20 16.654q0 1.4-.987 2.373T16.64 20t-2.36-.983t-.972-2.363t.977-2.363t2.35-.983q.304 0 .592.054t.546.161l1.989-3.307q.351-.585.222-1.147q-.13-.561-.55-.914t-1.005-.41t-1.125.409zm-.015-6.904q.979 0 1.663-.683q.683-.684.683-1.663T9.01 5.684T7.346 5t-1.662.684T5 7.346t.684 1.663t1.662.683M16.633 19q.976 0 1.672-.684q.695-.683.695-1.662t-.695-1.663t-1.672-.683t-1.651.683t-.674 1.663t.674 1.662t1.65.684m.022-2.346"/>
</svg></div>
             <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Loomin AI</span>
          </Link>
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-light leading-[1.1] tracking-tight">
              Deploy your <br /> <span className="text-sky-500">AI Workforce.</span>
            </h2>
            <p className="max-w-[280px] text-sm leading-relaxed text-gray-500">
              Join the network of brands using autonomous agents to dominate social reach.
            </p>
          </div>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-700">
          Encrypted Registration v.26
        </div>
      </div>

      
      <div className="flex-1 overflow-y-auto p-8 lg:p-20">
        <div className="mx-auto max-w-xl space-y-10">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">New Identity Registry</h1>
            <p className="text-sm text-gray-500 mt-2 text-balance">Select your primary agent persona and configure operator credentials.</p>
          </header>

          
          <div className="grid grid-cols-2 gap-4">
            <AgentPersonaCard
              title="Growth Agent"
              icon={Rocket}
              selected={selectedPersona === "growth"}
              onClick={() => setSelectedPersona("growth")}
              description="Built for reach."
            />
            <AgentPersonaCard
              title="Thought Leader"
              icon={Brain}
              selected={selectedPersona === "thought"}
              onClick={() => setSelectedPersona("thought")}
              description="Built for depth."
            />
          </div>

          <form className="grid gap-4 sm:grid-cols-2">
             <input type="text" placeholder="First Name" className="col-span-1 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm focus:border-sky-500/50 focus:outline-none transition-all" required />
             <input type="text" placeholder="Last Name" className="col-span-1 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm focus:border-sky-500/50 focus:outline-none transition-all" required />
             <input type="email" placeholder="Work Email" className="col-span-2 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm focus:border-sky-500/50 focus:outline-none transition-all" required />
             <input type="password" placeholder="Access Key" className="col-span-2 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm focus:border-sky-500/50 focus:outline-none transition-all" required />
             
             <button className="col-span-2 mt-4 bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-50 transition-all flex items-center justify-center gap-2">
               Initialize Operator <UserPlus size={16}/>
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}
