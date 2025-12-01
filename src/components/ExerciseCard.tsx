'use client';

import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Clock, Dumbbell, MapPin, Trophy } from 'lucide-react';
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
  label?: string;
}

function Stepper({ value, onChange, min = 0, step = 1, label }: StepperProps) {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const valueRef = React.useRef(value);
  const onChangeRef = React.useRef(onChange);

  valueRef.current = value;
  onChangeRef.current = onChange;

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  const handleStart = (amount: number) => {
    // Fix floating point precision issues (e.g. 0.1 + 0.2 = 0.30000000000000004)
    const fixPrecision = (val: number) => Number(val.toFixed(2));
    
    const newValue = Math.max(min, fixPrecision(valueRef.current + amount));
    onChangeRef.current(newValue);

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const rapidAmount = amount > 0 ? (step < 1 ? step * 5 : 5) : (step < 1 ? step * -5 : -5);
        const nextVal = Math.max(min, fixPrecision(valueRef.current + rapidAmount));
        onChangeRef.current(nextVal);
      }, 200);
    }, 500);
  };

  const handlePointerDown = (amount: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    handleStart(amount);
  };

  React.useEffect(() => () => clearTimers(), []);

  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</span>}
      <div className="flex items-center bg-gray-50 rounded-xl h-10 w-full max-w-[120px]">
        <button
          onPointerDown={handlePointerDown(-step)}
          onPointerUp={clearTimers}
          onPointerLeave={clearTimers}
          className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-blue-600 active:scale-90 transition-transform touch-none"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-full bg-transparent text-center font-bold text-gray-900 text-sm focus:outline-none"
        />
        <button
          onPointerDown={handlePointerDown(step)}
          onPointerUp={clearTimers}
          onPointerLeave={clearTimers}
          className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-blue-600 active:scale-90 transition-transform touch-none"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
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
    <div className="relative w-full bg-white rounded-3xl p-6 mb-4 animate-slide-up transition-all">
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
            <p className="text-xs text-gray-500 font-medium">{exercise.target}</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-red-500 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sets List */}
      <div className="space-y-3">
        {/* Column Headers */}
        <div className={`grid ${isStrength ? 'grid-cols-[30px_1fr_1fr_30px]' : 'grid-cols-[30px_1fr_1fr_1fr_30px]'} gap-2 px-2 text-center`}>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Set</span>
          {isStrength ? (
            <>
              <span className="text-[10px] font-bold text-gray-400 uppercase">kg</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Reps</span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Min</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Sec</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Km</span>
            </>
          )}
          <span className="text-[10px] font-bold text-gray-400 uppercase"></span>
        </div>

        {exercise.sets.map((set, index) => (
          <div key={set.id} className={`grid ${isStrength ? 'grid-cols-[30px_1fr_1fr_30px]' : 'grid-cols-[30px_1fr_1fr_1fr_30px]'} gap-2 items-center animate-fade-in`}>
            <div className="flex justify-center">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
            </div>
            
            {isStrength ? (
              <>
                <Stepper 
                  value={set.weight || 0} 
                  onChange={(val) => updateSet(set.id, { weight: val })} 
                  min={0} 
                  step={0.5} 
                />
                <Stepper 
                  value={set.reps || 0} 
                  onChange={(val) => updateSet(set.id, { reps: val })} 
                  min={0} 
                />
              </>
            ) : (
              <>
                <Stepper 
                  value={set.time || 0} 
                  onChange={(val) => updateSet(set.id, { time: val })} 
                  min={0} 
                />
                <Stepper 
                  value={set.sec || 0} 
                  onChange={(val) => updateSet(set.id, { sec: val })} 
                  min={0} 
                />
                <Stepper 
                  value={set.distance || 0} 
                  onChange={(val) => updateSet(set.id, { distance: val })} 
                  min={0} 
                  step={0.1}
                />
              </>
            )}

            <button 
              onClick={() => removeSet(set.id)}
              className="flex justify-center text-gray-300 hover:text-red-500 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Set Button */}
      <button
        onClick={addSet}
        className="w-full mt-4 py-3 rounded-2xl bg-gray-50 text-gray-500 font-bold text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add Set</span>
      </button>
    </div>
  );
}
