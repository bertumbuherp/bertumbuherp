'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceStore } from '@/lib/store/financeStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, Send, CheckCircle, XCircle, Clock } from 'lucide-react';

export function ReimbursementForm() {
  const { session } = useAuth();
  const { reimbursements, addReimbursement } = useFinanceStore();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Filter reimbursements for this user
  // In a real app, we'd use session?.userId. For now, we'll match by name to be safe with mocks.
  const myReimbursements = reimbursements.filter(
    (r) => r.userName === session?.name || r.userName === 'Dimas Prasetyo' // default fallback if session is weird
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !date) return;

    addReimbursement({
      id: `rem_${Date.now()}`,
      userName: session?.name || 'Unknown User',
      title,
      amount: parseInt(amount.replace(/\D/g, '') || '0', 10),
      date,
      notes,
      status: 'pending',
    });

    // Reset form
    setTitle('');
    setAmount('');
    setNotes('');
    alert('Pengajuan reimbursement berhasil dikirim ke Finance.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
      <div className="lg:col-span-1 space-y-6">
        <div className="card p-6 border-t-4 border-emerald-500 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">Buat Pengajuan</h2>
              <p className="text-xs text-gray-500">Klaim dana operasional</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Keterangan / Judul Pengeluaran</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="Contoh: Tiket Kereta, Beli Kertas..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">Rp</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => {
                    // Only allow numbers
                    const val = e.target.value.replace(/\D/g, '');
                    setAmount(val);
                  }}
                  className="input-field pl-10"
                  placeholder="0"
                  required
                />
              </div>
              {amount && (
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  Format: {formatCurrency(parseInt(amount || '0'))}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Bon/Struk</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field min-h-[80px]"
                placeholder="Tambahkan informasi pendukung..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 py-3 flex items-center justify-center gap-2 mt-2"
            >
              <Send size={18} /> Kirim Pengajuan
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6 shadow-sm border">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Riwayat Pengajuan Reimbursement Saya</h2>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {myReimbursements.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">Belum ada riwayat pengajuan reimbursement.</p>
              </div>
            ) : (
              myReimbursements.map((r) => (
                <div key={r.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    r.status === 'pending' ? 'bg-orange-400' :
                    r.status === 'approved' ? 'bg-blue-400' :
                    r.status === 'paid' ? 'bg-emerald-400' :
                    'bg-red-400'
                  }`} />
                  
                  <div className="pl-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{r.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          r.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          r.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          r.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {r.status === 'approved' ? 'Disetujui Finance' : r.status === 'paid' ? 'Sudah Dibayar' : r.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        Tanggal Bon: {formatDate(r.date)}
                      </p>
                      {r.notes && (
                        <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded border border-gray-100 italic">
                          &quot;{r.notes}&quot;
                        </p>
                      )}
                    </div>
                    
                    <div className="sm:text-right shrink-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Nominal Klaim</p>
                      <p className="text-lg font-black text-gray-800">{formatCurrency(r.amount)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
