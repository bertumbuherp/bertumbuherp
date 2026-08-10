'use client';
import React, { useState, useMemo } from 'react';
import { useFinanceStore, JournalEntry } from '@/lib/store/financeStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BookOpen, Calendar, Search, Filter, Printer, ArrowDownRight, ArrowUpRight, XCircle, FileText } from 'lucide-react';
import { createPortal } from 'react-dom';

export function GeneralLedgerView() {
  const { journal, coaList } = useFinanceStore();
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>('1.1.1.1.2.0'); // Default Bank PT Bertumbuh
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo] = useState('2026-06-30');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const selectedAccount = useMemo(() => {
    return coaList.find(c => c.code === selectedAccountCode) || {
      code: selectedAccountCode,
      name: 'Bank Mandiri - PT Bertumbuh',
      category: 'Asset',
      normalBalance: 'debit'
    };
  }, [coaList, selectedAccountCode]);

  // Compute transactions and running balance
  const ledgerData = useMemo(() => {
    const accountEntries = journal.filter(j => {
      const matchAccount = j.accountCode === selectedAccountCode || 
                           j.accountName === selectedAccount.name ||
                           j.account === selectedAccount.name;
      const matchDate = (!dateFrom || j.date >= dateFrom) && (!dateTo || j.date <= dateTo);
      const matchSearch = !searchQuery || j.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchAccount && matchDate && matchSearch;
    }).sort((a, b) => a.date.localeCompare(b.date));

    let runningBalance = 0;
    const rows = accountEntries.map(entry => {
      const isDebit = entry.type === 'debit';
      const debitVal = isDebit ? entry.amount : 0;
      const creditVal = !isDebit ? entry.amount : 0;

      if (selectedAccount.normalBalance === 'debit') {
        runningBalance += (debitVal - creditVal);
      } else {
        runningBalance += (creditVal - debitVal);
      }

      return {
        ...entry,
        debitVal,
        creditVal,
        runningBalance
      };
    });

    const totalDebit = rows.reduce((s, r) => s + r.debitVal, 0);
    const totalCredit = rows.reduce((s, r) => s + r.creditVal, 0);

    return { rows, totalDebit, totalCredit, endingBalance: runningBalance };
  }, [journal, selectedAccountCode, selectedAccount, dateFrom, dateTo, searchQuery]);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Modul Buku Besar per Akun (General Ledger)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Inspeksi Mutasi Debet, Kredit &amp; Saldo Berjalan (Running Balance) Spesifik per Akun COA
          </p>
        </div>
        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shrink-0 shadow-md"
        >
          <Printer size={14} /> Cetak Buku Besar PDF
        </button>
      </div>

      {/* Account Selector & Filters */}
      <div className="card p-4 space-y-4 no-print">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Akun Buku Besar (COA)</label>
            <select
              value={selectedAccountCode}
              onChange={(e) => setSelectedAccountCode(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-800 bg-white focus:outline-none focus:border-emerald-500"
            >
              {coaList.map(coa => (
                <option key={coa.code} value={coa.code}>
                  [{coa.code}] {coa.name} ({coa.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Periode Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari transaksi dalam buku besar ini..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {selectedAccount.category}
            </span>
            <span className="text-xs text-gray-300 font-mono">CODE: {selectedAccount.code}</span>
          </div>
          <h3 className="text-xl font-black mt-1">{selectedAccount.name}</h3>
          <p className="text-xs text-emerald-300/80 mt-0.5">Normal Balance: {selectedAccount.normalBalance.toUpperCase()}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-300 uppercase font-bold block">SALDO AKHIR BERJALAN</span>
          <span className="text-2xl font-black text-emerald-400">
            {formatCurrency(ledgerData.endingBalance)}
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Deskripsi Transaksi</th>
              <th className="py-3 px-4 text-right">Debet (Rp)</th>
              <th className="py-3 px-4 text-right">Kredit (Rp)</th>
              <th className="py-3 px-4 text-right">Saldo Berjalan (Rp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {ledgerData.rows.map(row => (
              <tr key={row.id} className={`hover:bg-gray-50/70 transition-colors ${row.isVoided ? 'line-through text-gray-400 opacity-60' : ''}`}>
                <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">{row.date}</td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-gray-900">{row.description}</p>
                  {row.referenceId && <p className="text-[10px] text-gray-400 font-mono">Ref: {row.referenceId}</p>}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                  {row.debitVal > 0 ? formatCurrency(row.debitVal) : '-'}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-rose-700">
                  {row.creditVal > 0 ? formatCurrency(row.creditVal) : '-'}
                </td>
                <td className="py-3 px-4 text-right font-black text-gray-900">
                  {formatCurrency(row.runningBalance)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold text-gray-900">
            <tr>
              <td colSpan={2} className="py-3 px-4 text-xs">TOTAL MUTASI PERIODE INI ({ledgerData.rows.length} Transaksi)</td>
              <td className="py-3 px-4 text-right text-emerald-700 text-xs">{formatCurrency(ledgerData.totalDebit)}</td>
              <td className="py-3 px-4 text-right text-rose-700 text-xs">{formatCurrency(ledgerData.totalCredit)}</td>
              <td className="py-3 px-4 text-right text-emerald-800 text-sm font-black">{formatCurrency(ledgerData.endingBalance)}</td>
            </tr>
          </tfoot>
        </table>
        {ledgerData.rows.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-xs">
            Tidak ada transaksi tercatat untuk akun [{selectedAccount.code}] {selectedAccount.name} dalam periode ini.
          </div>
        )}
      </div>

      {/* PRINTABLE MODAL DOCUMENT (100% NON-BLANK GUARANTEED) */}
      {isPrintModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl space-y-4 text-gray-800 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3 no-print">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <FileText size={18} className="text-emerald-600" /> Pratinjau Cetak PDF Buku Besar
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5 font-bold shadow"
                >
                  <Printer size={14} /> Cetak / Export PDF
                </button>
                <button onClick={() => setIsPrintModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Printable Document Box */}
            <div className="border border-gray-200 rounded-xl p-6 space-y-6 bg-white text-gray-900">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">PT BERTUMBUH DIGITAL INDONESIA</h1>
                  <h2 className="text-sm font-bold text-emerald-800 uppercase mt-0.5">LAPORAN BUKU BESAR PER AKUN (GENERAL LEDGER)</h2>
                  <p className="text-xs text-gray-600 mt-1 font-mono">Periode: {dateFrom || 'Awal'} s/d {dateTo || 'Hari Ini'}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold text-gray-700 block">AKUN BUKU BESAR:</span>
                  <span className="font-black text-slate-900 text-sm block">{selectedAccount.name}</span>
                  <span className="font-mono text-gray-500 block">KODE: {selectedAccount.code} ({selectedAccount.category})</span>
                  <span className="text-emerald-700 font-bold block mt-0.5">Normal Balance: {selectedAccount.normalBalance.toUpperCase()}</span>
                </div>
              </div>

              {/* Document Table */}
              <table className="w-full text-left text-xs border-collapse border border-gray-300">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="py-2.5 px-3 border border-slate-800">Tanggal</th>
                    <th className="py-2.5 px-3 border border-slate-800">Deskripsi Transaksi</th>
                    <th className="py-2.5 px-3 text-right border border-slate-800">Debet (Rp)</th>
                    <th className="py-2.5 px-3 text-right border border-slate-800">Kredit (Rp)</th>
                    <th className="py-2.5 px-3 text-right border border-slate-800">Saldo Berjalan (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ledgerData.rows.map(row => (
                    <tr key={row.id} className={row.isVoided ? 'line-through text-gray-400' : ''}>
                      <td className="py-2.5 px-3 font-mono border border-gray-200">{row.date}</td>
                      <td className="py-2.5 px-3 border border-gray-200 font-medium">{row.description}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 border border-gray-200">
                        {row.debitVal > 0 ? formatCurrency(row.debitVal) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-700 border border-gray-200">
                        {row.creditVal > 0 ? formatCurrency(row.creditVal) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-gray-900 border border-gray-200">
                        {formatCurrency(row.runningBalance)}
                      </td>
                    </tr>
                  ))}
                  {ledgerData.rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400 border">Tidak ada transaksi tercatat untuk periode ini.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-100 font-bold border-t-2 border-slate-900">
                  <tr>
                    <td colSpan={2} className="py-3 px-3 text-xs border border-gray-300 font-black">TOTAL MUTASI &amp; SALDO AKHIR</td>
                    <td className="py-3 px-3 text-right text-emerald-800 text-xs border border-gray-300">{formatCurrency(ledgerData.totalDebit)}</td>
                    <td className="py-3 px-3 text-right text-rose-800 text-xs border border-gray-300">{formatCurrency(ledgerData.totalCredit)}</td>
                    <td className="py-3 px-3 text-right text-emerald-900 text-sm font-black border border-gray-300">{formatCurrency(ledgerData.endingBalance)}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Official Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 text-center text-xs">
                <div>
                  <p className="text-gray-500 text-[10px]">Dibuat oleh (Finance &amp; Accounting)</p>
                  <div className="h-12 flex items-center justify-center font-semibold text-gray-400 italic">Signed Digitally</div>
                  <p className="font-bold text-gray-900">Hadi Nugroho (Finance Manager)</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">Disetujui oleh Direksi</p>
                  <div className="h-12 flex items-center justify-center font-semibold text-gray-400 italic">Signed Digitally</div>
                  <p className="font-bold text-gray-900">Board of Directors (BOD)</p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

