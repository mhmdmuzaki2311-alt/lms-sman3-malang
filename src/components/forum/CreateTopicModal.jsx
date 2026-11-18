import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { checkProfanity } from '../../services/profanityFilter';
import { MOCK_SUBJECTS } from '../../services/mockData';
import { 
  X, 
  PlusCircle, 
  Clock, 
  Calendar, 
  BookOpen, 
  Users, 
  Tag, 
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function CreateTopicModal({ isOpen, onClose, onTopicCreated, defaultSubChapterId, defaultClassId, defaultCourseName }) {
  const { user, users } = useAuth();
  const { createTopic } = useSocket();

  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState(defaultCourseName || 'Fisika');
  const [kelas, setKelas] = useState('XI MIPA 3');
  const [tag, setTag] = useState('Penting');
  const [durasiMenit, setDurasiMenit] = useState(45);
  const [deadline, setDeadline] = useState('2026-10-28T18:00');
  const [moderatorStudentId, setModeratorStudentId] = useState('usr-siswa-ryujin');
  const [pemantikText, setPemantikText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filter students for moderator dropdown
  const studentList = users.filter(u => u.role === 'murid');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validasi Role: Hanya Guru
    if (user?.role !== 'guru') {
      setError('Hanya role Guru yang memiliki otorisasi membuat forum diskusi.');
      return;
    }

    if (!title.trim()) {
      setError('Judul forum diskusi wajib diisi.');
      return;
    }

    if (!pemantikText.trim()) {
      setError('Teks pemantik diskusi wajib diisi untuk memandu awal sesi.');
      return;
    }

    // Profanity Filter Validation
    const titleCheck = checkProfanity(title);
    if (!titleCheck.isClean) {
      setError(titleCheck.message);
      return;
    }

    const pemantikCheck = checkProfanity(pemantikText);
    if (!pemantikCheck.isClean) {
      setError(pemantikCheck.message);
      return;
    }

    setIsSubmitting(true);

    const selectedMod = studentList.find(s => s.id === moderatorStudentId) || studentList[0];

    // Buat slug classId & subChapterId jika belum ditentukan
    const subjectSlug = courseName.toLowerCase().replace(/\s+/g, '-');
    const classSlug = kelas.toLowerCase().replace(/\s+/g, '-');
    const computedClassId = defaultClassId || `cls-${subjectSlug}-${classSlug}`;
    const computedSubChapterId = defaultSubChapterId || `sub-${computedClassId}-intro`;

    const newTopicData = {
      subChapterId: computedSubChapterId,
      classId: computedClassId,
      courseName,
      kelas,
      title: title.startsWith('FORUM KELAS:') ? title : `FORUM KELAS: ${title} (${courseName} ${kelas})`,
      tag,
      durasiMenit: Number(durasiMenit),
      scheduleDeadline: new Date(deadline).toISOString(),
      creator: user?.fullName || user?.name || 'Bu Guru Kim Minjeong',
      creatorTitle: `${user?.name || 'Guru'} (Guru)`,
      creatorRole: 'guru',
      creatorAvatar: user?.avatar,
      onlineCount: 32,
      pemantik: {
        author: `${selectedMod?.fullName || selectedMod?.name || 'Shin Ryujin'} [Moderator Kelas]`,
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        text: pemantikText
      },
      description: pemantikText
    };

    try {
      const created = createTopic(newTopicData);
      setIsSubmitting(false);
      if (onTopicCreated) {
        onTopicCreated(created);
      }
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError('Gagal membuat forum diskusi. Silakan coba kembali.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Buat Forum Diskusi Baru
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Inisiasi ruang diskusi interaktif terpandu untuk peserta didik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Judul Diskusi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Topik / Judul Diskusi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Analisis Dinamika Rotasi dan Momen Inersia"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
            />
          </div>

          {/* Row: Mata Pelajaran & Target Kelas (Membaca Sumber Tunggal MOCK_SUBJECTS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Mata Pelajaran
              </label>
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 font-medium cursor-pointer"
              >
                {MOCK_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Target Kelas
              </label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 font-medium cursor-pointer"
              >
                <option value="XI MIPA 3">XI MIPA 3</option>
                <option value="XI MIPA 4">XI MIPA 4</option>
                <option value="XI MIPA 1">XI MIPA 1</option>
                <option value="XI MIPA 2">XI MIPA 2</option>
                <option value="Kelas 10-A">Kelas 10-A</option>
                <option value="Semua Kelas">Semua Kelas</option>
              </select>
            </div>
          </div>

          {/* Teks Pemantik Diskusi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide flex items-center justify-between">
              <span>Pertanyaan / Pernyataan Pemantik Diskusi <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-sky-600 font-normal">Akan disematkan di awal</span>
            </label>
            <textarea
              required
              rows={3}
              value={pemantikText}
              onChange={(e) => setPemantikText(e.target.value)}
              placeholder="Tuliskan pertanyaan pemantik untuk merangsang ide dan argumen peserta didik..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-normal leading-relaxed"
            />
          </div>

          {/* Penunjukan Siswa Moderator (Sesuai Use Case) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide flex items-center justify-between">
              <span>Tunjuk Siswa Moderator (Peer Moderator)</span>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Hak Moderasi Diberikan</span>
              </span>
            </label>
            <select
              value={moderatorStudentId}
              onChange={(e) => setModeratorStudentId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 font-medium cursor-pointer"
            >
              {studentList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName || s.name} ({s.kelas || 'XI MIPA 3'}) {s.isModerator ? '★ Moderator Aktif' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Siswa terpilih akan memiliki hak untuk memandu obrolan, mengedit pemantik, dan menjeda sesi.
            </p>
          </div>

          {/* Row: Durasi & Batas Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Durasi Sesi (Menit)
              </label>
              <div className="relative flex items-center">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="number"
                  min="15"
                  max="180"
                  step="5"
                  value={durasiMenit}
                  onChange={(e) => setDurasiMenit(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Kategori Label
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-sky-500 font-medium cursor-pointer"
              >
                <option value="Penting">Penting (Wajib)</option>
                <option value="Tanya Soal">Tanya Soal</option>
                <option value="Diskusi Bebas">Diskusi Bebas</option>
                <option value="Remedial">Remedial</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : 'Terbitkan Forum'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
