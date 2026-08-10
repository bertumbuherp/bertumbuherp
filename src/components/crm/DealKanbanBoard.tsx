'use client';
import React, { useState } from 'react';
import { useCrmStore } from '@/lib/store/crmStore';
import { DealStage } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, MoreVertical, Target, Handshake, CheckCircle2, XCircle } from 'lucide-react';

export function DealKanbanBoard() {
  const { deals, clients, addDeal, updateDealStage } = useCrmStore();
  const [isOpenModal, setIsOpenModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [value, setValue] = useState(50000000);
  const [stage, setStage] = useState<DealStage>('lead');
  const [probability, setProbability] = useState(50);
  const [aeName, setAeName] = useState('Andi Saputra');

  const columns: { id: DealStage, title: string, color: string, bg: string, icon: React.ReactNode }[] = [
    { id: 'lead', title: 'Lead In', color: 'text-gray-600', bg: 'bg-gray-100', icon: null },
    { id: 'kualifikasi', title: 'Kualifikasi', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', icon: null },
    { id: 'penawaran', title: 'Kirim Penawaran', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', icon: null },
    { id: 'pitching', title: 'Pitching', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', icon: <Target size={14}/> },
    { id: 'negosiasi', title: 'Negosiasi', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', icon: <Handshake size={14}/> },
    { id: 'won', title: 'Closed Won', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 size={14}/> },
    { id: 'lost', title: 'Closed Lost', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: <XCircle size={14}/> },
  ];

  const handleStageChange = (dealId: string, newStage: DealStage) => {
    updateDealStage(dealId, newStage);
    if (newStage === 'won') {
      alert('🎉 Hore! Deal berhasil ditutup (WON).\nDraf proyek telah otomatis dibuat di Dashboard PM.');
    }
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim() || value <= 0) {
      alert('Mohon lengkapi judul deal, nama klien, dan estimasi nilai transaksi.');
      return;
    }

    addDeal({
      organizationId: 'org-1',
      clientId: `client-${Date.now()}`,
      clientName,
      title,
      value: Number(value),
      stage,
      probability: Number(probability),
      aeId: 'user-ae-1',
      aeName,
      source: 'Website Form'
    });

    setTitle('');
    setClientName('');
    setValue(50000000);
    setIsOpenModal(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col fade-in">
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Sales Pipeline</h2>
          <p className="text-sm text-gray-500">Geser (klik tombol aksi) untuk mengubah status prospek.</p>
        </div>
        <button 
          className="btn-primary py-2 px-4 flex items-center gap-2 text-sm cursor-pointer font-bold" 
          onClick={() => setIsOpenModal(true)}
        >
          <Plus size={16}/> Tambah Deal Prospek
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max items-start">
          {columns.map(col => {
            const colDeals = deals.filter(d => d.stage === col.id);
            const totalValue = colDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div key={col.id} className={`w-72 rounded-xl flex flex-col max-h-full border ${col.bg}`}>
                <div className="p-3 border-b border-black/5 flex flex-col shrink-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold flex items-center gap-1.5 ${col.color}`}>
                      {col.icon} {col.title}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs text-gray-600 shadow-sm font-bold">{colDeals.length}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">Total: {formatCurrency(totalValue)}</span>
                </div>
                
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {colDeals.map(deal => (
                    <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold tracking-wider bg-gray-100 text-gray-600 truncate max-w-[130px]" title={deal.clientName}>
                          {deal.clientName}
                        </span>
                        
                        <select 
                          className="text-[10px] bg-transparent border-0 text-gray-400 hover:text-gray-800 cursor-pointer p-0 opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                          value={deal.stage}
                          onChange={(e) => handleStageChange(deal.id, e.target.value as DealStage)}
                        >
                          <option disabled value={deal.stage}>Pindah ke...</option>
                          {columns.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                      
                      <h4 className="font-bold text-sm text-gray-800 leading-tight mb-2">{deal.title}</h4>
                      
                      <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-800">{formatCurrency(deal.value)}</span>
                          <span className={`font-bold ${deal.probability >= 70 ? 'text-green-600' : deal.probability >= 40 ? 'text-orange-600' : 'text-gray-400'}`}>
                            {deal.probability}%
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate">AE: {deal.aeName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Tambah Deal */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800">Form Tambah Deal Prospek Baru</h3>
              <button onClick={() => setIsOpenModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Judul / Nama Prospek Proyek</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Digital Campaign Q3 - PT Mandiri" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-red-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Perusahaan Klien</label>
                <input 
                  type="text" 
                  placeholder="Contoh: PT Mandiri Jaya" 
                  value={clientName} 
                  onChange={e => setClientName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-red-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Estimasi Nilai Transaksi (Rp)</label>
                <input 
                  type="number" 
                  value={value || ''} 
                  onChange={e => setValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-red-500" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tahap Pipeline Initial</label>
                  <select 
                    value={stage} 
                    onChange={e => setStage(e.target.value as DealStage)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-gray-50 font-semibold focus:outline-red-500"
                  >
                    {columns.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Probabilitas Closing (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={probability} 
                    onChange={e => setProbability(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-red-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Account Executive (AE) Penanggung Jawab</label>
                <input 
                  type="text" 
                  value={aeName} 
                  onChange={e => setAeName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-red-500" 
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsOpenModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl">Batal</button>
                <button type="submit" className="btn-primary px-5 py-2 text-xs font-bold rounded-xl shadow-md">Simpan Deal Baru</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
