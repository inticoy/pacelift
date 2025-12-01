'use client';

import React, { useState, useEffect } from 'react';
import { Exercise, getUserInfo } from '@/lib/actions';
import AppBar from './AppBar';
import BottomNav, { Tab } from './BottomNav';
import HomeDashboard from './HomeDashboard';
import WorkoutSession from './WorkoutSession';
import StatsView from './StatsView';
import SettingsView from './SettingsView';

interface MainLayoutProps {
  allExercises: Exercise[];
}

export default function MainLayout({ allExercises }: MainLayoutProps) {
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [user, setUser] = useState<{ name: string; avatarUrl: string | null } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const info = await getUserInfo();
      setUser(info);
    };
    loadUser();
  }, []);

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      {/* Global App Bar */}
      <AppBar />

      {/* Main Content Area */}
      <div className="pb-24"> {/* Padding for Bottom Nav */}
        {currentTab === 'home' && (
          <HomeDashboard 
            onStartWorkout={() => setCurrentTab('log')} 
            userName={user?.name}
          />
        )}
        
        {currentTab === 'log' && (
          <WorkoutSession allExercises={allExercises} />
        )}
        
        {currentTab === 'stats' && (
          <StatsView />
        )}

        {currentTab === 'settings' && (
          <SettingsView />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
}
