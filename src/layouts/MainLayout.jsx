import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SmartiLogo from '../components/common/SmartiLogo';
import Sman3Watermark from '../components/common/Sman3Watermark';
import { 
  LayoutGrid, 
  Calendar, 
  BarChart3, 
  MessageCircle, 
  LogOut, 
  Search, 
  Bell, 
  ChevronDown, 
  Check, 
  X,
  Menu,
  ShieldCheck,
  UserCheck,
  BookOpen
} from 'lucide-react';

export default function MainLayout() {
  const { user, users, switchUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isParent = user?.role === 'orang_tua';
  const isChatPage = location.pathname.includes('/chat');
  const isSubjectsPage = location.pathname.includes('/subjects') || location.pathname.includes('/classes');
  const isForumPage = location.pathname.includes('/forum');

  const handleSelectUser = (userId) => {
    switchUser(userId);
    setIsProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex antialiased relative overflow-x-hidden">
      {/* Background SMAN 3 Malang Watermark */}
      <Sman3Watermark />

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ========================================================
          SIDEBAR KIRI / NAVBAR KIRI
          Fleksibel & responsif di HP (Drawer/Modal) maupun Laptop (Sticky)
          ======================================================== */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 w-72 max-w-[85vw] p-3 sm:p-4 transition-transform duration-250 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full bg-white rounded-[24px] sm:rounded-[28px] border border-sky-100 shadow-[0_4px_24px_rgba(2,132,199,0.06)] flex flex-col justify-between p-5 sm:p-6 overflow-y-auto">
          
          {/* Top Section: Logo & Menu Links */}
          <div className="space-y-6 sm:space-y-8">
            
            {/* Header Sidebar Mobile Close + Logo */}
            <div className="flex items-center justify-between pt-1">
              <Link to="/subjects" onClick={() => setIsMobileMenuOpen(false)} className="block focus:outline-hidden">
                <SmartiLogo />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              
              {/* 1. Mata Pelajaran (Beranda Utama) */}
              <Link
                to="/subjects"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14.5px] font-semibold transition-all duration-150 ${
                  isSubjectsPage || (location.pathname === '/' && !isChatPage)
                    ? 'text-[#0284C7] bg-sky-50/80 shadow-xs'
                    : 'text-slate-600 hover:text-[#0284C7] hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-5 h-5 flex-shrink-0" />
                <span>Mata Pelajaran</span>
              </Link>

              {/* 2. Forum Diskusi */}
              <Link
                to="/forum"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14.5px] font-semibold transition-all duration-150 ${
                  isForumPage
                    ? 'text-[#0284C7] bg-sky-50/80 shadow-xs'
                    : 'text-slate-600 hover:text-[#0284C7] hover:bg-slate-50'
                }`}
              >
                <LayoutGrid className="w-5 h-5 flex-shrink-0" />
                <span>Forum Diskusi</span>
                {isParent && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-auto font-medium">
                    Khusus Kelas
                  </span>
                )}
              </Link>

              {/* 3. Presensi Anak */}
              <button
                type="button"
                onClick={() => {
                  alert('Modul Presensi: Terintegrasi dengan jadwal presensi harian SMAN 3 Kota Malang.');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14.5px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <Calendar className="w-5 h-5 flex-shrink-0 text-slate-400" />
                <span>Presensi</span>
              </button>

              {/* 4. Rekap Hasil */}
              <button
                type="button"
                onClick={() => {
                  alert('Modul Rekap Hasil: Menampilkan transkrip asesmen & portofolio akademik peserta didik.');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14.5px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <BarChart3 className="w-5 h-5 flex-shrink-0 text-slate-400" />
                <span>Rekap Hasil</span>
              </button>

              {/* 5. Chat (Ganti dari 'Chat dengan Guru' menjadi 'Chat' saja) */}
              <Link
                to="/chat"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14.5px] font-semibold transition-all duration-150 ${
                  isChatPage
                    ? 'text-[#0284C7] bg-sky-50/80 shadow-xs'
                    : 'text-slate-600 hover:text-[#0284C7] hover:bg-slate-50'
                }`}
              >
                <MessageCircle className="w-5 h-5 flex-shrink-0" />
                <span>Chat</span>
                {isParent && (
                  <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full ml-auto font-bold">
                    Aktif
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Bottom Section: Keluar (Logout) Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] text-[14px] font-semibold transition-colors duration-150"
            >
              <span>Keluar</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT AREA (Header + Body Canvas)
          ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        
        {/* TOP HEADER BAR */}
        <header className="px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Mobile Menu Trigger & Mobile Brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-white border border-slate-200 shadow-xs"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-sm text-sky-900 hidden sm:inline">SMARTI LMS</span>
          </div>

          {/* Search Pill Input */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 sm:left-5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isChatPage ? "Cari Kontak / Pesan" : "Cari Mata Pelajaran atau Materi"}
                className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-2 sm:py-2.5 rounded-full bg-white border border-slate-200 text-slate-800 text-[13px] sm:text-[14px] placeholder-slate-400 focus:outline-hidden focus:border-sky-400 focus:ring-2 focus:ring-sky-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
              />
            </div>
          </div>

          {/* Header Right: Notification Bell & Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotificationToast(!showNotificationToast)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-200 transition-colors relative shadow-xs"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
            </button>

            {/* Profile Pill & Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 sm:gap-2.5 p-1 sm:pr-3 rounded-full bg-white border border-slate-200 hover:border-sky-300 shadow-xs transition-colors focus:outline-hidden"
              >
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-sky-100"
                />
                <span className="hidden sm:inline text-xs font-bold text-slate-700 max-w-[120px] truncate">
                  {user?.displayName || user?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              </button>

              {/* User Switcher Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Ganti Akun Demo
                    </p>
                    <p className="text-xs font-semibold text-sky-700 truncate mt-0.5">
                      {user?.name} ({user?.roleLabel})
                    </p>
                  </div>

                  <div className="space-y-1">
                    {users.map((u) => {
                      const isSelected = u.id === user?.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSelectUser(u.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-sky-50 text-sky-800 font-bold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                            <span className="truncate">{u.displayName || u.name}</span>
                            <span className="text-[10px] text-slate-400">({u.roleLabel})</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* NOTIFICATION TOAST POPUP */}
        {showNotificationToast && (
          <div className="mx-4 sm:mx-6 lg:mx-10 mb-2 p-3 sm:p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between text-xs text-sky-900 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🔔</span>
              <span>Sistem notifikasi real-time SMAN 3 Kota Malang siap digunakan.</span>
            </div>
            <button
              onClick={() => setShowNotificationToast(false)}
              className="p-1 hover:bg-sky-100 rounded-lg text-sky-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* BODY CONTENT CANVAS */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 pb-6 flex flex-col">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
