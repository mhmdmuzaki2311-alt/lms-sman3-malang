import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_SUBJECTS } from '../services/mockData';
import { 
  BookOpen, 
  Atom, 
  Calculator, 
  Cpu, 
  ChevronRight, 
  GraduationCap, 
  Sparkles,
  Layers,
  ArrowRight,
  FlaskConical,
  Dna,
  Languages
} from 'lucide-react';

export default function SubjectListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState(MOCK_SUBJECTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:4000/api/subjects')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setSubjects(data.data);
        }
      })
      .catch(() => {
        // Fallback otomatis ke MOCK_SUBJECTS lengkap
      })
      .finally(() => setIsLoading(false));
  }, []);

  const getSubjectIcon = (iconName) => {
    switch (iconName) {
      case 'Atom':
        return <Atom className="w-7 h-7 text-sky-500" />;
      case 'Calculator':
        return <Calculator className="w-7 h-7 text-emerald-500" />;
      case 'FlaskConical':
        return <FlaskConical className="w-7 h-7 text-purple-500" />;
      case 'Dna':
        return <Dna className="w-7 h-7 text-teal-500" />;
      case 'Cpu':
        return <Cpu className="w-7 h-7 text-indigo-500" />;
      case 'Languages':
        return <Languages className="w-7 h-7 text-blue-500" />;
      default:
        return <BookOpen className="w-7 h-7 text-amber-500" />;
    }
  };

  const getSubjectBadgeColor = (color) => {
    switch (color) {
      case 'sky':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'teal':
        return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto space-y-6 pb-10">
      
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="text-sky-600 font-bold">Mata Pelajaran</span>
      </nav>

      {/* HEADER BANNER */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 lg:p-8 shadow-[0_4px_24px_rgba(2,132,199,0.04)] relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LMS Forum Pembelajaran SMAN 3 Kota Malang</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            Pilih Mata Pelajaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Selamat datang, <span className="font-bold text-slate-800">{user?.name}</span> ({user?.roleLabel}). Silakan pilih mata pelajaran untuk mengakses jenjang kelas, sub bab materi, dan forum diskusi interaktif.
          </p>
        </div>
        <div className="hidden md:block absolute right-6 -bottom-6 opacity-10 pointer-events-none">
          <GraduationCap className="w-48 h-48 text-sky-600" />
        </div>
      </div>

      {/* CARD GRID MATA PELAJARAN RESPONSIVE (HP: 1-2 kol, Tablet: 2-3 kol, Laptop: 3-4 kol) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {subjects.map((subj) => (
          <div
            key={subj.id}
            onClick={() => navigate(`/subjects/${subj.id}/classes`)}
            className="group bg-white rounded-3xl border border-slate-200/90 hover:border-sky-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(2,132,199,0.12)] p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-sky-50 transition-colors flex-shrink-0">
                  {getSubjectIcon(subj.icon)}
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getSubjectBadgeColor(subj.color)}`}>
                  {subj.code}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                  {subj.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {subj.description}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-sky-600 transition-colors">
              <span className="flex items-center gap-1.5 truncate">
                <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 flex-shrink-0" />
                <span className="truncate">Lihat Kelas</span>
              </span>
              <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
