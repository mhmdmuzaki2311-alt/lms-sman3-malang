import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { X, Shield, UserCog, CheckCircle, Power, User } from 'lucide-react';

export default function ManageUsersModal({ isOpen, onClose }) {
  const { users, updateUserStatus } = useSocket();

  if (!isOpen) return null;

  const handleToggleStatus = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'online' ? 'offline' : 'online';
    updateUserStatus(userId, nextStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <UserCog className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Kelola Pengguna Sistem</h3>
              <p className="text-[11px] text-gray-500">Panel Administrasi Pengguna Forum SMAN 3 Kota Malang</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabel / Daftar Pengguna */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-gray-900">{u.name}</p>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {u.email} • {u.nip ? `NIP: ${u.nip}` : u.nisn ? `NISN: ${u.nisn}` : u.nik ? `NIK: ${u.nik}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    u.status === 'online'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {u.status === 'online' ? 'Aktif' : 'Non-aktif'}
                </span>

                <button
                  onClick={() => handleToggleStatus(u.id, u.status)}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
                  title="Ubah status akun"
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
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
