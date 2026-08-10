'use client';
import { useMemo } from 'react';
import { projects, tasks, teamWorkload, atRiskAlerts } from '@/lib/mock-data';
import { formatCurrency, STATUS_LABELS, formatDate } from '@/lib/utils';
import { FolderKanban, CheckSquare, Users, AlertTriangle, AlertCircle, TrendingUp, Clock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  on_track: 'var(--green)', at_risk: 'var(--yellow)', delayed: 'var(--red-err)',
  planning: 'var(--blue)', completed: 'var(--violet)',
};
const STATUS_BG: Record<string, string> = {
  on_track: 'var(--green-dim)', at_risk: 'var(--yellow-dim)', delayed: 'var(--red-err-dim)',
  planning: 'var(--blue-dim)', completed: 'var(--violet-dim)',
};

import PackageTierBadge from './PackageTierBadge';

export default function PMOverview() {
  const now = useMemo(() => Date.now(), []);
  const allTasks = tasks;
  const overdueTasks = allTasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date());
  const inProgressTasks = allTasks.filter(t => t.status === 'in_progress');
  const delayedProjects = projects.filter(p => p.status === 'delayed' || p.status === 'at_risk');
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.actualCost, 0);

  return (
    <div className="space-y-5 fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Proyek Aktif', value: String(projects.length), sub: `${delayedProjects.length} butuh perhatian`, icon: FolderKanban, color: 'var(--red)', bg: 'var(--red-dim2)' },
          { label: 'Tugas In Progress', value: String(inProgressTasks.length), sub: `${overdueTasks.length} overdue`, icon: CheckSquare, color: 'var(--blue)', bg: 'var(--blue-dim)' },
          { label: 'Anggota Tim', value: String(teamWorkload.length), sub: 'Dalam pengawasan PM', icon: Users, color: 'var(--violet)', bg: 'var(--violet-dim)' },
          { label: 'Budget Terpakai', value: `${((totalSpent / totalBudget) * 100).toFixed(0)}%`, sub: `${formatCurrency(totalSpent)} / ${formatCurrency(totalBudget)}`, icon: TrendingUp, color: 'var(--green)', bg: 'var(--green-dim)' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Project status list */}
        <div className="card p-5">
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Status Semua Proyek & Detail Kontrak Paket</p>
          <div className="space-y-3">
            {projects.map(p => {
              const budget = (p.actualCost / p.budget) * 100;
              return (
                <div key={p.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2.5" style={{ background: 'var(--bg-page)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.clientName} · s/d {formatDate(p.endDate)}</p>
                    </div>
                    <span className="badge shrink-0" style={{ background: STATUS_BG[p.status], color: STATUS_COLORS[p.status] }}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </div>

                  {/* In-Line Package Tier & Services */}
                  <PackageTierBadge tier={p.packageTier} services={p.packageServices} size="sm" />

                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 progress-track h-1.5">
                      <div className="progress-fill" style={{ width: `${Math.min(budget, 100)}%`, background: budget > 100 ? 'var(--red-err)' : budget > 85 ? 'var(--yellow)' : 'var(--red)' }} />
                    </div>
                    <span className="text-xs font-medium shrink-0" style={{ color: budget > 100 ? 'var(--red-err)' : 'var(--text-muted)' }}>{budget.toFixed(0)}% budget</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts + deadlines */}
        <div className="space-y-4">
          <div className="card p-5">
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>⚠️ Butuh Perhatian</p>
            <div className="space-y-2.5">
              {atRiskAlerts.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: a.severity === 'high' ? 'var(--red-err-dim)' : a.severity === 'medium' ? 'var(--yellow-dim)' : 'var(--bg-page)' }}>
                  {a.severity === 'high' ? <AlertTriangle size={14} style={{ color: 'var(--red-err)', flexShrink: 0, marginTop: 1 }} /> : <AlertCircle size={14} style={{ color: 'var(--yellow)', flexShrink: 0, marginTop: 1 }} />}
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>📅 Deadline Terdekat</p>
            <div className="space-y-3">
              {tasks.filter(t => t.status !== 'done').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5).map(t => {
                const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - now) / 86400000);
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: daysLeft < 0 ? 'var(--red-err-dim)' : daysLeft <= 3 ? 'var(--yellow-dim)' : 'var(--bg-page)', border: '1px solid var(--border)' }}>
                      <Clock size={13} style={{ color: daysLeft < 0 ? 'var(--red-err)' : daysLeft <= 3 ? 'var(--yellow)' : 'var(--text-muted)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.assigneeName} · {t.subTeam}</p>
                    </div>
                    <span className="text-xs font-semibold shrink-0" style={{ color: daysLeft < 0 ? 'var(--red-err)' : daysLeft <= 3 ? 'var(--yellow)' : 'var(--text-muted)' }}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}h terlambat` : daysLeft === 0 ? 'Hari ini' : `${daysLeft}h lagi`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
