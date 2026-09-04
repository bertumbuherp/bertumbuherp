'use client';

import React, { useState, useMemo } from 'react';
import { useHRStore, Leave } from '@/lib/store/hrStore';
import { formatDate } from '@/lib/utils';
import { Calendar, ShieldAlert, CheckCircle, Clock, XCircle, Plus, AlertTriangle, UserCheck, ShieldCheck, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export function LeaveTimelineGuardingView() {
  const { leaves, employees, updateLeaveStatus, addLeave } = useHRStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // PM Assignment Guarding Test Widget State
  const [testUserId, setTestUserId] = useState(employees[0]?.id || '');
  const [testTaskDate, setTestTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [testResult, setTestResult] = useState<{ isBlocked: boolean; message: string } | null>(null);

  // Leave Application Form State
  const [formData, setFormData] = useState({
    userId: employees[0]?.id || '',
    type: 'Tahunan',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: 'Keperluan Pribadi'
  });

  // Guarding Logic: Check if employee is on leave on target date
  const handleCheckPMGuarding = () => {
    const emp = employees.find(e => e.id === testUserId);
    const empName = emp ? emp.name : 'Karyawan';

    const activeLeaves = leaves.filter(l =>
      (l.userId === testUserId || l.userName === empName) &&
      (l.status === 'approved_hr' || l.status === 'approved_pm')
    );

    const onLeaveRecord = activeLeaves.find(l => testTaskDate >= l.startDate && testTaskDate <= l.endDate);

    if (onLeaveRecord) {
      setTestResult({
        isBlocked: true,
        message: `⛔ GUARDING PM DIPETIK! Karyawan [${empName}] sedang ${onLeaveRecord.type.toUpperCase()} (${formatDate(onLeaveRecord.startDate)} s/d ${formatDate(onLeaveRecord.endDate)}). Sistem MENCEGAH penugasan baru pada tanggal ini!`
      });
    } else {
      setTestResult({
        isBlocked: false,
        message: `✅ AMAN! Karyawan [${empName}] TIDAK sedang cuti pada tanggal ${formatDate(testTaskDate)}. Penugasan PM diizinkan!`
      });
    }
  };

  const handleApplyLeave = () => {
    const emp = employees.find(e => e.id === formData.userId);
    if (!emp) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave: Leave = {
      id: 'c_' + Date.now(),
      userId: emp.id,
      userName: emp.name,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      durationDays,
      reason: formData.reason,
      status: 'pending'
    };

    addLeave(newLeave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Integrasi Cuti &amp; Guarding Penugasan PM
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Timeline Jadwal Cuti Tim &amp; Proteksi Otomatis Peringatan Penugasan Proyek PM Saat Karyawan On-Leave
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shrink-0 shadow-md"
        >
          <Plus size={14} /> Ajukan Cuti Baru
        </button>
      </div>

      {/* Item 5.2: PM Assignment Guarding Simulator Widget (Light Theme) */}
      <div className="card p-5 bg-white border border-amber-200/80 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-600" />
            <h3 className="font-extrabold text-sm tracking-wide text-amber-900">PM TASK GUARDING SIMULATOR (PENCEGAHAN OVERLAP CUTI)</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
            AUTO-GUARD ACTIVE
          </span>
        </div>

        <p className="text-xs text-gray-600">
          Uji simulasi bagaimana sistem HR ERP mencegah PM memberikan task / penugasan proyek baru kepada karyawan yang sedang menjalani cuti.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-amber-50/50 p-4 rounded-xl border border-amber-100">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Karyawan Ditugaskan</label>
            <select
              value={testUserId}
              onChange={e => setTestUserId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold bg-white text-gray-900 focus:outline-none focus:border-amber-500 shadow-sm"
            >
              {employees.length === 0 ? (
                <option value="">Belum ada karyawan terdaftar</option>
              ) : (
                employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.div})</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Rencana Tanggal Penugasan PM</label>
            <input
              type="date"
              value={testTaskDate}
              onChange={e => setTestTaskDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold bg-white text-gray-900 focus:outline-none focus:border-amber-500 shadow-sm"
            />
          </div>

          <button
            onClick={handleCheckPMGuarding}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} /> Cek Guarding Penugasan
          </button>
        </div>

        {/* Guarding Result Banner */}
        {testResult && (
          <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${
            testResult.isBlocked
              ? 'bg-rose-50 text-rose-900 border-2 border-rose-300 shadow-sm'
              : 'bg-emerald-50 text-emerald-900 border-2 border-emerald-300 shadow-sm'
          }`}>
            {testResult.isBlocked ? <ShieldAlert size={22} className="shrink-0 text-rose-600" /> : <CheckCircle size={22} className="shrink-0 text-emerald-600" />}
            <span className="leading-relaxed">{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Leave Approval & Timeline Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" /> Daftar Pengajuan &amp; Approval Cuti Karyawan
          </h3>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Nama Karyawan</th>
              <th className="py-3.5 px-4">Jenis Cuti</th>
              <th className="py-3.5 px-4">Periode Tanggal</th>
              <th className="py-3.5 px-4 text-center">Durasi</th>
              <th className="py-3.5 px-4">Alasan Cuti</th>
              <th className="py-3.5 px-4 text-center">Status Approval (2-Tier)</th>
              <th className="py-3.5 px-4 text-center">Aksi HR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                  Belum ada pengajuan cuti karyawan. Klik tombol <strong>"+ Ajukan Cuti Baru"</strong> untuk membuat pengajuan baru.
                </td>
              </tr>
            ) : (
              leaves.map(l => (
              <tr key={l.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-gray-900">{l.userName}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                    {l.type}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-gray-700">
                  {formatDate(l.startDate)} s/d {formatDate(l.endDate)}
                </td>
                <td className="py-3.5 px-4 text-center font-black text-gray-900 text-sm">
                  {l.durationDays} Hari
                </td>
                <td className="py-3.5 px-4 text-gray-600 italic">{l.reason}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    l.status === 'approved_hr' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    l.status === 'approved_pm' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                    l.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {l.status === 'approved_hr' ? '✓ HR Approved' :
                     l.status === 'approved_pm' ? '⏳ PM Approved (Menunggu HR)' :
                     l.status === 'rejected' ? '✕ Ditolak' : '⏳ Pending Approval'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  {l.status !== 'approved_hr' && l.status !== 'rejected' && (
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => updateLeaveStatus(l.id, 'approved_hr')}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700 shadow-sm"
                      >
                        Setujui HR
                      </button>
                      <button
                        onClick={() => updateLeaveStatus(l.id, 'rejected')}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[10px] hover:bg-rose-700 shadow-sm"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      {/* Item 5.2: Modal Ajukan Cuti Baru */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" /> Form Pengajuan Cuti Karyawan
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Karyawan</label>
                <select
                  value={formData.userId}
                  onChange={e => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.div})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Jenis Cuti</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Tahunan">Cuti Tahunan</option>
                  <option value="Sakit">Cuti Sakit (Surat Dokter)</option>
                  <option value="Melahirkan">Cuti Melahirkan</option>
                  <option value="Penting">Izin Alasan Penting</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mulai Tanggal</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border rounded-xl p-2.5 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border rounded-xl p-2.5 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Alasan Cuti</label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl font-semibold">Batal</button>
              <button onClick={handleApplyLeave} className="btn-primary px-4 py-2 font-bold shadow-md">Kirim Pengajuan</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
