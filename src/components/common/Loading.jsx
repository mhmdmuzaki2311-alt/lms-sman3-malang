import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text = 'Memuat data LMS...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-slate-100">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 gap-3 text-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
      <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
    </div>
  );
}
