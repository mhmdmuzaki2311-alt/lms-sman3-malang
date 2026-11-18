import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Heart, 
  Bookmark, 
  Clock, 
  X, 
  Calendar,
  AlertCircle,
  Lock,
  Unlock,
  ShieldCheck,
  Timer
} from 'lucide-react';

export default function ForumListPage() {
  const { user } = useAuth();
  const { topics, createTopic } = useSocket();
  const [searchParams] = useSearchParams();

  const classFilterParam = searchParams.get('kelas') || 'Semua';
  const authorFilterParam = searchParams.get('author') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [sortOrder, setSortOrder] = useState('terbaru');
  const [selectedClass, setSelectedClass] = useState(classFilterParam);

  // Modal Buat Diskusi Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Penting');
  const [newCourse, setNewCourse] = useState('Fisika');
  const [newKelas, setNewKelas] = useState(user?.role === 'guru' ? 'Kelas 10-A' : user?.kelas || 'Kelas 10-A');
  const [newDescription, setNewDescription] = useState('');
  const [newDeadline, setNewDeadline] = useState('2026-10-31T23:59');
  const [newDuration, setNewDuration] = useState('120');
  const [modalError, setModalError] = useState('');

  // Likes & bookmarks
  const [likedTopics, setLikedTopics] = useState(new Set());
  const [bookmarkedTopics, setBookmarkedTopics] = useState(new Set());

  // Use Case: Guru atau Murid Moderator dapat membuat topik diskusi
  const canCreateTopic = user?.role === 'guru' || (user?.role === 'murid' && user?.isModerator);

  const toggleLike = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBookmark = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.creator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Semua Kategori' ||
      (t.tag && t.tag.toLowerCase() === selectedCategory.toLowerCase());

    const matchesClass =
      selectedClass === 'Semua' || t.kelas === selectedClass;

    const matchesAuthor =
      !authorFilterParam || t.creator.toLowerCase().includes(authorFilterParam.toLowerCase());

    return matchesSearch && matchesCategory && matchesClass && matchesAuthor;
  });

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortOrder === 'terpopuler') {
      return (b.repliesCount || 0) - (a.repliesCount || 0);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleCreateTopicSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      setModalError('Judul dan isi topik diskusi wajib diisi.');
      return;
    }

    createTopic({
      title: newTitle.trim(),
      courseName: newCourse,
      kelas: newKelas,
      tag: newCategory,
      tagColor: newCategory === 'Penting' ? 'red' : 'blue',
      description: newDescription.trim(),
      scheduleDeadline: newDeadline ? `${newDeadline}:00Z` : null,
      durasiMenit: Number(newDuration),
      creator: user?.name,
      creatorTitle: `${user?.name} (${user?.role === 'guru' ? 'Guru' : 'Murid Moderator'})`,
      creatorRole: user?.role,
      creatorAvatar: user?.avatar
    });

    setIsModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setModalError('');
  };

  return (
    <div className="space-y-6">
      
      {/* Judul Halaman */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Forum Diskusi {selectedClass !== 'Semua' ? `${selectedClass} - Fisika` : 'SMAN 3 Kota Malang'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Ruang diskusi dan berbagi pendapat antara guru dan peserta didik.
        </p>
      </div>

      {/* Toolbar Filter & Aksi */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
        
        {/* Kolom Pencarian */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari topik diskusi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Dropdown Filter Kategori */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
          >
            <option value="Semua Kategori">Semua Kategori</option>
            <option value="Penting">Penting</option>
            <option value="Tanya Soal">Tanya Soal</option>
            <option value="Materi Diskusi">Materi Diskusi</option>
          </select>

          {/* Dropdown Urutkan */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
          >
            <option value="terbaru">Urutkan Terbaru</option>
            <option value="terpopuler">Paling Banyak Balasan</option>
          </select>

          {/* USE CASE: Membuat Topik Diskusi (Guru & Murid Moderator) */}
          {canCreateTopic ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Diskusi Baru</span>
            </button>
          ) : (
            <button
              onClick={() => alert('Pembuatan topik diskusi hanya dapat dilakukan oleh Guru atau Murid yang telah ditunjuk sebagai Moderator.')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-400 text-xs font-semibold rounded-lg shrink-0 cursor-not-allowed"
              title="Membutuhkan Hak Moderator Murid dari Guru"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Buat Diskusi</span>
            </button>
          )}
        </div>

      </div>

      {/* Daftar Card Topik Diskusi */}
      <div className="space-y-4">
        {sortedTopics.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800">Belum Ada Diskusi</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Tidak ditemukan topik diskusi yang sesuai dengan kata kunci atau filter yang Anda pilih.
            </p>
          </div>
        ) : (
          sortedTopics.map((topic) => {
            const isLiked = likedTopics.has(topic.id);
            const isBookmarked = bookmarkedTopics.has(topic.id);
            const isClosed = topic.status === 'closed';

            return (
              <div
                key={topic.id}
                className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-5 sm:p-6 transition-all shadow-2xs hover:shadow-xs space-y-3.5 group"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={topic.creatorAvatar}
                    alt={topic.creator}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0 mt-0.5"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/forum/${topic.id}`}
                        className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2"
                      >
                        {topic.title}
                      </Link>

                      <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
                        <button
                          onClick={(e) => toggleLike(topic.id, e)}
                          className={`p-1 rounded-md hover:bg-gray-100 transition-colors ${
                            isLiked ? 'text-rose-500 fill-rose-500' : 'hover:text-gray-600'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => toggleBookmark(topic.id, e)}
                          className={`p-1 rounded-md hover:bg-gray-100 transition-colors ${
                            isBookmarked ? 'text-blue-600 fill-blue-600' : 'hover:text-gray-600'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                      <span className="font-semibold text-gray-800">
                        {topic.creatorTitle || topic.creator}
                      </span>

                      {topic.tag === 'Penting' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                          Penting
                        </span>
                      )}
                      {topic.tag === 'Tanya Soal' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                          Tanya Soal
                        </span>
                      )}
                      {topic.tag === 'Materi Diskusi' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                          Materi Diskusi
                        </span>
                      )}

                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {topic.kelas}
                      </span>
                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {topic.courseName}
                      </span>

                      {/* USE CASE: Mengatur Jadwal atau Durasi Diskusi Indicator */}
                      {topic.scheduleDeadline && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Timer className="w-3 h-3 text-amber-600" />
                          <span>Batas: {new Date(topic.scheduleDeadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        </span>
                      )}

                      {isClosed && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                          <Lock className="w-3 h-3" /> Ditutup
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed pl-13 sm:pl-13.5 line-clamp-2">
                  {topic.description}
                </p>

                <div className="pt-2 pl-13 sm:pl-13.5 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 font-bold text-gray-700">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      {topic.repliesCount || 0} Balasan
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-400 font-medium">
                    {topic.lastActive || 'Baru saja'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Buat Diskusi Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Buat Diskusi Baru</h3>
                <p className="text-[11px] text-gray-500">
                  Diterbitkan oleh: <strong className="text-gray-700">{user?.name} ({user?.role === 'guru' ? 'Guru' : 'Murid Moderator'})</strong>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTopicSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Judul Diskusi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Diskusi Bab 1: Gaya dan Gerak..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Penting">Penting</option>
                    <option value="Tanya Soal">Tanya Soal</option>
                    <option value="Materi Diskusi">Materi Diskusi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Fisika">Fisika</option>
                    <option value="Matematika">Matematika</option>
                    <option value="Informatika">Informatika</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Kelas Tujuan
                  </label>
                  <select
                    value={newKelas}
                    onChange={(e) => setNewKelas(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Kelas 10-A">Kelas 10-A</option>
                    <option value="XI IPA 1">XI IPA 1</option>
                    <option value="XII MIPA 1">XII MIPA 1</option>
                  </select>
                </div>
              </div>

              {/* USE CASE: Mengatur Jadwal atau Durasi Diskusi */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>Jadwal Batas Selesai</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-amber-700" />
                    <span>Target Durasi (Menit)</span>
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="1440"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Isi / Pengantar Pertanyaan Diskusi
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan pertanyaan pemantik atau materi yang ingin didiskusikan..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Publikasikan Diskusi
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
