'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  const bgColors = {
    success: 'bg-botanical-900 border-emerald-500/50 text-white',
    error: 'bg-rose-950 border-rose-500/50 text-white',
    info: 'bg-botanical-800 border-sandal-400/50 text-sandal-100',
  };

  const Icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sandal-400 flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-modal-pop max-w-sm w-full px-2">
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${bgColors[toast.type]}`}
      >
        {Icons[toast.type]}
        <p className="text-sm font-medium tracking-wide leading-snug">{toast.message}</p>
      </div>
    </div>
  );
};
