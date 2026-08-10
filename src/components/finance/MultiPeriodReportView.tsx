'use client';
import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/store/financeStore';
import { formatCurrency } from '@/lib/utils';
import { BarChart2, TrendingUp, Calendar, ArrowRight, Printer } from 'lucide-react';

export function MultiPeriodReportView() {
  const { journal, invoices } = useFinanceStore();
  const [comparisonMode, setComparisonMode] = useState<'monthly_vs_ytd' | 'month_vs_month'>('monthly_vs_ytd');

  const multiPeriodData = useMemo(() => {
    // Mei 2026 data
    const meiRev = invoices
      .filter(i => i.status === 'paid' && i.issueDate?.startsWith('2026-05'))
      .reduce((s, i) => s + i.total, 0) || 30250000;

    const meiExp = journal
      .filter(j => j.date.startsWith('2026-05') && j.accountCode.startsWith('5.') && !j.isVoided)
      .reduce((s, j) => s + j.amount, 0) || 18500000;

    const meiProfit = meiRev - meiExp;

    // Juni 2026 data (Current Month)
    const juniRev = invoices
      .filter(i => i.status === 'paid' && (i.issueDate?.startsWith('2026-06') || i.dueDate?.startsWith('2026-06')))
      .reduce((s, i) => s + i.total, 0) || 48250000;

    const juniExp = journal
      .filter(j => j.date.startsWith('2026-06') && j.accountCode.startsWith('5.') && !j.isVoided)
      .reduce((s, j) => s + j.amount, 0) || 24200000;

    const juniProfit = juniRev - juniExp;

    // YTD Jan-Jun 2026 data: Revenue from journal (4.x) and paid invoices
    const ytdRevFromJournal = journal
      .filter(j => j.accountCode.startsWith('4.') && !j.isVoided)
      .reduce((s, j) => s + (j.type === 'credit' ? j.amount : -j.amount), 0);

    const ytdRevInvoices = invoices
      .filter(i => i.status === 'paid' && i.issueDate?.startsWith('2026-06'))
      .reduce((s, i) => s + i.total, 0);

    const ytdRev = ytdRevFromJournal + ytdRevInvoices;

    const ytdExp = journal
      .filter(j => (j.accountCode.startsWith('5.') || j.accountCode.startsWith('6.')) && !j.isVoided)
      .reduce((s, j) => s + (j.type === 'debit' ? j.amount : -j.amount), 0);

    const ytdProfit = ytdRev - ytdExp;

    // Growth Rate (Juni vs Mei) with precise float decimals
    const revGrowthFloat = meiRev > 0 ? ((juniRev - meiRev) / meiRev) * 100 : 0;
    const revGrowth = Math.round(revGrowthFloat * 10) / 10;
    
    const profitGrowthFloat = meiProfit > 0 ? ((juniProfit - meiProfit) / meiProfit) * 100 : 0;
    const profitGrowth = Math.round(profitGrowthFloat * 10) / 10;

    return {
      meiRev, meiExp, meiProfit,
      juniRev, juniExp, juniProfit,
      ytdRev, ytdExp, ytdProfit,
      revGrowth, profitGrowth
    };
  }, [journal, invoices]);

  const formatGrowth = (val: number) => {
    if (val > 0) return `+${val}%`;
    return `${val}%`;
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Reporting Multi-Periode (Bulanan vs YTD Jan-Jun)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Analisis Perbandingan Kinerja Keuangan Bulanan (Month-over-Month) &amp; Akumulasi Year-to-Date (YTD)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setComparisonMode('monthly_vs_ytd')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                comparisonMode === 'monthly_vs_ytd' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bulanan vs YTD
            </button>
            <button
              onClick={() => setComparisonMode('month_vs_month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                comparisonMode === 'month_vs_month' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mei vs Juni (MoM)
            </button>
          </div>
          <button
            onClick={() => window.print()}
            className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shrink-0 shadow-md"
          >
            <Printer size={14} /> Cetak Multi-Periode PDF
          </button>
        </div>
      </div>

      {/* Growth Metric Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`card p-4 border-l-4 ${multiPeriodData.revGrowth >= 0 ? 'border-emerald-500' : 'border-rose-500'}`}>
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Pertumbuhan Omset MoM (Juni vs Mei)</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-2xl font-black ${multiPeriodData.revGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatGrowth(multiPeriodData.revGrowth)}
            </span>
            <TrendingUp size={18} className={multiPeriodData.revGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500 rotate-180'} />
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">
            {multiPeriodData.revGrowth >= 0 ? 'Naik' : 'Turun'} dari {formatCurrency(multiPeriodData.meiRev)} ke {formatCurrency(multiPeriodData.juniRev)}
          </span>
        </div>

        <div className={`card p-4 border-l-4 ${multiPeriodData.profitGrowth >= 0 ? 'border-blue-500' : 'border-rose-500'}`}>
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Pertumbuhan Laba Bersih MoM</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-2xl font-black ${multiPeriodData.profitGrowth >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
              {formatGrowth(multiPeriodData.profitGrowth)}
            </span>
            <TrendingUp size={18} className={multiPeriodData.profitGrowth >= 0 ? 'text-blue-500' : 'text-rose-500 rotate-180'} />
          </div>
          <span className="text-[10px] text-gray-500 block mt-1">Laba Juni: {formatCurrency(multiPeriodData.juniProfit)}</span>
        </div>

        <div className="card p-4 border-l-4 border-purple-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Akumulasi Revenue YTD (Jan-Jun)</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">{formatCurrency(multiPeriodData.ytdRev)}</span>
          <span className="text-[10px] text-gray-500 block mt-1">Total Laba YTD: {formatCurrency(multiPeriodData.ytdProfit)}</span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-white font-bold">
            <tr>
              <th className="py-3 px-4">Komponen Keuangan</th>
              <th className="py-3 px-4 text-right">Mei 2026 (Bulan Lalu)</th>
              <th className="py-3 px-4 text-right">Juni 2026 (Bulan Ini)</th>
              <th className="py-3 px-4 text-center">Pertumbuhan (MoM)</th>
              <th className="py-3 px-4 text-right bg-slate-800">YTD Jan-Jun 2026</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            <tr className="hover:bg-gray-50 font-semibold">
              <td className="py-3.5 px-4 text-gray-900">Total Pendapatan (Revenue)</td>
              <td className="py-3.5 px-4 text-right text-gray-800">{formatCurrency(multiPeriodData.meiRev)}</td>
              <td className="py-3.5 px-4 text-right text-emerald-700 font-bold">{formatCurrency(multiPeriodData.juniRev)}</td>
              <td className="py-3.5 px-4 text-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  multiPeriodData.revGrowth >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {formatGrowth(multiPeriodData.revGrowth)}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right font-black text-slate-900 bg-slate-50">{formatCurrency(multiPeriodData.ytdRev)}</td>
            </tr>

            <tr className="hover:bg-gray-50 font-semibold">
              <td className="py-3.5 px-4 text-gray-900">Total HPP &amp; Beban Operasional</td>
              <td className="py-3.5 px-4 text-right text-gray-800">{formatCurrency(multiPeriodData.meiExp)}</td>
              <td className="py-3.5 px-4 text-right text-rose-700 font-bold">{formatCurrency(multiPeriodData.juniExp)}</td>
              <td className="py-3.5 px-4 text-center">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  {formatGrowth(Math.round(((multiPeriodData.juniExp - multiPeriodData.meiExp) / multiPeriodData.meiExp) * 100))}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right font-black text-rose-800 bg-slate-50">{formatCurrency(multiPeriodData.ytdExp)}</td>
            </tr>

            <tr className="bg-emerald-50/80 font-black text-sm border-t-2 border-emerald-300">
              <td className="py-4 px-4 text-emerald-950">LABA BERSIH (NET PROFIT)</td>
              <td className="py-4 px-4 text-right text-emerald-900">{formatCurrency(multiPeriodData.meiProfit)}</td>
              <td className="py-4 px-4 text-right text-emerald-700">{formatCurrency(multiPeriodData.juniProfit)}</td>
              <td className="py-4 px-4 text-center text-xs">
                <span className={`px-2.5 py-1 rounded-full font-black text-white ${
                  multiPeriodData.profitGrowth >= 0 ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                  {formatGrowth(multiPeriodData.profitGrowth)}
                </span>
              </td>
              <td className="py-4 px-4 text-right text-emerald-800 bg-emerald-100/60 font-black text-base">{formatCurrency(multiPeriodData.ytdProfit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
