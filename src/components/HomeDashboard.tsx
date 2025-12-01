'use client';

import React from 'react';
import { Play, Flame, CalendarDays, Trophy, ArrowRight } from 'lucide-react';

interface HomeDashboardProps {
  onStartWorkout: () => void;
  userName?: string;
}

export default function HomeDashboard({ onStartWorkout, userName = 'User' }: HomeDashboardProps) {
  return (
    <div className="px-4 pt-20 animate-fade-in">
      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Hello, {userName} <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-gray-500 font-medium mt-1">Ready to crush your goals today?</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Main Action Card (Start Workout) - Spans full width */}
        <button 
          onClick={onStartWorkout}
          className="col-span-2 group relative overflow-hidden bg-black text-white rounded-3xl p-6 shadow-lg shadow-black/5 transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-2xl font-bold">Start Workout</h3>
              <p className="text-gray-300 text-sm mt-1">Log your session now</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
              <Play className="w-6 h-6 fill-current" />
            </div>
          </div>
        </button>

        {/* Streak Card */}
        <div className="bg-white p-5 rounded-3xl flex flex-col justify-between h-40">
          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xl font-black text-gray-900">0</span>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Day Streak</p>
          </div>
        </div>

        {/* Weekly Volume / Activity Card */}
        <div className="bg-white p-5 rounded-3xl flex flex-col justify-between h-40">
          <div className="w-10 h-10 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xl font-black text-gray-900">0</span>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Workouts</p>
          </div>
        </div>

        {/* Heatmap / Calendar Placeholder - Spans full width */}
        <div className="col-span-2 bg-white p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-gray-700">Recent Activity</h3>
          </div>
          
          {/* Mock Heatmap Grid */}
          <div className="flex justify-between gap-1">
            {[...Array(14)].map((_, i) => (
              <div 
                key={i} 
                className={`h-8 w-full rounded-md ${[true, false, false, true, false, true, true, false, false, true, false, true, false, false][i] ? 'bg-green-500' : 'bg-gray-100'}`} 
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
            <span>Last 2 weeks</span>
            <div className="flex items-center gap-1">
              <span>Less</span>
              <div className="w-2 h-2 bg-gray-100 rounded-sm" />
              <div className="w-2 h-2 bg-green-500 rounded-sm" />
              <span>More</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
