'use client';
import React from 'react';
import { Deal, DealStage, Project } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import { useCrmStore } from '@/lib/store/crmStore';
import { usePMStore } from '@/lib/store/pmStore';
import { formatCurrency, STAGE_LABELS } from '@/lib/utils';

const STAGES: DealStage[] = ['lead', 'kualifikasi', 'penawaran', 'pitching', 'negosiasi', 'won', 'lost'];

export function DealCard({ deal }: { deal: Deal }) {
  const updateDealStage = useCrmStore(s => s.updateDealStage);
  const addProject = usePMStore(s => s.addProject);
  const probColor = deal.probability >= 70 ? 'var(--green)' : deal.probability >= 40 ? 'var(--yellow)' : 'var(--red-err)';
  
  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateDealStage(deal.id, e.target.value as DealStage);
  };

  const handleHandover = () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      organizationId: deal.organizationId,
      name: deal.title,
      clientId: deal.clientId || 'client-x',
      clientName: deal.clientName,
      pmId: 'pm-1',
      pmName: 'Budi (PM)',
      status: 'planning',
      billingType: 'project',
      contractValue: deal.value,
      budget: deal.value * 0.7,
      actualCost: 0,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      members: [],
      addOns: [],
      milestones: [],
      subTeams: ['Design', 'Brand'],
      reports: [],
      activities: [{
        id: `act-${Date.now()}`,
        projectId: `proj-${Date.now()}`,
        userName: 'Sistem',
        action: 'Handover Project dari AE',
        target: deal.title,
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString()
    };
    addProject(newProject);
    alert(`Project ${deal.title} berhasil di-handover ke Project Manager!`);
  };

  return (
    <div className="card kanban-card p-4 mb-2.5">
      <p className="text-xs font-semibold mb-0.5 leading-snug" style={{ color: 'var(--text-primary)' }}>{deal.title}</p>
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{deal.clientName}</p>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold" style={{ color: 'var(--red)' }}>{formatCurrency(deal.value)}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: deal.probability >= 70 ? 'var(--green-dim)' : deal.probability >= 40 ? 'var(--yellow-dim)' : 'var(--red-err-dim)', color: probColor }}>
          {deal.probability}%
        </span>
      </div>
      <div className="flex flex-col gap-2 mb-2">
        <select 
          className="w-full text-xs p-1.5 rounded border border-gray-300 bg-gray-50 focus:outline-none focus:border-red-500"
          value={deal.stage}
          onChange={handleStageChange}
        >
          {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
        
        {deal.stage === 'won' && (
          <button 
            onClick={handleHandover}
            className="w-full text-[10px] bg-emerald-500 text-white font-bold py-1.5 rounded-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            Handover to PM <ArrowRight size={12} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--red-dim2)', color: 'var(--red)' }}>
          {deal.aeName[0]}
        </div>
        <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-muted)' }}>{deal.aeName}</span>
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-page)', color: 'var(--text-muted)', fontSize: 10 }}>{deal.source}</span>
      </div>
    </div>
  );
}
