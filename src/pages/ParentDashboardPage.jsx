import React from 'react';
import { MOCK_PARENT_DATA } from '../services/mockData';
import { Users, CheckCircle2, Award, BookOpen, User, PhoneCall, Calendar } from 'lucide-react';

export default function ParentDashboardPage() {
  const data = MOCK_PARENT_DATA;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-100 text-xs font-bold border border-white/10">
          <Users className="w-3.5 h-3.5 text-amber-300" /> Pemantauan Akademik Anak oleh Orang Tua
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Pantau Pembelajaran Ananda {data.childInfo.name}
        </h1>
        <p className="text-xs text-amber-100/90">
          Kelas {data.childInfo.kelas} • SMAN 3 Kota Malang • Wali Kelas: {data.childInfo.waliKelas}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Tingkat Kehadiran</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{data.childInfo.attendanceRate}%</h3>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">IPK / Rata-Rata Nilai</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">{data.childInfo.gpa}</h3>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Peringkat Kelas</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">Juara {data.childInfo.rankInClass}</h3>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Mata Pelajaran</p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">{data.childInfo.totalClasses} Matpel</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Grades Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Capaian Nilai Terbaru</h3>
          </div>

          <div className="space-y-3">
            {data.recentGrades.map((g, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{g.subject}</h4>
                  <p className="text-[11px] text-slate-500">{g.type} • {g.date}</p>
                </div>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-900">
                  {g.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Attendance Logs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Catatan Kehadiran Sekolah</h3>
          </div>

          <div className="space-y-3">
            {data.attendanceLogs.map((log, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{log.date}</h4>
                  <p className="text-[11px] text-slate-500">{log.method} ({log.time})</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
