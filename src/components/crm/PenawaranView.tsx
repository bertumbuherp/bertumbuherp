'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCrmStore } from '@/lib/store/crmStore';
import { formatCurrency } from '@/lib/utils';
import { Plus, Eye, Trash2, ArrowLeft, Printer, ShoppingBag, PlusCircle, Check, Zap, Layers, CheckCircle, X } from 'lucide-react';
import { Quotation, QuotationLineItem, QuotationStatus } from '@/lib/types';

export function PenawaranView() {
  const clients = useCrmStore(s => s.clients);
  const packages = useCrmStore(s => s.packages);
  const quotations = useCrmStore(s => s.quotations);
  
  const addQuotation = useCrmStore(s => s.addQuotation);
  const updateQuotation = useCrmStore(s => s.updateQuotation);
  const deleteQuotation = useCrmStore(s => s.deleteQuotation);
  const convertQuotationToDealAndProject = useCrmStore(s => s.convertQuotationToDealAndProject);

  // View state: 'list' | 'create' | 'view'
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'list' | 'create' | 'view'>('list');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Selector & Comparison states (Item 2.3)
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConvertQuotation = (qId: string, qNum: string) => {
    const res = convertQuotationToDealAndProject(qId);
    if (res) {
      setToast(`🎉 Berhasil! Quotation ${qNum} telah dikonversi menjadi Deal Won & Proyek PM Active secara otomatis.`);
      setTimeout(() => setToast(null), 5000);
      if (selectedQuotation?.id === qId) {
        setSelectedQuotation({ ...selectedQuotation, status: 'approved' });
      }
    }
  };

  // Form states for creation
  const [clientId, setClientId] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<Omit<QuotationLineItem, 'total'>[]>([
    { id: 'item-1', description: '', quantity: 1, unitPrice: 0 }
  ]);

  const handleCreateNew = () => {
    if (clients.length === 0) {
      alert('Silakan buat klien terlebih dahulu di menu Klien.');
      return;
    }
    setClientId(clients[0].id);
    setValidityDays(30);
    setNotes('');
    setLineItems([{ id: 'item-1', description: '', quantity: 1, unitPrice: 0 }]);
    setView('create');
  };

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: `item-${Date.now()}-${Math.random()}`, description: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleUpdateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setLineItems(updated);
  };

  const handleAddPackage = (pkgId: string) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;

    if (pkg.status !== 'approved') {
      alert(`Peringatan: Paket "${pkg.name}" berstatus "${pkg.status}" dan belum di-approve oleh owner.`);
    }

    const newItem = {
      id: `item-${Date.now()}`,
      description: pkg.name,
      quantity: 1,
      unitPrice: pkg.basePrice
    };

    // Replace first empty item if applicable
    if (lineItems.length === 1 && lineItems[0].description === '' && lineItems[0].unitPrice === 0) {
      setLineItems([newItem]);
    } else {
      setLineItems([...lineItems, newItem]);
    }
  };

  const handleAddPackageTier = (tierType: 'TIER_A' | 'TIER_B' | 'TIER_C') => {
    let tierName = 'Package Tier C (Essential)';
    let tierPrice = 8500000;
    let tierCategory = 'Sosmed/CC';

    if (tierType === 'TIER_A') {
      tierName = 'Package Tier A (Enterprise Retainer)';
      tierPrice = 25000000;
      tierCategory = 'Branding & Retainer';
    } else if (tierType === 'TIER_B') {
      tierName = 'Package Tier B (Growth Retainer)';
      tierPrice = 15000000;
      tierCategory = 'Sosmed & Performance';
    }

    const newItem = {
      id: `item-${Date.now()}`,
      description: tierName,
      category: tierCategory,
      quantity: 1,
      unitPrice: tierPrice,
      discountPct: 0
    };

    if (lineItems.length === 1 && !lineItems[0].description && lineItems[0].unitPrice === 0) {
      setLineItems([newItem]);
    } else {
      setLineItems([...lineItems, newItem]);
    }
  };

  const calculateSubtotal = (items: typeof lineItems) => {
    return items.reduce((sum, item) => {
      const gross = item.quantity * item.unitPrice;
      const discount = gross * ((item.discountPct || 0) / 100);
      return sum + (gross - discount);
    }, 0);
  };

  const calculateTotalDiscount = (items: typeof lineItems) => {
    return items.reduce((sum, item) => {
      const gross = item.quantity * item.unitPrice;
      return sum + (gross * ((item.discountPct || 0) / 100));
    }, 0);
  };

  const subtotalVal = calculateSubtotal(lineItems);
  const totalDiscountVal = calculateTotalDiscount(lineItems);
  const taxVal = subtotalVal * 0.11;
  const grandTotalVal = subtotalVal + taxVal;

  const handleSaveQuotation = (status: QuotationStatus) => {
    if (!clientId) {
      alert('Pilih klien terlebih dahulu.');
      return;
    }
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    if (lineItems.some(item => !item.description.trim() || item.unitPrice <= 0)) {
      alert('Harap lengkapi semua deskripsi item dan pastikan harga di atas Rp 0.');
      return;
    }

    const newQuotationNum = `QTO-2026-06-${String(quotations.length + 1).padStart(3, '0')}`;

    const newQuotation: Quotation = {
      id: `qto-${Date.now()}`,
      organizationId: 'org-1',
      quotationNumber: newQuotationNum,
      clientId: client.id,
      clientName: client.name,
      issueDate: new Date().toISOString(),
      validityDays: Number(validityDays),
      lineItems: lineItems.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      })),
      subtotal: subtotalVal,
      tax: taxVal,
      total: grandTotalVal,
      status: status,
      notes: notes
    };

    addQuotation(newQuotation);
    setView('list');
  };

  const handleDeleteQuotation = (qId: string, qNum: string) => {
    if (window.confirm(`Hapus quotation ${qNum}?`)) {
      deleteQuotation(qId);
      if (selectedQuotation?.id === qId) {
        setView('list');
        setSelectedQuotation(null);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">
      {/* Dynamic printer media styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: A4 landscape;
          margin: 12mm 15mm;
        }
        @media print {
          aside, nav, header, button, .no-print {
            display: none !important;
          }
          body, html, #__next {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-only {
            display: block !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            position: absolute;
            top: 0;
            left: 0;
            width: 100% !important;
          }
          /* Landscape: tabel mengisi lebar halaman */
          .print-only table {
            width: 100% !important;
            table-layout: fixed !important;
            font-size: 10pt !important;
          }
          .print-only table th,
          .print-only table td {
            padding: 6px 8px !important;
            word-break: break-word !important;
          }
          /* Kolom deskripsi lebih lebar */
          .print-only table th:first-child,
          .print-only table td:first-child {
            width: 45% !important;
          }
          /* Header info lebih compact landscape */
          .print-only .print-header {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 16px !important;
          }
          /* Font size global print */
          .print-only {
            font-size: 10pt !important;
            line-height: 1.4 !important;
          }
          .print-only h1 { font-size: 22pt !important; }
          .print-only h2 { font-size: 13pt !important; }
          .print-only h3 { font-size: 11pt !important; }
        }
      `}} />

      {/* Toast Feedback Bar */}
      {toast && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-md fade-in no-print">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white hover:text-gray-200">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          VIEW 1: LIST VIEW & SEMI-AUTOMATIC SELECTOR TOOLBAR
      ──────────────────────────────────────────────────────── */}
      {view === 'list' && (
        <div className="fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Semi-Automatic Quotation Selector</h2>
              <p className="text-sm text-gray-500 mt-1">Pilih, bandingkan opsi tier penawaran, dan konversi otomatis quotation approved menjadi Deal Won &amp; Proyek PM Active</p>
            </div>
            <div className="flex items-center gap-2">
              {compareIds.length >= 2 && (
                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Layers size={15} /> Bandingkan ({compareIds.length}) Opsi Tier
                </button>
              )}
              <button 
                onClick={handleCreateNew}
                className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm font-bold shadow-md cursor-pointer"
              >
                <Plus size={16} /> Buat Quotation Baru
              </button>
            </div>
          </div>

          {/* Quotation Filter Toolbar */}
          <div className="card p-4 mb-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white no-print">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-1">Status:</span>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'draft', label: 'Draft' },
                { id: 'sent', label: 'Terkirim' },
                { id: 'approved', label: 'Deal Won / Approved' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setStatusFilter(t.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === t.id
                      ? 'bg-red-500 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Filter Klien:</span>
              <select
                value={selectedClientFilter}
                onChange={e => setSelectedClientFilter(e.target.value)}
                className="border border-gray-200 rounded-lg p-1.5 text-xs bg-gray-50 font-semibold focus:outline-none focus:border-red-500"
              >
                <option value="all">Semua Klien Agensi</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card overflow-hidden border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }}>
                    <th className="py-3 px-3 text-center w-10">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Pilih</span>
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nomor Quotation</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Klien</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Total Penawaran</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Aksi &amp; Konversi</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations
                    .filter(q => statusFilter === 'all' || q.status === statusFilter)
                    .filter(q => selectedClientFilter === 'all' || q.clientId === selectedClientFilter)
                    .map(q => {
                      const isChecked = compareIds.includes(q.id);
                      return (
                        <tr key={q.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--border)' }}>
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCompareIds([...compareIds, q.id]);
                                } else {
                                  setCompareIds(compareIds.filter(id => id !== q.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                              title="Pilih untuk membandingkan"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-sm text-gray-800">{q.quotationNumber}</td>
                          <td className="py-3.5 px-4 text-sm font-semibold text-gray-700">{q.clientName}</td>
                          <td className="py-3.5 px-4 text-xs text-gray-500">
                            {new Date(q.issueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3.5 px-4 text-sm font-bold text-right text-gray-800">{formatCurrency(q.total)}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                              q.status === 'approved' ? 'bg-green-100 text-green-700' :
                              q.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                              q.status === 'draft' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'
                            }`}>
                              {q.status === 'approved' ? 'Deal Won / Active' : q.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {q.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleConvertQuotation(q.id, q.quotationNumber)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  title="Konversi ke Deal Won & Proyek PM Active"
                                >
                                  <Zap size={13} /> Konversi
                                </button>
                              )}
                              <button 
                                onClick={() => { setSelectedQuotation(q); setView('view'); }}
                                className="p-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-md transition-colors"
                                title="Lihat &amp; Cetak Dokumen"
                              >
                                <Eye size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteQuotation(q.id, q.quotationNumber)}
                                className="p-1.5 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-md transition-colors"
                                title="Hapus Quotation"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {quotations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">Belum ada quotation yang dibuat.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          VIEW 2: CREATE VIEW (SIDE-BY-SIDE BUILDER & PREVIEW)
      ──────────────────────────────────────────────────────── */}
      {view === 'create' && (
        <div className="fade-in no-print">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setView('list')}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} /> Kembali ke Daftar
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => handleSaveQuotation('draft')}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-bold text-gray-600"
              >
                Simpan Draft
              </button>
              <button 
                onClick={() => handleSaveQuotation('sent')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                Terbitkan &amp; Kirim
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* BUILDER FORM */}
            <div className="card p-6 space-y-5">
              <h3 className="text-base font-bold text-gray-800 border-b pb-2">Form Builder Quotation</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Pilih Klien</label>
                  <select 
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-red-500 bg-gray-50 font-semibold"
                  >
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Validitas Penawaran (Hari)</label>
                  <select 
                    value={validityDays}
                    onChange={e => setValidityDays(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-red-500 bg-gray-50 font-semibold"
                  >
                    <option value={7}>7 Hari</option>
                    <option value={14}>14 Hari</option>
                    <option value={30}>30 Hari</option>
                  </select>
                </div>
              </div>

              {/* Quick Add Preset Package Tiers */}
              <div className="bg-gradient-to-r from-red-50 to-purple-50 rounded-xl p-3 border border-red-100 space-y-2">
                <label className="block text-xs font-bold text-red-900">Preset Package Tiers Cepat (AE Standard):</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddPackageTier('TIER_A')}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                  >
                    + Tier A Enterprise (25 Jt)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPackageTier('TIER_B')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                  >
                    + Tier B Growth (15 Jt)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPackageTier('TIER_C')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                  >
                    + Tier C Essential (8.5 Jt)
                  </button>
                </div>
                <div className="pt-1">
                  <select 
                    onChange={e => {
                      if (e.target.value) {
                        handleAddPackage(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full border rounded-lg p-2 text-xs focus:outline-none focus:border-red-500 bg-white font-medium text-gray-700"
                  >
                    <option value="">-- Atau Pilih Paket Khusus Lainnya --</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.status === 'approved' ? 'Aktif' : 'Draft'}) - {formatCurrency(p.basePrice)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-600">Daftar Layanan / Custom Scope Items</label>
                  <button 
                    type="button" 
                    onClick={handleAddLineItem}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle size={14} /> Tambah Scope Item
                  </button>
                </div>

                {lineItems.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input 
                          required
                          type="text" 
                          placeholder="Deskripsi layanan (contoh: 12 Social Media Feeds + Reels)..." 
                          className="w-full border rounded-lg p-2 text-xs bg-white focus:outline-none focus:border-red-500 font-medium"
                          value={item.description}
                          onChange={e => handleUpdateLineItem(idx, 'description', e.target.value)}
                        />
                      </div>
                      <div className="w-36">
                        <select
                          value={item.category || 'Sosmed/CC'}
                          onChange={e => handleUpdateLineItem(idx, 'category', e.target.value)}
                          className="w-full border rounded-lg p-2 text-xs bg-white focus:outline-none focus:border-red-500 font-semibold"
                        >
                          <option value="Branding">Branding</option>
                          <option value="Sosmed/CC">Sosmed/CC</option>
                          <option value="Production">Production</option>
                          <option value="Design">Design</option>
                          <option value="Talent KOL">Talent KOL</option>
                          <option value="Ads Spend">Ads Spend</option>
                          <option value="Web Dev">Web Dev</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center text-xs">
                      <div className="w-20">
                        <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Qty</label>
                        <input 
                          required
                          type="number" 
                          min="1"
                          placeholder="Qty" 
                          className="w-full border rounded-lg p-1.5 text-xs bg-white text-center focus:outline-none focus:border-red-500 font-bold"
                          value={item.quantity}
                          onChange={e => handleUpdateLineItem(idx, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Harga Satuan (Rp)</label>
                        <input 
                          required
                          type="number" 
                          placeholder="Harga Satuan" 
                          className="w-full border rounded-lg p-1.5 text-xs bg-white text-right focus:outline-none focus:border-red-500 font-semibold"
                          value={item.unitPrice || ''}
                          onChange={e => handleUpdateLineItem(idx, 'unitPrice', Number(e.target.value))}
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Diskon (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          placeholder="0%" 
                          className="w-full border rounded-lg p-1.5 text-xs bg-white text-center focus:outline-none focus:border-red-500 font-bold text-red-600"
                          value={item.discountPct || ''}
                          onChange={e => handleUpdateLineItem(idx, 'discountPct', Number(e.target.value))}
                        />
                      </div>
                      <div className="w-32 text-right">
                        <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Subtotal</label>
                        <p className="text-xs font-bold text-gray-800 pt-1">
                          {formatCurrency((item.quantity * item.unitPrice) * (1 - ((item.discountPct || 0) / 100)))}
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveLineItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1.5 mt-4"
                        title="Hapus baris"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Catatan Tambahan (Syarat &amp; Ketentuan)</label>
                <textarea 
                  rows={3} 
                  placeholder="Metode pembayaran, jadwal pengerjaan, dll..." 
                  className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-red-500 bg-gray-50" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* LIVE PREVIEW DOCUMENT */}
            <div className="card p-8 bg-white shadow-lg space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase border-b pb-2 tracking-wider">Live Preview Dokumen</h3>
              
              <div className="border border-gray-100 p-6 rounded-lg shadow-sm bg-white min-h-[500px] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start border-b pb-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-black text-gray-800 tracking-tight">QUOTATION</h1>
                      <p className="text-xs text-gray-400 font-bold uppercase mt-1">Draft QTO-2026-06-XXX</p>
                      <p className="text-[10px] text-gray-400 mt-1">Tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-base font-bold text-red-600">Bertumbuh Agency</h2>
                      <p className="text-[10px] text-gray-500">Jl. Teknologi No. 88, Jakarta</p>
                      <p className="text-[10px] text-gray-500">finance@bertumbuh.id</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tujuan Penawaran:</p>
                    <p className="text-sm font-bold text-gray-800">{clients.find(c => c.id === clientId)?.name || 'Nama Klien'}</p>
                    <p className="text-xs text-gray-500">Klien ERP Bertumbuh</p>
                  </div>

                  <table className="w-full text-left border-collapse text-xs mb-6">
                    <thead>
                      <tr className="bg-gray-50 border-b border-t font-semibold text-gray-600">
                        <th className="py-2 px-1">Deskripsi Scope Layanan</th>
                        <th className="py-2 px-1 text-center w-24">Kategori</th>
                        <th className="py-2 px-1 text-center w-12">Qty</th>
                        <th className="py-2 px-1 text-right w-24">Harga Satuan</th>
                        <th className="py-2 px-1 text-center w-16">Diskon</th>
                        <th className="py-2 px-1 text-right w-28">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item) => {
                        const itemGross = item.quantity * item.unitPrice;
                        const itemDisc = itemGross * ((item.discountPct || 0) / 100);
                        const itemNet = itemGross - itemDisc;
                        return (
                          <tr key={item.id} className="border-b">
                            <td className="py-2.5 px-1 text-gray-800 font-semibold">{item.description || '(Belum diisi)'}</td>
                            <td className="py-2.5 px-1 text-center">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{item.category || 'General'}</span>
                            </td>
                            <td className="py-2.5 px-1 text-center text-gray-700 font-bold">{item.quantity}</td>
                            <td className="py-2.5 px-1 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-2.5 px-1 text-center text-red-600 font-semibold">{item.discountPct ? `${item.discountPct}%` : '-'}</td>
                            <td className="py-2.5 px-1 text-right font-bold text-gray-800">{formatCurrency(itemNet)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="flex justify-end mb-6">
                    <div className="w-56 text-xs space-y-1.5 border-t pt-2">
                      {totalDiscountVal > 0 && (
                        <div className="flex justify-between text-red-600 font-medium">
                          <span>Total Diskon</span>
                          <span>-{formatCurrency(totalDiscountVal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>Subtotal Bersih</span>
                        <span>{formatCurrency(subtotalVal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>PPN (11%)</span>
                        <span>{formatCurrency(taxVal)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 text-sm border-t pt-2 mt-1">
                        <span>Total Penawaran</span>
                        <span className="text-red-600 font-black">{formatCurrency(grandTotalVal)}</span>
                      </div>
                    </div>
                  </div>

                  {notes && (
                    <div className="border-t pt-2 mt-4 text-[10px] text-gray-500">
                      <p className="font-bold uppercase mb-0.5">Syarat &amp; Ketentuan:</p>
                      <p className="whitespace-pre-wrap italic">{notes}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          VIEW 3: DOCUMENT PREVIEW & PRINT
      ──────────────────────────────────────────────────────── */}
      {view === 'view' && selectedQuotation && (
        <div className="fade-in">
          {/* Header Controls (Hides when printing) */}
          <div className="flex items-center justify-between mb-6 no-print">
            <button 
              onClick={() => setView('list')}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} /> Kembali ke Daftar
            </button>
            <div className="flex gap-2">
              {selectedQuotation.status !== 'approved' && (
                <button 
                  onClick={() => {
                    handleConvertQuotation(selectedQuotation.id, selectedQuotation.quotationNumber);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap size={15} /> Konversi ke Deal Won &amp; Proyek PM Active
                </button>
              )}
              {selectedQuotation.status === 'draft' && (
                <button 
                  onClick={() => {
                    updateQuotation(selectedQuotation.id, { status: 'sent' });
                    setSelectedQuotation({ ...selectedQuotation, status: 'sent' });
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-1"
                >
                  <Check size={14} /> Tandai Terkirim
                </button>
              )}
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Printer size={15} /> Cetak / Export PDF
              </button>
            </div>
          </div>

          {/* Printable Official Document Canvas */}
          <div className="max-w-4xl mx-auto card p-10 bg-white shadow-md print-only">
            <div className="flex justify-between items-start mb-10 border-b pb-8">
              <div>
                <h1 className="text-3xl font-black text-gray-800 mb-2">QUOTATION</h1>
                <p className="text-sm font-bold text-gray-600">{selectedQuotation.quotationNumber}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Tanggal: {new Date(selectedQuotation.issueDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                </p>
                <p className="text-xs text-gray-400">
                  Masa Berlaku: {selectedQuotation.validityDays} Hari
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-red-600 mb-1">Bertumbuh Agency</h2>
                <p className="text-sm text-gray-600">Jl. Teknologi No. 88, Jakarta</p>
                <p className="text-sm text-gray-600">finance@bertumbuh.id</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Tujuan Penawaran:</p>
              <h3 className="text-base font-bold text-gray-800">{selectedQuotation.clientName}</h3>
              <p className="text-xs text-gray-500">Mitra Bisnis Bertumbuh ERP</p>
            </div>

            <table className="w-full text-left border-collapse mb-8 text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-t text-gray-700">
                  <th className="py-2.5 px-4 font-semibold">Deskripsi Layanan / Scope of Work</th>
                  <th className="py-2.5 px-4 font-semibold text-center w-16">Qty</th>
                  <th className="py-2.5 px-4 font-semibold text-right w-32">Harga Satuan</th>
                  <th className="py-2.5 px-4 font-semibold text-right w-36">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedQuotation.lineItems.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-800">{item.description}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-800">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-72">
                <div className="flex justify-between py-1 text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedQuotation.subtotal)}</span>
                </div>
                <div className="flex justify-between py-1 text-sm text-gray-600">
                  <span>PPN (11%)</span>
                  <span>{formatCurrency(selectedQuotation.tax)}</span>
                </div>
                <div className="flex justify-between py-2 mt-2 border-t-2 text-base font-bold text-gray-800">
                  <span>Total Grand</span>
                  <span className="text-red-600">{formatCurrency(selectedQuotation.total)}</span>
                </div>
              </div>
            </div>

            {selectedQuotation.notes && (
              <div className="border-t pt-4 text-xs text-gray-500">
                <p className="font-bold uppercase mb-1">Syarat &amp; Ketentuan:</p>
                <p className="whitespace-pre-wrap italic bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedQuotation.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          MODAL COMPARISON QUOTATION TIERS (Item 2.3)
      ──────────────────────────────────────────────────────── */}
      {isCompareModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 space-y-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <Layers className="text-purple-600" size={20} />
                <div>
                  <h3 className="text-base font-bold text-gray-900">Perbandingan Opsi Tier Quotation</h3>
                  <p className="text-xs text-gray-500">Bandingkan rincian scope, harga, dan diskon beberapa pilihan penawaran klien</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {quotations
                .filter(q => compareIds.includes(q.id))
                .map((q, idx) => (
                  <div key={q.id} className="border border-purple-200 rounded-xl p-4 bg-purple-50/30 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">
                          Opsi {idx + 1}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                          q.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {q.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">{q.quotationNumber}</h4>
                      <p className="text-xs font-semibold text-gray-600">{q.clientName}</p>

                      <div className="my-3 border-t border-b border-purple-100 py-2 space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Lingkup Pekerjaan ({q.lineItems.length} Items):</p>
                        <ul className="text-xs space-y-1 text-gray-700 font-medium">
                          {q.lineItems.map(item => (
                            <li key={item.id} className="flex justify-between">
                              <span>• {item.description}</span>
                              <span className="font-bold text-gray-900">{formatCurrency(item.quantity * item.unitPrice)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-right space-y-0.5">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Nilai Penawaran:</p>
                        <p className="text-lg font-black text-purple-900">{formatCurrency(q.total)}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCompareModalOpen(false);
                        handleConvertQuotation(q.id, q.quotationNumber);
                      }}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Zap size={14} /> Pilih &amp; Konversi Tier Ini ↗
                    </button>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Tutup Perbandingan
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
