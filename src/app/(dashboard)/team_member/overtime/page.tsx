'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';

const OvertimeLogForm = dynamic(
  () => import('@/components/team/OvertimeLogForm').then(mod => mod.OvertimeLogForm),
  { ssr: false }
);

export default function TeamOvertime() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="Catat Lembur (Overtime)" subtitle="Portal Karyawan" />
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full">
        <OvertimeLogForm />
      </div>
    </div>
  );
}
