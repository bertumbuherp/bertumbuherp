'use client';
import React, { useState } from 'react';
import { useHRStore } from '@/lib/store/hrStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { CalendarDays, AlertCircle } from 'lucide-react';

export function LeaveRequestForm() {
  const { leaves, addLeave } = useHRStore();
  const { session } = useAuth();
  const [formData, setFormData] = useState({ type: 'Tahunan', startDate: '', endDate: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple filter to show "my leaves" by session.userId
  const myLeaves = leaves.filter(l => l.userId === session?.userId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Calculate days (simple math)
    const d1 = new Date(formData.startDate);
    const d2 = new Date(formData.endDate);
    const days = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1;

    setTimeout(() => {
      addLeave({
        id: 'lv_' + Date.now(),
        userId: session?.userId || 'u_default',
        userName: session?.name || 'User',
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        durationDays: days,
        reason: formData.reason,
        status: 'pending'
      });
      setFormData({ type: 'Tahunan', startDate: '', endDate: '', reason: '' });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
      <div className="lg:col-span-1 space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center"><CalendarDays size={20}/></div>
            <h3 className="font-bold text-lg">Buat Pengajuan</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipe Cuti / Izin</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-red-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option>Tahunan</option>
                <option>Sakit (Dengan Surat Dokter)</option>
                <option>Sakit (Tanpa Surat Dokter)</option>
                <option>Izin Pribadi (Unpaid)</option>
                <option>Menikah / Melahirkan</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mulai</label>
                <input required type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-red-500" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sampai</label>
                <input required type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-red-500" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})}/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Alasan</label>
              <textarea required rows={3} placeholder="Jelaskan alasan cuti/izin..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-red-500" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
            </div>
            
            {formData.type.includes('Surat Dokter') && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 items-start">
                <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Mohon serahkan surat dokter asli ke HRD saat Anda kembali masuk kerja.</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-2.5 flex justify-center mt-2">
              {isSubmitting ? 'Mengirim...' : 'Ajukan Sekarang'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Riwayat Pengajuan Saya</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600">Tipe</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Durasi</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map(l => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{l.type}</td>
                    <td className="px-4 py-3">{formatDate(l.startDate)} - {formatDate(l.endDate)}</td>
                    <td className="px-4 py-3 font-bold">{l.durationDays} Hari</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${
                        l.status === 'pending' || l.status === 'approved_pm' ? 'bg-yellow-100 text-yellow-700' :
                        l.status === 'approved_hr' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {l.status.replace('_hr', '').replace('_pm', ' (PM)')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
