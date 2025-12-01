import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { Exercise } from '@/lib/actions';
import { motion, AnimatePresence, PanInfo, useDragControls } from 'framer-motion';

interface ExerciseListModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onSelect: (exerciseId: string) => void;
}

export default function ExerciseListModal({ isOpen, onClose, exercises, onSelect }: ExerciseListModalProps) {
  const [search, setSearch] = useState('');
  const dragControls = useDragControls();
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Visual Viewport resize (for mobile keyboard)
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      }
    };

    window.visualViewport.addEventListener('resize', handleResize);
    handleResize(); // Initial set

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group by target body part
  const grouped = filtered.reduce((acc, exercise) => {
    const target = exercise.target || 'Other';
    if (!acc[target]) acc[target] = [];
    acc[target].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm touch-none"
          />

          {/* Modal / Bottom Sheet */}
          <div 
            className="fixed inset-0 z-[61] flex items-end sm:items-center justify-center pointer-events-none"
            style={{ 
              height: viewportHeight ? `${viewportHeight}px` : '100%',
              // Ensure the container itself respects the visual viewport
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl pointer-events-auto"
              style={{
                height: '85dvh',
                maxHeight: viewportHeight ? `${viewportHeight}px` : '100%'
              }}
            >
              {/* Drag Handle (Mobile Only) - Active Area */}
              <div 
                onPointerDown={(e) => dragControls.start(e)}
                className="w-full flex justify-center pt-3 pb-1 sm:hidden cursor-grab active:cursor-grabbing touch-none"
              >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-lg">Add Exercise</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 pb-2 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5"
                    autoFocus
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 overscroll-contain">
                {Object.entries(grouped).map(([target, items]) => (
                  <div key={target}>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                      {target}
                    </h4>
                    <div className="space-y-1">
                      {items.map((exercise) => (
                        <button
                          key={exercise.id}
                          onClick={() => {
                            onSelect(exercise.id);
                            onClose();
                          }}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              {exercise.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{exercise.name}</div>
                              <div className="text-xs text-gray-500">{exercise.type} · {exercise.target}</div>
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                              <Check className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <p>No exercises found.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
