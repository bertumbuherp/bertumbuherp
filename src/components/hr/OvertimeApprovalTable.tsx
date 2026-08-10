'use client';
import React from 'react';
import { useHRStore } from '@/lib/store/hrStore';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Undo2, Search } from 'lucide-react';

export function OvertimeApprovalTable() {
  const { overtimes, updateOvertimeStatus } = useHRStore();

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Verifikasi Lembur (Overtime)</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari nama..." className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-red-500 w-64" />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 font-semibold text-gray-600">Tanggal</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Karyawan</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Project</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Durasi</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Alasan</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-center">Status/Aksi</th>
            </tr>
          </thead>
          <tbody>
            {overtimes.map((ot) => (
              <tr key={ot.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 text-xs whitespace-nowrap">{formatDate(ot.date.split('T')[0])} <br/><span className="text-gray-400">{ot.date.split('T')[1]}</span></td>
                <td className="px-5 py-3 font-medium text-gray-800">{ot.userName}</td>
                <td className="px-5 py-3 text-xs bg-gray-100 rounded px-2">{ot.projectId}</td>
                <td className="px-5 py-3 font-bold text-purple-600">{ot.durationHours} Jam</td>
                <td className="px-5 py-3 text-gray-600">{ot.reason}</td>
                <td className="px-5 py-3 text-center">
                  {ot.status === 'pending' ? (
                    <div className="flex justify-center gap-2">
                      <button onClick={() => updateOvertimeStatus(ot.id, 'approved')} className="text-emerald-500 hover:text-emerald-700 bg-emerald-50 p-1.5 rounded-md transition-colors" title="Setujui"><CheckCircle size={18}/></button>
                      <button onClick={() => updateOvertimeStatus(ot.id, 'returned')} className="text-yellow-600 hover:text-yellow-700 bg-yellow-50 p-1.5 rounded-md transition-colors" title="Kembalikan (Revisi)"><Undo2 size={18}/></button>
                      <button onClick={() => updateOvertimeStatus(ot.id, 'declined')} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors" title="Tolak"><XCircle size={18}/></button>
                    </div>
                  ) : (
                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                      ot.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                      ot.status === 'returned' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {ot.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {overtimes.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-gray-500">Belum ada pengajuan lembur.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
