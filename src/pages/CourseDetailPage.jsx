import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_COURSES, MOCK_MATERIALS, MOCK_ASSIGNMENTS, MOCK_QUIZZES } from '../services/mockData';
import { BookOpen, FileText, CheckSquare, HelpCircle, MessageSquare, Download, ArrowLeft, Calendar, User } from 'lucide-react';

export default function CourseDetailPage() {
  const { id } = useParams();
  const course = MOCK_COURSES.find(c => c.id === id) || MOCK_COURSES[0];
  const [activeTab, setActiveTab] = useState('materi');

  const materials = MOCK_MATERIALS.filter(m => m.courseId === course.id);
  const assignments = MOCK_ASSIGNMENTS.filter(a => a.courseId === course.id);
  const quizzes = MOCK_QUIZZES.filter(q => q.courseId === course.id);

  return (
    <div className="space-y-6">
      
      {/* Top Navigation */}
      <Link to="/kelas" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kelas
      </Link>

      {/* Course Hero Header */}
      <div 
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4"
        style={{ background: `linear-gradient(135deg, ${course.color}, #0f172a)` }}
      >
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-extrabold uppercase">
            {course.code}
          </span>
          <span className="text-xs font-semibold text-blue-100">{course.kelas}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">{course.name}</h1>
        <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl">{course.description}</p>

        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-blue-100 font-medium">
          <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {course.teacher}</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {course.schedule}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('materi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'materi'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Berkas Materi ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('tugas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tugas'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Tugas & Asesmen ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('kuis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'kuis'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Kuis Digital ({quizzes.length})
        </button>
        <Link
          to={`/forum?topic=top-1`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 ml-auto"
        >
          <MessageSquare className="w-4 h-4" /> Forum WebSocket B7 →
        </Link>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'materi' && (
          <div className="space-y-3">
            {materials.map((mat) => (
              <div key={mat.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                    {mat.type} • {mat.fileSize}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{mat.title}</h4>
                  <p className="text-xs text-slate-500">{mat.description}</p>
                </div>
                <button className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-md">
                  <Download className="w-3.5 h-3.5" /> Unduh PDF
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tugas' && (
          <div className="space-y-3">
            {assignments.map((asg) => (
              <div key={asg.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{asg.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{asg.instructions}</p>
                </div>
                <Link
                  to={`/tugas/${asg.id}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shrink-0 shadow-md"
                >
                  Buka Detail Tugas
                </Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'kuis' && (
          <div className="space-y-3">
            {quizzes.map((qz) => (
              <div key={qz.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{qz.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Durasi: {qz.durationMinutes} menit • {qz.questionsCount} Soal Pilihan Ganda</p>
                </div>
                <Link
                  to="/kuis"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shrink-0 shadow-md"
                >
                  Kerjakan Kuis
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
