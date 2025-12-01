'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Exercise, getUserInfo, ActiveExercise } from '@/lib/actions';
import AppBar from './AppBar';
import BottomNav, { Tab } from './BottomNav';
import HomeDashboard from './HomeDashboard';
import WorkoutSession, { WorkoutSessionRef } from './WorkoutSession';
import StatsView from './StatsView';
import SettingsView from './SettingsView';
import ConfirmModal from './ConfirmModal';
import { ListPlus, Check, Trash2 } from 'lucide-react';

interface MainLayoutProps {
  allExercises: Exercise[];
}

export default function MainLayout({ allExercises }: MainLayoutProps) {
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [user, setUser] = useState<{ name: string; avatarUrl: string | null } | null>(null);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const workoutSessionRef = useRef<WorkoutSessionRef>(null);

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

  const getTitle = () => {
    switch (currentTab) {
      case 'home':
        return 'PaceLift';
      case 'log':
        return 'Workout';
      case 'stats':
        return 'Statistics';
      case 'settings':
        return 'Settings';
      default:
        return 'PaceLift';
    }
  };

  const handleAddRoutine = () => {
    workoutSessionRef.current?.openAddRoutineModal();
  };

  const handleClearWorkout = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmClearWorkout = () => {
    setActiveExercises([]);
  };

  const handleFinishWorkout = () => {
    setIsFinishModalOpen(true);
  };

  const confirmFinishWorkout = () => {
    workoutSessionRef.current?.handleSubmit();
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      {/* Global App Bar */}
      <AppBar 
        title={getTitle()} 
        trailing={
          currentTab === 'log' && activeExercises.length > 0 ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClearWorkout}
                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={handleAddRoutine}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
              >
                <ListPlus className="w-5 h-5 text-gray-700" />
              </button>
              <button 
                onClick={handleFinishWorkout}
                className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 active:scale-95 transition-all"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Main Content Area */}
      <div className="pb-24"> {/* Padding for Bottom Nav */}
        {currentTab === 'home' && (
          <HomeDashboard 
            onStartWorkout={() => setCurrentTab('log')} 
            userName={user?.name}
          />
        )}
        
        {currentTab === 'log' && (
          <WorkoutSession 
            ref={workoutSessionRef}
            allExercises={allExercises} 
            activeExercises={activeExercises}
            onActiveExercisesChange={setActiveExercises}
          />
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

      {/* Modals */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmClearWorkout}
        title="Clear Workout"
        message="Are you sure you want to remove all exercises? This action cannot be undone."
        confirmText="Clear All"
        isDestructive
      />

      <ConfirmModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onConfirm={confirmFinishWorkout}
        title="Finish Workout"
        message="Are you sure you want to finish and save this workout?"
        confirmText="Finish & Save"
      />
    </div>
  );
}
