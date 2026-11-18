import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { X, Users, Activity, Radio, CheckCircle2 } from 'lucide-react';

export default function ActiveUsersModal({ isOpen, onClose }) {
  const { users } = useSocket();

  if (!isOpen) return null;

  const onlineUsers = users.filter((u) => u.status === 'online');
  const offlineUsers = users.filter((u) => u.status !== 'online');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Status Pengguna Aktif</span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                  {onlineUsers.length} Online
                </span>
              </h3>
              <p className="text-[11px] text-gray-500">Guru, Murid, dan Orang Tua yang sedang online</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Pengguna Aktif */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
            Sedang Aktif Saat Ini
          </p>

          {onlineUsers.map((u) => (
            <div
              key={u.id}
              className="p-2.5 rounded-xl border border-gray-100 bg-[#F8FAFC] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-400 animate-pulse"></span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{u.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {u.role === 'guru' && '👨‍🏫 Guru Pengajar'}
                    {u.role === 'murid' && `🎓 Murid (${u.kelas})${u.isModerator ? ' • Moderator' : ''}`}
                    {u.role === 'orang_tua' && '👪 Orang Tua Murid'}
                    {u.role === 'admin' && '🛡️ Administrator'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Online
              </span>
            </div>
          ))}

          {offlineUsers.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 pt-2">
                Tidak Aktif
              </p>
              {offlineUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-2.5 rounded-xl border border-gray-100 bg-white opacity-70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 grayscale"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-700">{u.name}</p>
                      <p className="text-[10px] text-gray-400">{u.kelas || u.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    Offline
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
