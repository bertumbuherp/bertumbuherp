'use client';
import React, { useState } from 'react';
import { useCrmStore } from '@/lib/store/crmStore';
import { formatCurrency, STAGE_LABELS } from '@/lib/utils';
import { DealStage } from '@/lib/types';
import { TrendingUp, Users, DollarSign, Plus } from 'lucide-react';
import { AddDealModal } from './AddDealModal';
import { DealCard } from './DealCard';

const STAGES: DealStage[] = ['lead', 'kualifikasi', 'penawaran', 'pitching', 'negosiasi', 'won', 'lost'];
const STAGE_COLORS: Record<DealStage, string> = {
  lead: '#9CA3AF', kualifikasi: 'var(--blue)', penawaran: 'var(--violet)',
  pitching: 'var(--yellow)', negosiasi: 'var(--orange)', won: 'var(--green)', lost: 'var(--red-err)',
};

export function SummaryView() {
  const deals = useCrmStore(s => s.deals);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPipelineValue = deals.filter(d => !['won', 'lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0);
  const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage)).length;

  return (
    <div className="p-6">
      <AddDealModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Pipeline', value: formatCurrency(totalPipelineValue), icon: TrendingUp, color: 'var(--blue)', bg: 'var(--blue-dim)' },
          { label: 'Deal Aktif', value: String(activeDeals), icon: Users, color: 'var(--violet)', bg: 'var(--violet-dim)' },
          { label: 'Won Keseluruhan', value: formatCurrency(wonValue), icon: DollarSign, color: 'var(--green)', bg: 'var(--green-dim)' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Pipeline Kanban</h2>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-1.5 py-2 px-3 text-xs">
          <Plus size={13} /> Tambah Deal
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 items-start">
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage} className="shrink-0 w-64 bg-gray-50/50 rounded-2xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: STAGE_COLORS[stage] }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{STAGE_LABELS[stage]}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-gray-500 shadow-sm border border-gray-200">
                  {stageDeals.length}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500">Nilai: <span className="text-gray-800">{formatCurrency(stageValue)}</span></p>
              </div>

              <div className="flex flex-col min-h-[150px]">
                {stageDeals.map(deal => <DealCard key={deal.id} deal={deal} />)}
                {!stageDeals.length && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                    <p className="text-xs font-medium text-gray-400">Kosong</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
