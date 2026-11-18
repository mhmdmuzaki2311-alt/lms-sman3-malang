import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { checkProfanity } from '../services/profanityFilter';
import CreateTopicModal from '../components/forum/CreateTopicModal';
import { 
  Send, 
  FilePlus2, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Info, 
  CheckCircle, 
  AlertCircle,
  PlusCircle,
  ChevronDown,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';

export default function ForumTopicDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const classIdParam = searchParams.get('classId') || 'cls-fisika-xi-3';
  const subChapterIdParam = searchParams.get('subChapterId') || 'sub-hukum-newton';

  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    topics, 
    messages, 
    joinRoom, 
    leaveRoom, 
    sendMessage 
  } = useSocket();

  const isParent = user?.role === 'orang_tua';

  // Active topic management
  const [selectedTopicId, setSelectedTopicId] = useState(id || 'top-fisika-newton');
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setSelectedTopicId(id);
    }
  }, [id]);

  const activeTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  const [messageText, setMessageText] = useState('');
  const [profanityError, setProfanityError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(34 * 60 + 15);

  const messagesEndRef = useRef(null);

  // Live countdown timer [00:34:15]
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    if (activeTopic?.id) {
      joinRoom(activeTopic.id);
    }
    return () => {
      leaveRoom();
    };
  }, [activeTopic?.id, joinRoom, leaveRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // BATASAN HAK AKSES: Orang tua hanya bisa chat ke guru saja
  if (isParent) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Akses Khusus Orang Tua / Wali Murid
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Sesuai batasan sistem (FR-18), Orang Tua hanya dapat berkomunikasi langsung melalui kanal konsultasi pribadi dengan Guru Mata Pelajaran / Wali Kelas.
          </p>
        </div>
        <div className="pt-3">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm rounded-2xl shadow-md shadow-sky-500/20 transition-all hover:scale-105"
          >
            <span>Buka Chat</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!messageText.trim()) return;

    // Filter Kata Tidak Pantas
    const filterResult = checkProfanity(messageText);
    if (!filterResult.isClean) {
      setProfanityError(filterResult.message);
      return;
    }
    setProfanityError('');

    sendMessage({
      topicId: activeTopic?.id || 'top-fisika-newton',
      text: messageText,
      senderId: user?.id || user?.user_id,
      senderName: user?.fullName || user?.name,
      senderRole: user?.isModerator && user?.role === 'murid' ? 'Moderator' : (user?.roleLabel || (user?.role === 'guru' ? 'Guru' : 'Siswa'))
    });

    setMessageText('');
  };

  const showActionToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleTopicCreated = (newTopic) => {
    setSelectedTopicId(newTopic.id);
    showActionToast(`Forum "${newTopic.title}" berhasil dibuat dan disiarkan!`);
  };

  const isGuru = user?.role === 'guru';
  const isSiswaModerator = user?.role === 'murid' && user?.isModerator;
  const isSiswaBiasa = user?.role === 'murid' && !user?.isModerator;

  // Filter messages for current room (KOSONGKAN SAJA awalnya agar user bisa isi live saat demo)
  const roomMessages = messages.filter(m => m.topicId === activeTopic?.id);

  return (
    <div className="flex-1 flex flex-col justify-between max-w-7xl w-full mx-auto pb-4 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-10 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Modal Buat Forum Baru (Guru & Siswa Moderator) */}
      <CreateTopicModal
        isOpen={isCreateTopicModalOpen}
        onClose={() => setIsCreateTopicModalOpen(false)}
        onTopicCreated={handleTopicCreated}
      />

      {/* BREADCRUMB & BACK NAVIGATION */}
      <div className="space-y-3 mb-3">
        <nav className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-500">
          <Link to="/subjects" className="hover:text-sky-600 transition-colors">
            Mata Pelajaran
          </Link>
          <span className="text-slate-300">&gt;</span>
          <Link to="/subjects" className="hover:text-sky-600 transition-colors">
            {activeTopic?.courseName || 'Fisika'}
          </Link>
          <span className="text-slate-300">&gt;</span>
          <Link to={`/classes/${classIdParam}/sub-chapters`} className="hover:text-sky-600 transition-colors">
            Kelas {activeTopic?.kelas || 'XI MIPA 3'}
          </Link>
          <span className="text-slate-300">&gt;</span>
          <Link to={`/classes/${classIdParam}/sub-chapters`} className="hover:text-sky-600 transition-colors">
            Sub Bab
          </Link>
          <span className="text-slate-300">&gt;</span>
          <span className="text-sky-600 font-bold">Forum Diskusi</span>
        </nav>

        <button
          onClick={() => navigate(`/classes/${classIdParam}/sub-chapters`)}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-sky-600 font-bold text-xs tracking-tight transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <span>Kembali ke Daftar Sub Bab</span>
        </button>
      </div>

      {/* TOPIC HEADER SECTION */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[26px] font-black tracking-tight text-slate-900 leading-tight">
            {activeTopic?.title || 'FORUM KELAS: Analisis Hukum II Newton (Fisika XI MIPA 3)'}
          </h1>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-6 mt-2 text-[14px] font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"></span>
              <span className="text-slate-700">Terhubung (Real-Time)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4 text-sky-600" />
              <span>{activeTopic?.onlineCount || 32} Online</span>
            </div>
          </div>
        </div>

        {/* Action Controls: Switcher & Buat Forum Baru */}
        <div className="flex items-center gap-3">
          {topics.length > 1 && (
            <div className="relative">
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs focus:outline-hidden focus:border-sky-400 cursor-pointer"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.courseName} - {t.title.replace('FORUM KELAS: ', '')}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          )}

          {(isGuru || isSiswaModerator) && (
            <button
              onClick={() => setIsCreateTopicModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Forum Diskusi Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT (Responsive layout) */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full min-h-[500px]">
        
        {/* LEFT COLUMN: Discussion Stream (Span 8) */}
        <div className="w-full lg:col-span-8 space-y-4">
          
          {/* PEMANTIK DISKUSI CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-4 sm:p-5">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <span>📌</span>
              <span>PEMANTIK DISKUSI</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span>👤 {activeTopic?.pemantik?.author || 'Shin Ryujin [Moderator Kelas]'}</span>
              <span>•</span>
              <span>{activeTopic?.pemantik?.timeStr || '09:15 WIB'}</span>
            </div>
            <p className="mt-3 text-[14px] text-slate-800 leading-relaxed font-normal break-words">
              &quot;{activeTopic?.pemantik?.text || activeTopic?.description}&quot;
            </p>
          </div>

          {/* STREAM OF MESSAGES (DIMULAI KOSONG MURNI - Tampil saat user ketik pesan live) */}
          <div className="space-y-3.5 pt-1 min-h-[220px]">
            {roomMessages.length === 0 ? (
              <div className="p-6 sm:p-8 text-center bg-white/70 backdrop-blur-xs rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-sky-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Ruang Percakapan Masih Kosong</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Belum ada pesan yang dikirimkan. Tuliskan tanggapan atau opini Anda melalui kolom pesan di bawah untuk memulai diskusi kelas secara real-time.
                </p>
              </div>
            ) : (
              roomMessages.map((msg) => {
                const isCurrentUser = msg.senderId === user?.id || msg.senderId === user?.user_id;
                const senderDisplayName = msg.senderName;
                const timeDisplay = msg.timeStr || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '09:20 WIB');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 sm:px-5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[13.5px] leading-relaxed transition-all break-words ${
                        isCurrentUser
                          ? 'bg-[#C2EBF7] text-slate-900 border border-sky-200/50'
                          : 'bg-[#C6EBF6] text-slate-900 border border-sky-200/40'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-1 text-[11px] font-bold text-sky-900/90">
                        <span>{senderDisplayName}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-500">{timeDisplay}</span>
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

        </div>

        {/* RIGHT COLUMN: Floating Info & Widget Panel (Span 4) */}
        <div className="w-full lg:col-span-4 lg:sticky lg:top-6 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-5 space-y-5 text-[13px] w-full">
            
            {/* 1. SISA WAKTU DISKUSI KELAS (Responsif wrap & flex) */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-amber-900 font-bold tracking-tight">
                <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>⏳</span> SISA WAKTU DISKUSI KELAS
                </span>
                <span className="font-mono bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200/60 text-xs sm:text-sm">
                  [ {formatCountdown(secondsRemaining)} ]
                </span>
              </div>
            </div>

            {/* 2. INFORMASI FORUM (Responsive auto wrap) */}
            <div className="space-y-2.5 border-b border-slate-100 pb-4">
              <h4 className="flex items-center gap-1.5 font-bold text-sky-900 text-xs uppercase tracking-wide">
                <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>INFORMASI FORUM</span>
              </h4>
              <div className="space-y-2 text-slate-600 text-xs sm:text-[13px]">
                <div className="grid grid-cols-[85px_1fr] sm:grid-cols-[100px_1fr] gap-1 items-start">
                  <span className="font-medium text-slate-400">Topik</span>
                  <span className="font-semibold text-slate-800 break-words">: {activeTopic?.courseName || 'Fisika'}</span>
                </div>
                <div className="grid grid-cols-[85px_1fr] sm:grid-cols-[100px_1fr] gap-1 items-start">
                  <span className="font-medium text-slate-400">Moderator</span>
                  <span className="font-semibold text-slate-800 break-words">: {activeTopic?.pemantik?.author?.replace(' [Moderator Kelas]', '') || 'Shin Ryujin'}</span>
                </div>
                <div className="grid grid-cols-[85px_1fr] sm:grid-cols-[100px_1fr] gap-1 items-start">
                  <span className="font-medium text-slate-400">Peserta</span>
                  <span className="font-semibold text-slate-800 break-words">: Seluruh Siswa {activeTopic?.kelas || 'XI MIPA 3'}</span>
                </div>
              </div>
            </div>

            {/* 3. DYNAMIC ROLE SECTION */}
            
            {/* A. SISWA BIASA (Ning Yizhou) */}
            {isSiswaBiasa && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-1.5 font-bold text-rose-900 text-xs uppercase tracking-wide">
                  <span>🎯</span>
                  <span>STATUS PARTISIPASI SAYA</span>
                </h4>
                <div className="space-y-2 pl-1">
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="break-words">Kirim 1 Pendapat Utama (Selesai)</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-600 font-medium">
                    <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span className="break-words">Beri 1 Tanggapan ke Teman (Belum)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="flex items-center gap-1.5 font-bold text-slate-700 text-xs uppercase tracking-wide mb-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>PESERTA AKTIF (32/32)</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600 pl-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-medium">Shin Ryujin (Mod)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-medium text-sky-700">Ning Yizhou (Kamu)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Aditya Agung ...</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* B. GURU (Bu Kim Minjeong) */}
            {isGuru && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-1.5 font-bold text-slate-800 text-xs uppercase tracking-wide">
                  <span>🛠️</span>
                  <span>KONTROL SUPERVISI GURU</span>
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => showActionToast('Peran moderasi telah diambil alih oleh Guru.')}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-900 border border-slate-200/80 font-medium flex items-center gap-2 transition-colors text-xs sm:text-sm"
                  >
                    <span>👑</span>
                    <span>[ Ambil Alih Moderasi ]</span>
                  </button>
                  <Link
                    to="/chat"
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-900 border border-slate-200/80 font-medium flex items-center gap-2 transition-colors block text-xs sm:text-sm"
                  >
                    <span>✉️</span>
                    <span>[ Private Chat ]</span>
                  </Link>
                  <button
                    onClick={() => showActionToast('Sesi ditutup & rekapitulasi penilaian berhasil disimpan.')}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200/80 font-medium flex items-center gap-2 transition-colors text-xs sm:text-sm"
                  >
                    <span>🛑</span>
                    <span>[ Akhiri Sesi & Rekap Penilaian ]</span>
                  </button>
                </div>
              </div>
            )}

            {/* C. SISWA MODERATOR (Shin Ryujin) */}
            {isSiswaModerator && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-1.5 font-bold text-slate-800 text-xs uppercase tracking-wide">
                  <span>⚙️</span>
                  <span>KONTROL MODERATOR</span>
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => showActionToast('Diskusi dijeda sementara. Seluruh peserta diminta memperhatikan.')}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-900 border border-slate-200/80 font-medium flex items-center gap-2 transition-colors text-xs sm:text-sm"
                  >
                    <span>⏸️</span>
                    <span>[ Jeda Diskusi Sementara ]</span>
                  </button>
                  <button
                    onClick={() => showActionToast('Seluruh peserta dinonaktifkan suaranya (Mute All).')}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200/80 font-medium flex items-center gap-2 transition-colors text-xs sm:text-sm"
                  >
                    <span>🔇</span>
                    <span>[ Senyapkan Peserta (Mute All) ]</span>
                  </button>
                  <button
                    onClick={() => showActionToast('Sesi diskusi ditutup & seluruh riwayat diarsipkan.')}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200/80 font-medium flex items-center gap-2 transition-colors text-xs sm:text-sm"
                  >
                    <span>🔒</span>
                    <span>[ Tutup Sesi & Simpan Riwayat ]</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* PROFANITY FILTER WARNING */}
      {profanityError && (
        <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{profanityError}</span>
        </div>
      )}

      {/* FLOATING BOTTOM INPUT BAR */}
      <div className="mt-6 pt-2 sticky bottom-2 z-30">
        <form
          onSubmit={handleSendMessage}
          className="bg-white rounded-full border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-5 py-3 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-400"
        >
          <button
            type="button"
            onClick={() => showActionToast('Pilih dokumen materi pendukung diskusi.')}
            className="p-1.5 text-slate-400 hover:text-sky-600 transition-colors focus:outline-hidden"
            title="Lampirkan Dokumen"
          >
            <FilePlus2 className="w-6 h-6" />
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              if (profanityError) setProfanityError('');
            }}
            placeholder="Ketik Pesan"
            className="flex-1 bg-transparent text-slate-800 text-[14.5px] placeholder-slate-400 focus:outline-hidden"
          />

          <button
            type="submit"
            disabled={!messageText.trim()}
            className={`p-2 rounded-full transition-all focus:outline-hidden ${
              messageText.trim()
                ? 'text-[#0284C7] hover:scale-110 active:scale-95'
                : 'text-slate-300'
            }`}
            title="Kirim Pesan"
          >
            <Send className="w-6 h-6 fill-current" />
          </button>
        </form>
      </div>

    </div>
  );
}
