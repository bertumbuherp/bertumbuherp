'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import { useHRStore } from '@/lib/store/hrStore';
import { Users, Clock, CalendarDays, CheckCircle, ShieldAlert, Award, Grid, DollarSign, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { TeamAllocationMatrixView } from './TeamAllocationMatrixView';
import { LeaveTimelineGuardingView } from './LeaveTimelineGuardingView';
import { HRPerformanceTrackingView } from './HRPerformanceTrackingView';
import { LeaveApprovalTable } from './LeaveApprovalTable';
import { OvertimeApprovalTable } from './OvertimeApprovalTable';
import { EmployeeDatabase } from './EmployeeDatabase';
import { GajiPayroll } from '@/components/finance/GajiPayroll';

export default function HRDashboardView() {
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'summary';

  const { employees, attendances, leaves, overtimes } = useHRStore();

  const today = new Date().toISOString().split('T')[0];
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const presentToday = attendances.filter(a => a.date === today && a.status === 'present').length;
  
  const pendingLeaves = leaves.filter(l => l.status === 'pending' || l.status === 'approved_pm').length;
  const pendingOvertimes = overtimes.filter(o => o.status === 'pending').length;

  const hrTabs = [
    { key: 'summary', label: 'Summary HR' },
    { key: 'matrix', label: 'Matriks Alokasi Tim' },
    { key: 'guarding_cuti', label: 'Guarding Cuti PM' },
    { key: 'performance_tracking', label: 'Performa & Overdue Rate' },
    { key: 'cuti', label: 'Persetujuan Cuti' },
    { key: 'lembur', label: 'Absen Lembur' },
    { key: 'payroll_bulanan', label: 'Slip Gaji & Payroll' },
    { key: 'employees', label: 'Database Karyawan' },
  ];

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="HR &amp; People Operations Dashboard" subtitle="Human Capital &amp; Resource Management Platform" />
      
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full space-y-6 fade-in">
        {/* Navigation Tabs */}
        <nav className="flex space-x-2 border-b border-gray-200 pb-2 no-print overflow-x-auto">
          {hrTabs.map((t) => (
            <Link
              key={t.key}
              href={`/hr/dashboard?tab=${t.key}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === t.key || (t.key === 'performance_tracking' && activeTab === 'kpi') || (t.key === 'payroll_bulanan' && (activeTab === 'slip' || activeTab === 'payroll_freelance'))
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {activeTab === 'matrix' ? (
          <TeamAllocationMatrixView />
        ) : activeTab === 'guarding_cuti' ? (
          <LeaveTimelineGuardingView />
        ) : activeTab === 'performance_tracking' || activeTab === 'kpi' ? (
          <HRPerformanceTrackingView />
        ) : activeTab === 'cuti' ? (
          <LeaveApprovalTable />
        ) : activeTab === 'lembur' || activeTab === 'absen_lembur' ? (
          <OvertimeApprovalTable />
        ) : activeTab === 'payroll_bulanan' ? (
          <GajiPayroll filterType="Full-Time" mode="summary" />
        ) : activeTab === 'payroll_freelance' ? (
          <GajiPayroll filterType="Freelance" mode="input" />
        ) : activeTab === 'slip' ? (
          <GajiPayroll filterType="All" mode="input" />
        ) : activeTab === 'employees' ? (
          <EmployeeDatabase />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card p-5 border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Total Karyawan</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{activeEmployees}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><Users size={20}/></div>
                </div>
              </div>
              
              <div className="card p-5 border-l-4 border-emerald-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Kehadiran Hari Ini</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{presentToday} <span className="text-sm font-medium text-gray-500">/ {activeEmployees}</span></p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center"><CheckCircle size={20}/></div>
                </div>
              </div>

              <div className="card p-5 border-l-4 border-orange-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Cuti Menunggu Approval</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{pendingLeaves}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><CalendarDays size={20}/></div>
                </div>
                {pendingLeaves > 0 && <Link href="/hr/dashboard?tab=cuti" className="text-xs text-orange-600 hover:underline mt-2 inline-block">Review Sekarang &rarr;</Link>}
              </div>

              <div className="card p-5 border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Lembur Menunggu Approval</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{pendingOvertimes}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center"><Clock size={20}/></div>
                </div>
                {pendingOvertimes > 0 && <Link href="/hr/dashboard?tab=lembur" className="text-xs text-purple-600 hover:underline mt-2 inline-block">Review Sekarang &rarr;</Link>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4">Log Kehadiran Hari Ini</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Nama</th>
                        <th className="px-4 py-2 font-semibold">Clock In</th>
                        <th className="px-4 py-2 font-semibold">Clock Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendances.filter(a => a.date === today).map(att => (
                        <tr key={att.id} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium">{att.userName}</td>
                          <td className="px-4 py-3 text-emerald-600 font-medium">
                            {att.clockIn ? new Date(att.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-medium">
                            {att.clockOut ? new Date(att.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Belum Out'}
                          </td>
                        </tr>
                      ))}
                      {attendances.filter(a => a.date === today).length === 0 && (
                        <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Belum ada karyawan yang clock-in hari ini.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-bold mb-4">Akses Cepat HR Modules</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/hr/dashboard?tab=matrix" className="p-4 border rounded-xl hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Grid size={24}/></div>
                    <span className="font-semibold text-sm">Matriks Alokasi Tim</span>
                  </Link>

                  <Link href="/hr/dashboard?tab=guarding_cuti" className="p-4 border rounded-xl hover:border-amber-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform"><ShieldAlert size={24}/></div>
                    <span className="font-semibold text-sm">Guarding Cuti PM</span>
                  </Link>

                  <Link href="/hr/dashboard?tab=performance_tracking" className="p-4 border rounded-xl hover:border-purple-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Award size={24}/></div>
                    <span className="font-semibold text-sm">Performa &amp; Overdue Rate</span>
                  </Link>

                  <Link href="/hr/dashboard?tab=payroll_bulanan" className="p-4 border rounded-xl hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><DollarSign size={24}/></div>
                    <span className="font-semibold text-sm">Payroll &amp; Slip Gaji</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
