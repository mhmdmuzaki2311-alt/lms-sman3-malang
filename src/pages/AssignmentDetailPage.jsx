import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_ASSIGNMENTS } from '../services/mockData';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { ArrowLeft, Upload, FileText, CheckCircle2, Award, Send, MessageSquare } from 'lucide-react';

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  const initialAsg = MOCK_ASSIGNMENTS.find(a => a.id === id) || MOCK_ASSIGNMENTS[0];
  const [assignment, setAssignment] = useState(initialAsg);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [gradeInput, setGradeInput] = useState(assignment.myScore || 90);
  const [feedbackInput, setFeedbackInput] = useState(assignment.teacherFeedback || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await apiService.submitAssignment(assignment.id, {
      fileName: file ? file.name : 'Tugas_Analisis_LMS_AhmadRaihan.pdf',
      notes
    });
    setSubmitting(false);
    if (res.success) {
      setAssignment(res.assignment);
      alert('Tugas berhasil dikumpulkan ke server LMS SMAN 3!');
    }
  };

  const handleTeacherGrade = (e) => {
    e.preventDefault();
    setAssignment({
      ...assignment,
      myScore: Number(gradeInput),
      teacherFeedback: feedbackInput
    });
    alert('Penilaian tugas berhasil disimpan!');
  };

  return (
    <div className="space-y-6">
      <Link to="/tugas" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Tugas
      </Link>

      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase px-3 py-1 bg-blue-100 text-blue-800 rounded-lg">
            {assignment.courseName}
          </span>
          {assignment.myScore && (
            <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg flex items-center gap-1">
              <Award className="w-4 h-4" /> Nilai: {assignment.myScore} / 100
            </span>
          )}
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{assignment.title}</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{assignment.instructions}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Submission Form or Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Status Pengumpulan Tugas</h3>

            {assignment.status === 'dikumpulkan' && assignment.mySubmission ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Jawaban Terkirim
                  </span>
                  <span>{assignment.mySubmission.submittedAt}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold">{assignment.mySubmission.fileName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{assignment.mySubmission.fileSize}</span>
                </div>
                {assignment.mySubmission.notes && (
                  <p className="text-xs text-emerald-700 italic">Catatan Siswa: "{assignment.mySubmission.notes}"</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-6 border-2 border-dashed border-blue-200 dark:border-slate-700 rounded-2xl text-center bg-blue-50/50 dark:bg-slate-800/50">
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Pilih / Seret Berkas Jawaban (PDF / Doc)</p>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="mt-3 text-xs text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Catatan Tambahan untuk Pengajar
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan penjelasan tambahan jika ada..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> {submitting ? 'Mengirim...' : 'Kumpulkan Tugas Sekarang'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Feedback & Teacher Grading */}
        <div className="space-y-6">
          
          {/* Teacher Feedback Display */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Umpan Balik Pengajar</h3>
            </div>
            {assignment.teacherFeedback ? (
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
                <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed italic">
                  "{assignment.teacherFeedback}"
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada umpan balik tertulis dari pengajar.</p>
            )}
          </div>

          {/* Teacher Grading Control Panel (Only for Guru/Admin) */}
          {isTeacher && (
            <form onSubmit={handleTeacherGrade} className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Form Penilaian Guru</h3>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-semibold">Skor (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-semibold">Catatan Evaluasi</label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow transition-all"
              >
                Simpan Penilaian Tugas
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
