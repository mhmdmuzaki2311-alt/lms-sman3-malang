import React, { useState } from 'react';
import { MOCK_ATTENDANCE } from '../services/mockData';
import { apiService } from '../services/apiService';
import { CalendarCheck, QrCode, CheckCircle2, AlertCircle, Clock, MapPin } from 'lucide-react';
import Modal from '../components/common/Modal';

export default function AttendancePage() {
  const [logs, setLogs] = useState(MOCK_ATTENDANCE);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleScanQr = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 1200));
    const res = await apiService.submitAttendance('QR-SMAN3-MALANG-PRESENSI');
    setScanning(false);
    setIsQrModalOpen(false);

    if (res.success) {
      const newLog = {
        id: `att-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        subject: 'Fisika Modern & Kuantum',
        time: '07.00 WIB',
        status: 'hadir',
        method: 'QR Digital SMAN3',
        location: 'Lab Fisika 2'
      };
      setLogs([newLog, ...logs]);
      alert('Presensi digital berhasil dicatat!');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Presensi Digital SMAN 3 Malang</h1>
          <p className="text-xs text-slate-500 mt-1">Catatan kehadiran otomatis via QR Code & SIM Sekolah</p>
        </div>

        <button
          onClick={() => setIsQrModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <QrCode className="w-4 h-4" /> Scan Kode QR Presensi
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Kehadiran</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">98.5%</h3>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Hadir Tepat Waktu</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">34 Hari</h3>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Izin / Sakit</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">1 Hari</h3>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Tanpa Keterangan</p>
          <h3 className="text-2xl font-black text-slate-400 mt-1">0 Hari</h3>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Riwayat Kehadiran Digital</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Lokasi</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{log.date} ({log.time})</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{log.subject}</td>
                  <td className="py-3.5 px-4 text-slate-500">{log.method}</td>
                  <td className="py-3.5 px-4 text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {log.location}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Hadir
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Modal Simulator */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Scanner QR Code Presensi SMAN 3">
        <div className="text-center space-y-4 py-4">
          <div className="w-48 h-48 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center p-4 border-4 border-emerald-500/50 relative overflow-hidden shadow-2xl">
            <QrCode className="w-32 h-32 text-emerald-400 animate-pulse" />
            <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400 animate-bounce"></div>
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Arahkan kamera ke QR Code yang ditayangkan oleh Guru di depan kelas.
          </p>

          <button
            onClick={handleScanQr}
            disabled={scanning}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
          >
            {scanning ? 'Memverifikasi Presensi...' : 'Simulasi Scan QR Sekarang'}
          </button>
        </div>
      </Modal>

    </div>
  );
}
