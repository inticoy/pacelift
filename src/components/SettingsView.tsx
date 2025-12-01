import React, { useEffect, useState } from 'react';
import { getUserInfo, signOut, resetDatabases } from '@/lib/actions';
import { LogOut, RefreshCw, Database, User as UserIcon, Settings, Dumbbell } from 'lucide-react';
import ExerciseManager from './ExerciseManager';

export default function SettingsView() {
  const [user, setUser] = useState<{ name: string; avatarUrl: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExerciseManager, setShowExerciseManager] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const info = await getUserInfo();
      setUser(info);
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
      window.location.reload();
    }
  };

  const handleResetDb = async () => {
    if (confirm('This will disconnect your current databases and require setup again. Continue?')) {
      await resetDatabases();
      window.location.reload();
    }
  };

  if (showExerciseManager) {
    return <ExerciseManager onClose={() => setShowExerciseManager(false)} />;
  }

  return (
    <div className="px-4 pt-20 animate-fade-in">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-2 text-gray-900">
        <Settings className="w-8 h-8" />
        Settings
      </h2>

      {/* Profile Section */}
      <div className="bg-white rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{loading ? 'Loading...' : user?.name}</h3>
            <p className="text-sm text-gray-500">Notion Connected</p>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="space-y-3">
        <button 
          onClick={() => setShowExerciseManager(true)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-700">Manage Exercises</span>
          </div>
        </button>

        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-red-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium text-red-600">Sign Out</span>
          </div>
        </button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-gray-300 font-medium">PaceLift v1.0.0</p>
      </div>
    </div>
  );
}
