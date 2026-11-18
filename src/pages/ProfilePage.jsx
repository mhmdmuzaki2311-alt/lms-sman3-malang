import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLE_BADGES, ROLE_LABELS } from '../utils/helpers';
import { User, Mail, Phone, ShieldCheck, MapPin, Award } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const roleBadge = ROLE_BADGES[user?.role] || ROLE_BADGES.siswa;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/20 shadow-xl"
          />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h1>
              <span
                className="text-xs font-extrabold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: roleBadge.bg, color: roleBadge.color }}
              >
                {ROLE_LABELS[user?.role]}
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-xs font-semibold text-blue-600 flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5" /> SMAN 3 Kota Malang — Bhumi Bhakti Wiyata
            </p>
          </div>
        </div>

        {/* Identity Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Nomor Induk (NISN / NIP / NIK)</span>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{user?.nisn || user?.nip || user?.nik || '0054819201'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Kelas / Rombel</span>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{user?.kelas || 'XII MIPA 1'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Nomor WhatsApp</span>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{user?.phone || '081234567890'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Status Akun SIM</span>
            <p className="font-extrabold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Terverifikasi Aktif
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
