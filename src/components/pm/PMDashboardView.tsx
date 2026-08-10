'use client';

import Header from '@/components/layout/Header';
import { usePMStore } from '@/lib/store/pmStore';
import { useHRStore } from '@/lib/store/hrStore';
import { useAuth } from '@/contexts/AuthContext';
import { FolderKanban, CheckCircle, AlertTriangle, Clock, CalendarDays, Users, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import PackageTierBadge from './PackageTierBadge';
import GoogleCalendarSyncWidget from './GoogleCalendarSyncWidget';
import MeetingSchedulerModal from './MeetingSchedulerModal';

export default function PMDashboardView() {
  const { session } = useAuth();
  const { projects, tasks } = usePMStore();
  const { leaves } = useHRStore();
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  if (!session) return null;

  // Mock PM logic: find projects managed by current user. 
  // Fallback to all projects if no match for demo purposes.
  let myProjects = projects.filter(p => p.pmId === session.userId || p.pmName === session.name);
  if (myProjects.length === 0) myProjects = projects;

  const activeProjects = myProjects.filter(p => p.status !== 'completed');
  const delayedProjects = activeProjects.filter(p => p.status === 'delayed' || p.status === 'at_risk');
  
  // Tasks requiring PM review (status = 'review')
  const reviewTasks = tasks.filter(t => myProjects.some(p => p.id === t.projectId) && t.status === 'review');

  // Pending leaves (Cuti) waiting for PM approval
  const pendingLeaves = leaves.filter(l => l.status === 'pending');

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header title="PM Dashboard" subtitle="Operasional & Manajemen Tim" />
      
      <div className="p-6 flex-1 max-w-7xl mx-auto w-full space-y-6 fade-in">
        
        {/* Google Calendar 2-Way Sync Control Widget */}
        <GoogleCalendarSyncWidget />

        {/* Quick Actions Header: Meeting Timeline Scheduling */}
        <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-gray-800 dark:text-white">
              <Sparkles size={16} className="text-purple-600" /> Penjadwalan Rapat & Meeting Tim
            </h3>
            <p className="text-xs text-gray-500">
              Jadwalkan Rapat Pitching Client (Team Branding), Strategy & Ideation (Team Sosmed), atau Evaluasi Kinerja (Team Performance).
            </p>
          </div>
          <button
            onClick={() => setIsSchedulerOpen(true)}
            className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md hover:scale-[1.02] transition-transform"
          >
            <Plus size={14} /> Jadwalkan Meeting Tim Baru
          </button>
        </div>

        <MeetingSchedulerModal
          isOpen={isSchedulerOpen}
          onClose={() => setIsSchedulerOpen(false)}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-5 border-l-4 border-blue-500 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500">Proyek Aktif</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{activeProjects.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><FolderKanban size={20}/></div>
            </div>
            <Link href="/pm/projects" className="text-xs text-blue-600 hover:underline mt-4 inline-block">Lihat Semua Proyek &rarr;</Link>
          </div>
          
          <div className="card p-5 border-l-4 border-red-500 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500">Proyek At Risk / Delay</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{delayedProjects.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center"><AlertTriangle size={20}/></div>
            </div>
            {delayedProjects.length > 0 && <span className="text-xs text-red-600 mt-4 font-semibold">Perlu intervensi segera</span>}
          </div>

          <div className="card p-5 border-l-4 border-orange-500 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500">Tugas Menunggu Review</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{reviewTasks.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><CheckCircle size={20}/></div>
            </div>
            {reviewTasks.length > 0 && <Link href="/pm/projects" className="text-xs text-orange-600 hover:underline mt-4 inline-block">Review Sekarang &rarr;</Link>}
          </div>

          <div className="card p-5 border-l-4 border-purple-500 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500">Cuti Menunggu Approval</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{pendingLeaves.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center"><CalendarDays size={20}/></div>
            </div>
            {pendingLeaves.length > 0 && <Link href="/pm/cuti" className="text-xs text-purple-600 hover:underline mt-4 inline-block">Review Cuti Tim &rarr;</Link>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Status Proyek Berjalan</h3>
                <Link href="/pm/projects" className="text-sm text-red-500 hover:underline">Lihat Detail</Link>
              </div>
              <div className="space-y-4">
                {activeProjects.slice(0, 5).map(p => {
                  const pTasks = tasks.filter(t => t.projectId === p.id);
                  const pDone = pTasks.filter(t => t.status === 'done').length;
                  const progressPct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
                  
                  const statusColors: Record<string, string> = {
                    on_track: 'var(--green)', at_risk: 'var(--yellow)', delayed: 'var(--red-err)',
                    planning: 'var(--blue)', completed: 'var(--violet)'
                  };

                  return (
                    <div key={p.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors space-y-3">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-bold text-gray-800">{p.name}</h4>
                          <p className="text-xs text-gray-500">{p.clientName}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: `${statusColors[p.status]}20`, color: statusColors[p.status] }}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {/* Package Tier & In-Line Scope Services */}
                      <PackageTierBadge tier={p.packageTier} services={p.packageServices} size="sm" />

                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1 font-medium text-gray-600">
                          <span>Progres: {progressPct}%</span>
                          <span className="flex items-center gap-1"><Clock size={12}/> Deadline: {new Date(p.endDate).toLocaleDateString('id-ID', {day: 'numeric', month:'short'})}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: statusColors[p.status] }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6 bg-red-50 border border-red-100">
              <h3 className="text-md font-bold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle size={18}/> Perhatian PM
              </h3>
              <ul className="space-y-3 text-sm text-red-700">
                {reviewTasks.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                    Ada {reviewTasks.length} tugas yang selesai dikerjakan tim dan menunggu validasi bukti kerja Anda.
                  </li>
                )}
                {delayedProjects.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                    {delayedProjects.length} proyek berstatus Delayed / At Risk. Hubungi Klien atau ubah timeline secepatnya.
                  </li>
                )}
                {pendingLeaves.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                    {pendingLeaves.length} pengajuan cuti tim menunggu persetujuan Anda sebelum masuk ke HR.
                  </li>
                )}
                {reviewTasks.length === 0 && delayedProjects.length === 0 && pendingLeaves.length === 0 && (
                  <li className="text-green-700 font-medium">Semua indikator operasional aman. Tidak ada tugas darurat.</li>
                )}
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="font-bold mb-4">Akses Cepat</h3>
              <div className="flex flex-col gap-3">
                <Link href="/pm/projects" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><FolderKanban size={16}/></div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Manajemen Proyek</p>
                    <p className="text-xs text-gray-500">Papan Tugas & Timeline</p>
                  </div>
                </Link>
                <Link href="/pm/cuti" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><Users size={16}/></div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Approval Cuti Tim</p>
                    <p className="text-xs text-gray-500">Validasi absen tim proyek</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
