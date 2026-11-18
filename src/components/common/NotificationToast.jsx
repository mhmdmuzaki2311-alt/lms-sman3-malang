import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Bell, MessageSquare, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationToast() {
  const { toasts, removeToast } = useNotification();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Bell;
        let borderClass = 'border-blue-500';
        let bgIcon = 'bg-blue-100 text-blue-600';

        if (toast.type === 'forum') {
          Icon = MessageSquare;
          borderClass = 'border-indigo-500';
          bgIcon = 'bg-indigo-100 text-indigo-600';
        } else if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-500';
          bgIcon = 'bg-emerald-100 text-emerald-600';
        } else if (toast.type === 'warning') {
          Icon = AlertCircle;
          borderClass = 'border-amber-500';
          bgIcon = 'bg-amber-100 text-amber-600';
        }

        return (
          <div
            key={toast.toastId}
            className={`pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border-l-4 ${borderClass} border-slate-200 dark:border-slate-800 flex items-start gap-3 transform transition-all duration-300 animate-slideInRight`}
          >
            <div className={`p-2 rounded-xl ${bgIcon} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                {toast.message}
              </p>
              {toast.link && (
                <Link
                  to={toast.link}
                  onClick={() => removeToast(toast.toastId)}
                  className="inline-block mt-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Buka Detail →
                </Link>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.toastId)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
