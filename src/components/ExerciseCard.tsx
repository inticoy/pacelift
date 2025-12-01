'use client';

import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Clock, Dumbbell, MapPin, Trophy, Check } from 'lucide-react';
import { Exercise, ActiveExercise } from '@/lib/actions';

interface ExerciseCardProps {
  exercise: ActiveExercise;
  onRemove: () => void;
  onChange: (data: any) => void;
}

interface StepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  step?: number;
  rapidStep?: number;
  label?: string;
  labelClassName?: string;
}

function Stepper({ value, onChange, min = 0, step = 1, rapidStep, label, labelClassName }: StepperProps) {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const valueRef = React.useRef(value);
  const onChangeRef = React.useRef(onChange);
  
  // Local state to handle empty string input and focus behavior
  const [localValue, setLocalValue] = useState(value.toString());

  valueRef.current = value;
  onChangeRef.current = onChange;

  // Sync local value with prop value when prop changes externally
  // But avoid overriding if the user is currently typing (handled by checking number equality)
  useEffect(() => {
    if (Number(localValue) !== value) {
      setLocalValue(value.toString());
    }
  }, [value]);

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  const handleStart = (amount: number) => {
    // Fix floating point precision issues
    const fixPrecision = (val: number) => Number(val.toFixed(2));

    const newValue = Math.max(min, fixPrecision(valueRef.current + amount));
    onChangeRef.current(newValue);

    // Determine rapid step amount
    // If rapidStep is provided, use it. Otherwise default to 5x step or 5.
    const absRapid = rapidStep || (step < 1 ? step * 5 : 5);
    const rapidAmount = amount > 0 ? absRapid : -absRapid;

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const nextVal = Math.max(min, fixPrecision(valueRef.current + rapidAmount));
        onChangeRef.current(nextVal);
      }, 200);
    }, 500);
  };

  const handlePointerDown = (amount: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    handleStart(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    if (val === '') {
      onChange(0);
    } else {
      onChange(Number(val));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (value === 0) {
      setLocalValue('');
    } else {
      e.target.select();
    }
  };

  const handleBlur = () => {
    if (localValue === '') {
      setLocalValue('0');
    }
  };

  React.useEffect(() => () => clearTimers(), []);

  return (
    <div className="flex items-center bg-gray-50 rounded-xl h-10 w-full">
      <button
        onPointerDown={handlePointerDown(-step)}
        onPointerUp={clearTimers}
        onPointerLeave={clearTimers}
        className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-blue-600 active:scale-90 transition-transform touch-none select-none touch-manipulation"
      >
        <Minus className="w-3 h-3" />
      </button>
      <div className="flex-1 h-full flex items-center justify-center gap-0.5">
        <input
          type="number"
          inputMode="decimal"
          value={localValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-8 h-full bg-transparent text-center font-bold text-gray-900 text-sm focus:outline-none"
        />
        {label && <span className={`font-medium text-gray-500 ${labelClassName || 'text-[11px]'}`}>{label}</span>}
      </div>
      <button
        onPointerDown={handlePointerDown(step)}
        onPointerUp={clearTimers}
        onPointerLeave={clearTimers}
        className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-blue-600 active:scale-90 transition-transform touch-none select-none touch-manipulation"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function ExerciseCard({ exercise, onRemove, onChange }: ExerciseCardProps) {
  const isStrength = exercise.type === 'Strength';
  const isCardio = exercise.type === 'Cardio';
  const isSports = exercise.type === 'Sports' || exercise.type === 'Sport';

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet = {
      id: crypto.randomUUID(),
      weight: lastSet?.weight ?? 0,
      reps: lastSet?.reps ?? 10,
      time: lastSet?.time ?? 0,
      distance: lastSet?.distance ?? 0,
      sec: lastSet?.sec ?? 0,
      heartRate: lastSet?.heartRate ?? 0,
      cadence: lastSet?.cadence ?? 0,
    };
    onChange([...exercise.sets, newSet]);
  };

  const removeSet = (setId: string) => {
    onChange(exercise.sets.filter(s => s.id !== setId));
  };

  const updateSet = (setId: string, data: any) => {
    onChange(exercise.sets.map(s => s.id === setId ? { ...s, ...data } : s));
  };

  return (
    <div className="relative w-full bg-white rounded-3xl p-5 mb-4 animate-slide-up transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold ${
            isStrength ? 'bg-green-50 text-green-600' :
            isCardio ? 'bg-orange-50 text-orange-600' :
            'bg-blue-50 text-blue-600'
          }`}>
            {isStrength && <Dumbbell className="w-5 h-5" />}
            {isCardio && <Clock className="w-5 h-5" />}
            {isSports && <Trophy className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 leading-tight">{exercise.name}</h3>
            <p className="text-xs text-gray-500 font-medium">{exercise.type} · {exercise.target}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addSet}
            className="text-gray-400 hover:text-blue-600 transition-colors p-2 active:scale-90"
            title="Add Set"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onRemove}
            className="text-gray-300 hover:text-red-500 transition-colors p-2 active:scale-90"
            title="Remove Exercise"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sets List */}
      <div className="space-y-3">
        {exercise.sets.map((set) => (
          <div key={set.id} className={`flex items-center gap-2 animate-fade-in transition-opacity ${set.completed ? 'opacity-50' : 'opacity-100'}`}>
            {/* Checkbox */}
            <div className="shrink-0 w-8 flex justify-center">
              <button
                onClick={() => updateSet(set.id, { completed: !set.completed })}
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all active:scale-90 ${
                  set.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 text-gray-300 hover:border-green-400'
                }`}
              >
                {set.completed && <Check className="w-5 h-5" />}
              </button>
            </div>

            {/* Steppers Container */}
            <div className="flex-1">
              {isStrength ? (
                <div className="grid gap-2 grid-cols-2">
                  <Stepper
                    value={set.weight || 0}
                    onChange={(val) => updateSet(set.id, { weight: val })}
                    min={0}
                    step={0.5}
                    label="kg"
                  />
                  <Stepper
                    value={set.reps || 0}
                    onChange={(val) => updateSet(set.id, { reps: val })}
                    min={0}
                    label="reps"
                  />
                </div>
              ) : isSports ? (
                <div className="grid gap-2 grid-cols-3">
                  <Stepper
                    value={set.time || 0}
                    onChange={(val) => updateSet(set.id, { time: val })}
                    min={0}
                    label="m"
                  />
                  <Stepper
                    value={set.sec || 0}
                    onChange={(val) => updateSet(set.id, { sec: val })}
                    min={0}
                    label="s"
                  />
                  <Stepper
                    value={set.heartRate || 0}
                    onChange={(val) => updateSet(set.id, { heartRate: val })}
                    min={0}
                    step={1}
                    rapidStep={5}
                    label="bpm"
                    labelClassName="text-[8px]"
                  />
                </div>
              ) : (
                // Cardio
                <div className="space-y-2">
                  <div className="grid gap-2 grid-cols-2 min-[380px]:grid-cols-3">
                    <Stepper
                      value={set.time || 0}
                      onChange={(val) => updateSet(set.id, { time: val })}
                      min={0}
                      label="m"
                    />
                    <Stepper
                      value={set.sec || 0}
                      onChange={(val) => updateSet(set.id, { sec: val })}
                      min={0}
                      label="s"
                    />
                    <Stepper
                      value={set.distance || 0}
                      onChange={(val) => updateSet(set.id, { distance: val })}
                      min={0}
                      step={0.1}
                      rapidStep={1}
                      label="km"
                    />
                  </div>
                  <div className="grid gap-2 grid-cols-2">
                    <Stepper
                      value={set.heartRate || 0}
                      onChange={(val) => updateSet(set.id, { heartRate: val })}
                      min={0}
                      step={1}
                      rapidStep={5}
                      label="bpm"
                    />
                    <Stepper
                      value={set.cadence || 0}
                      onChange={(val) => updateSet(set.id, { cadence: val })}
                      min={0}
                      step={1}
                      rapidStep={5}
                      label="spm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <div className="shrink-0 w-8 flex justify-center">
              <button
                onClick={() => removeSet(set.id)}
                className="flex justify-center text-gray-300 hover:text-red-500 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
