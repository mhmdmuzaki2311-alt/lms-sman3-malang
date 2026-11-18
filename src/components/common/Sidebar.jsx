import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  CalendarCheck, 
  MessageSquare, 
  Users, 
  User, 
  Bell,
  Sparkles,
  ShieldAlert,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const isParent = user?.role === 'orang_tua';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Daftar Kelas', path: '/kelas', icon: BookOpen },
    { label: 'Materi Pembelajaran', path: '/materi', icon: FileText },
    { label: 'Tugas & Asesmen', path: '/tugas', icon: FileText },
    { label: 'Kuis Digital', path: '/kuis', icon: HelpCircle },
    { label: 'Presensi Digital', path: '/presensi', icon: CalendarCheck },
    { 
      label: 'Forum Diskusi B7', 
      path: '/forum', 
      icon: MessageSquare,
      badge: 'Real-time'
    },
    { label: 'Notifikasi', path: '/notifikasi', icon: Bell },
    ...(isParent ? [{ label: 'Pemantauan Anak', path: '/orang-tua', icon: Users, highlight: true }] : []),
    { label: 'Profil Saya', path: '/profil', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-lg shadow-lg ring-2 ring-blue-400/30">
              3
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wide text-white leading-tight">LMS SMAN 3</h1>
              <p className="text-[10px] text-blue-400 font-semibold tracking-wider">KOTA MALANG</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MENU UTAMA</p>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-bold'
                      : item.highlight
                      ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Badge */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-800/40 border border-slate-700/50 text-center">
          <div className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-500/10 text-blue-400 mb-2">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white">Capstone Kelompok B7</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">WebSocket Real-Time LMS SMAN 3 Kota Malang</p>
        </div>
      </aside>
    </>
  );
}
