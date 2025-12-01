'use client';

import React, { useState, useEffect } from 'react';
import { Exercise, createExercise, updateExercise, deleteExercise, getExercises, getExercisePropertyOptions } from '@/lib/actions';
import { Plus, X, Edit2, Trash2, Dumbbell, Clock, Loader2, Search, Trophy, ChevronLeft } from 'lucide-react';

import AppBar from './AppBar';

interface ExerciseManagerProps {
  onClose: () => void;
}

export default function ExerciseManager({ onClose }: ExerciseManagerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Strength');
  const [formTarget, setFormTarget] = useState('Body');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [typeOptions, setTypeOptions] = useState<string[]>(['Strength', 'Cardio']);
  const [targetOptions, setTargetOptions] = useState<string[]>(['Body']);

  const loadData = async () => {
    setLoading(true);
    const [fetchedExercises, options] = await Promise.all([
      getExercises(),
      getExercisePropertyOptions()
    ]);
    setExercises(fetchedExercises);
    if (options.types.length > 0) setTypeOptions(options.types);
    if (options.targets.length > 0) setTargetOptions(options.targets);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredExercises = exercises.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSubmitting(true);
    let result;

    if (editingId) {
      result = await updateExercise(editingId, formName, formType, formTarget);
    } else {
      result = await createExercise(formName, formType, formTarget);
    }

    if (result.success) {
      await loadData(); // Reload all data to be safe
      resetForm();
    } else {
      alert('Failed to save exercise');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    
    setLoading(true); // Show loading state on list
    const result = await deleteExercise(id);
    if (result.success) {
      await loadData();
    } else {
      alert('Failed to delete exercise');
      setLoading(false);
    }
  };

  const startEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setFormName(exercise.name);
    setFormType(exercise.type);
    setFormTarget(exercise.target || 'Body');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormType(typeOptions[0] || 'Strength');
    setFormTarget(targetOptions[0] || 'Body');
    setShowForm(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#F2F4F6] flex flex-col animate-fade-in">
      {/* Reused AppBar */}
      <AppBar 
        title="Manage Exercises"
        leading={
          <button 
            onClick={onClose}
            className="p-2 -ml-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        }
        className="relative bg-white" // Override fixed positioning if needed, or keep it. 
        // Actually AppBar is fixed by default. In a modal, we might want it sticky or just relative if the modal is fixed.
        // But the modal is fixed inset-0. So fixed top-0 works relative to viewport.
        // However, ExerciseManager is z-[60], AppBar is z-40. We need to boost AppBar z-index or make it relative.
        // Let's make it relative here since the modal is already a fixed overlay.
      />

      {/* Content - Add padding-top to account for AppBar if it's fixed, or just flex if it's relative */}
      {/* Since I made AppBar relative in usage via className override (if I change AppBar css), wait. 
         AppBar has `fixed` class. I should override it to `sticky` or `relative` for this modal usage.
      */}
      
      <div className="flex-1 overflow-y-auto p-4 pb-12 pt-4"> 
        {/* Search & Add Bar */}
        <div className="flex gap-2 mb-6 sticky top-0 z-10">
          <div className="relative flex-1 shadow-sm rounded-2xl"> {/* Added shadow-sm */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search exercises..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-12 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExercises.map(exercise => (
              <div key={exercise.id} className="bg-white p-4 rounded-2xl flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    exercise.type === 'Strength' ? 'bg-green-50 text-green-600' : 
                    exercise.type === 'Cardio' ? 'bg-orange-50 text-orange-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {exercise.type === 'Strength' && <Dumbbell className="w-5 h-5" />}
                    {exercise.type === 'Cardio' && <Clock className="w-5 h-5" />}
                    {(exercise.type === 'Sports' || exercise.type === 'Sport') && <Trophy className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{exercise.name}</h3>
                    <div className="flex gap-2">
                        <span className="text-xs text-gray-400">{exercise.type}</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">{exercise.target}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => startEdit(exercise)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(exercise.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredExercises.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No exercises found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal (Overlay) */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Exercise' : 'New Exercise'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Bench Press"
                  className="w-full p-4 bg-gray-50 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map(option => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => setFormType(option)}
                        className={`p-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                        formType === option 
                            ? (option === 'Strength' ? 'bg-green-50 text-green-600 ring-2 ring-green-500/20' :
                               option === 'Cardio' ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-500/20' :
                               'bg-blue-50 text-blue-600 ring-2 ring-blue-500/20')
                            : 'bg-gray-50 text-gray-400'
                        }`}
                    >
                        {option === 'Strength' && <Dumbbell className="w-4 h-4" />}
                        {option === 'Cardio' && <Clock className="w-4 h-4" />}
                        {(option === 'Sports' || option === 'Sport') && <Trophy className="w-4 h-4" />}
                        {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target</label>
                <div className="flex flex-wrap gap-2">
                    {targetOptions.map(option => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setFormTarget(option)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                formTarget === option 
                                ? 'bg-black text-white shadow-md transform scale-105' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !formName.trim()}
                  className="flex-1 py-4 rounded-2xl bg-black text-white font-bold shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
