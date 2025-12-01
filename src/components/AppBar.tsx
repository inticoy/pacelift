'use client';

import React from 'react';
import { Dumbbell, Settings } from 'lucide-react';

interface AppBarProps {
  title?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export default function AppBar({ 
  title = 'PaceLift', 
  leading, 
  trailing,
  className = '',
  children
}: AppBarProps) {
  return (
    <header className={`fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 z-40 ${className}`}>
      <div className="flex items-center gap-3 flex-1">
        {leading ? (
          leading
        ) : (
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white shrink-0">
            <Dumbbell className="w-4 h-4" />
          </div>
        )}
        <h1 className="font-bold text-lg tracking-tight truncate">{title}</h1>
      </div>
      
      {children && (
        <div className="absolute left-1/2 -translate-x-1/2">
            {children}
        </div>
      )}

      <div className="flex items-center gap-2">
        {trailing}
      </div>
    </header>
  );
}
