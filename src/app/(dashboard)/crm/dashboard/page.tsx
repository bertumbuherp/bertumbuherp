'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { SummaryView } from '@/components/crm/SummaryView';
import { ListingProspekView } from '@/components/crm/ListingProspekView';
import { OfflineOnlineView } from '@/components/crm/OfflineOnlineView';
import { StrategiPackageView } from '@/components/crm/StrategiPackageView';
import { PitchingView } from '@/components/crm/PitchingView';
import { PenawaranView } from '@/components/crm/PenawaranView';
import { KontrakView } from '@/components/crm/KontrakView';

const tabs = [
  { key: 'summary', label: 'Summary' },
  { key: 'prospek', label: 'Listing Prospek' },
  { key: 'offline-online', label: 'Offline vs Online' },
  { key: 'strategi', label: 'Strategi Package' },
  { key: 'pitching', label: 'Propose & Pitching' },
  { key: 'penawaran', label: 'Quotation (Penawaran)' },
  { key: 'kontrak', label: 'Generate Kontrak' },
];

function CRMDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'summary';

  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'summary':
        return { title: 'CRM Dashboard', subtitle: 'Sistem Manajemen Hubungan Pelanggan & AE' };
      case 'prospek':
        return { title: 'Listing Prospek Klien', subtitle: 'Kelola Calon Klien Baru' };
      case 'offline-online':
        return { title: 'Analisis Sumber Prospek', subtitle: 'Perbandingan Jalur Offline vs Online' };
      case 'strategi':
        return { title: 'Paket Jasa & Strategi', subtitle: 'Daftar Paket Penawaran Agensi' };
      case 'pitching':
        return { title: 'Penjadwalan Pitching', subtitle: 'Persiapan Presentasi & Negosiasi Klien' };
      case 'penawaran':
        return { title: 'Quotation Penawaran', subtitle: 'Generator Penawaran Resmi & Harga' };
      case 'kontrak':
        return { title: 'Generator Kontrak Kerja', subtitle: 'Pembuatan Perjanjian Bisnis Instan' };
      default:
        return { title: 'CRM Dashboard', subtitle: 'Sistem Manajemen Hubungan Pelanggan & AE' };
    }
  };

  const header = getHeaderDetails();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryView />;
      case 'prospek':
        return <ListingProspekView />;
      case 'offline-online':
        return <OfflineOnlineView />;
      case 'strategi':
        return <StrategiPackageView />;
      case 'pitching':
        return <PitchingView />;
      case 'penawaran':
        return <PenawaranView />;
      case 'kontrak':
        return <KontrakView />;
      default:
        return <SummaryView />;
    }
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title={header.title} subtitle={header.subtitle} />
      <div className="max-w-7xl mx-auto w-full p-6 flex-1 flex flex-col">
        {/* Tab Content Wrapper */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 min-h-[60vh] fade-in">
          {renderTabContent()}
        </section>
      </div>
    </div>
  );
}

export default function CRMDashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header title="CRM Dashboard" subtitle="Sistem Manajemen Hubungan Pelanggan & AE" />
        <div className="max-w-7xl mx-auto w-full p-6 flex-1 text-center py-12 text-gray-500">
          Memuat Dashboard CRM...
        </div>
      </div>
    }>
      <CRMDashboardContent />
    </Suspense>
  );
}
