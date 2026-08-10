'use client';

import dynamic from 'next/dynamic';

const CEOReportsView = dynamic(
  () => import('@/components/views/CEOReportsView'),
  {
    ssr: false,
    loading: () => (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="p-6 text-center text-gray-500 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold text-sm text-gray-500">Memuat Laporan Perusahaan...</p>
          </div>
        </div>
      </div>
    )
  }
);

export default function CEOReports() {
  return <CEOReportsView />;
}
