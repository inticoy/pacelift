'use client';

import React from 'react';
import { LogOut, Dumbbell } from 'lucide-react';
import { signOut } from '@/lib/actions';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white">
          <Dumbbell className="w-4 h-4" />
        </div>
        <h1 className="font-bold text-lg tracking-tight">WLog</h1>
      </div>
      
      <button 
        onClick={() => signOut()}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Sign out"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  );
}
