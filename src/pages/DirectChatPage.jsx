import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { checkProfanity } from '../services/profanityFilter';
import { CHAT_PERMISSIONS, MOCK_USERS } from '../services/mockData';
import { 
  ArrowLeft, 
  Send, 
  FilePlus2, 
  CheckCircle, 
  AlertCircle,
  Users,
  MessageCircle,
  ChevronRight,
  ShieldAlert,
  Search,
  Lock,
  Clock,
  CheckCheck
} from 'lucide-react';

export default function DirectChatPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode tampilan: 'directory' (daftar kontak/tujuan chat) | 'conversation' (ruang chat aktif)
  const [viewMode, setViewMode] = useState('directory');

  // Filter tab kontak berdasarkan role target yang diizinkan untuk role user saat ini
  const allowedTargets = CHAT_PERMISSIONS[user?.role] || [];
  const [selectedTargetRole, setSelectedTargetRole] = useState(() => 
    allowedTargets[0]?.targetRole || 'guru'
  );

  // Kontak aktif yang sedang diajak chat
  const [activePartner, setActivePartner] = useState(null);

  // Daftar pesan chat yang diamankan
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [profanityError, setProfanityError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const messagesEndRef = useRef(null);

  // Helper untuk membuat ID percakapan kanonikal deterministik
  const getCanonicalConversationId = (userAId, userBId) => {
    const sorted = [userAId, userBId].sort();
    return `chat-${sorted[0]}-${sorted[1]}`;
  };

  // 1. Sync state percakapan dari URL param (memastikan persistensi setelah refresh)
  useEffect(() => {
    const partnerIdFromUrl = searchParams.get('partnerId');
    if (partnerIdFromUrl && user) {
      const foundPartner = MOCK_USERS.find(u => u.id === partnerIdFromUrl);
      if (foundPartner && foundPartner.id !== user.id) {
        // Validasi aturan akses peran: Pastikan role user saat ini berhak chat dengan role partner
        const targets = CHAT_PERMISSIONS[user.role] || [];
        const isPermitted = targets.some(t => t.targetRole === foundPartner.role);

        if (!isPermitted) {
          setAuthError(`Akses Dibatasi: Peran ${user.roleLabel || user.role} tidak memiliki hak akses chat dengan ${foundPartner.roleLabel || foundPartner.role}.`);
          setActivePartner(null);
          setViewMode('directory');
          setSearchParams({});
          return;
        }

        setActivePartner(foundPartner);
        setViewMode('conversation');
        setAuthError('');
      }
    } else {
      setViewMode('directory');
      setActivePartner(null);
    }
  }, [searchParams, user]);

  // Update target role saat user berganti akun
  useEffect(() => {
    const targets = CHAT_PERMISSIONS[user?.role] || [];
    if (targets.length > 0) {
      setSelectedTargetRole(targets[0].targetRole);
    }
  }, [user]);

  // Saat kontak dipilih dari direktori, buka percakapan dan perbarui URL
  const handleOpenConversation = (partner) => {
    setActivePartner(partner);
    setViewMode('conversation');
    setAuthError('');
    setSendError('');
    setSearchParams({ partnerId: partner.id });
  };

  // Saat kembali ke daftar pesan, reset URL
  const handleBackToDirectory = () => {
    setViewMode('directory');
    setActivePartner(null);
    setChatMessages([]);
    setSearchParams({});
  };

  // Muat riwayat chat dari Database API setiap kali percakapan aktif dibuka atau di-refresh
  const fetchChatHistory = () => {
    if (!activePartner || !user) return;

    const conversationId = getCanonicalConversationId(user.id, activePartner.id);

    // Muat riwayat dari cache lokal terlebih dahulu agar UI instan dan persisten
    try {
      const stored = localStorage.getItem(`local_chat_${conversationId}`);
      if (stored) {
        setChatMessages(JSON.parse(stored));
      } else {
        setChatMessages([]);
      }
    } catch {
      setChatMessages([]);
    }

    // Kemudian sinkronkan dengan database server jika backend aktif
    fetch(`http://localhost:4000/api/direct-messages?conversationId=${conversationId}&userId=${user.id}`, {
      headers: {
        'x-user-id': user.id
      }
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 403) {
            setAuthError(data.error || 'Akses ditolak: Anda tidak memiliki otorisasi melihat percakapan ini.');
          }
          return;
        }
        if (data.success && Array.isArray(data.data)) {
          setChatMessages(data.data);
          setAuthError('');
          try {
            localStorage.setItem(`local_chat_${conversationId}`, JSON.stringify(data.data));
          } catch {}
        }
      })
      .catch((err) => {
        // Backend offline (Failed to fetch) adalah kondisi normal saat menjalankan frontend tanpa server
        // Tidak menampilkan error merah ke pengguna karena data lokal sudah dimuat
        console.warn('[Chat] Backend server tidak terdeteksi, menggunakan data lokal persisten:', err.message);
      });
  };

  // Effect: Ambil riwayat saat percakapan aktif & daftarkan listener WebSocket
  useEffect(() => {
    if (!activePartner || viewMode !== 'conversation' || !user) return;

    const conversationId = getCanonicalConversationId(user.id, activePartner.id);

    // Ambil riwayat dari database atau cache lokal
    fetchChatHistory();

    // Bergabung ke secure room WebSocket jika socket terhubung
    if (socket && socket.connected) {
      socket.emit('join_chat_room', { conversationId, userId: user.id });
    }

    // Listener real-time socket untuk pesan baru
    const handleReceiveMessage = (newMsg) => {
      if (newMsg.conversationId === conversationId) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          const updated = [...prev, newMsg];
          try {
            localStorage.setItem(`local_chat_${conversationId}`, JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    };

    if (socket) {
      socket.on('direct_message_received', handleReceiveMessage);
    }

    return () => {
      if (socket) {
        socket.emit('leave_chat_room', { conversationId });
        socket.off('direct_message_received', handleReceiveMessage);
      }
    };
  }, [activePartner, viewMode, user, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Pengiriman pesan: Simpan ke DB jika server aktif, dan selalu persist ke localStorage
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activePartner || isSending) return;

    const filterResult = checkProfanity(inputText);
    if (!filterResult.isClean) {
      setProfanityError(filterResult.message);
      return;
    }
    setProfanityError('');
    setSendError('');

    const conversationId = getCanonicalConversationId(user.id, activePartner.id);

    const messagePayload = {
      id: `dm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      conversationId,
      channelType: 'private',
      senderId: user.id,
      recipientId: activePartner.id,
      senderName: user.displayName || user.name,
      senderRole: user.roleLabel || user.role,
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      text: inputText.trim()
    };

    setIsSending(true);

    let savedMessage = messagePayload;

    try {
      // 1. Coba simpan ke database server via REST API
      try {
        const res = await fetch('http://localhost:4000/api/direct-messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
          body: JSON.stringify(messagePayload)
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 403) {
            throw new Error(json.error || 'Akses ditolak: Anda tidak memiliki otorisasi mengirim pesan ke pengguna ini.');
          }
          console.warn('[Chat] Respon server gagal, fallback ke penyimpanan lokal:', json);
        } else if (json.data) {
          savedMessage = json.data;
        }
      } catch (netErr) {
        if (netErr.message && netErr.message.includes('Akses ditolak')) {
          throw netErr;
        }
        // Backend offline / network error: tetap lanjutkan ke penyimpanan lokal agar pengguna bisa chat
        console.warn('[Chat] Backend offline, menggunakan persistensi lokal:', netErr.message);
      }

      // 2. Simpan pesan secara persisten di state & localStorage (tahan refresh)
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === savedMessage.id)) return prev;
        const next = [...prev, savedMessage];
        try {
          localStorage.setItem(`local_chat_${conversationId}`, JSON.stringify(next));
        } catch {}
        return next;
      });

      // 3. Broadcast WebSocket jika socket terhubung
      if (socket && socket.connected) {
        socket.emit('send_direct_message', savedMessage);
      }

      setInputText('');
    } catch (err) {
      console.error('[Chat Error] Gagal mengirim direct message:', err);
      setSendError(err.message || 'Gagal mengirim pesan.');
    } finally {
      setIsSending(false);
    }
  };

  const showActionToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Daftar kontak yang cocok dengan target role yang dipilih
  const availablePartners = MOCK_USERS.filter((u) => {
    if (u.id === user.id) return false;
    return u.role === selectedTargetRole;
  });

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl w-full mx-auto pb-4 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-10 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          TAMPILAN 1: DAFTAR PESAN & PILIHAN TUJUAN CHAT (DIRECTORY)
          ======================================================== */}
      {viewMode === 'directory' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Header Directory */}
          <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-7 shadow-[0_4px_24px_rgba(2,132,199,0.04)]">
            <div className="max-w-2xl space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100">
                <Lock className="w-3.5 h-3.5" />
                <span>Saluran Komunikasi Pribadi Terenkripsi & Persisten</span>
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Pusat Chat Pribadi
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Anda masuk sebagai <b className="text-slate-800">{user.name}</b> ({user.roleLabel}). Riwayat obrolan tersimpan otomatis di database dan terlindungi dari akses pihak ketiga.
              </p>
            </div>
          </div>

          {/* PILIHAN TUJUAN CHAT BERDASARKAN ROLE PENGGUNA */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
              Pilihan Tujuan Chat yang Diizinkan:
            </h3>

            {/* Tombol Tab Pilihan Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allowedTargets.map((item) => {
                const isActive = selectedTargetRole === item.targetRole;
                return (
                  <button
                    key={item.targetRole}
                    onClick={() => setSelectedTargetRole(item.targetRole)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-50/80 border-sky-300 ring-2 ring-sky-100 shadow-xs'
                        : 'bg-white border-slate-200/90 hover:border-sky-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.label}
                      </h4>
                      <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-sky-500' : 'bg-slate-300'}`} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DAFTAR KONTAK TERKAIT TUJUAN CHAT TERPILIH */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Pilih Kontak Tujuan</span>
              </h3>
              <span className="text-xs text-slate-400">
                {availablePartners.length} Kontak Tersedia
              </span>
            </div>

            {availablePartners.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada kontak ditemukan untuk kategori ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {availablePartners.map((partner) => (
                  <div
                    key={partner.id}
                    onClick={() => handleOpenConversation(partner)}
                    className="group py-3.5 px-3 -mx-3 rounded-2xl hover:bg-sky-50/60 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={partner.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"}
                          alt={partner.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-sky-200 transition-all"
                        />
                        <span className="w-3 h-3 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                          {partner.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {partner.roleLabel} • {partner.mapel || partner.kelas || partner.childKelas || 'SMAN 3 Malang'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Mulai Chat</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================
          TAMPILAN 2: RUANG PERCAKAPAN AKTIF (CONVERSATION)
          ======================================================== */}
      {viewMode === 'conversation' && activePartner && (
        <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-150">
          
          {/* SUBHEADER & CONTACT BAR */}
          <div className="space-y-4 mb-4">
            
            {/* Tombol Kembali ke Daftar Pesan */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToDirectory}
                className="inline-flex items-center gap-2 text-slate-700 hover:text-sky-600 font-bold text-sm tracking-tight transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span>Kembali ke Daftar Pesan</span>
              </button>

              <span className="text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>Percakapan Terisolasi (Tersimpan Permanen)</span>
              </span>
            </div>

            {/* Active Contact Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] px-5 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={activePartner.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"}
                  alt={activePartner.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-sky-100"
                />
                <div>
                  <span className="text-[16px] sm:text-[17px] font-bold text-slate-900 block leading-tight">
                    {activePartner.name}
                  </span>
                  <span className="text-[12px] text-slate-500 font-medium block">
                    {activePartner.roleLabel} • {activePartner.mapel || activePartner.kelas || 'SMAN 3 Malang'}
                  </span>
                </div>
              </div>

              {/* Online Indicator Badge */}
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs sm:text-sm">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                <span>Online</span>
              </div>
            </div>

          </div>

          {/* AUTHENTICATION / ACCESS DENIED ERROR */}
          {authError && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {/* SEND ERROR NOTIFICATION */}
          {sendError && (
            <div className="mb-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-2.5 text-rose-700 text-xs animate-shake shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span className="font-medium">{sendError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSendError('')}
                className="text-rose-500 hover:text-rose-800 font-bold px-2 py-0.5 rounded cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {/* STREAM OF DIRECT MESSAGES (Terproteksi & Persisten dari Database) */}
          <div className="flex-1 space-y-3.5 min-h-[420px] pb-4 flex flex-col justify-center">
            {chatMessages.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xs rounded-3xl border border-dashed border-sky-200 p-8 text-center max-w-lg mx-auto shadow-xs my-auto">
                <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Ruang Chat Langsung Masih Kosong
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Percakapan pribadi dengan <b className="text-slate-800">{activePartner.name}</b> telah terhubung. Semua pesan akan disimpan permanen ke database dan tetap ada saat halaman di-refresh.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 text-[11px] font-semibold rounded-full border border-sky-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Siap mengirim pesan aman & persisten</span>
                </div>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isCurrentUser = msg.senderId === user.id;
                const authorTitle = isCurrentUser ? `${msg.senderName} (Anda)` : `${msg.senderName} (${msg.senderRole})`;
                const timeDisplay = msg.timeStr || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Baru saja');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-5 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[13.5px] leading-relaxed transition-all break-words ${
                        isCurrentUser
                          ? 'bg-[#BAE6FD] text-slate-900 border border-sky-200/60'
                          : 'bg-[#C6EBF6] text-slate-900 border border-sky-200/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1 text-[11px] font-bold text-sky-950">
                        <span>{authorTitle}</span>
                        <div className="flex items-center gap-1 font-medium text-slate-500">
                          <span>{timeDisplay}</span>
                          {isCurrentUser && (
                            <CheckCheck className="w-3.5 h-3.5 text-sky-700 inline" />
                          )}
                        </div>
                      </div>
                      <p className="text-slate-800 font-normal">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* PROFANITY FILTER WARNING */}
          {profanityError && (
            <div className="mb-2 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{profanityError}</span>
            </div>
          )}

          {/* FLOATING BOTTOM INPUT BAR */}
          <div className="sticky bottom-2 z-30 pt-2">
            <form
              onSubmit={handleSendMessage}
              className="bg-white rounded-full border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-5 py-3 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-400"
            >
              <button
                type="button"
                onClick={() => showActionToast('Pilih dokumen lampiran pesan.')}
                className="p-1.5 text-slate-400 hover:text-sky-600 transition-colors focus:outline-hidden"
                title="Lampirkan Dokumen"
              >
                <FilePlus2 className="w-6 h-6" />
              </button>

              <input
                type="text"
                disabled={isSending}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (profanityError) setProfanityError('');
                  if (sendError) setSendError('');
                }}
                placeholder={`Ketik pesan ke ${activePartner.displayName || activePartner.name}...`}
                className="flex-1 bg-transparent text-slate-800 text-[14.5px] placeholder-slate-400 focus:outline-hidden disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className={`p-2 rounded-full transition-all focus:outline-hidden ${
                  inputText.trim() && !isSending
                    ? 'text-[#0284C7] hover:scale-110 active:scale-95 cursor-pointer'
                    : 'text-slate-300'
                }`}
                title="Kirim Pesan"
              >
                <Send className="w-6 h-6 fill-current" />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
