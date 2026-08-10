'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Project } from '@/lib/types';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';

import { usePMStore } from '@/lib/store/pmStore';
import { useAuth } from '@/contexts/AuthContext';

export default function TeamMemberProjectsView() {
  const { session } = useAuth();
  const { projects: allProjects, tasks } = usePMStore();

  // Find projects where the user has tasks
  const userTasks = tasks.filter(t => t.assigneeId === session?.userId || t.assigneeName === 'Dimas Prasetyo');
  const projectIds = new Set(userTasks.map(t => t.projectId));
  const localProjects = allProjects.filter(p => projectIds.has(p.id));

  const groupedByClient = localProjects.reduce((acc, p) => {
    if (!acc[p.clientName]) acc[p.clientName] = [];
    acc[p.clientName].push(p);
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Header title="Tugas & Proyek Saya" subtitle="Pekerjaan yang ditugaskan ke Anda" />
      <div className="p-6">
        <div className="flex gap-6 overflow-x-auto pb-6">
          {Object.entries(groupedByClient).map(([client, clientProjects]) => (
            <div key={client} className="shrink-0 w-80">
              <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-lg">
                  {client.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{client}</h3>
                  <p className="text-xs text-gray-500">{clientProjects.length} Proyek Aktif</p>
                </div>
              </div>
              <div className="space-y-4">
                {clientProjects.map(p => {
                  const statusColors: Record<string, string> = {
                    on_track: 'var(--green)', at_risk: 'var(--yellow)', delayed: 'var(--red-err)',
                    planning: 'var(--blue)', completed: 'var(--violet)'
                  };
                  const statusBg: Record<string, string> = {
                    on_track: 'var(--green-dim)', at_risk: 'var(--yellow-dim)', delayed: 'var(--red-err-dim)',
                    planning: 'var(--blue-dim)', completed: 'var(--violet-dim)'
                  };
                  
                  const pTasks = tasks.filter(t => t.projectId === p.id);
                  const pDone = pTasks.filter(t => t.status === 'done').length;
                  const progressPct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
                  
                  return (
                  <div key={p.id} className="card p-4 hover:shadow-md transition-shadow border-l-4" style={{borderLeftColor: statusColors[p.status]}}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800 leading-tight">{p.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: statusBg[p.status], color: statusColors[p.status] }}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">PM: <span className="font-medium text-gray-700">{p.pmName}</span></p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5 text-gray-600 font-medium">
                        <span>Progres Tasks</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${progressPct}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs pt-3 border-t">
                      <span className="flex items-center gap-1.5 text-red-600 font-medium bg-red-50 px-2 py-1 rounded-md">
                         <CalendarDays size={13}/> {p.endDate ? new Date(p.endDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'}) : ''}
                      </span>
                      <Link href={`/team_member/projects/${p.id}`} className="text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors text-xs text-center">
                        Lihat Papan Tugas
                      </Link>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
