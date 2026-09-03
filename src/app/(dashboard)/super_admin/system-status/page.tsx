'use client';
import SystemStatusView from '@/components/admin/SystemStatusView';
import Header from '@/components/layout/Header';

export default function SystemStatusPage() {
  return (
    <div className="space-y-6">
      <Header
        title="Status System & Real-Time Health Monitor"
        subtitle="Pemantauan kesehatan database Supabase, server API, integritas kode, dan log error"
      />
      <div className="p-6">
        <SystemStatusView />
      </div>
    </div>
  );
}
