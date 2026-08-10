'use client';
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import { useSearchParams } from 'next/navigation';
import { useFinanceStore } from '@/lib/store/financeStore';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { FinanceOverview } from '@/components/finance/FinanceOverview';
import { LabaRugiTable } from '@/components/finance/LabaRugiTable';
import { JurnalTable } from '@/components/finance/JurnalTable';
import { PenagihanTable } from '@/components/finance/PenagihanTable';
import { InvoicePaymentList } from '@/components/finance/InvoicePaymentList';
import { ReimbursTable } from '@/components/finance/ReimbursTable';
import { GajiPayroll } from '@/components/finance/GajiPayroll';
import { VendorTable } from '@/components/finance/VendorTable';
import { PajakTable } from '@/components/finance/PajakTable';

export default function FinanceDashboard() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Finance Dashboard" subtitle="Manajemen Keuangan Terpusat" />
      <Suspense fallback={<div className="p-6 text-center text-gray-500">Memuat data keuangan...</div>}>
        <FinanceContent />
      </Suspense>
    </div>
  );
}

function FinanceContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  const { reimbursements } = useFinanceStore();
  const pendingReimbursements = reimbursements.filter(r => r.status === 'pending').length;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <FinanceOverview />;
      case 'laba_rugi': return <LabaRugiTable />;
      case 'jurnal': return <JurnalTable />;
      case 'penagihan': return <PenagihanTable />;
      case 'invoice_payment': return <InvoicePaymentList />;
      case 'reimburs': return <ReimbursTable />;
      case 'gaji': return <GajiPayroll />;
      case 'vendor': return <VendorTable />;
      case 'pajak': return <PajakTable />;
      default: return null;
    }
  };

  return (
    <div className="p-6 flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex-1 min-w-0">
        {pendingReimbursements > 0 && activeTab === 'overview' && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-500" />
              <div>
                <h3 className="font-bold text-yellow-800">Menunggu Approval Anda</h3>
                <p className="text-sm text-yellow-700 mt-0.5">
                  Ada {pendingReimbursements} pengajuan reimbursement yang belum diproses.
                </p>
              </div>
            </div>
            <Link href="?tab=reimburs" className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg font-medium transition-colors">
              Lihat Reimbursement
            </Link>
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
}
