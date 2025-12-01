'use client';

import React from 'react';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

export default function StatsView() {
  return (
    <div className="px-4 pt-20 animate-fade-in">
      {/* Placeholder for Streak/Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white mb-6">
        <div className="flex items-center gap-2 mb-2 opacity-80">
          <Calendar className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Current Streak</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black">0</span>
          <span className="text-lg font-medium opacity-80">days</span>
        </div>
        <p className="text-sm mt-2 opacity-90">Start your journey today!</p>
      </div>

      {/* Placeholder for Charts */}
      <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Data Yet</h3>
        <p className="text-gray-500 max-w-xs mx-auto">
          Complete your first workout to see your progress analytics here.
        </p>
      </div>
    </div>
  );
}
