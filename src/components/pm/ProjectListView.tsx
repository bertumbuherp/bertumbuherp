'use client';

import React, { useState } from 'react';
import { usePMStore } from '@/lib/store/pmStore';
import { useAuth } from '@/contexts/AuthContext';
import { FolderKanban, Clock, CalendarDays, Search } from 'lucide-react';
import Link from 'next/link';
import PackageTierBadge from './PackageTierBadge';

export function ProjectListView() {
  const { projects, tasks } = usePMStore();
  const { session } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  let myProjects = projects.filter(p => p.pmId === session?.userId || p.pmName === session?.name);
  if (myProjects.length === 0) myProjects = projects; // Mock fallback

  const filtered = myProjects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    on_track: 'var(--green)', at_risk: 'var(--yellow)', delayed: 'var(--red-err)',
    planning: 'var(--blue)', completed: 'var(--violet)'
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold">Proyek yang Anda Kelola</h2>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama proyek / klien..." 
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-red-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => {
          const pTasks = tasks.filter(t => t.projectId === p.id);
          const pDone = pTasks.filter(t => t.status === 'done').length;
          const progressPct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
          
          return (
            <div key={p.id} className="card p-5 hover:shadow-lg transition-shadow border-t-4 flex flex-col h-full space-y-3" style={{ borderTopColor: statusColors[p.status] }}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                  {p.billingType === 'retainer' ? 'RETAINER' : 'PROJECT'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: `${statusColors[p.status]}20`, color: statusColors[p.status] }}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-800 leading-tight mb-0.5">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.clientName}</p>
              </div>

              {/* Package Tier Badge In-line */}
              <PackageTierBadge tier={p.packageTier} services={p.packageServices} size="sm" />
              
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-600">
                  <span>Progres Tugas</span>
                  <span>{progressPct}% ({pDone}/{pTasks.length})</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: statusColors[p.status] }}></div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 font-medium">
                <div className="flex items-center gap-1.5"><CalendarDays size={14}/> {new Date(p.startDate).toLocaleDateString('id-ID', {month:'short', day:'numeric'})}</div>
                <div className="flex items-center gap-1.5"><Clock size={14}/> {new Date(p.endDate).toLocaleDateString('id-ID', {month:'short', day:'numeric'})}</div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <Link href={`/pm/projects/${p.id}`} className="w-full py-2 bg-gray-50 hover:bg-red-50 text-red-600 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm border border-transparent hover:border-red-200">
                  <FolderKanban size={16}/> Kelola Papan Tugas
                </Link>
              </div>
            </div>
          )
        })}
        
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
            Tidak ada proyek yang sesuai pencarian.
          </div>
        )}
      </div>
    </div>
  );
}
