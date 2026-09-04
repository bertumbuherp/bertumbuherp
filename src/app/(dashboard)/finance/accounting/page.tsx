'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { 
  FilePlus, 
  FolderTree, 
  BookOpen, 
  TrendingUp, 
  ArrowLeftRight, 
  BarChart3, 
  Award, 
  Scale, 
  PieChart, 
  Landmark, 
  Wallet 
} from 'lucide-react';
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
  { key: 'input', label: 'Input Jurnal & Simulasi', icon: FilePlus },
  { key: 'coa', label: 'Master COA', icon: FolderTree },
  { key: 'buku_besar', label: 'Buku Besar per Akun', icon: BookOpen },
  { key: 'client_revenue', label: 'Revenue Klien', icon: TrendingUp },
  { key: 'cash_flow', label: 'Arus Kas (3 Aktivitas)', icon: ArrowLeftRight },
  { key: 'multi_period', label: 'Reporting Multi-Periode', icon: BarChart3 },
  { key: 'bod_report', label: 'Laporan BOD', icon: Award },
  { key: 'neraca_saldo', label: 'Neraca Saldo', icon: Scale },
  { key: 'laba_rugi', label: 'Laporan L/R', icon: PieChart },
  { key: 'posisi_keuangan', label: 'Neraca (Posisi Keuangan)', icon: Landmark },
  { key: 'modal', label: 'Perubahan Modal', icon: Wallet },
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
        <nav 
          className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/80 shadow-sm mb-6 flex items-center gap-1.5 overflow-x-auto"
          aria-label="Accounting tabs"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/finance/accounting?tab=${tab.key}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/60 border border-transparent'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[65vh] fade-in">
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
