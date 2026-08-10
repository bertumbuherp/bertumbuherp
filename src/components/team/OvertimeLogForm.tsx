'use client';
import React, { useState } from 'react';
import { useHRStore } from '@/lib/store/hrStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { Clock } from 'lucide-react';

export function OvertimeLogForm() {
  const { overtimes, addOvertime } = useHRStore();
  const { session } = useAuth();
  
  const [formData, setFormData] = useState({ date: '', timeStr: '18:00', durationHours: 1, projectId: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myOvertimes = overtimes.filter(o => o.userId === session?.userId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      addOvertime({
        id: 'ot_' + Date.now(),
        userId: session?.userId || 'u_default',
        userName: session?.name || 'User',
        projectId: formData.projectId || 'Internal',
        date: `${formData.date}T${formData.timeStr}`,
        durationHours: Number(formData.durationHours),
        reason: formData.reason,
        status: 'pending'
      });
      setFormData({ date: '', timeStr: '18:00', durationHours: 1, projectId: '', reason: '' });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
      <div className="lg:col-span-1 space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><Clock size={20}/></div>
            <h3 className="font-bold text-lg">Catat Lembur</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
                <input required type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-red-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mulai Pukul</label>
                <input required type="time" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-red-500" value={formData.timeStr} onChange={e => setFormData({...formData, timeStr: e.target.value})}/>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Durasi (Jam)</label>
                <input required type="number" min="0.5" step="0.5" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-red-500" value={formData.durationHours} onChange={e => setFormData({...formData, durationHours: Number(e.target.value)})}/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ID Project (Opsional)</label>
                <input type="text" placeholder="Misal: PRJ-001" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-red-500" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Keterangan / Hasil Pekerjaan</label>
              <textarea required rows={3} placeholder="Contoh: Menyelesaikan revisi desain client A..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-red-500" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full btn-primary bg-purple-600 hover:bg-purple-700 py-2.5 flex justify-center mt-2">
              {isSubmitting ? 'Menyimpan...' : 'Submit Lembur'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Riwayat Lembur Anda</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600">Tanggal/Jam</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Durasi</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Keterangan</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {myOvertimes.map(ot => (
                  <tr key={ot.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(ot.date.split('T')[0])} <br/><span className="text-gray-400 text-xs">{ot.date.split('T')[1]}</span></td>
                    <td className="px-4 py-3 font-bold text-purple-600">{ot.durationHours} Jam</td>
                    <td className="px-4 py-3 text-gray-600">{ot.reason}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                        ot.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        ot.status === 'returned' ? 'bg-yellow-100 text-yellow-700' : 
                        ot.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ot.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {myOvertimes.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-6 text-gray-500">Belum ada riwayat lembur.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
