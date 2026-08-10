'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';

const ReimbursementForm = dynamic(
  () => import('@/components/team/ReimbursementForm').then(mod => mod.ReimbursementForm),
  { ssr: false }
);

export default function TeamReimbursement() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Pengajuan Reimbursement" subtitle="Portal Karyawan" />
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full">
        <ReimbursementForm />
      </div>
    </div>
  );
}
