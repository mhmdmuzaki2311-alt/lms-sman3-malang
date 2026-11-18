import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/helpers';
import { MOCK_COURSES, MOCK_ASSIGNMENTS, MOCK_FORUM_TOPICS } from '../services/mockData';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Award, 
  TrendingUp, 
  Users, 
  UserCheck, 
  FileText,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || ROLES.STUDENT;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-md border border-white/10">
            <span>SMAN 3 Kota Malang LMS</span> • <span>Tahun Ajaran 2026/2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Selamat Datang, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            {role === ROLES.STUDENT && 'Pantau perkembangan kelas, tugas mendatang, kuis digital, serta aktif berdiskusi di forum real-time.'}
            {role === ROLES.TEACHER && 'Kelola materi pengajaran, unggah tugas, berikan koreksi & umpan balik, dan pandu forum diskusi.'}
            {role === ROLES.ADMIN && 'Ringkasan sistem manajemen informasi, statistik pembelajaran, serta keaktifan WebSocket LMS.'}
            {role === ROLES.PARENT && `Pantau kehadiran, pencapaian akademis, dan aktivitas belajar ananda ${user?.childName}.`}
          </p>
        </div>
      </div>

      {/* Role-Specific Stats Grid */}
      {role === ROLES.STUDENT && <StudentStatsGrid />}
      {role === ROLES.TEACHER && <TeacherStatsGrid />}
      {role === ROLES.ADMIN && <AdminStatsGrid />}
      {role === ROLES.PARENT && <ParentStatsGrid childName={user?.childName} />}

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Courses Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Mata Pelajaran Aktif</h3>
              </div>
              <Link to="/kelas" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_COURSES.map((course) => (
                <div key={course.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {course.code}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{course.progress}% Selesai</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{course.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{course.teacher}</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Forum Thread Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Forum Diskusi Real-time (Kelompok B7)</h3>
              </div>
              <Link to="/forum" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                Buka Forum <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_FORUM_TOPICS.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/forum/${topic.id}`}
                  className="block p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{topic.courseName}</span>
                    <span className="text-[11px] text-slate-400">{topic.repliesCount} Balasan</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{topic.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-1">{topic.description}</p>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col) - Deadlines & Schedules */}
        <div className="space-y-6">
          
          {/* Upcoming Assignments */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Tugas & Deadline</h3>
            </div>

            <div className="space-y-3">
              {MOCK_ASSIGNMENTS.map((asg) => (
                <div key={asg.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Tenggat 5 Okt
                    </span>
                    {asg.status === 'dikumpulkan' ? (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Dikumpulkan
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-600">Belum Selesai</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{asg.title}</h4>
                  <p className="text-[11px] text-slate-500">{asg.courseName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Schedule */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Jadwal Hari Ini</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">07.00 - 09.15 WIB</p>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Fisika Modern & Kuantum</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Lab Fisika 2 • Drs. Bambang Hariyanto</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

function StudentStatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={BookOpen} label="Mata Pelajaran" value="4 Kelas" color="text-blue-600" bg="bg-blue-50" />
      <StatCard icon={Clock} label="Tugas Aktif" value="2 Tugas" color="text-amber-600" bg="bg-amber-50" />
      <StatCard icon={CheckCircle2} label="Presensi Kehadiran" value="98%" color="text-emerald-600" bg="bg-emerald-50" />
      <StatCard icon={Award} label="Rata-rata Nilai" value="93.2" color="text-indigo-600" bg="bg-indigo-50" />
    </div>
  );
}

function TeacherStatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Users} label="Total Peserta Didik" value="136 Siswa" color="text-indigo-600" bg="bg-indigo-50" />
      <StatCard icon={FileText} label="Materi Diunggah" value="28 Berkas" color="text-blue-600" bg="bg-blue-50" />
      <StatCard icon={Clock} label="Tugas Perlu Dinilai" value="14 Jawaban" color="text-amber-600" bg="bg-amber-50" />
      <StatCard icon={MessageSquare} label="Aktivitas Forum B7" value="48 Pesan" color="text-emerald-600" bg="bg-emerald-50" />
    </div>
  );
}

function AdminStatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Users} label="Pengguna LMS" value="1,240 Total" color="text-rose-600" bg="bg-rose-50" />
      <StatCard icon={BookOpen} label="Kelas Terdaftar" value="36 Kelas" color="text-blue-600" bg="bg-blue-50" />
      <StatCard icon={TrendingUp} label="Socket.IO Node.js" value="Online 100%" color="text-emerald-600" bg="bg-emerald-50" />
      <StatCard icon={UserCheck} label="Log Guru & Ortu" value="Aktif" color="text-indigo-600" bg="bg-indigo-50" />
    </div>
  );
}

function ParentStatsGrid({ childName = 'Ahmad Raihan' }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={CheckCircle2} label={`Kehadiran ${childName}`} value="98.5%" color="text-emerald-600" bg="bg-emerald-50" />
      <StatCard icon={Award} label="Peringkat Kelas" value="Juara 2" color="text-amber-600" bg="bg-amber-50" />
      <StatCard icon={BookOpen} label="Tugas Selesai" value="12 / 14" color="text-blue-600" bg="bg-blue-50" />
      <StatCard icon={Users} label="Wali Kelas" value="Drs. Bambang" color="text-indigo-600" bg="bg-indigo-50" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
      <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <h4 className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">{value}</h4>
      </div>
    </div>
  );
}
