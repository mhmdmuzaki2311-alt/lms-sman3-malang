import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { Bell, CheckCheck, MessageSquare, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationPage() {
  const { notifications, markAllAsRead } = useNotification();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Pemberitahuan & Notifikasi</h1>
          <p className="text-xs text-slate-500 mt-1">Riwayat notifikasi balasan forum real-time, tugas, dan pengumuman sekolah</p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-blue-200 shrink-0"
        >
          <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
              notif.read
                ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                : 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 shadow-sm'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 shrink-0">
              {notif.type === 'forum' ? <MessageSquare className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h3>
                <span className="text-[11px] text-slate-400 font-medium">{notif.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{notif.message}</p>
              {notif.link && (
                <Link to={notif.link} className="inline-block mt-2 text-xs font-bold text-blue-600 hover:underline">
                  Buka Halaman Terkait →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
