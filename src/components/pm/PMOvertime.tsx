'use client';
import { useHRStore } from '@/lib/store/hrStore';
import { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { icon: any, color: string, bg: string, label: string }> = {
  approved: { icon: CheckCircle, color: 'var(--green)', bg: 'var(--green-dim)', label: 'Disetujui' },
  pending:  { icon: AlertCircle, color: 'var(--yellow)', bg: 'var(--yellow-dim)', label: 'Menunggu' },
  declined: { icon: XCircle, color: 'var(--red-err)', bg: 'var(--red-err-dim)', label: 'Ditolak' },
  returned: { icon: AlertCircle, color: 'var(--yellow)', bg: 'var(--yellow-dim)', label: 'Revisi' },
};

export default function PMOvertime() {
  const { overtimes, updateOvertimeStatus } = useHRStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');

  const filtered = overtimes.filter(ot => filter === 'all' || ot.status === filter);
  const totalHours = overtimes.reduce((s, ot) => s + ot.durationHours, 0);
  const pendingCount = overtimes.filter(ot => ot.status === 'pending').length;
  const approvedHours = overtimes.filter(ot => ot.status === 'approved').reduce((s, ot) => s + ot.durationHours, 0);

  // Group by unique employee names for the summary
  const uniqueEmployees = Array.from(new Set(overtimes.map(ot => ot.userName)));

  return (
    <div className="space-y-5 fade-in">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Entry Lembur', value: String(overtimes.length), color: 'var(--text-primary)' },
          { label: 'Total Jam Lembur', value: `${totalHours}j`, color: 'var(--red)' },
          { label: 'Menunggu Approval', value: String(pendingCount), color: 'var(--yellow)' },
          { label: 'Jam Disetujui', value: `${approvedHours}j`, color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {(['all', 'pending', 'approved', 'declined'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{ background: filter === s ? 'var(--red)' : 'transparent', color: filter === s ? 'white' : 'var(--text-muted)' }}>
              {s === 'all' ? 'Semua' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3" onClick={() => alert('Gunakan module Team Member untuk mencatat lembur.')}>
          <Plus size={13} /> Catat Lembur
        </button>
      </div>

      {/* Overtime list */}
      <div className="card p-5">
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Riwayat Lembur Tim</p>
        <div className="space-y-3">
          {filtered.map(ot => {
            const cfg = STATUS_CONFIG[ot.status] || STATUS_CONFIG['pending'];
            const StatusIcon = cfg.icon;
            return (
              <div key={ot.id} className="p-4 rounded-xl flex items-start gap-4 transition-colors"
                style={{ background: 'var(--bg-page)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--red)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'var(--red-dim2)', color: 'var(--red)' }}>
                  {ot.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ot.userName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ot.projectId} · {formatDate(ot.date.split('T')[0])}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-lg font-bold" style={{ color: 'var(--red)' }}>{ot.durationHours}j</span>
                      <span className="badge flex items-center" style={{ background: cfg.bg, color: cfg.color }}>
                        <StatusIcon size={11} className="mr-1" />{cfg.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mt-2 p-2 rounded-lg" style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
                    💬 {ot.reason}
                  </p>
                </div>

                {/* Action buttons for pending */}
                {ot.status === 'pending' && (
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => updateOvertimeStatus(ot.id, 'approved')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600">
                      <CheckCircle size={12} /> Setujui
                    </button>
                    <button onClick={() => updateOvertimeStatus(ot.id, 'declined')} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
                      style={{ color: 'var(--red-err)', borderColor: 'var(--red-err-dim)' }}>
                      <XCircle size={12} /> Tolak
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Clock size={32} className="mx-auto mb-3" style={{ color: 'var(--border)' }} />
              <p style={{ color: 'var(--text-muted)' }}>Tidak ada entri lembur</p>
            </div>
          )}
        </div>
      </div>

      {/* Per-person summary */}
      <div className="card p-5">
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Ringkasan Lembur per Anggota</p>
        <div className="space-y-3">
          {uniqueEmployees.map(name => {
            const entries = overtimes.filter(ot => ot.userName === name);
            const total = entries.reduce((s, ot) => s + ot.durationHours, 0);
            const approved = entries.filter(ot => ot.status === 'approved').reduce((s, ot) => s + ot.durationHours, 0);
            return (
              <div key={name} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-page)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'var(--red-dim2)', color: 'var(--red)' }}>
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{entries.length} entry · {approved}j disetujui</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: 'var(--red)' }}>{total}j</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>total</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
