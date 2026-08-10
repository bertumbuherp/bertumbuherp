'use client';
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePMStore } from '@/lib/store/pmStore';
import { useFinanceStore } from '@/lib/store/financeStore';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, AlertTriangle, Plus, X, CheckCircle, RefreshCw, BarChart2, ExternalLink } from 'lucide-react';

type AdPlatform = 'Meta Ads' | 'Google Ads' | 'TikTok Ads' | 'YouTube Ads' | 'LinkedIn Ads' | 'Twitter/X Ads';
type BillingStatus = 'pending' | 'billed' | 'paid';

interface AdsBudgetEntry {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  platform: AdPlatform;
  allocatedBudget: number;
  spentBudget: number;
  billingStatus: BillingStatus;
  billedToClient: number;
  startDate: string;
  endDate: string;
  notes?: string;
  roas?: number; // Return on Ads Spend
}

const PLATFORM_COLORS: Record<AdPlatform, string> = {
  'Meta Ads': '#1877F2',
  'Google Ads': '#4285F4',
  'TikTok Ads': '#010101',
  'YouTube Ads': '#FF0000',
  'LinkedIn Ads': '#0A66C2',
  'Twitter/X Ads': '#1DA1F2',
};

const PLATFORM_ICONS: Record<AdPlatform, string> = {
  'Meta Ads': '📘',
  'Google Ads': '🔵',
  'TikTok Ads': '🎵',
  'YouTube Ads': '▶️',
  'LinkedIn Ads': '💼',
  'Twitter/X Ads': '🐦',
};

const INITIAL_ADS_DATA: AdsBudgetEntry[] = [
  { id: 'ab1', projectId: 'p3', projectName: 'Campaign Lebaran', clientName: 'Batik Wastra', platform: 'Meta Ads', allocatedBudget: 8000000, spentBudget: 8560000, billingStatus: 'billed', billedToClient: 8500000, startDate: '2026-03-15', endDate: '2026-05-25', notes: 'Kampanye Lebaran Q2 — retargeting + lookalike', roas: 3.2 },
  { id: 'ab2', projectId: 'p3', projectName: 'Campaign Lebaran', clientName: 'Batik Wastra', platform: 'TikTok Ads', allocatedBudget: 3000000, spentBudget: 2850000, billingStatus: 'billed', billedToClient: 3000000, startDate: '2026-04-01', endDate: '2026-05-25', notes: 'TikTok campaign awareness', roas: 2.8 },
  { id: 'ab3', projectId: 'p4', projectName: 'Performance Ads Q2', clientName: 'Edu Academy', platform: 'Google Ads', allocatedBudget: 6000000, spentBudget: 4200000, billingStatus: 'pending', billedToClient: 0, startDate: '2026-04-01', endDate: '2026-06-30', notes: 'Search + Display Edu Academy Q2', roas: 4.1 },
  { id: 'ab4', projectId: 'p4', projectName: 'Performance Ads Q2', clientName: 'Edu Academy', platform: 'YouTube Ads', allocatedBudget: 2500000, spentBudget: 1800000, billingStatus: 'pending', billedToClient: 0, startDate: '2026-05-01', endDate: '2026-06-30', notes: 'YouTube skippable ads awareness', roas: 2.1 },
  { id: 'ab5', projectId: 'p2', projectName: 'Social Media Retainer Mei', clientName: 'Kopi Nusantara', platform: 'Meta Ads', allocatedBudget: 4000000, spentBudget: 3600000, billingStatus: 'paid', billedToClient: 4000000, startDate: '2026-05-01', endDate: '2026-05-31', notes: 'Boosting post organik + story ads', roas: 3.8 },
];

const BILLING_STATUS_STYLE: Record<BillingStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  billed: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
};
const BILLING_STATUS_LABEL: Record<BillingStatus, string> = {
  pending: '⏳ Belum Ditagih',
  billed: '📄 Sudah Ditagih',
  paid: '✅ Lunas',
};

