'use client';
import React from 'react';
import { useHRStore } from '@/lib/store/hrStore';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Search, AlertCircle } from 'lucide-react';

export function PMLeaveApprovalTable() {
  const { leaves, updateLeaveStatus } = useHRStore();
  
  // PM should only see 'pending' leaves
  const pendingLeaves = leaves.filter(l => l.status === 'pending');

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold">Verifikasi Cuti / Izin Tim</h2>
          <p className="text-sm text-gray-500 mt-1">Anda adalah pintu pertama persetujuan sebelum diteruskan ke HR.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari nama karyawan..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-red-500" />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 font-semibold text-gray-600">Karyawan</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Tipe</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Tanggal</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Alasan</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-center">Status/Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pendingLeaves.map((l) => (
              <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">
                  {l.userName}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${l.type === 'Sakit' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {l.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs">{formatDate(l.startDate)} - {formatDate(l.endDate)} <br/><span className="text-gray-400 font-semibold">{l.durationDays} Hari</span></td>
                <td className="px-5 py-3 text-gray-600 max-w-xs truncate" title={l.reason}>{l.reason}</td>
                <td className="px-5 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => updateLeaveStatus(l.id, 'approved_pm')} className="text-emerald-500 hover:text-emerald-700 bg-emerald-50 p-1.5 rounded-md transition-colors" title="Setujui (Lanjut ke HR)"><CheckCircle size={18}/></button>
                    <button onClick={() => updateLeaveStatus(l.id, 'rejected')} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors" title="Tolak"><XCircle size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingLeaves.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">
                <AlertCircle size={24} className="mx-auto mb-2 text-gray-300" />
                Belum ada pengajuan cuti yang menunggu review.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
