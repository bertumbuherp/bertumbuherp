'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Plus, Save, Clock, CheckCircle2, XCircle, CalendarDays } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useHRStore, Leave } from '@/lib/store/hrStore';

type LeaveStatus = 'pending' | 'approved_pm' | 'approved_hr' | 'rejected';
type LeaveType = 'Tahunan' | 'Sakit' | 'Izin';

export default function CutiPage() {
  const { session } = useAuth();
  const { leaves: requests, addLeave } = useHRStore();

  const [type, setType] = useState<LeaveType>('Tahunan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const calculateDays = (start: string, end: string) => {
    if(!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: Leave = {
      id: `c-${Date.now()}`,
      userId: session?.userId || 'u_default',
      userName: session?.name || 'User',
      type,
      startDate,
      endDate,
      durationDays: calculateDays(startDate, endDate),
      reason,
      status: 'pending'
    };
    addLeave(newReq);
    setStartDate(''); setEndDate(''); setReason('');
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded text-[10px] font-bold uppercase tracking-wider">Menunggu PM</span>;
      case 'approved_pm': return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">Tunggu HR</span>;
      case 'approved_hr': return <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold uppercase tracking-wider">Disetujui</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase tracking-wider">Ditolak</span>;
    }
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Header title="Pengajuan Cuti" subtitle="Request izin cuti tahunan, sakit, atau keperluan lain" />
      
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Kuota Cuti Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card p-5 border-l-4 border-blue-500 bg-blue-50/30">
            <p className="text-sm font-semibold text-gray-500 mb-1">Sisa Cuti Tahunan</p>
            <p className="text-3xl font-bold text-gray-800">9 Hari</p>
            <p className="text-xs mt-1 text-gray-400">Dari total 12 hari (Tahun 2026)</p>
          </div>
          <div className="card p-5 border-l-4 border-yellow-500">
            <p className="text-sm font-semibold text-gray-500 mb-1">Cuti Menunggu Approval</p>
            <p className="text-3xl font-bold text-gray-800">{requests.filter(r => r.status.includes('pending') || r.status === 'approved_pm').length} Pengajuan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-1">
            <div className="card p-6 border-t-4 border-blue-500">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={18} className="text-blue-500"/> Form Pengajuan</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Cuti</label>
                  <select required value={type} onChange={(e: any) => setType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="Tahunan">Cuti Tahunan</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Izin">Izin (Lainnya)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Mulai</label>
                    <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Selesai</label>
                    <input required type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                </div>
                {startDate && endDate && (
                  <p className="text-xs text-blue-600 font-semibold bg-blue-50 p-2 rounded">Estimasi Durasi: {calculateDays(startDate, endDate)} Hari</p>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Lengkap</label>
                  <textarea required value={reason} onChange={e => setReason(e.target.value)} placeholder="Berikan detail alasan..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-20 resize-none"></textarea>
                </div>
                <button type="submit" className="w-full btn-primary flex justify-center items-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 border-blue-600">
                  <Save size={16} /> Submit Pengajuan
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="card p-0 overflow-hidden shadow-sm h-full flex flex-col">
              <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Riwayat Pengajuan Cuti</h3>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Jenis & Tanggal</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Durasi</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Alasan</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-700">{req.type}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(req.startDate)} - {formatDate(req.endDate)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                            <CalendarDays size={14} className="text-gray-400"/> {req.durationDays} Hari
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-600 line-clamp-2">{req.reason}</p>
                        </td>
                        <td className="px-5 py-4">
                          {getStatusBadge(req.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {requests.length === 0 && (
                  <div className="p-10 text-center text-gray-500">Belum ada riwayat pengajuan cuti.</div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
