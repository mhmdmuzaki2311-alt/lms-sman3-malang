import React, { useState } from 'react';
import { MOCK_MATERIALS } from '../services/mockData';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, Plus, Upload, CheckCircle2 } from 'lucide-react';
import Modal from '../components/common/Modal';

export default function MaterialPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';
  const [materials, setMaterials] = useState(MOCK_MATERIALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleUpload = (e) => {
    e.preventDefault();
    const newMaterial = {
      id: `mat-${Date.now()}`,
      courseId: 'crs-1',
      title,
      type: 'pdf',
      fileSize: '3.5 MB',
      uploadedAt: new Date().toISOString(),
      description,
      url: '#'
    };
    setMaterials([newMaterial, ...materials]);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Materi Pembelajaran</h1>
          <p className="text-xs text-slate-500 mt-1">Modul, Presentasi, & Bahan Ajar SMAN 3 Kota Malang</p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Unggah Materi Baru (Guru)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((mat) => (
          <div key={mat.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                  {mat.type} • {mat.fileSize}
                </span>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{mat.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-3">{mat.description}</p>
            </div>

            <button
              onClick={() => alert(`Mengunduh file: ${mat.title}`)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" /> Unduh Berkas
            </button>
          </div>
        ))}
      </div>

      {/* Upload Modal for Teacher */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Unggah Berkas Materi Baru">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Judul Materi
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Modul 2 Kinematika Gerak"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan cakupan materi dan instruksi pembacaan..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center bg-slate-50 dark:bg-slate-800/50">
            <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Berkas PDF / Slide Presentasi</p>
            <p className="text-[10px] text-slate-400 mt-1">Maksimal ukuran file 25 MB</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20"
          >
            Simpan & Unggah Materi
          </button>
        </form>
      </Modal>

    </div>
  );
}
