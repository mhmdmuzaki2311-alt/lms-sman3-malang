import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { X, Send, MessageCircle, User, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function ParentTeacherChatModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { parentTeacherMessages, sendParentTeacherMessage } = useSocket();

  const [chatInput, setChatInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, parentTeacherMessages]);

  if (!isOpen) return null;

  const isTeacher = user?.role === 'guru';
  const isParent = user?.role === 'orang_tua';

  // Target lawan bicara
  const targetName = isTeacher ? 'Ibu Ratna Puspita (Orang Tua)' : 'Pak Budi Prasetyo (Guru)';
  const targetRole = isTeacher ? 'Orang Tua' : 'Guru';

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      sendParentTeacherMessage({
        senderId: user?.id,
        senderName: user?.name,
        senderRole: user?.role,
        receiverId: isTeacher ? 'usr-ortu-1' : 'usr-guru-1',
        receiverName: isTeacher ? 'Ibu Ratna Puspita' : 'Pak Budi Prasetyo',
        text: chatInput.trim()
      });

      setChatInput('');
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirim pesan chat.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full flex flex-col h-[560px] overflow-hidden">
        
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <span>Pesan Konsultasi Guru & Orang Tua</span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  WebSocket
                </span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Komunikasi langsung: <strong className="text-gray-700">{targetName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Info Use Case */}
        <div className="px-5 py-2 bg-blue-50/50 border-b border-blue-100/60 text-[11px] text-blue-700 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
          <span>
            Saluran pesan ini menghubungkan Guru dan Orang Tua secara real-time via WebSocket.
          </span>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-[#F8FAFC]">
          {parentTeacherMessages.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <MessageCircle className="w-8 h-8 mx-auto text-gray-300 mb-1" />
              <p>Belum ada riwayat pesan konsultasi.</p>
            </div>
          ) : (
            parentTeacherMessages.map((msg) => {
              const isOwn = msg.senderId === user?.id || msg.senderName === user?.name;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isOwn ? 'ml-auto items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1 px-1">
                    <span className="font-semibold text-gray-700">{msg.senderName}</span>
                    <span>•</span>
                    <span className="capitalize">{msg.senderRole === 'guru' ? 'Guru' : 'Orang Tua'}</span>
                    <span>•</span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                      isOwn
                        ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none'
                        : 'bg-white text-gray-800 border-gray-200 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 border-t border-gray-200 bg-white space-y-2">
          {errorMsg && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Tulis pesan konsultasi kepada ${targetRole}...`}
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value);
                setErrorMsg('');
              }}
              className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" /> Kirim
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
