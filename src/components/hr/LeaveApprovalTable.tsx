'use client';
import React from 'react';
import { useHRStore } from '@/lib/store/hrStore';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Search } from 'lucide-react';

export function LeaveApprovalTable() {
  const { leaves, updateLeaveStatus } = useHRStore();

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Persetujuan Cuti & Izin</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari nama karyawan..." className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-red-500 w-64" />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 font-semibold text-gray-600">Karyawan</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Tipe</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Tanggal</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Durasi</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Alasan</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-center">Status/Aksi</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">
                  {l.userName}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${l.type === 'Sakit' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {l.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs">{formatDate(l.startDate)} - {formatDate(l.endDate)}</td>
                <td className="px-5 py-3 font-bold">{l.durationDays} Hari</td>
                <td className="px-5 py-3 text-gray-600">{l.reason}</td>
                <td className="px-5 py-3 text-center">
                  {l.status === 'pending' || l.status === 'approved_pm' ? (
                    <div className="flex justify-center gap-2">
                      <button onClick={() => updateLeaveStatus(l.id, 'approved_hr')} className="text-emerald-500 hover:text-emerald-700 bg-emerald-50 p-1.5 rounded-md transition-colors" title="Setujui (HR)"><CheckCircle size={18}/></button>
                      <button onClick={() => updateLeaveStatus(l.id, 'rejected')} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors" title="Tolak"><XCircle size={18}/></button>
                    </div>
                  ) : (
                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${l.status === 'approved_hr' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {l.status === 'approved_hr' ? 'Disetujui HR' : 'Ditolak'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {leaves.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-gray-500">Belum ada pengajuan cuti.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
