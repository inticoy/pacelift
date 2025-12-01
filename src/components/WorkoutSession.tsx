'use client';

import React, { useState, useEffect } from 'react';
import { Exercise } from '@/lib/actions';
import RoutineSelector from './RoutineSelector';
import ExerciseCard from './ExerciseCard';
import ExerciseListModal from './ExerciseListModal';
import Toast from './Toast';
import { Plus, Save, Loader2 } from 'lucide-react';
import { submitLog, ActiveExercise, saveRoutine, getRoutines, Routine } from '@/lib/actions';

interface WorkoutSessionProps {
  allExercises: Exercise[];
}

export default function WorkoutSession({ allExercises }: WorkoutSessionProps) {
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadRoutines = async () => {
      const fetched = await getRoutines();
      setRoutines(fetched);
    };
    loadRoutines();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const addExercise = (exerciseId: string) => {
    const exercise = allExercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    const newExercise: ActiveExercise = {
      ...exercise,
      uuid: crypto.randomUUID(),
      sets: Array.from({ length: exercise.type === 'Strength' ? 3 : 1 }).map(() => ({
        id: crypto.randomUUID(),
        weight: 0,
        reps: 10,
        time: 0,
        distance: 0,
        sec: 0,
      }))
    };

    setActiveExercises((prev) => [...prev, newExercise]);
  };

  const removeExercise = (uuid: string) => {
    setActiveExercises((prev) => prev.filter((e) => e.uuid !== uuid));
  };

  const updateExerciseData = (uuid: string, sets: any[]) => {
    setActiveExercises((prev) =>
      prev.map((e) => (e.uuid === uuid ? { ...e, sets } : e))
    );
  };

  const handleRoutineSelect = (routine: Routine) => {
    const exercisesToAdd: ActiveExercise[] = [];
    
    if (routine.items && routine.items.length > 0) {
        routine.items.forEach(item => {
            const exercise = allExercises.find(e => e.id === item.id);
            if (exercise) {
                // Ensure sets have unique IDs when loaded from routine
                const sets = Array.isArray(item.sets) ? item.sets : [];
                const setsWithNewIds = sets.map(s => ({ ...s, id: crypto.randomUUID() }));
                
                exercisesToAdd.push({
                    ...exercise,
                    uuid: crypto.randomUUID(),
                    sets: setsWithNewIds
                });
            }
        });
    }

    if (exercisesToAdd.length === 0) {
      showToast('No valid exercises found in this routine.', 'error');
      return;
    }

    setActiveExercises(prev => [...prev, ...exercisesToAdd]);
    showToast(`Loaded "${routine.label}"!`, 'success');
  };

  const handleAddRoutine = async () => {
    if (activeExercises.length === 0) {
      showToast('Add exercises first to create a routine.', 'error');
      return;
    }

    const name = window.prompt('Enter routine name (e.g., Chest Day):');
    if (!name) return;

    const result = await saveRoutine(name, activeExercises);
    if (result.success) {
      showToast('Routine saved successfully!', 'success');
      const fetched = await getRoutines();
      setRoutines(fetched);
    } else {
      showToast('Failed to save routine.', 'error');
    }
  };

  const handleSubmit = async () => {
    if (activeExercises.length === 0) return;
    setIsSubmitting(true);
    
    try {
        // Prepare payload
        const payload = activeExercises.map(e => ({
            exerciseId: e.id,
            exerciseName: e.name,
            date: new Date().toISOString(),
            sets: e.sets
        }));

        const result = await submitLog(payload);
        
        if (result.success) {
            showToast('Workout saved successfully!', 'success');
            // Reset session
            setActiveExercises([]);
        } else {
            showToast(`Failed to save: ${JSON.stringify(result.error)}`, 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('An unexpected error occurred.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20 pb-32">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Routine Selector */}
      <div className="mb-8">
        <div className="px-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Workout</h1>
            <h2 className="text-xl font-bold text-gray-800">Quick Start</h2>
        </div>
        <RoutineSelector 
          routines={routines} 
          onSelect={handleRoutineSelect} 
          onAdd={handleAddRoutine}
        />
      </div>
      <div className="mt-8 px-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Active Session</h2>
        
        {activeExercises.length === 0 ? (
          <div className="space-y-3">
             <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-6 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">Add Exercise</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.uuid}
                exercise={exercise}
                onRemove={() => removeExercise(exercise.uuid)}
                onChange={(data) => updateExerciseData(exercise.uuid, data)}
              />
            ))}
            
            {/* Inline Add Exercise Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-6 rounded-3xl bg-white flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-600 transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">Add Exercise</span>
            </button>
          </div>
        )}
      </div>

      <ExerciseListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exercises={allExercises}
        onSelect={addExercise}
      />

      {/* Bottom Save Bar */}
      {activeExercises.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 p-4 z-30 pointer-events-none">
          <div className="pointer-events-auto max-w-md mx-auto">
             <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold py-4 rounded-2xl shadow-2xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                {isSubmitting ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                    </span>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        <span>Finish Workout ({activeExercises.length})</span>
                    </>
                )}
              </button>
          </div>
        </div>
      )}
    </div>
  );
}
