import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SmartiLogo from '../components/common/SmartiLogo';
import { 
  LogIn, 
  Lock, 
  Mail, 
  AlertCircle, 
  UserCheck, 
  GraduationCap, 
  HeartHandshake, 
  ShieldCheck 
} from 'lucide-react';

export default function LoginPage() {
  const { login, switchUser, users } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('guru@sman3malang.sch.id');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectByRole = (userObj) => {
    if (userObj.role === 'orang_tua') {
      navigate('/chat');
    } else {
      navigate('/forum');
    }
  };

  const handleManualLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loggedUser = login(email, password);
      setIsLoading(false);
      redirectByRole(loggedUser);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Login gagal. Periksa kembali email dan password.');
    }
  };

  const handleQuickLogin = (userId) => {
    const selected = users.find((u) => u.id === userId || u.user_id === userId);
    if (selected) {
      try {
        login(selected.email, selected.password);
        redirectByRole(selected);
      } catch (err) {
        switchUser(selected.id);
        redirectByRole(selected);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative">
      {/* Background Watermark */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: "url('/logo_sman3.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "400px auto"
        }}
      />

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-[0_10px_40px_rgba(2,132,199,0.08)] p-8 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <SmartiLogo />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Masuk ke Akun LMS
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            SMAN 3 Kota Malang • Capstone Project Kelompok B7
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@sman3malang.sch.id"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
          </button>
        </form>

        {/* Quick Demo Login (4 Role Sesuai Proposal) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Pilihan Akun Demo (4 Peran UTS)
          </p>
          <div className="grid grid-cols-2 gap-2">
            
            {/* 1. Guru */}
            <button
              type="button"
              onClick={() => handleQuickLogin('usr-guru-minjeong')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200/80 text-left transition-all"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-800">Guru</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">Bu Kim Minjeong</p>
            </button>

            {/* 2. Siswa */}
            <button
              type="button"
              onClick={() => handleQuickLogin('usr-siswa-ryujin')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200/80 text-left transition-all"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Siswa (Mod)</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">Shin Ryujin</p>
            </button>

            {/* 3. Orang Tua */}
            <button
              type="button"
              onClick={() => handleQuickLogin('usr-ortu-karina')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200/80 text-left transition-all"
            >
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">Orang Tua</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">Bu Karina</p>
            </button>

            {/* 4. Admin */}
            <button
              type="button"
              onClick={() => handleQuickLogin('usr-admin-sim')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200/80 text-left transition-all"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-800">Admin</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">Siti Aminah</p>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
