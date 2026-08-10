'use client';
import React, { useState } from 'react';
import { useFinanceStore, AccountCOA } from '@/lib/store/financeStore';
import { Plus, Search, Edit2, Shield, FolderPlus, CheckCircle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export function COAManagementView() {
  const { coaList, addCOA, updateCOA } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<AccountCOA['category']>('Expense');
  const [formBalance, setFormBalance] = useState<'debit' | 'credit'>('debit');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredCOA = coaList.filter(item => {
    const matchesSearch = item.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingCode(null);
    setFormCode('');
    setFormName('');
    setFormCategory('Expense');
    setFormBalance('debit');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (account: AccountCOA) => {
    setEditingCode(account.code);
    setFormCode(account.code);
    setFormName(account.name);
    setFormCategory(account.category);
    setFormBalance(account.normalBalance);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName) return;

    if (editingCode) {
      updateCOA(editingCode, {
        name: formName,
        category: formCategory,
        normalBalance: formBalance
      });
      showToast(`✅ Akun ${editingCode} berhasil diperbarui!`);
    } else {
      if (coaList.some(c => c.code === formCode)) {
        alert('Kode akun sudah terdaftar!');
        return;
      }
      addCOA({
        code: formCode,
        name: formName,
        category: formCategory,
        normalBalance: formBalance
      });
      showToast(`✅ Akun baru ${formCode} - ${formName} berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Asset': return 'bg-blue-100 text-blue-800';
      case 'Liability': return 'bg-amber-100 text-amber-800';
      case 'Equity': return 'bg-purple-100 text-purple-800';
      case 'Revenue': return 'bg-emerald-100 text-emerald-800';
      case 'Expense': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <button onClick={() => setToastMessage(null)}><X size={16} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Dynamic Chart of Accounts (COA Master Management)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Kelola Master Kode Akun, Kategori Aset/Kewajiban/Ekuitas/Pendapatan/Beban &amp; Normal Balance
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shrink-0 shadow-md"
        >
          <Plus size={14} /> Tambah Akun COA Baru
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kode akun atau nama akun..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['all', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                categoryFilter === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
              }`}
            >
              {cat === 'all' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Kode Akun (COA)</th>
              <th className="py-3 px-4">Nama Akun</th>
              <th className="py-3 px-4">Kategori Utama</th>
              <th className="py-3 px-4 text-center">Normal Balance</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredCOA.map(item => (
              <tr key={item.code} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-gray-900">{item.code}</td>
                <td className="py-3 px-4 font-semibold text-gray-800">{item.name}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-bold text-gray-600 uppercase">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${item.normalBalance === 'debit' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                    {item.normalBalance}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit Kode/Nama Akun"
                  >
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCOA.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-xs">
            Tidak ada akun COA ditemukan untuk filter ini.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FolderPlus size={18} className="text-emerald-600" />
                {editingCode ? 'Edit Akun COA' : 'Tambah Akun COA Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Kode Akun (COA Code)</label>
                <input
                  type="text"
                  required
                  disabled={!!editingCode}
                  placeholder="Misal: 5.1.18.0.0.0"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 font-mono focus:outline-none focus:border-emerald-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nama Akun</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Beban Influencer Marketing"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori Utama</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as AccountCOA['category'])}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Asset">Asset (Aset)</option>
                    <option value="Liability">Liability (Kewajiban)</option>
                    <option value="Equity">Equity (Ekuitas)</option>
                    <option value="Revenue">Revenue (Pendapatan)</option>
                    <option value="Expense">Expense (Beban)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Normal Balance</label>
                  <select
                    value={formBalance}
                    onChange={e => setFormBalance(e.target.value as 'debit' | 'credit')}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="debit">DEBIT</option>
                    <option value="credit">KREDIT</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 font-bold shadow-md"
                >
                  {editingCode ? 'Simpan Perubahan' : 'Tambah Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
