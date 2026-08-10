'use client';
import React, { useState } from 'react';
import { useFinanceStore } from '@/lib/store/financeStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Image as ImageIcon, ExternalLink, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export function ReimbursTable() {
  const { reimbursements, updateReimbursementStatus } = useFinanceStore();
  const [selectedReceipt, setSelectedReceipt] = useState<{ title: string; userName: string; url: string } | null>(null);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Reimburs dari Team &amp; Attachment Nota</h2>
          <p className="text-xs text-gray-500">Pemeriksaan Bukti Nota / Foto Struk Pengajuan Reimbursement</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">Tanggal</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Tim Member</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Keterangan</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">Bukti Nota</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Nominal</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">Status / Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reimbursements.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 font-mono">{formatDate(r.date)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{r.userName}</td>
                <td className="px-4 py-3 text-gray-700">{r.title}</td>
                <td className="px-4 py-3 text-center">
                  {/* Item 4.6: Attachment viewer button */}
                  <button
                    onClick={() => setSelectedReceipt({
                      title: r.title,
                      userName: r.userName,
                      url: r.attachmentUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80'
                    })}
                    className="flex items-center justify-center gap-1 mx-auto px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    <ImageIcon size={13} /> lihat Nota
                  </button>
                </td>
                <td className="px-4 py-3 font-bold text-right text-gray-900">{formatCurrency(r.amount)}</td>
                <td className="px-4 py-3 text-center">
                  {r.status === 'pending' ? (
                    <div className="flex justify-center gap-2">
                      <button onClick={() => updateReimbursementStatus(r.id, 'approved')} className="px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-bold flex items-center gap-1 border border-green-200" title="Setujui">
                        <CheckCircle size={14}/> Setujui
                      </button>
                      <button onClick={() => updateReimbursementStatus(r.id, 'rejected')} className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-bold flex items-center gap-1 border border-red-200" title="Tolak">
                        <XCircle size={14}/> Tolak
                      </button>
                    </div>
                  ) : (
                    <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-bold ${r.status === 'approved' || r.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status === 'approved' || r.status === 'paid' ? 'Disetujui' : 'Ditolak'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {reimbursements.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-gray-400">Belum ada pengajuan reimbursement.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Item 4.6: Receipt Image Modal */}
      {selectedReceipt && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <ImageIcon size={16} className="text-purple-600" /> Bukti Foto Nota / Struk
                </h3>
                <p className="text-[11px] text-gray-500">{selectedReceipt.userName} — {selectedReceipt.title}</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center p-2 min-h-[220px]">
              <img
                src={selectedReceipt.url}
                alt="Bukti Nota Reimbursement"
                className="max-h-[350px] w-full object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="btn-primary text-xs font-bold px-4 py-2 rounded-xl"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

