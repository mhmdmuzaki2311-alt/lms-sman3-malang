import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_SUBJECTS, MOCK_CLASSES } from '../services/mockData';
import { 
  ArrowLeft, 
  ChevronRight, 
  Calendar,
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function SubjectClassListPage() {
  const { subjectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(() => 
    MOCK_SUBJECTS.find((s) => s.id === subjectId) || { name: 'Mata Pelajaran', code: 'MAPEL' }
  );

  const [classes, setClasses] = useState(() => 
    MOCK_CLASSES.filter((c) => c.subject_id === subjectId)
  );

  useEffect(() => {
    // Ambil subject detail dari API
    fetch('http://localhost:4000/api/subjects')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const found = data.data.find((s) => s.id === subjectId);
          if (found) setSubject(found);
        }
      })
      .catch(() => {});

    // Ambil daftar kelas dari API
    fetch(`http://localhost:4000/api/subjects/${subjectId}/classes`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          // Jika kelas ada di DB, tampilkan
          if (data.data.length > 0) {
            setClasses(data.data);
          } else {
            // Sediakan default rombel kelas XI MIPA 3 agar tetap bisa dibuat sub bab / forum
            setClasses([
              {
                id: `cls-${subjectId.replace('mapel-', '')}-xi-3`,
                class_id: `cls-${subjectId.replace('mapel-', '')}-xi-3`,
                subject_id: subjectId,
                className: 'XI MIPA 3',
                class_name: 'XI MIPA 3',
                academicYear: '2026/2027',
                academic_year: '2026/2027',
                subject_name: subject.name
              }
            ]);
          }
        }
      })
      .catch(() => {
        // Fallback
        const filtered = MOCK_CLASSES.filter((c) => c.subject_id === subjectId);
        if (filtered.length > 0) {
          setClasses(filtered);
        } else {
          setClasses([
            {
              id: `cls-${subjectId.replace('mapel-', '')}-xi-3`,
              class_id: `cls-${subjectId.replace('mapel-', '')}-xi-3`,
              subject_id: subjectId,
              className: 'XI MIPA 3',
              class_name: 'XI MIPA 3',
              academicYear: '2026/2027',
              academic_year: '2026/2027',
              subject_name: subject.name
            }
          ]);
        }
      });
  }, [subjectId, subject.name]);

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto space-y-6 pb-10">
      
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/subjects" className="hover:text-sky-600 transition-colors">
          Mata Pelajaran
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sky-600 font-bold">{subject.name}</span>
      </nav>

      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/subjects')}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-sky-600 font-bold text-sm tracking-tight transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs hover:border-sky-300">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Kembali ke Daftar Mata Pelajaran</span>
        </button>
      </div>

      {/* SUBJECT INFO BANNER */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 lg:p-7 shadow-[0_4px_24px_rgba(2,132,199,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100 mb-2">
            <span>Mata Pelajaran: {subject.code}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pilih Kelas {subject.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {subject.description || 'Pilih rombongan belajar kelas untuk melihat daftar materi dan forum interaktif.'}
          </p>
        </div>
      </div>

      {/* LIST KELAS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const classId = cls.id || cls.class_id;
          const className = cls.className || cls.class_name;
          const academicYear = cls.academicYear || cls.academic_year || '2026/2027';

          return (
            <div
              key={classId}
              onClick={() => navigate(`/classes/${classId}/sub-chapters`)}
              className="group bg-white rounded-3xl border border-slate-200/90 hover:border-sky-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(2,132,199,0.12)] p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-sky-50 text-sky-700 font-extrabold text-xs rounded-full border border-sky-100">
                    {className}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {academicYear}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    Kelas {className}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Pengampu: {subject.teacher || 'Guru Pengampu Mata Pelajaran'}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-sky-600 transition-colors">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-400 group-hover:text-sky-500" />
                  <span>Buka Sub Bab Materi</span>
                </span>
                <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
