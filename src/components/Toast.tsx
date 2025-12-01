'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 animate-fade-in w-full max-w-sm px-4">
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-full shadow-2xl bg-gray-900 text-white">
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
        )}
        <span className="font-medium text-sm truncate flex-1">{message}</span>
      </div>
    </div>
  );
}
