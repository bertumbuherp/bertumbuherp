'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePMStore } from '@/lib/store/pmStore';
import { formatCurrency } from '@/lib/utils';
import { Package, CheckCircle, Clock, Plus, X, Tag } from 'lucide-react';

export default function PMAddOn() {
  const { projects, addProjectAddOn } = usePMStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [addOnName, setAddOnName] = useState('');
  const [category, setCategory] = useState('Talent KOL');
  const [procurementCost, setProcurementCost] = useState<number>(0);
  const [billingPrice, setBillingPrice] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allAddOns = projects.flatMap(p =>
    p.addOns.map((ao: any) => ({ ...ao, projectId: p.id, projectName: p.name, clientName: p.clientName }))
  );
  
  const totalMarkup = allAddOns.reduce((s, ao) => s + (ao.billingPrice - ao.procurementCost), 0);
  const totalBilling = allAddOns.reduce((s, ao) => s + ao.billingPrice, 0);
  const invoiced = allAddOns.filter((ao: any) => ao.invoiced).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !addOnName || billingPrice <= 0) return;

    const newAddOn = {
      id: `ao_${Date.now()}`,
      projectId: selectedProjectId,
      name: addOnName,
      category,
      procurementCost: Number(procurementCost),
      billingPrice: Number(billingPrice),
      invoiced: false,
    };

    addProjectAddOn(selectedProjectId, newAddOn);
    setIsModalOpen(false);
    setAddOnName('');
    setProcurementCost(0);
    setBillingPrice(0);
  };

  return (
    <div className="space-y-5 fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Add-On', value: String(allAddOns.length), color: 'var(--text-primary)' },
          { label: 'Total Tagihan Klien', value: formatCurrency(totalBilling), color: 'var(--red)' },
          { label: 'Total Profit Markup', value: formatCurrency(totalMarkup), color: 'var(--green)' },
          { label: 'Sudah Difakturkan', value: `${invoiced}/${allAddOns.length}`, color: 'var(--blue)' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add-on table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Daftar Add-On Klien (Talent, Cetak, Venue, Media)</p>
            <p className="text-xs text-gray-500">Add-on yang diinput otomatis terhubung ke penagihan Invoice Finance bulan berjalan.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3">
            <Plus size={14} /> Tambah Add-On Klien
          </button>
        </div>

        {allAddOns.length === 0 ? (
          <div className="text-center py-12">
            <Package size={32} className="mx-auto mb-3" style={{ color: 'var(--border)' }} />
            <p style={{ color: 'var(--text-muted)' }}>Belum ada add-on yang diinput untuk proyek ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Add-On Item', 'Proyek / Klien', 'Kategori', 'Biaya Pengadaan', 'Harga Tagih Klien', 'Markup Profit', 'Status Invoice'].map(h => (
                    <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allAddOns.map((ao: any) => {
                  const markup = ao.billingPrice - ao.procurementCost;
                  return (
                    <tr key={ao.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-light)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-page)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--red-dim2)' }}>
                            <Package size={14} style={{ color: 'var(--red)' }} />
                          </div>
                          <span className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{ao.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{ao.projectName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ao.clientName}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="badge badge-gray text-xs">{ao.category}</span>
                      </td>
                      <td className="py-3 pr-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(ao.procurementCost)}</td>
                      <td className="py-3 pr-4 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(ao.billingPrice)}</td>
                      <td className="py-3 pr-4 text-xs font-semibold" style={{ color: 'var(--green)' }}>+{formatCurrency(markup)}</td>
                      <td className="py-3">
                        <span className="flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: ao.invoiced ? 'var(--green)' : 'var(--yellow)' }}>
                          {ao.invoiced ? <CheckCircle size={13} /> : <Clock size={13} />}
                          {ao.invoiced ? 'Sudah Di-Invoice' : 'Belum Di-Invoice'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Addon */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 text-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold flex items-center gap-2 text-gray-900">
                <Plus size={18} className="text-red-500" />
                Tambah Add-On Klien Baru
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Proyek / Klien</label>
                <select 
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-red-500">
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.clientName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kategori Add-On</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-red-500">
                  <option value="KOL Talent">KOL Talent / Influencer</option>
                  <option value="Cetak & Bahan">Cetak & Bahan Promosi</option>
                  <option value="Sewa Venue">Sewa Venue / Perizinan</option>
                  <option value="Media Placement">Media Placement / Ads</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Item Add-On</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Fee KOL Instagram @talent_a (2 Feed + 1 Story)"
                  value={addOnName}
                  onChange={(e) => setAddOnName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 font-medium focus:outline-none focus:border-red-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Biaya Pengadaan (Rp)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Biaya Asli Agensi"
                    value={procurementCost || ''}
                    onChange={(e) => setProcurementCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 font-bold focus:outline-none focus:border-red-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Harga Tagih Klien (Rp)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Harga Penjualan"
                    value={billingPrice || ''}
                    onChange={(e) => setBillingPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-800 font-bold focus:outline-none focus:border-red-500" 
                  />
                </div>
              </div>

              {billingPrice > procurementCost && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex justify-between font-semibold">
                  <span>Estimasi Profit Markup:</span>
                  <span className="font-bold">{formatCurrency(billingPrice - procurementCost)}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50">
                  Batal
                </button>
                <button 
                  type="submit"
                  className="btn-primary px-4 py-2 text-xs font-bold shadow-md cursor-pointer">
                  Simpan Add-On
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