export function AdsBudgetTrackerView() {
  const { projects } = usePMStore();
  const [adsData, setAdsData] = useState<AdsBudgetEntry[]>(INITIAL_ADS_DATA);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterBilling, setFilterBilling] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => { setMounted(true); }, []);

  const [formData, setFormData] = useState({
    projectId: '',
    platform: 'Meta Ads' as AdPlatform,
    allocatedBudget: '',
    spentBudget: '',
    billedToClient: '',
    billingStatus: 'pending' as BillingStatus,
    startDate: '',
    endDate: '',
    notes: '',
    roas: '',
  });

  const filtered = useMemo(() => {
    return adsData.filter(a => {
      if (filterProject !== 'all' && a.projectId !== filterProject) return false;
      if (filterPlatform !== 'all' && a.platform !== filterPlatform) return false;
      if (filterBilling !== 'all' && a.billingStatus !== filterBilling) return false;
      return true;
    });
  }, [adsData, filterProject, filterPlatform, filterBilling]);

  const totals = useMemo(() => {
    const totalAllocated = filtered.reduce((s, a) => s + a.allocatedBudget, 0);
    const totalSpent = filtered.reduce((s, a) => s + a.spentBudget, 0);
    const totalBilled = filtered.reduce((s, a) => s + a.billedToClient, 0);
    const unbilled = filtered.filter(a => a.billingStatus === 'pending').reduce((s, a) => s + a.spentBudget, 0);
    const avgRoas = filtered.filter(a => a.roas).reduce((s, a, _, arr) => s + (a.roas || 0) / arr.length, 0);
    return { totalAllocated, totalSpent, totalBilled, unbilled, avgRoas };
  }, [filtered]);

  const handleSyncBilling = (id: string) => {
    setAdsData(prev => prev.map(a => a.id === id ? { ...a, billingStatus: 'billed', billedToClient: a.spentBudget } : a));
    setToast('✅ Budget Ads berhasil di-sync ke billing / invoice!');
    setTimeout(() => setToast(null), 4000);
  };

  const handleMarkPaid = (id: string) => {
    setAdsData(prev => prev.map(a => a.id === id ? { ...a, billingStatus: 'paid' } : a));
    setToast('✅ Status billing diperbarui ke Lunas!');
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find(p => p.id === formData.projectId);
    if (!project) return;
    const newEntry: AdsBudgetEntry = {
      id: `ab${Date.now()}`,
      projectId: formData.projectId,
      projectName: project.name,
      clientName: project.clientName,
      platform: formData.platform,
      allocatedBudget: parseInt(formData.allocatedBudget) || 0,
      spentBudget: parseInt(formData.spentBudget) || 0,
      billingStatus: formData.billingStatus,
      billedToClient: parseInt(formData.billedToClient) || 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes,
      roas: parseFloat(formData.roas) || undefined,
    };
    setAdsData(prev => [newEntry, ...prev]);
    setIsModalOpen(false);
    setToast(`✅ Budget Ads "${formData.platform}" untuk ${project.name} berhasil ditambahkan!`);
    setTimeout(() => setToast(null), 4000);
    setFormData({ projectId: '', platform: 'Meta Ads', allocatedBudget: '', spentBudget: '', billedToClient: '', billingStatus: 'pending', startDate: '', endDate: '', notes: '', roas: '' });
  };

  const platforms = [...new Set(adsData.map(a => a.platform))];

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Toast */}
      {toast && (
        <div className="mb-2 p-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2"><CheckCircle size={16} /><span>{toast}</span></div>
          <button onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Tracker Budget Ads (All Platform) & Direct Billing Sync
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor pengeluaran iklan per platform, per proyek · Sinkronisasi langsung ke billing klien
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm font-bold shadow-md shrink-0"
        >
          <Plus size={16} /> Tambah Budget Ads
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-blue-500">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Alokasi</p>
          <p className="text-xl font-black text-blue-600">{formatCurrency(totals.totalAllocated)}</p>
          <p className="text-xs text-gray-400 mt-1">budget dialokasikan</p>
        </div>
        <div className="card p-4 border-l-4 border-violet-500">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Terpakai</p>
          <p className="text-xl font-black text-violet-600">{formatCurrency(totals.totalSpent)}</p>
          <p className="text-xs text-gray-400 mt-1">{totals.totalAllocated > 0 ? Math.round((totals.totalSpent / totals.totalAllocated) * 100) : 0}% dari alokasi</p>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Belum Ditagih</p>
          <p className="text-xl font-black text-amber-600">{formatCurrency(totals.unbilled)}</p>
          <p className="text-xs text-gray-400 mt-1">perlu sync ke invoice</p>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Avg. ROAS</p>
          <p className="text-xl font-black text-emerald-600">{totals.avgRoas.toFixed(1)}x</p>
          <p className="text-xs text-gray-400 mt-1">return on ads spend</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white font-semibold text-gray-700 focus:outline-none focus:border-red-400"
        >
          <option value="all">Semua Proyek</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select
          value={filterPlatform}
          onChange={e => setFilterPlatform(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white font-semibold text-gray-700 focus:outline-none focus:border-red-400"
        >
          <option value="all">Semua Platform</option>
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={filterBilling}
          onChange={e => setFilterBilling(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white font-semibold text-gray-700 focus:outline-none focus:border-red-400"
        >
          <option value="all">Semua Status Billing</option>
          <option value="pending">⏳ Belum Ditagih</option>
          <option value="billed">📄 Sudah Ditagih</option>
          <option value="paid">✅ Lunas</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} entri</span>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-bold text-gray-500 uppercase">Platform</th>
              <th className="text-left py-3 px-4 font-bold text-gray-500 uppercase">Proyek / Klien</th>
              <th className="text-right py-3 px-4 font-bold text-gray-500 uppercase">Alokasi</th>
              <th className="text-right py-3 px-4 font-bold text-gray-500 uppercase">Terpakai</th>
              <th className="text-center py-3 px-4 font-bold text-gray-500 uppercase">ROAS</th>
              <th className="text-center py-3 px-4 font-bold text-gray-500 uppercase">Billing</th>
              <th className="text-center py-3 px-4 font-bold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(entry => {
              const burnPct = Math.min((entry.spentBudget / entry.allocatedBudget) * 100, 120);
              const isOverBudget = entry.spentBudget > entry.allocatedBudget;
              return (
                <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{PLATFORM_ICONS[entry.platform]}</span>
                      <div>
                        <span className="font-bold text-gray-800">{entry.platform}</span>
                        <p className="text-gray-400 text-xs">{entry.startDate} → {entry.endDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-800">{entry.projectName}</p>
                    <p className="text-gray-500">{entry.clientName}</p>
                    {entry.notes && <p className="text-gray-400 truncate max-w-[160px]">{entry.notes}</p>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="font-bold text-gray-800">{formatCurrency(entry.allocatedBudget)}</p>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(burnPct, 100)}%`, backgroundColor: isOverBudget ? 'var(--red-err)' : PLATFORM_COLORS[entry.platform] || 'var(--accent)' }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
                      {formatCurrency(entry.spentBudget)}
                    </p>
                    {isOverBudget && (
                      <span className="text-xs text-red-500 flex items-center justify-end gap-1">
                        <AlertTriangle size={10} /> Over {Math.round(burnPct - 100)}%
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {entry.roas ? (
                      <span className={`font-bold ${entry.roas >= 3 ? 'text-emerald-600' : entry.roas >= 2 ? 'text-amber-600' : 'text-red-500'}`}>
                        {entry.roas.toFixed(1)}x
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${BILLING_STATUS_STYLE[entry.billingStatus]}`}>
                      {BILLING_STATUS_LABEL[entry.billingStatus]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {entry.billingStatus === 'pending' && (
                        <button
                          onClick={() => handleSyncBilling(entry.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                        >
                          <RefreshCw size={10} /> Sync Billing
                        </button>
                      )}
                      {entry.billingStatus === 'billed' && (
                        <button
                          onClick={() => handleMarkPaid(entry.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                        >
                          <CheckCircle size={10} /> Lunas
                        </button>
                      )}
                      {entry.billingStatus === 'paid' && (
                        <span className="text-emerald-500 text-xs font-bold">✓ Selesai</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-gray-200">
            <tr>
              <td colSpan={2} className="py-3 px-4 font-bold text-gray-700 text-xs">TOTAL ({filtered.length} entri)</td>
              <td className="py-3 px-4 text-right font-black text-gray-900 text-xs">{formatCurrency(totals.totalAllocated)}</td>
              <td className="py-3 px-4 text-right font-black text-gray-900 text-xs">{formatCurrency(totals.totalSpent)}</td>
              <td className="py-3 px-4 text-center font-black text-emerald-600 text-xs">{totals.avgRoas.toFixed(1)}x avg</td>
              <td className="py-3 px-4 text-center text-xs text-amber-600 font-bold">{formatCurrency(totals.unbilled)} unbilled</td>
              <td />
            </tr>
          </tfoot>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-gray-400 text-sm">Tidak ada data budget ads untuk filter ini.</div>
        )}
      </div>

      {/* ADD MODAL */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <DollarSign size={18} className="text-blue-600" /> Tambah Budget Ads Baru
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddEntry} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Proyek</label>
                <select required value={formData.projectId} onChange={e => setFormData(f => ({ ...f, projectId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:outline-none focus:border-blue-400">
                  <option value="">-- Pilih Proyek --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name} — {p.clientName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Platform</label>
                  <select value={formData.platform} onChange={e => setFormData(f => ({ ...f, platform: e.target.value as AdPlatform }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:outline-none focus:border-blue-400">
                    {(['Meta Ads', 'Google Ads', 'TikTok Ads', 'YouTube Ads', 'LinkedIn Ads', 'Twitter/X Ads'] as AdPlatform[]).map(p => (
                      <option key={p} value={p}>{PLATFORM_ICONS[p]} {p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status Billing</label>
                  <select value={formData.billingStatus} onChange={e => setFormData(f => ({ ...f, billingStatus: e.target.value as BillingStatus }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:outline-none focus:border-blue-400">
                    <option value="pending">⏳ Belum Ditagih</option>
                    <option value="billed">📄 Sudah Ditagih</option>
                    <option value="paid">✅ Lunas</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Alokasi Budget (Rp)</label>
                  <input required type="text" inputMode="numeric" placeholder="8000000"
                    value={formData.allocatedBudget} onChange={e => setFormData(f => ({ ...f, allocatedBudget: e.target.value.replace(/\D/g, '') }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Realisasi Spend (Rp)</label>
                  <input required type="text" inputMode="numeric" placeholder="7500000"
                    value={formData.spentBudget} onChange={e => setFormData(f => ({ ...f, spentBudget: e.target.value.replace(/\D/g, '') }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ditagih ke Klien (Rp)</label>
                  <input type="text" inputMode="numeric" placeholder="8000000"
                    value={formData.billedToClient} onChange={e => setFormData(f => ({ ...f, billedToClient: e.target.value.replace(/\D/g, '') }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ROAS (opsional)</label>
                  <input type="number" step="0.1" placeholder="3.2"
                    value={formData.roas} onChange={e => setFormData(f => ({ ...f, roas: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Mulai</label>
                  <input required type="date" value={formData.startDate} onChange={e => setFormData(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Selesai</label>
                  <input required type="date" value={formData.endDate} onChange={e => setFormData(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Catatan (opsional)</label>
                <textarea rows={2} placeholder="Deskripsi kampanye, target, dll..."
                  value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:outline-none focus:border-blue-400 resize-none" />
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-gray-600 font-semibold border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" className="btn-primary px-4 py-2 text-xs font-bold shadow-md">Simpan Budget Ads</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
