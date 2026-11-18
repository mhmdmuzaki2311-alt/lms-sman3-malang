import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../../utils/helpers';
import { ShieldCheck, GraduationCap, UserCheck, Users } from 'lucide-react';

export default function QuickRoleSwitcher() {
  const { user, switchRole } = useAuth();

  const roleOptions = [
    { role: ROLES.STUDENT, label: 'Siswa', icon: GraduationCap, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { role: ROLES.TEACHER, label: 'Guru', icon: UserCheck, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { role: ROLES.ADMIN, label: 'Admin', icon: ShieldCheck, bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    { role: ROLES.PARENT, label: 'Orang Tua', icon: Users, bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-3 px-4 rounded-2xl text-white shadow-lg border border-blue-900/50 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">Demo Role Switcher SMAN 3:</span>
        <span className="text-xs font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
          {ROLE_LABELS[user?.role] || user?.role}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {roleOptions.map((item) => {
          const Icon = item.icon;
          const isActive = user?.role === item.role;
          return (
            <button
              key={item.role}
              onClick={() => switchRole(item.role)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white text-slate-900 font-bold shadow-md scale-105 ring-2 ring-blue-400'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
