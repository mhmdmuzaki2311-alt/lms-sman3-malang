import React, { useState, useEffect } from 'react';
import { MOCK_QUIZZES } from '../services/mockData';
import { Clock, HelpCircle, CheckCircle2, Award, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import Modal from '../components/common/Modal';

export default function QuizPage() {
  const quiz = MOCK_QUIZZES[0];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(quiz.durationMinutes * 60);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  useEffect(() => {
    if (isQuizSubmitted || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isQuizSubmitted, timeLeftSeconds]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScoreResult({
      score: calculatedScore,
      correctCount,
      totalCount: quiz.questions.length
    });
    setIsQuizSubmitted(true);
  };

  const currentQ = quiz.questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      
      {/* Quiz Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-blue-100 text-blue-800">
            {quiz.courseName}
          </span>
          <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">{quiz.title}</h1>
          <p className="text-xs text-slate-500">Jumlah Soal: {quiz.questions.length} • Pilihan Ganda</p>
        </div>

        {/* Timer Bar */}
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-900 shrink-0">
          <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
          <div>
            <p className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">SISA WAKTU</p>
            <p className="text-lg font-black text-amber-900 dark:text-amber-100 tracking-wider font-mono">
              {formatTimer(timeLeftSeconds)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Question Card */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Soal Nomor #{currentQuestionIndex + 1}
              </span>
              {selectedAnswers[currentQ.id] !== undefined && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Terjawab
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
              {currentQ.text}
            </p>

            {/* Answer Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((optionText, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(currentQ.id, idx)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-md ring-2 ring-blue-400/30'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>{optionText}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>

              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md"
                >
                  Selanjutnya <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Kirim Jawaban Kuis
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Question Grid Navigator Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Navigasi Soal</h3>
            <div className="grid grid-cols-4 gap-2">
              {quiz.questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCurrent = currentQuestionIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 rounded-xl font-bold text-xs transition-all ${
                      isCurrent
                        ? 'ring-2 ring-blue-500 bg-blue-600 text-white shadow'
                        : isAnswered
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSubmitQuiz}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-4"
            >
              Selesaikan Kuis
            </button>
          </div>
        </div>

      </div>

      {/* Result Modal */}
      <Modal isOpen={isQuizSubmitted} onClose={() => setIsQuizSubmitted(false)} title="Hasil Kuis Digital SMAN 3 Malang">
        <div className="text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Kuis Berhasil Dikirim!</h2>
          <p className="text-xs text-slate-500">Jawaban Anda telah direkam dalam SIM LMS SMAN 3 Malang.</p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-xs mx-auto space-y-1">
            <p className="text-xs font-semibold text-slate-500">Skor Akhir Anda</p>
            <p className="text-4xl font-black text-emerald-600">{scoreResult?.score} / 100</p>
            <p className="text-[11px] text-slate-400 font-medium pt-1">
              Benar {scoreResult?.correctCount} dari {scoreResult?.totalCount} Soal
            </p>
          </div>

          <button
            onClick={() => setIsQuizSubmitted(false)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
          >
            Tutup & Kembali ke Pembelajaran
          </button>
        </div>
      </Modal>

    </div>
  );
}
