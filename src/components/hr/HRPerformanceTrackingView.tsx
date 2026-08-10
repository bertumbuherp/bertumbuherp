'use client';

import React, { useState, useMemo } from 'react';
import { useHRStore } from '@/lib/store/hrStore';
import { TrendingUp, Clock, AlertTriangle, Award, CheckCircle, Star, Filter, Printer, X, FileText } from 'lucide-react';
import { createPortal } from 'react-dom';

interface EmployeePerformance {
  id: string;
  name: string;
  role: string;
  div: string;
  totalTasks: number;
  onTimeTasks: number;
  overdueTasks: number;
  overdueRate: number; // e.g. 4.2%
  avgDelayDays: number; // e.g. 0.3 days
  rating: number; // e.g. 4.8
  hrRecommendation: 'Bonus & Apresiasi' | 'Kinerja Baik' | 'Perlu Monitoring';
}

const initialPerformanceData: EmployeePerformance[] = [
  { id: 'e1', name: 'Ghani Affan', role: 'Graphic Designer', div: 'Design', totalTasks: 48, onTimeTasks: 46, overdueTasks: 2, overdueRate: 4.2, avgDelayDays: 0.2, rating: 4.9, hrRecommendation: 'Bonus & Apresiasi' },
  { id: 'e2', name: 'Amalia', role: 'Social Media Specialist', div: 'Social Media', totalTasks: 52, onTimeTasks: 49, overdueTasks: 3, overdueRate: 5.7, avgDelayDays: 0.4, rating: 4.8, hrRecommendation: 'Kinerja Baik' },
  { id: 'e3', name: 'Pipit Widyawati', role: 'Content Creator', div: 'Social Media', totalTasks: 35, onTimeTasks: 32, overdueTasks: 3, overdueRate: 8.5, avgDelayDays: 0.6, rating: 4.5, hrRecommendation: 'Kinerja Baik' },
  { id: 'e4', name: 'Rafi', role: 'Copywriter', div: 'Social Media', totalTasks: 28, onTimeTasks: 24, overdueTasks: 4, overdueRate: 14.2, avgDelayDays: 1.2, rating: 4.1, hrRecommendation: 'Perlu Monitoring' },
  { id: 'e5', name: 'Bayu', role: 'Videographer', div: 'Production', totalTasks: 40, onTimeTasks: 39, overdueTasks: 1, overdueRate: 2.5, avgDelayDays: 0.1, rating: 4.95, hrRecommendation: 'Bonus & Apresiasi' },
];

