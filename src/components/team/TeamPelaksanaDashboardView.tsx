'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { WorkloadTrackingView } from '@/components/team/WorkloadTrackingView';
import { AdsBudgetTrackerView } from '@/components/team/AdsBudgetTrackerView';
import { WeeklyReportBuilderView } from '@/components/team/WeeklyReportBuilderView';
import TeamMemberDashboardView from '@/components/team/TeamMemberDashboardView';
import { Activity, DollarSign, FileText, Clock } from 'lucide-react';

const TABS = [
  { id: 'workload', label: 'Workload Tracking', icon: Activity, subtitle: 'Overload & Capacity Guarding (Threshold 40 jam/minggu)' },
  { id: 'ads-budget', label: 'Budget Ads Tracker', icon: DollarSign, subtitle: 'All Platform & Direct Billing Sync' },
  { id: 'weekly-report', label: 'Weekly Report', icon: FileText, subtitle: 'Divisional Weekly Report Builder' },
  { id: 'presensi', label: 'Presensi & Kehadiran', icon: Clock, subtitle: 'Time Tracker Kehadiran & Sisa Cuti' },
];

export default function TeamPelaksanaDashboardView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'workload');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`?tab=${tabId}`, { scroll: false });
  };

  const activeTabMeta = TABS.find(t => t.id === activeTab);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        title="Dashboard Team Pelaksana"
        subtitle={activeTabMeta?.subtitle || 'Divisi Team Pelaksana'}
      />

      {/* Tab Navigation */}
      <div className="border-b no-print" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                    isActive
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full">
        {activeTab === 'workload' && <WorkloadTrackingView />}
        {activeTab === 'ads-budget' && <AdsBudgetTrackerView />}
        {activeTab === 'weekly-report' && <WeeklyReportBuilderView />}
        {activeTab === 'presensi' && <TeamMemberDashboardView />}
      </div>
    </div>
  );
}
