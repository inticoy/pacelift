import React from 'react';
import { SiNotion } from 'react-icons/si';
import { Dumbbell } from 'lucide-react';

interface LoginScreenProps {
  authUrl: string;
}

export default function LoginScreen({ authUrl }: LoginScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F2F4F6] p-4 text-center animate-fade-in">
      <div className="max-w-md w-full space-y-10">
        
        {/* Logo & Branding */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-xl shadow-blue-900/20 transform hover:scale-105 transition-transform duration-500">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-gray-900">
              PaceLift
            </h1>
            <p className="text-lg font-medium text-gray-500">
              Your minimalist workout companion.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-xs mx-auto pt-8 pb-8">
          <a
            href={authUrl}
            className="group relative flex items-center justify-center gap-3 w-full bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:scale-[1.02] active:scale-95 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity" />
            <SiNotion className="text-xl relative z-10" />
            <span className="relative z-10">Connect with Notion</span>
          </a>
          
          <p className="text-xs text-gray-400 font-medium mt-8">
            Secure authentication via Notion API
          </p>
        </div>
      </div>
    </div>
  );
}
