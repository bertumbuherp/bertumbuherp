'use client';
import React, { useMemo } from 'react';
import { useFinanceStore } from '@/lib/store/financeStore';
import { formatCurrency } from '@/lib/utils';
import { Printer, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export function CashFlowStatementView() {
  const { journal, invoices, payrolls, reimbursements } = useFinanceStore();

  const cashFlowDetails = useMemo(() => {
    // 1. Aktivitas Operasional
    const clientReceipts = invoices
      .filter(i => i.status === 'paid')
      .reduce((s, i) => s + i.total, 0);

    const payrollDisbursements = payrolls
      .filter(p => p.status === 'paid')
      .reduce((s, p) => s + p.netPay, 0);

    const reimbursementDisbursements = reimbursements
      .filter(r => r.status === 'paid')
      .reduce((s, r) => s + r.amount, 0);

    const operationalSGAExp = journal
      .filter(j => j.accountCode.startsWith('6.') && !j.isVoided)
      .reduce((s, j) => s + j.amount, 0);

    const netOperationalCF = clientReceipts - (payrollDisbursements + reimbursementDisbursements + operationalSGAExp);

    // 2. Aktivitas Investasi
    const equipmentPurchaseExp = journal
      .filter(j => (j.accountCode === '1.2.1.1.0.0' || j.accountCode === '1.2.1.2.0.0') && !j.isVoided)
      .reduce((s, j) => s + j.amount, 0);

    const netInvestmentCF = -equipmentPurchaseExp;

    // 3. Aktivitas Pendanaan
    const equityInflows = journal
      .filter(j => j.accountCode === '3.1.0.0.0.0' && !j.isVoided)
      .reduce((s, j) => s + j.amount, 0);

    const dividendDraws = journal
      .filter(j => j.accountCode === '3.3.0.0.0.0' && !j.isVoided)
      .reduce((s, j) => s + j.amount, 0);

    const netFinancingCF = equityInflows - dividendDraws;

    const netCashIncrease = netOperationalCF + netInvestmentCF + netFinancingCF;
    const initialCashBalance = 28613780; // Saldo awal kas & bank
    const endingCashBalance = initialCashBalance + netCashIncrease;

    return {
      clientReceipts,
      payrollDisbursements,
      reimbursementDisbursements,
      operationalSGAExp,
      netOperationalCF,
      equipmentPurchaseExp,
      netInvestmentCF,
      equityInflows,
      dividendDraws,
      netFinancingCF,
      netCashIncrease,
      initialCashBalance,
      endingCashBalance
    };
  }, [journal, invoices, payrolls, reimbursements]);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Laporan Arus Kas 3 Aktivitas (Statement of Cash Flows)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Arus Kas dari Aktivitas Operasional, Aktivitas Investasi, &amp; Aktivitas Pendanaan
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shrink-0 shadow-md"
        >
          <Printer size={14} /> Cetak Laporan Arus Kas PDF
        </button>
      </div>

      {/* Cash Flow Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-emerald-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">1. Net Arus Kas Operasional</span>
          <span className="text-xl font-black text-emerald-700">{formatCurrency(cashFlowDetails.netOperationalCF)}</span>
          <span className="text-[10px] text-gray-500 block mt-1">Penerimaan Klien - Beban Operasional</span>
        </div>
        <div className="card p-4 border-l-4 border-blue-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">2. Net Arus Kas Investasi</span>
          <span className="text-xl font-black text-blue-700">{formatCurrency(cashFlowDetails.netInvestmentCF)}</span>
          <span className="text-[10px] text-gray-500 block mt-1">Pembelian Peralatan Produksi/Kantor</span>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">3. Saldo Kas &amp; Bank Akhir</span>
          <span className="text-xl font-black text-purple-700">{formatCurrency(cashFlowDetails.endingCashBalance)}</span>
          <span className="text-[10px] text-gray-500 block mt-1">Saldo Awal + Total Kenaikan Kas</span>
        </div>
      </div>

      {/* Main Cash Flow Statement Document */}
      <div className="card p-6 space-y-6 bg-white">
        <div className="border-b pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-900">BERTUMBUH CREATIVE</h3>
            <p className="text-xs text-gray-500 font-bold">LAPORAN ARUS KAS (CASH FLOW STATEMENT)</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-700">
            Periode Berjalan 2026
          </span>
        </div>

        <div className="space-y-6 text-xs">
          {/* Section 1: Operasional */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-emerald-800 border-b pb-1">
              I. ARUS KAS DARI AKTIVITAS OPERASIONAL
            </h4>
            <div className="pl-3 space-y-1">
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Penerimaan Kas dari Pelunasan Invoice Klien (+)</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(cashFlowDetails.clientReceipts)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Pembayaran Gaji Karyawan Full-Time &amp; Freelance (-)</span>
                <span className="font-semibold text-rose-700">-{formatCurrency(cashFlowDetails.payrollDisbursements)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Pembayaran Reimbursement Tim (-)</span>
                <span className="font-semibold text-rose-700">-{formatCurrency(cashFlowDetails.reimbursementDisbursements)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Pembayaran Beban Operasional SGA (-)</span>
                <span className="font-semibold text-rose-700">-{formatCurrency(cashFlowDetails.operationalSGAExp)}</span>
              </div>
            </div>
            <div className="flex justify-between p-2 bg-emerald-50 rounded-lg font-bold text-emerald-900 mt-1">
              <span>Arus Kas Bersih dari Aktivitas Operasional</span>
              <span>{formatCurrency(cashFlowDetails.netOperationalCF)}</span>
            </div>
          </div>

          {/* Section 2: Investasi */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-blue-800 border-b pb-1">
              II. ARUS KAS DARI AKTIVITAS INVESTASI
            </h4>
            <div className="pl-3 space-y-1">
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Pembelian Peralatan Produksi &amp; Aset Kantor (-)</span>
                <span className="font-semibold text-rose-700">-{formatCurrency(cashFlowDetails.equipmentPurchaseExp)}</span>
              </div>
            </div>
            <div className="flex justify-between p-2 bg-blue-50 rounded-lg font-bold text-blue-900 mt-1">
              <span>Arus Kas Bersih dari Aktivitas Investasi</span>
              <span>{formatCurrency(cashFlowDetails.netInvestmentCF)}</span>
            </div>
          </div>

          {/* Section 3: Pendanaan */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-purple-800 border-b pb-1">
              III. ARUS KAS DARI AKTIVITAS PENDANAAN
            </h4>
            <div className="pl-3 space-y-1">
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Penerimaan Setoran Modal Saham (+)</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(cashFlowDetails.equityInflows)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Pembayaran Dividen / Prive Pemilik (-)</span>
                <span className="font-semibold text-rose-700">-{formatCurrency(cashFlowDetails.dividendDraws)}</span>
              </div>
            </div>
            <div className="flex justify-between p-2 bg-purple-50 rounded-lg font-bold text-purple-900 mt-1">
              <span>Arus Kas Bersih dari Aktivitas Pendanaan</span>
              <span>{formatCurrency(cashFlowDetails.netFinancingCF)}</span>
            </div>
          </div>

          {/* Summary Balance */}
          <div className="border-t-2 border-slate-900 pt-4 space-y-2">
            <div className="flex justify-between font-bold text-sm text-slate-800">
              <span>KENAIKAN (PENURUNAN) BERSIH KAS &amp; BANK</span>
              <span className={cashFlowDetails.netCashIncrease >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                {formatCurrency(cashFlowDetails.netCashIncrease)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>SALDO KAS &amp; BANK AWAL PERIODE</span>
              <span>{formatCurrency(cashFlowDetails.initialCashBalance)}</span>
            </div>
            <div className="flex justify-between font-black text-base text-slate-900 p-3 bg-slate-100 rounded-xl border border-slate-300">
              <span>SALDO KAS &amp; BANK AKHIR PERIODE</span>
              <span className="text-emerald-700">{formatCurrency(cashFlowDetails.endingCashBalance)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
