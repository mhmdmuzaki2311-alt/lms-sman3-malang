import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ 
  title = 'Gagal Memuat Data', 
  message = 'Terjadi kesalahan saat menghubungkan ke server REST API. Silakan coba beberapa saat lagi.', 
  onRetry 
}) {
  return (
    <div className="p-8 bg-rose-50/80 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex flex-col items-center text-center my-6">
      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900 dark:text-rose-200 mb-1">{title}</h3>
      <p className="text-sm text-rose-700 dark:text-rose-300 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-xl transition-all shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
        </button>
      )}
    </div>
  );
}
