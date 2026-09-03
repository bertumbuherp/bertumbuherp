'use client';
import { useSearchParams } from 'next/navigation';
import UserManagementView from '@/components/admin/UserManagementView';
import ActivityLogView from '@/components/admin/ActivityLogView';
import SystemStatusView from '@/components/admin/SystemStatusView';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { Users, Activity, Activity as PulseIcon, Server } from 'lucide-react';

export default function SuperAdminPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'users';

  return (
    <div className="space-y-6">
      <Header
        title="Admin Control Center & Audit Pengawas"
        subtitle="Manajemen akun karyawan, role access control, pengawasan log aktivitas, dan status kesehatan sistem"
      />

      <div className="px-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
          <Link
            href="/super_admin?tab=users"
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={16} /> Kelola User &amp; Hak Akses
          </Link>
          <Link
            href="/super_admin?tab=activity-logs"
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'activity-logs'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity size={16} /> Log Aktivitas (Audit Trail)
          </Link>
          <Link
            href="/super_admin?tab=system-status"
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'system-status'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Server size={16} /> Status System &amp; Health
          </Link>
        </div>

        {/* Tab View Render */}
        {activeTab === 'activity-logs' ? (
          <ActivityLogView />
        ) : activeTab === 'system-status' ? (
          <SystemStatusView />
        ) : (
          <UserManagementView />
        )}
      </div>
    </div>
  );
}
