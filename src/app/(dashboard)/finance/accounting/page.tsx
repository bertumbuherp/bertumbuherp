'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import TransactionInput from '@/components/finance/TransactionInput';
import TrialBalance from '@/components/finance/TrialBalance';
import ProfitLossReport from '@/components/finance/ProfitLossReport';
import BalanceSheet from '@/components/finance/BalanceSheet';
import CashLedger from '@/components/finance/CashLedger';
import EquityReport from '@/components/finance/EquityReport';
import { COAManagementView } from '@/components/finance/COAManagementView';
import { GeneralLedgerView } from '@/components/finance/GeneralLedgerView';
import { BODFinancialReportView } from '@/components/finance/BODFinancialReportView';
import { ClientRevenueReportView } from '@/components/finance/ClientRevenueReportView';
import { CashFlowStatementView } from '@/components/finance/CashFlowStatementView';
import { MultiPeriodReportView } from '@/components/finance/MultiPeriodReportView';

const tabs = [
  { key: 'input', label: 'Input Jurnal & Simulasi' },
  { key: 'coa', label: 'Master COA' },
  { key: 'buku_besar', label: 'Buku Besar per Akun' },
  { key: 'client_revenue', label: 'Revenue Klien' },
  { key: 'cash_flow', label: 'Arus Kas (3 Aktivitas)' },
  { key: 'multi_period', label: 'Reporting Multi-Periode' },
  { key: 'bod_report', label: 'Laporan BOD' },
  { key: 'neraca_saldo', label: 'Neraca Saldo' },
  { key: 'laba_rugi', label: 'Laporan L/R' },
  { key: 'posisi_keuangan', label: 'Neraca' },
  { key: 'modal', label: 'Perubahan Modal' },
];

function FinanceAccountingContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'input';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'input':
        return <TransactionInput />;
      case 'coa':
        return <COAManagementView />;
      case 'buku_besar':
        return <GeneralLedgerView />;
      case 'client_revenue':
        return <ClientRevenueReportView />;
      case 'cash_flow':
        return <CashFlowStatementView />;
      case 'multi_period':
        return <MultiPeriodReportView />;
      case 'bod_report':
        return <BODFinancialReportView />;
      case 'neraca_saldo':
        return <TrialBalance />;
      case 'laba_rugi':
        return <ProfitLossReport />;
      case 'posisi_keuangan':
        return <BalanceSheet />;
      case 'modal':
        return <EquityReport />;
      default:
        return <TransactionInput />;
    }
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Accounting &amp; Buku Besar" subtitle="Finance" />
      <div className="max-w-7xl mx-auto w-full p-6 flex-1">
        <nav className="flex space-x-4 mb-6 overflow-x-auto" aria-label="Accounting tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={`/finance/accounting?tab=${tab.key}`}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <section className="bg-white rounded-lg shadow p-6 min-h-[60vh]">
          {renderTabContent()}
        </section>
      </div>
    </div>
  );
}

export default function FinanceAccounting() {
  return (
    <Suspense fallback={
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header title="Accounting &amp; Buku Besar" subtitle="Finance" />
        <div className="max-w-7xl mx-auto w-full p-6 flex-1 text-center py-12 text-gray-500">
          Memuat Akuntansi...
        </div>
      </div>
    }>
      <FinanceAccountingContent />
    </Suspense>
  );
}
