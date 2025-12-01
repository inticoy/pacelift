'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Dumbbell, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tab = 'home' | 'log' | 'stats' | 'settings';

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'log', label: 'Workout', icon: Dumbbell },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs sm:max-w-xl px-4 pb-[calc(0.5rem_+_env(safe-area-inset-bottom))] pointer-events-none">
      <div className="relative flex items-center justify-between bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-lg shadow-gray-200/50 rounded-full p-1 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative z-10 flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-full transition-colors duration-200",
                isActive ? "text-white" : "text-gray-400 hover:text-gray-600"
              )}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-black rounded-full shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <span className="relative z-20 flex items-center gap-2">
                <Icon className={cn("w-7 h-7 transition-transform duration-200", isActive && "scale-110")} />
                {/* Text visible only on larger screens or always if requested, 
                    but user said "Icon only on mobile, Icon+Text on web". 
                    Tailwind 'hidden sm:block' handles this. */}
                <span className={cn("text-sm font-bold hidden sm:block", isActive ? "text-white" : "text-gray-500")}>
                  {tab.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
