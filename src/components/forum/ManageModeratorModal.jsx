import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { X, ShieldCheck, ShieldAlert, Check, UserCheck, AlertCircle } from 'lucide-react';

export default function ManageModeratorModal({ isOpen, onClose }) {
  const { user, updateUserModeratorStatus } = useAuth();
  const { users, toggleModerator } = useSocket();

  if (!isOpen) return null;

  const students = users.filter((u) => u.role === 'murid');

  const handleToggle = (studentId, currentStatus) => {
    const newStatus = !currentStatus;
    toggleModerator(studentId, newStatus);
    updateUserModeratorStatus(studentId, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Kelola Moderator Murid</h3>
              <p className="text-[11px] text-gray-500">Penunjukan Hak Moderator Diskusi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box Sesuai Diagram Use Case */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-bold">Ketentuan Hak Moderator:</span>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Murid yang ditunjuk sebagai moderator oleh guru memiliki wewenang untuk:
            </p>
            <ul className="list-disc pl-4 mt-1 text-[11px] text-amber-700 space-y-0.5">
              <li>Membuat Topik Diskusi baru</li>
              <li>Mengatur Jadwal dan Durasi Diskusi</li>
              <li>Memoderasi Diskusi (Tutup/Buka Topik & Hapus pesan)</li>
            </ul>
          </div>
        </div>

        {/* List Murid */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto">
          {students.map((student) => (
            <div
              key={student.id}
              className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-gray-900">{student.name}</p>
                    {student.isModerator && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Moderator
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {student.kelas} • NISN: {student.nisn}
                  </p>
                </div>
              </div>

              {/* Tombol Toggle Beri/Cabut Hak */}
              <button
                onClick={() => handleToggle(student.id, student.isModerator)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                  student.isModerator
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                }`}
              >
                {student.isModerator ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Cabut Hak
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-white" /> Tunjuk Moderator
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
