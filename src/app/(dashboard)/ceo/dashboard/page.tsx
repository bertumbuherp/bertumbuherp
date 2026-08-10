'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';

const CEODashboardView = dynamic(
  () => import('@/components/views/CEODashboardView'),
  {
    ssr: false,
    loading: () => (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header title="CEO Dashboard" subtitle="Agregasi Kinerja Perusahaan Terpadu & Real-time" />
        <div className="max-w-7xl mx-auto w-full p-6 flex-1 text-center py-12 text-gray-500">
          Memuat Dashboard CEO...
        </div>
      </div>
    )
  }
);

export default function CEODashboard() {
  return <CEODashboardView />;
}
