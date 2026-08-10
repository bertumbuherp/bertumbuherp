'use client';
import React, { useState } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus, XCircle, Trash2, Edit2, Ban, CheckCircle } from 'lucide-react';
import { useFinanceStore, JournalEntry, CHART_OF_ACCOUNTS } from '@/lib/store/financeStore';

export function JurnalTable() {
  const { journal, addJournalEntry, editJournalEntry, voidJournalEntry } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({ date: '', description: '', account: '', type: 'debit', amount: 0 });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAdd = () => {
    if (!formData.date || !formData.description || !formData.account || formData.amount <= 0) return;
    
    const matchedCOA = CHART_OF_ACCOUNTS.find(
      a => a.name.toLowerCase().includes(formData.account.toLowerCase()) || 
           a.code === formData.account
    );
    const accountCode = matchedCOA ? matchedCOA.code : '6.1.16.0.0.0';
    const accountName = matchedCOA ? matchedCOA.name : formData.account;

    addJournalEntry({
      id: 'j_' + Date.now(),
      date: formData.date,
      description: formData.description,
      account: formData.account,
      accountCode,
      accountName,
      type: formData.type as 'debit' | 'credit',
      amount: formData.amount,
    });
    setIsModalOpen(false);
    setFormData({ date: '', description: '', account: '', type: 'debit', amount: 0 });
    showToast('✅ Entri Jurnal baru berhasil disimpan!');
  };

  const handleVoid = (id: string, desc: string) => {
    if (confirm(`Apakah Anda yakin ingin membatalkan/void entri jurnal: "${desc}"?`)) {
      voidJournalEntry(id);
      showToast('⚠️ Entri Jurnal berhasil di-void & Reversal Entry dibuat!');
    }
  };

  const handleSaveEdit = () => {
    if (!editingJournal) return;
    editJournalEntry(editingJournal.id, {
      description: editingJournal.description,
      amount: editingJournal.amount
    });
    setEditingJournal(null);
    showToast('✅ Perubahan jurnal berhasil disimpan!');
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)}><XCircle size={16} /></button>
        </div>
      )}

      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Buku Besar &amp; Recent Journal Entries</h2>
          <p className="text-xs text-gray-500">Pencatatan Jurnal Terbaru, Edit, &amp; Reversal Void Jurnal</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shadow-md">
          <Plus size={14}/> Tambah Entri Jurnal
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1a365d] text-white border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Tanggal</th>
              <th className="px-4 py-3 font-semibold">Keterangan Transaksi</th>
              <th className="px-4 py-3 font-semibold">Akun (COA)</th>
              <th className="px-4 py-3 font-semibold text-right border-l border-[#2a4a7f]">Debit</th>
              <th className="px-4 py-3 font-semibold text-right">Kredit</th>
              <th className="px-4 py-3 font-semibold text-center">Status / Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {journal.map((j) => (
              <tr key={j.id} className={`hover:bg-gray-50/70 transition-colors ${j.isVoided ? 'bg-red-50/40 text-gray-400 line-through' : ''}`}>
                <td className="px-4 py-3 font-mono whitespace-nowrap">{formatDate(j.date)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <span>{j.description}</span>
                  {j.isSimulation && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 no-underline inline-block">
                      🧪 SIMULASI
                    </span>
                  )}
                  {j.isVoided && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 border border-red-300 no-underline inline-block">
                      🚫 VOIDED
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700 font-medium">
                  <span className="font-mono text-[10px] text-gray-400 block">{j.accountCode}</span>
                  {j.accountName || j.account}
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-700 border-l border-gray-100">
                  {j.type === 'debit' ? formatCurrency(j.amount) : '-'}
                </td>
                <td className="px-4 py-3 text-right font-bold text-rose-700">
                  {j.type === 'credit' ? formatCurrency(j.amount) : '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  {!j.isVoided && (
                    <div className="flex items-center justify-center gap-1">
                      {/* Item 4.8: Edit Button */}
                      <button
                        onClick={() => setEditingJournal(j)}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Deskripsi/Nominal"
                      >
                        <Edit2 size={13} />
                      </button>
                      
                      {/* Item 4.8: Void Reversal Button */}
                      <button
                        onClick={() => handleVoid(j.id, j.description)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Void / Batalkan Jurnal Ini"
                      >
                        <Ban size={13} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {journal.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">Tidak ada entri jurnal.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800">Tambah Entri Jurnal</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Tanggal</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2 text-xs" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Keterangan / Deskripsi</label>
                <input type="text" placeholder="Misal: Pembayaran Vendor X..." className="w-full border rounded-lg px-3 py-2 text-xs" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Akun</label>
                  <input type="text" placeholder="Misal: Kas, Biaya Operasional..." className="w-full border rounded-lg px-3 py-2 text-xs" value={formData.account} onChange={e => setFormData({...formData, account: e.target.value})} />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tipe Entri</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-xs bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="debit">DEBIT</option>
                    <option value="credit">KREDIT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                <input type="number" placeholder="0" className="w-full border rounded-lg px-3 py-2 text-xs" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">Batal</button>
              <button onClick={handleAdd} className="btn-primary text-xs px-4 py-2 font-bold shadow-md">Simpan Jurnal</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingJournal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Edit Entri Jurnal [{editingJournal.accountCode}]</h3>
              <button onClick={() => setEditingJournal(null)}><XCircle size={18} className="text-gray-400" /></button>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Deskripsi Transaksi</label>
              <input
                type="text"
                value={editingJournal.description}
                onChange={e => setEditingJournal({ ...editingJournal, description: e.target.value })}
                className="w-full border rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Nominal (Rp)</label>
              <input
                type="number"
                value={editingJournal.amount}
                onChange={e => setEditingJournal({ ...editingJournal, amount: Number(e.target.value) })}
                className="w-full border rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setEditingJournal(null)} className="px-3 py-1.5 border rounded-lg">Batal</button>
              <button onClick={handleSaveEdit} className="btn-primary px-3 py-1.5 font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
