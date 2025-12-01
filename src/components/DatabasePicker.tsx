'use client';

import React, { useState, useEffect } from 'react';
import { searchDatabases, saveConfig, signOut } from '@/lib/actions';
import { Database, Check, Loader2, RefreshCw, LogOut } from 'lucide-react';

export default function DatabasePicker() {
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutDb, setWorkoutDb] = useState<string | null>(null);
  const [logDb, setLogDb] = useState<string | null>(null);
  const [routineDb, setRoutineDb] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDbs = async () => {
      const results = await searchDatabases();
      setDatabases(results);

      // Auto-discovery logic
      const exercisesDb = results.find((db: any) => db.title.toLowerCase() === 'exercises');
      const logsDb = results.find((db: any) => db.title.toLowerCase() === 'logs');
      const routinesDb = results.find((db: any) => db.title.toLowerCase() === 'routines');

      if (exercisesDb && logsDb && routinesDb) {
        setWorkoutDb(exercisesDb.id);
        setLogDb(logsDb.id);
        setRoutineDb(routinesDb.id);
        
        // Auto-save
        setSaving(true);
        await saveConfig(exercisesDb.id, logsDb.id, routinesDb.id);
        window.location.reload();
      } else {
        // Pre-select if found
        if (exercisesDb) setWorkoutDb(exercisesDb.id);
        if (logsDb) setLogDb(logsDb.id);
        if (routinesDb) setRoutineDb(routinesDb.id);
        
        setLoading(false);
      }
    };
    fetchDbs();
  }, []);

  const handleSave = async () => {
    if (!workoutDb || !logDb || !routineDb) return;
    setSaving(true);
    await saveConfig(workoutDb, logDb, routineDb);
    window.location.reload(); // Reload to trigger the main view
  };

  const handleReconnect = async () => {
    await signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Searching for databases...</p>
      </div>
    );
  }

  if (saving) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-4" />
        <p className="text-gray-500">Found matching databases! Configuring...</p>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="max-w-2xl w-full p-4 md:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Setup Databases</h2>
              <p className="text-gray-500 font-medium">
                  Select the databases for your workout system.
              </p>
          </div>
          <button 
              onClick={handleReconnect}
              className="px-4 py-2 bg-white text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm"
          >
              <LogOut className="w-3 h-3" /> Reconnect
          </button>
        </div>

        {databases.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Databases Found</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto leading-relaxed">
                  We couldn't find any databases. This usually happens if you didn't select the pages during the Notion login.
              </p>
              <button
                  onClick={handleReconnect}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-gray-200"
              >
                  <RefreshCw className="w-4 h-4" />
                  Reconnect & Select Pages
              </button>
          </div>
        ) : (
          <div className="space-y-10">
              {/* Workout DB Selection */}
              <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">
                  1. Exercises Database
              </label>
              <div className="grid gap-3">
                  {databases.map((db) => (
                  <button
                      key={db.id}
                      onClick={() => setWorkoutDb(db.id)}
                      className={`group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      workoutDb === db.id
                          ? 'border-blue-500 bg-white shadow-md shadow-blue-100'
                          : 'border-transparent bg-white shadow-sm hover:bg-gray-50'
                      }`}
                  >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          workoutDb === db.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                          <Database className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                      <div className={`font-bold truncate ${workoutDb === db.id ? 'text-blue-700' : 'text-gray-900'}`}>
                          {db.title}
                      </div>
                      </div>
                      {workoutDb === db.id && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md animate-scale-in">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                      )}
                  </button>
                  ))}
              </div>
              </div>

              {/* Log DB Selection */}
              <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">
                  2. Logs Database
              </label>
              <div className="grid gap-3">
                  {databases.map((db) => (
                  <button
                      key={db.id}
                      onClick={() => setLogDb(db.id)}
                      className={`group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      logDb === db.id
                          ? 'border-green-500 bg-white shadow-md shadow-green-100'
                          : 'border-transparent bg-white shadow-sm hover:bg-gray-50'
                      }`}
                  >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          logDb === db.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                          <Database className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                      <div className={`font-bold truncate ${logDb === db.id ? 'text-green-700' : 'text-gray-900'}`}>
                          {db.title}
                      </div>
                      </div>
                      {logDb === db.id && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white shadow-md animate-scale-in">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                      )}
                  </button>
                  ))}
              </div>
              </div>

              {/* Routine DB Selection */}
              <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">
                  3. Routines Database
              </label>
              <div className="grid gap-3">
                  {databases.map((db) => (
                  <button
                      key={db.id}
                      onClick={() => setRoutineDb(db.id)}
                      className={`group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      routineDb === db.id
                          ? 'border-purple-500 bg-white shadow-md shadow-purple-100'
                          : 'border-transparent bg-white shadow-sm hover:bg-gray-50'
                      }`}
                  >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          routineDb === db.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                          <Database className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                      <div className={`font-bold truncate ${routineDb === db.id ? 'text-purple-700' : 'text-gray-900'}`}>
                          {db.title}
                      </div>
                      </div>
                      {routineDb === db.id && (
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-md animate-scale-in">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                      )}
                  </button>
                  ))}
              </div>
              </div>
          </div>
        )}

        {databases.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 flex justify-end pb-10">
              <button
              onClick={handleSave}
              disabled={!workoutDb || !logDb || !routineDb || saving}
              className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
              {saving && <Loader2 className="w-5 h-5 animate-spin" />}
              {saving ? 'Saving...' : 'Complete Setup'}
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
