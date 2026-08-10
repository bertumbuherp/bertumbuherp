'use client';
import React, { useState, useMemo } from 'react';
import { usePMStore } from '@/lib/store/pmStore';
import { formatCurrency } from '@/lib/utils';
import { teamWorkload } from '@/backend/repositories/mockRepository';
import { AlertTriangle, CheckCircle, User, Clock, TrendingUp, ChevronDown, ChevronUp, BarChart2, Shield, Zap } from 'lucide-react';

const CAPACITY_THRESHOLD = 40; // jam/minggu
const WARNING_THRESHOLD = 35;  // jam/minggu — kuning

type FilterMode = 'all' | 'overload' | 'warning' | 'ok';

export function WorkloadTrackingView() {
  const { tasks, projects } = usePMStore();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'bar'>('card');

  // Merge teamWorkload with live task data
  const enrichedWorkload = useMemo(() => {
    return teamWorkload.map(member => {
      const memberTasks = tasks.filter(t =>
        t.assigneeId === member.employeeId ||
        t.assigneeName === member.name
      );
      const activeTasks = memberTasks.filter(t => t.status !== 'done');
      const doneTasks = memberTasks.filter(t => t.status === 'done');
      const estimatedHoursLeft = activeTasks.reduce((sum, t) => sum + Math.max(0, t.estimatedHours - t.loggedHours), 0);
      const totalLogged = memberTasks.reduce((sum, t) => sum + t.loggedHours, 0);
      const weeklyHours = member.hoursLogged;

      let status: 'overload' | 'warning' | 'ok';
      if (weeklyHours > CAPACITY_THRESHOLD) status = 'overload';
      else if (weeklyHours >= WARNING_THRESHOLD) status = 'warning';
      else status = 'ok';

      return {
        ...member,
        activeTasks,
        doneTasks,
        estimatedHoursLeft,
        totalLoggedAllTime: totalLogged,
        status,
        memberProjects: projects.filter(p =>
          p.members.some(m => m.userId === member.employeeId)
        ),
      };
    });
  }, [tasks, projects]);

  const filtered = enrichedWorkload.filter(m => {
    if (filterMode === 'all') return true;
    return m.status === filterMode;
  });

  const overloadCount = enrichedWorkload.filter(m => m.status === 'overload').length;
  const warningCount = enrichedWorkload.filter(m => m.status === 'warning').length;
  const okCount = enrichedWorkload.filter(m => m.status === 'ok').length;
  const avgUtilization = Math.round(enrichedWorkload.reduce((s, m) => s + m.utilizationPercent, 0) / enrichedWorkload.length);

  const getStatusColor = (status: string) => {
    if (status === 'overload') return { bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', bar: 'var(--red-err)', icon: '🔴' };
    if (status === 'warning') return { bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', bar: 'var(--yellow)', icon: '🟡' };
    return { bg: 'bg-emerald-50 border-emerald-100', badge: 'bg-emerald-100 text-emerald-700', bar: 'var(--green)', icon: '🟢' };
  };

  const getBarWidth = (hours: number) => Math.min((hours / 50) * 100, 100);

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Overload Workload Tracking & Capacity Guarding
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor beban kerja tim mingguan · Threshold: <strong>{CAPACITY_THRESHOLD} jam/minggu</strong> · Peringatan: {WARNING_THRESHOLD}+ jam
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'card' ? 'bar' : 'card')}
            className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
          >
            <BarChart2 size={14} />
            {viewMode === 'card' ? 'Bar Chart' : 'Card View'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-xs font-bold text-gray-500 uppercase">Overload</span>
          </div>
          <p className="text-3xl font-black text-red-500">{overloadCount}</p>
          <p className="text-xs text-gray-400">anggota &gt;{CAPACITY_THRESHOLD} jam</p>
        </div>
        <div className="card p-4 border-l-4 border-amber-400">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-xs font-bold text-gray-500 uppercase">Peringatan</span>
          </div>
          <p className="text-3xl font-black text-amber-500">{warningCount}</p>
          <p className="text-xs text-gray-400">anggota {WARNING_THRESHOLD}–{CAPACITY_THRESHOLD} jam</p>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="text-xs font-bold text-gray-500 uppercase">Kapasitas OK</span>
          </div>
          <p className="text-3xl font-black text-emerald-500">{okCount}</p>
          <p className="text-xs text-gray-400">anggota &lt;{WARNING_THRESHOLD} jam</p>
        </div>
        <div className="card p-4 border-l-4" style={{ borderColor: 'var(--accent)' }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-bold text-gray-500 uppercase">Rata-rata Utilisasi</span>
          </div>
          <p className="text-3xl font-black" style={{ color: 'var(--accent)' }}>{avgUtilization}%</p>
          <p className="text-xs text-gray-400">dari kapasitas tim</p>
        </div>
      </div>

      {/* Capacity Guardian Banner */}
      {overloadCount > 0 && (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200 flex items-start gap-3">
          <Shield size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">⚠️ Capacity Guardian — Overload Terdeteksi!</p>
            <p className="text-xs text-red-600 mt-0.5">
              {overloadCount} anggota tim melebihi threshold {CAPACITY_THRESHOLD} jam/minggu. 
              Pertimbangkan redistribusi tugas atau pengajuan lembur resmi untuk menghindari burnout.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'overload', 'warning', 'ok'] as FilterMode[]).map(mode => {
          const labels = { all: 'Semua', overload: '🔴 Overload', warning: '🟡 Peringatan', ok: '🟢 Aman' };
          return (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterMode === mode ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {labels[mode]}
            </button>
          );
        })}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} anggota ditampilkan</span>
      </div>

      {/* BAR CHART VIEW */}
      {viewMode === 'bar' && (
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><BarChart2 size={16} /> Kapasitas vs Beban Kerja Mingguan</h3>
          {filtered.map(m => {
            const colors = getStatusColor(m.status);
            return (
              <div key={m.employeeId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 w-40 truncate">{m.name}</span>
                  <span className="text-gray-500">{m.hoursLogged}h / {CAPACITY_THRESHOLD}h</span>
                </div>
                <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                  {/* Capacity line */}
                  <div className="absolute top-0 bottom-0 border-r-2 border-dashed border-gray-400 z-10" style={{ left: `${(CAPACITY_THRESHOLD / 50) * 100}%` }} />
                  {/* Warning line */}
                  <div className="absolute top-0 bottom-0 border-r border-amber-300 z-10" style={{ left: `${(WARNING_THRESHOLD / 50) * 100}%` }} />
                  {/* Bar */}
                  <div
                    className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${getBarWidth(m.hoursLogged)}%`, backgroundColor: colors.bar }}
                  />
                </div>
                <p className="text-xs text-gray-400">{m.subTeam} · {m.currentFocus}</p>
              </div>
            );
          })}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 border-dashed border-t-2 border-gray-400 inline-block" /> Batas 40 jam</span>
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 border-t border-amber-300 inline-block" /> Peringatan 35 jam</span>
          </div>
        </div>
      )}

      {/* CARD VIEW */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(member => {
            const colors = getStatusColor(member.status);
            const isExpanded = expandedMember === member.employeeId;
            const pct = Math.min((member.hoursLogged / CAPACITY_THRESHOLD) * 100, 120);

            return (
              <div key={member.employeeId} className={`card p-5 border ${colors.bg} space-y-3 transition-all`}>
                {/* Top Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: member.avatarColor || 'var(--accent)' }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.position} · {member.subTeam}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.badge}`}>
                    {colors.icon} {member.status === 'overload' ? 'OVERLOAD' : member.status === 'warning' ? 'PERINGATAN' : 'AMAN'}
                  </span>
                </div>

                {/* Hours Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Jam Minggu Ini</span>
                    <span className="font-bold" style={{ color: pct > 100 ? 'var(--red-err)' : 'var(--text-primary)' }}>
                      {member.hoursLogged}h / {CAPACITY_THRESHOLD}h ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: colors.bar }}
                    />
                    {pct > 100 && (
                      <div className="absolute top-0 right-0 h-full w-1.5 bg-red-600 rounded-r-full animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-base font-black text-gray-800">{member.activeTasks.length}</p>
                    <p className="text-xs text-gray-500">Task Aktif</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-base font-black text-gray-800">{member.activeProjects}</p>
                    <p className="text-xs text-gray-500">Proyek</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-base font-black text-gray-800">{member.estimatedHoursLeft}h</p>
                    <p className="text-xs text-gray-500">Sisa Est.</p>
                  </div>
                </div>

                {/* Current Focus */}
                <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
                  <Zap size={12} className="text-amber-500 shrink-0" />
                  <span className="text-xs text-gray-600 truncate">{member.currentFocus}</span>
                </div>

                {/* Expand Toggle */}
                <button
                  onClick={() => setExpandedMember(isExpanded ? null : member.employeeId)}
                  className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700 pt-1"
                >
                  {isExpanded ? <><ChevronUp size={14} /> Sembunyikan detail</> : <><ChevronDown size={14} /> Lihat task detail</>}
                </button>

                {/* Expanded Task List */}
                {isExpanded && (
                  <div className="border-t border-gray-200/80 pt-3 space-y-2">
                    {member.activeTasks.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">Tidak ada task aktif</p>
                    ) : (
                      member.activeTasks.map(t => (
                        <div key={t.id} className="flex items-start justify-between bg-white/70 rounded-lg px-3 py-2 text-xs">
                          <div>
                            <p className="font-semibold text-gray-800 truncate max-w-[200px]">{t.title}</p>
                            <p className="text-gray-400">{t.subTeam} · Due {new Date(t.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                              t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              t.status === 'review' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{t.status.replace('_', ' ')}</span>
                            <p className="text-gray-400 mt-1">{t.loggedHours}h/{t.estimatedHours}h</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card p-10 text-center text-gray-400">
          <User size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Tidak ada anggota tim dengan status ini.</p>
        </div>
      )}
    </div>
  );
}
