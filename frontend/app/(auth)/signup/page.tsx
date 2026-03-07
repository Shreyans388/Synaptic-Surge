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
             <div className="h-10 w-10 rounded-xl bg-sky-600 flex items-center justify-center"><Zap size={20} fill="currentColor"/></div>
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
