import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_CLASSES, MOCK_SUB_CHAPTERS, MOCK_FORUM_TOPICS, MOCK_SUBJECTS } from '../services/mockData';
import CreateTopicModal from '../components/forum/CreateTopicModal';
import { 
  ArrowLeft, 
  ChevronRight, 
  BookOpen, 
  MessageSquare, 
  PlusCircle, 
  CheckCircle, 
  Lock, 
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

export default function SubChapterListPage() {
  const { classId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isGuru = user?.role === 'guru';

  // Ekstrak nama mapel dari classId jika format cls-<subjectSlug>-<classSlug>
  const subjectSlugMatch = classId?.replace('cls-', '').split('-')[0];
  const matchedSubject = MOCK_SUBJECTS.find(s => s.id.includes(subjectSlugMatch) || s.name.toLowerCase().includes(subjectSlugMatch)) || { name: 'Fisika' };

  const [currentClass, setCurrentClass] = useState(() => 
    MOCK_CLASSES.find((c) => c.id === classId || c.class_id === classId) || { class_name: 'XI MIPA 3', subject_name: matchedSubject.name }
  );

  const [subChapters, setSubChapters] = useState(() => {
    const list = MOCK_SUB_CHAPTERS.filter((s) => s.class_id === classId);
    if (list.length > 0) return list;
    return [
      {
        id: `sub-${classId}-intro`,
        sub_chapter_id: `sub-${classId}-intro`,
        class_id: classId,
        title: `Pendahuluan & Konsep Dasar ${matchedSubject.name}`,
        chapter_number: 1,
        description: `Membahas materi pokok, capaian pembelajaran, serta forum diskusi interaktif ${matchedSubject.name}.`
      }
    ];
  });

  const [topics, setTopics] = useState(MOCK_FORUM_TOPICS);
  const [selectedSubChapterForModal, setSelectedSubChapterForModal] = useState(null);
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchTopicsAndSubChapters = () => {
    // Sub chapters dari API
    fetch(`http://localhost:4000/api/classes/${classId}/sub-chapters`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setSubChapters(data.data);
        }
      })
      .catch(() => {});

    // Topics dari API
    fetch('http://localhost:4000/api/topics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setTopics(data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTopicsAndSubChapters();
  }, [classId]);

  const showActionToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleOpenCreateModal = (subChapter) => {
    setSelectedSubChapterForModal(subChapter);
    setIsCreateTopicModalOpen(true);
  };

  const handleTopicCreated = (newTopic) => {
    setTopics((prev) => [newTopic, ...prev]);
    showActionToast(`Forum "${newTopic.title}" berhasil dibuat di ${selectedSubChapterForModal?.title || 'Sub Bab'}!`);
    setIsCreateTopicModalOpen(false);
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto space-y-6 pb-10">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-10 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* MODAL BUAT FORUM OLEH GURU */}
      <CreateTopicModal
        isOpen={isCreateTopicModalOpen}
        onClose={() => setIsCreateTopicModalOpen(false)}
        onTopicCreated={handleTopicCreated}
        defaultSubChapterId={selectedSubChapterForModal?.id || selectedSubChapterForModal?.sub_chapter_id}
        defaultClassId={classId}
        defaultCourseName={currentClass.subject_name || matchedSubject.name}
      />

      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/subjects" className="hover:text-sky-600 transition-colors">
          Mata Pelajaran
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/subjects" className="hover:text-sky-600 transition-colors">
          {currentClass.subject_name || matchedSubject.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sky-600 font-bold">Kelas {currentClass.class_name || currentClass.className || 'XI MIPA 3'}</span>
      </nav>

      {/* BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/subjects')}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-sky-600 font-bold text-sm tracking-tight transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs hover:border-sky-300">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Kembali ke Pilihan Kelas</span>
        </button>
      </div>

      {/* CLASS BANNER */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 lg:p-7 shadow-[0_4px_24px_rgba(2,132,199,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100 mb-2">
            <span>Daftar Materi & Sub Bab</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kelas {currentClass.class_name || currentClass.className || 'XI MIPA 3'} - {currentClass.subject_name || matchedSubject.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Pilih Sub Bab di bawah ini untuk melihat materi dan bergabung dalam forum diskusi interaktif.
          </p>
        </div>

        {isGuru && (
          <div className="text-xs text-sky-800 bg-sky-50 border border-sky-200 px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <span>Sebagai <b>Guru</b>, Anda dapat membuka forum diskusi baru pada setiap Sub Bab.</span>
          </div>
        )}
      </div>

      {/* LIST SUB BAB */}
      <div className="space-y-4">
        {subChapters.map((sub, index) => {
          const subId = sub.id || sub.sub_chapter_id;
          // Temukan topik forum terkait sub bab atau classId
          const forumForThisSub = topics.find((t) => 
            t.subChapterId === subId || 
            t.classId === classId ||
            (t.id === 'top-fisika-newton' && subId === 'sub-hukum-newton')
          );

          return (
            <div
              key={subId}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 transition-all hover:border-sky-200"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Left: Sub Chapter Detail */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center">
                      {sub.chapter_number || index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {sub.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-9">
                    {sub.description}
                  </p>
                </div>

                {/* Right: Forum Status or Action */}
                <div className="pl-9 md:pl-0 flex items-center gap-3">
                  {forumForThisSub ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full block">
                          ● Forum Tersedia
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {forumForThisSub.repliesCount || 0} Tanggapan
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/forum/${forumForThisSub.id}?subChapterId=${subId}&classId=${classId}`)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Masuk Forum Diskusi</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Empty state informative */}
                      <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full">
                        Belum ada forum diskusi di sub bab ini
                      </span>

                      {/* Hanya Guru yang memiliki hak membuat forum baru */}
                      {isGuru ? (
                        <button
                          onClick={() => handleOpenCreateModal(sub)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs hover:scale-105 transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Buat Forum Diskusi</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <Lock className="w-3.5 h-3.5 text-slate-300" />
                          Menunggu Guru
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
