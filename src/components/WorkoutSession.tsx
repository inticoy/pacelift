'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Exercise } from '@/lib/actions';
import ExerciseCard from './ExerciseCard';
import ExerciseListModal from './ExerciseListModal';
import InputModal from './InputModal';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';
import { Plus, Dumbbell, X } from 'lucide-react';
import { submitLog, ActiveExercise, saveRoutine, getRoutines, deleteRoutine, Routine } from '@/lib/actions';

interface WorkoutSessionProps {
  allExercises: Exercise[];
  activeExercises: ActiveExercise[];
  onActiveExercisesChange: (exercises: ActiveExercise[]) => void;
}

export interface WorkoutSessionRef {
  handleSubmit: () => Promise<void>;
  openAddRoutineModal: () => void;
}

const WorkoutSession = forwardRef<WorkoutSessionRef, WorkoutSessionProps>(({ allExercises, activeExercises, onActiveExercisesChange }, ref) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);
  const [isDeleteRoutineModalOpen, setIsDeleteRoutineModalOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
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

    onActiveExercisesChange([...activeExercises, newExercise]);
  };

  const removeExercise = (uuid: string) => {
    onActiveExercisesChange(activeExercises.filter((e) => e.uuid !== uuid));
  };

  const updateExerciseData = (uuid: string, sets: any[]) => {
    onActiveExercisesChange(activeExercises.map((e) => (e.uuid === uuid ? { ...e, sets } : e)));
  };

  const handleRoutineSelect = (routine: Routine) => {
    const exercisesToAdd: ActiveExercise[] = [];

    if (routine.items && routine.items.length > 0) {
        routine.items.forEach(item => {
            const exercise = allExercises.find(e => e.id === item.id);
            if (exercise) {
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

    onActiveExercisesChange([...activeExercises, ...exercisesToAdd]);
    showToast(`Loaded "${routine.label}"!`, 'success');
  };

  const handleAddRoutine = async (name: string) => {
    if (activeExercises.length === 0) {
      showToast('Add exercises first to create a routine.', 'error');
      return;
    }

    const result = await saveRoutine(name, activeExercises);
    if (result.success) {
      showToast('Routine saved successfully!', 'success');
      const fetched = await getRoutines();
      setRoutines(fetched);
    } else {
      showToast('Failed to save routine.', 'error');
    }
  };

  const handleDeleteRoutineClick = (e: React.MouseEvent, routine: Routine) => {
    e.stopPropagation(); // Prevent card click
    setRoutineToDelete(routine);
    setIsDeleteRoutineModalOpen(true);
  };

  const confirmDeleteRoutine = async () => {
    if (!routineToDelete) return;

    const result = await deleteRoutine(routineToDelete.id);
    if (result.success) {
      showToast('Routine deleted successfully!', 'success');
      const fetched = await getRoutines();
      setRoutines(fetched);
    } else {
      showToast('Failed to delete routine.', 'error');
    }
    setRoutineToDelete(null);
  };

  const handleSubmit = async () => {
    if (activeExercises.length === 0) return;
    setIsSubmitting(true);

    try {
        const payload = activeExercises.map(e => ({
            exerciseId: e.id,
            exerciseName: e.name,
            date: new Date().toISOString(),
            sets: e.sets
        }));

        const result = await submitLog(payload);

        if (result.success) {
            showToast('Workout saved successfully!', 'success');
            onActiveExercisesChange([]);
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

  useImperativeHandle(ref, () => ({
    handleSubmit,
    openAddRoutineModal: () => setIsAddRoutineModalOpen(true)
  }));

  return (
    <div className="pt-20 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {activeExercises.length === 0 ? (
        // State A: Routine Selection
        <div className="grid grid-cols-2 gap-3">
          {/* Start Empty Card */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white p-5 rounded-3xl flex flex-col justify-between h-40 text-left hover:scale-[1.02] transition-all active:scale-95"
          >
            <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Start Empty</span>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">New Session</p>
            </div>
          </button>

          {/* User Routines */}
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="relative group"
            >
              <button
                onClick={() => handleRoutineSelect(routine)}
                className="w-full bg-white p-5 rounded-3xl flex flex-col justify-between h-40 text-left hover:scale-[1.02] transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                    {routine.label}
                  </span>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                    {routine.items?.length || 0} Exercises
                  </p>
                </div>
              </button>
              
              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteRoutineClick(e, routine)}
                className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        // State B: Active Session
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

      <ExerciseListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exercises={allExercises}
        onSelect={addExercise}
      />

      <InputModal
        isOpen={isAddRoutineModalOpen}
        onClose={() => setIsAddRoutineModalOpen(false)}
        onConfirm={handleAddRoutine}
        title="Save Routine"
        placeholder="e.g., Chest Day"
        confirmText="Save Routine"
      />

      <ConfirmModal
        isOpen={isDeleteRoutineModalOpen}
        onClose={() => setIsDeleteRoutineModalOpen(false)}
        onConfirm={confirmDeleteRoutine}
        title="Delete Routine"
        message={`Are you sure you want to delete "${routineToDelete?.label}"? This action cannot be undone.`}
        confirmText="Remove Routine"
        isDestructive
      />
    </div>
  );
});

WorkoutSession.displayName = 'WorkoutSession';

export default WorkoutSession;
