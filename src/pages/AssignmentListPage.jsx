import React from 'react';
import { MOCK_ASSIGNMENTS } from '../services/mockData';
import { FileText, Clock, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AssignmentListPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 dark:text-white">Tugas & Asesmen Pembelajaran</h1>
        <p className="text-xs text-slate-500 mt-1">Daftar pengumpulan tugas, deadline, dan penilaian pengajar</p>
      </div>

      <div className="space-y-4">
        {MOCK_ASSIGNMENTS.map((asg) => (
          <div key={asg.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-blue-100 text-blue-800">
                  {asg.courseName}
                </span>
                {asg.status === 'dikumpulkan' && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Dikumpulkan
                  </span>
                )}
                {asg.myScore && (
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded">
                    <Award className="w-3.5 h-3.5" /> Nilai: {asg.myScore}/100
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{asg.title}</h3>
              <p className="text-xs text-slate-500">{asg.instructions}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase">TENGGAT WAKTU</p>
                <p className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 5 Oktober 2026
                </p>
              </div>

              <Link
                to={`/tugas/${asg.id}`}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md"
              >
                Detail & Kirim <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
