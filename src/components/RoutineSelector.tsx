'use client';

import React from 'react';
import { Dumbbell, PersonStanding, Flame, Footprints, Plus } from 'lucide-react';

import { Routine } from '@/lib/actions';

interface RoutineSelectorProps {
  routines: Routine[];
  onSelect: (routine: Routine) => void;
  onAdd: () => void;
}



export default function RoutineSelector({ routines, onSelect, onAdd }: RoutineSelectorProps) {
  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 no-scrollbar">
      <div className="flex gap-3 px-4">
        {routines.map((routine) => (
          <button
            key={routine.id}
            onClick={() => onSelect(routine)}
            className="flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-2xl bg-white hover:bg-blue-50/50 transition-all active:scale-95"
          >
            <div className="p-2 rounded-full bg-blue-50 text-blue-600">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
              {routine.label}
            </span>
          </button>
        ))}
        
        {/* Add Routine Button */}
        <button
          onClick={onAdd}
          className="flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-2xl bg-white hover:bg-gray-50 transition-all active:scale-95"
        >
          <div className="p-2 rounded-full bg-gray-100 text-gray-600">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
            Add New
          </span>
        </button>
      </div>
    </div>
  );
}
