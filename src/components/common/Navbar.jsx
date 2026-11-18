import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ROLE_BADGES } from '../../utils/helpers';
import ConnectionBadge from '../forum/ConnectionBadge';
import { Bell, Search, Menu, LogOut, User, CheckCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();

  const roleBadge = ROLE_BADGES[user?.role] || ROLE_BADGES.siswa;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Brand/Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 w-64 lg:w-80">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari kelas, materi, tugas..."
              className="bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Center/Right: WebSocket Status & User Actions */}
        <div className="flex items-center gap-3">
          
          {/* Real-time Socket.IO Connection Badge */}
          <div className="hidden sm:block">
            <ConnectionBadge />
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifikasi Real-time</h3>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Tandai Dibaca
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                  {notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      to={notif.link || '#'}
                      onClick={() => setShowNotifDropdown(false)}
                      className={`block p-3 rounded-xl transition-all border ${
                        notif.read
                          ? 'bg-slate-50/50 dark:bg-slate-800/40 border-transparent'
                          : 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{notif.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{user?.name}</p>
                <span 
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: roleBadge.bg, color: roleBadge.color }}
                >
                  {roleBadge.text}
                </span>
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fadeIn">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profil"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="w-4 h-4 text-blue-600" /> Profil Saya
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
