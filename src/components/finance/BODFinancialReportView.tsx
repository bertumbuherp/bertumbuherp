'use client';
import React, { useState } from 'react';
import { useFinanceStore } from '@/lib/store/financeStore';
import { formatCurrency } from '@/lib/utils';
import { Printer, ShieldCheck, TrendingUp, DollarSign, FileSpreadsheet, Building2, Calendar } from 'lucide-react';

export function BODFinancialReportView() {
  const { journal, invoices, payrolls, reimbursements } = useFinanceStore();
  const [reportPeriod, setReportPeriod] = useState<'Q2 2026' | 'H1 2026 (Jan-Jun)' | 'Mei 2026'>('H1 2026 (Jan-Jun)');

  // Calculations for BOD
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const totalRetainerRev = paidInvoices.reduce((s, i) => {
    const retainerItems = i.lineItems?.filter(l => l.type === 'retainer' || l.type === 'service') || [];
    return s + (retainerItems.length > 0 ? retainerItems.reduce((ss, li) => ss + li.total, 0) : i.total);
  }, 0);

  const totalAdsRev = paidInvoices.reduce((s, i) => {
    const adsItems = i.lineItems?.filter(l => l.type === 'ads_spend') || [];
    return s + adsItems.reduce((ss, li) => ss + li.total, 0);
  }, 0);

  const totalAddonRev = paidInvoices.reduce((s, i) => {
    const addonItems = i.lineItems?.filter(l => l.type === 'addon_kol') || [];
    return s + addonItems.reduce((ss, li) => ss + li.total, 0);
  }, 0);

  const totalRevenue = totalRetainerRev + totalAdsRev + totalAddonRev;

  // Expenses from Journal
  const totalPayrollExp = journal
    .filter(j => j.accountCode === '5.1.1.0.0.0' || j.accountCode === '5.1.2.0.0.0')
    .reduce((s, j) => s + j.amount, 0);

  const totalAdsExp = journal
    .filter(j => j.accountCode === '5.1.13.0.0.0' || j.accountCode === '5.1.12.0.0.0')
    .reduce((s, j) => s + j.amount, 0);

  const totalSGAExp = journal
    .filter(j => j.accountCode.startsWith('6.'))
    .reduce((s, j) => s + j.amount, 0);

  const totalExpenses = totalPayrollExp + totalAdsExp + totalSGAExp;
  const netProfit = totalRevenue - totalExpenses;
  const grossMarginPct = totalRevenue > 0 ? Math.round(((totalRevenue - (totalPayrollExp + totalAdsExp)) / totalRevenue) * 100) : 0;
  const netMarginPct = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Ekspor Laporan Keuangan PDF untuk BOD (Board of Directors)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Laporan Eksekutif Performa Financial, Profitabilitas, &amp; Struktur Beban Perusahaan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={reportPeriod}
            onChange={e => setReportPeriod(e.target.value as any)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 bg-white"
          >
            <option value="Mei 2026">Periode Mei 2026</option>
            <option value="Q2 2026">Periode Triwulan II (Q2 2026)</option>
            <option value="H1 2026 (Jan-Jun)">Periode Semester I (H1 2026)</option>
          </select>
          <button
            onClick={() => window.print()}
            className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shrink-0 shadow-md"
          >
            <Printer size={14} /> Cetak Laporan BOD PDF
          </button>
        </div>
      </div>

      {/* BOD Print-Ready Executive Report Card */}
      <div className="card p-8 space-y-6 bg-white border border-gray-200 shadow-xl rounded-2xl">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
              B
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">PT BERTUMBUH DIGITAL INDONESIA</h1>
              <p className="text-xs text-gray-500">Agency Executive Financial Report for Board of Directors</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-300">
              {reportPeriod}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Omset (Revenue)</span>
            <span className="text-xl font-black text-slate-900">{formatCurrency(totalRevenue)}</span>
            <span className="text-[10px] text-emerald-600 block font-semibold mt-1">✓ 100% Invoiced &amp; Paid</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Beban Usaha</span>
            <span className="text-xl font-black text-rose-700">{formatCurrency(totalExpenses)}</span>
            <span className="text-[10px] text-gray-500 block font-semibold mt-1">HPP &amp; Operational SGA</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Laba Bersih (Net Profit)</span>
            <span className="text-xl font-black text-emerald-700">{formatCurrency(netProfit)}</span>
            <span className="text-[10px] text-emerald-800 block font-bold mt-1">Net Margin: {netMarginPct}%</span>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">Gross Margin Rate</span>
            <span className="text-xl font-black text-blue-700">{grossMarginPct}%</span>
            <span className="text-[10px] text-blue-800 block font-semibold mt-1">Target BOD: &gt;40%</span>
          </div>
        </div>

        {/* Detailed Breakdown Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Stream Breakdown */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center justify-between">
              <span>1. RINCIAN PENDAPATAN (REVENUE STREAM)</span>
              <span className="text-xs text-emerald-600 font-mono">{formatCurrency(totalRevenue)}</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Pendapatan Jasa Retainer &amp; Project</span>
                <span className="font-bold text-gray-900">{formatCurrency(totalRetainerRev)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Pendapatan Performance Ads Spend</span>
                <span className="font-bold text-gray-900">{formatCurrency(totalAdsRev)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Pendapatan Add-on KOL Talent &amp; Vendor</span>
                <span className="font-bold text-gray-900">{formatCurrency(totalAddonRev)}</span>
              </div>
            </div>
          </div>

          {/* Expense Structure Breakdown */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center justify-between">
              <span>2. STRUKTUR BEBAN USAHA (EXPENSE STRUCTURE)</span>
              <span className="text-xs text-rose-600 font-mono">{formatCurrency(totalExpenses)}</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Beban Gaji Tim Full-Time &amp; Freelance</span>
                <span className="font-bold text-gray-900">{formatCurrency(totalPayrollExp)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Beban Belanja Iklan Ads Klien &amp; Internal</span>
                <span className="font-bold text-gray-900">{formatCurrency(totalAdsExp)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">Beban Operasional SGA, Alat &amp; Adm</span>
                <span className="font-bold text-gray-900">{formatCurrency(totalSGAExp)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOD Catatan Direksi */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
          <p className="font-bold text-slate-900 uppercase">3. REKOMENDASI STRATEGIS UNTUK BOARD OF DIRECTORS (BOD)</p>
          <ul className="list-disc pl-4 space-y-1 text-gray-700">
            <li>Kinerja profitabilitas perusahaan pada periode {reportPeriod} berada pada tingkat sehat dengan Net Profit Margin <strong>{netMarginPct}%</strong>.</li>
            <li>Arus kas masuk dari pelunasan invoice berjalan lancar tanpa indikasi bad debt yang signifikan.</li>
            <li>Disarankan untuk meningkatkan alokasi reinvestasi pada teknologi AI &amp; kapasitas SDM produksi untuk menjaga margin di kuartal berikutnya.</li>
          </ul>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 text-center text-xs">
          <div>
            <p className="text-gray-400 text-[10px]">Dibuat oleh</p>
            <div className="h-12 flex items-center justify-center font-semibold text-gray-400 italic">Signed</div>
            <p className="font-bold text-slate-900">Hadi Nugroho</p>
            <p className="text-[10px] text-gray-500">Finance Manager</p>
          </div>
          <div>
            <p className="text-gray-400 text-[10px]">Ditinjau oleh</p>
            <div className="h-12 flex items-center justify-center font-semibold text-gray-400 italic">Signed</div>
            <p className="font-bold text-slate-900">Dewi Lestari</p>
            <p className="text-[10px] text-gray-500">Operations Lead / PM</p>
          </div>
          <div>
            <p className="text-gray-400 text-[10px]">Disetujui BOD</p>
            <div className="h-12 flex items-center justify-center font-semibold text-gray-400 italic">Signed</div>
            <p className="font-bold text-slate-900">Reza Pratama</p>
            <p className="text-[10px] text-gray-500">Chief Executive Officer (CEO)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
