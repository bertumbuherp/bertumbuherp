'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';

const LeaveRequestForm = dynamic(
  () => import('@/components/team/LeaveRequestForm').then(mod => mod.LeaveRequestForm),
  { ssr: false }
);

export default function TeamCuti() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Pengajuan Cuti / Izin" subtitle="Portal Karyawan" />
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full">
        <LeaveRequestForm />
      </div>
    </div>
  );
}
