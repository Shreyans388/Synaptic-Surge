// components/onboarding/AgentPersonaCard.tsx
"use client";
import { LucideIcon } from "lucide-react";

interface PersonaProps {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}

export function AgentPersonaCard({ title, description, icon: Icon, selected, onClick }: PersonaProps) {
  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200 ${
        selected 
        ? "border-sky-500 bg-sky-500/5 shadow-[0_0_20px_rgba(14,165,233,0.18)]" 
        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#0B0E14]"
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        selected ? "bg-sky-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
      }`}>
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-lg mb-1 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
