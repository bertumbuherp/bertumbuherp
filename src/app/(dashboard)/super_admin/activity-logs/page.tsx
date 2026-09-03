'use client';
import ActivityLogView from '@/components/admin/ActivityLogView';
import Header from '@/components/layout/Header';

export default function ActivityLogsPage() {
  return (
    <div className="space-y-6">
      <Header
        title="Log Aktivitas System & Audit Trail"
        subtitle="Pengawasan log transaksi, autentikasi, dan aksi pengguna di seluruh aplikasi"
      />
      <div className="p-6">
        <ActivityLogView />
      </div>
    </div>
  );
}