export function HRPerformanceTrackingView() {
  const { employees } = useHRStore();
  const [performanceList, setPerformanceList] = useState<EmployeePerformance[]>(initialPerformanceData);
  const [selectedDiv, setSelectedDiv] = useState<string>('All');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const filteredList = useMemo(() => {
    return performanceList.filter(p => selectedDiv === 'All' || p.div === selectedDiv);
  }, [performanceList, selectedDiv]);

  // Overall HR Performance Metrics
  const metrics = useMemo(() => {
    const totalTasks = performanceList.reduce((s, p) => s + p.totalTasks, 0);
    const totalOnTime = performanceList.reduce((s, p) => s + p.onTimeTasks, 0);
    const totalOverdue = performanceList.reduce((s, p) => s + p.overdueTasks, 0);

    const onTimeRate = Math.round((totalOnTime / totalTasks) * 100);
    const overdueRate = (100 - onTimeRate).toFixed(1);
    const avgRating = (performanceList.reduce((s, p) => s + p.rating, 0) / performanceList.length).toFixed(2);

    return { totalTasks, totalOnTime, totalOverdue, onTimeRate, overdueRate, avgRating };
  }, [performanceList]);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            HR Performance Timeline &amp; Overdue Task Rate Tracking
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Analisis Produktivitas Tim, Ketepatan Waktu Penyelesaian Task &amp; Tracking Overdue Rate
          </p>
        </div>
        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shrink-0 shadow-md"
        >
          <Printer size={14} /> Cetak Laporan Performa HR
        </button>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-emerald-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Task On-Time Rate</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700">{metrics.onTimeRate}%</span>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">{metrics.totalOnTime} dari {metrics.totalTasks} Task Tepat Waktu</span>
        </div>

        <div className="card p-4 border-l-4 border-rose-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Overdue Task Rate</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-rose-700">{metrics.overdueRate}%</span>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">{metrics.totalOverdue} Task Mengalami Keterlambatan</span>
        </div>

        <div className="card p-4 border-l-4 border-purple-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Avg Discipline Rating</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-2xl font-black text-purple-700">{metrics.avgRating}</span>
            <Star size={18} className="text-amber-400 fill-amber-400" />
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">Skala 5.0 (Disiplin &amp; Kinerja)</span>
        </div>

        <div className="card p-4 border-l-4 border-blue-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Rekomendasi Bonus HR</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">
            {performanceList.filter(p => p.hrRecommendation === 'Bonus & Apresiasi').length} Tim
          </span>
          <span className="text-[10px] text-gray-500 block mt-1">Lulus Kualifikasi Reward</span>
        </div>
      </div>

      {/* Filter Divisi */}
      <div className="card p-4 flex items-center gap-3 no-print">
        <Filter size={14} className="text-gray-400" />
        <span className="text-xs font-bold text-gray-700">Filter Divisi:</span>
        {['All', 'Design', 'Social Media', 'Production', 'Operations'].map(d => (
          <button
            key={d}
            onClick={() => setSelectedDiv(d)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              selectedDiv === d ? 'bg-slate-900 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Performance & Overdue Rate Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Nama Tim &amp; Posisi</th>
              <th className="py-3.5 px-4">Divisi</th>
              <th className="py-3.5 px-4 text-center">Total Task</th>
              <th className="py-3.5 px-4 text-center">On-Time</th>
              <th className="py-3.5 px-4 text-center">Overdue</th>
              <th className="py-3.5 px-4 text-center">Overdue Rate (%)</th>
              <th className="py-3.5 px-4 text-center">Avg Delay</th>
              <th className="py-3.5 px-4 text-center">Rating Kinerja</th>
              <th className="py-3.5 px-4 text-center">Rekomendasi HR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredList.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-gray-900">
                  <span className="text-sm block">{p.name}</span>
                  <span className="text-[11px] text-gray-500 font-normal">{p.role}</span>
                </td>

                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {p.div}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-center font-bold text-gray-800 text-sm">
                  {p.totalTasks}
                </td>

                <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                  {p.onTimeTasks}
                </td>

                <td className="py-3.5 px-4 text-center font-bold text-rose-700">
                  {p.overdueTasks}
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    p.overdueRate > 10 ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    p.overdueRate > 5 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {p.overdueRate}%
                  </span>
                </td>

                <td className="py-3.5 px-4 text-center font-mono text-gray-600">
                  {p.avgDelayDays} Hari
                </td>

                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1 font-black text-slate-900">
                    <span>{p.rating}</span>
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                  </div>
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    p.hrRecommendation === 'Bonus & Apresiasi' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                    p.hrRecommendation === 'Kinerja Baik' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {p.hrRecommendation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Printable Modal Document for A4 Landscape */}
      {isPrintModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-8 shadow-2xl text-slate-900 my-auto">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <FileText className="text-rose-600" size={20} />
                <h3 className="font-bold text-sm text-slate-800">Pratinjau Cetak PDF Laporan Performa HR (A4 Landscape)</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-2"
                >
                  <Printer size={14} /> Cetak PDF Sekarang
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div className="space-y-6">
              {/* Document Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">PT BERTUMBUH DIGITAL INDONESIA</h1>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">LAPORAN KINERJA &amp; OVERDUE TASK RATE HR</p>
                  <p className="text-[10px] text-slate-500">Divisi Human Capital &amp; People Operations • Periode Juni 2026</p>
                </div>
                <div className="text-right text-[10px] text-slate-600 space-y-0.5">
                  <p className="font-mono font-bold">No. Dok: HR/PERF/2026/06-004</p>
                  <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p>Kategori: Confidential Internal BOD Report</p>
                </div>
              </div>

              {/* Printable Summary Cards (Compact 4 Grid) */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Task On-Time Rate</span>
                  <span className="text-lg font-black text-emerald-900 block mt-0.5">{metrics.onTimeRate}%</span>
                  <span className="text-[9px] text-emerald-700 block">{metrics.totalOnTime} / {metrics.totalTasks} Task Tepat Waktu</span>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block">Overdue Task Rate</span>
                  <span className="text-lg font-black text-rose-900 block mt-0.5">{metrics.overdueRate}%</span>
                  <span className="text-[9px] text-rose-700 block">{metrics.totalOverdue} Task Mengalami Delay</span>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <span className="text-[10px] font-bold text-purple-800 uppercase block">Discipline Index</span>
                  <span className="text-lg font-black text-purple-900 block mt-0.5">{metrics.avgRating} / 5.0</span>
                  <span className="text-[9px] text-purple-700 block">Evaluasi Kedisiplinan Tim</span>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Rekomendasi Bonus</span>
                  <span className="text-lg font-black text-blue-900 block mt-0.5">
                    {performanceList.filter(p => p.hrRecommendation === 'Bonus & Apresiasi').length} Anggota
                  </span>
                  <span className="text-[9px] text-blue-700 block">Kandidat Apresiasi HR</span>
                </div>
              </div>

              {/* Printable Table */}
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-300">Nama Tim &amp; Posisi</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Divisi</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-300">Total Task</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-300">On-Time</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-300">Overdue</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-300">Overdue Rate (%)</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-300">Avg Delay</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-300">Rating Kinerja</th>
                    <th className="py-2.5 px-3 text-center">Rekomendasi HR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredList.map(p => (
                    <tr key={p.id} className="border-b border-slate-200">
                      <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                        {p.name} <span className="font-normal text-slate-600 block text-[10px]">{p.role}</span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700 border-r border-slate-200">{p.div}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800 border-r border-slate-200">{p.totalTasks}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-800 border-r border-slate-200">{p.onTimeTasks}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-rose-800 border-r border-slate-200">{p.overdueTasks}</td>
                      <td className="py-2.5 px-3 text-center font-bold border-r border-slate-200">{p.overdueRate}%</td>
                      <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{p.avgDelayDays} Hari</td>
                      <td className="py-2.5 px-3 text-center font-bold border-r border-slate-200">{p.rating} / 5.0</td>
                      <td className="py-2.5 px-3 text-center font-bold text-[10px] uppercase">{p.hrRecommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Digital Signatures Footer */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="space-y-12">
                  <p className="font-bold text-slate-700">Dibuat Oleh (HR Manager):</p>
                  <div>
                    <p className="font-black text-slate-900 underline">Siti Aminah, S.Psi</p>
                    <p className="text-[10px] text-slate-500">Head of Human Capital</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <p className="font-bold text-slate-700">Disetujui Oleh (Director of Ops):</p>
                  <div>
                    <p className="font-black text-slate-900 underline">Budi Santoso, M.M.</p>
                    <p className="text-[10px] text-slate-500">Managing Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
