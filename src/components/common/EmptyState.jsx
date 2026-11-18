import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = FolderOpen, 
  title = 'Belum Ada Data', 
  description = 'Data tidak ditemukan atau belum ditambahkan oleh pengajar/admin.', 
  actionLabel, 
  onAction 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center my-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-700/50 flex items-center justify-center text-blue-600 mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-blue-500/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
