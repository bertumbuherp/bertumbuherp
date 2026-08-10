'use client';
import { clientReports } from '@/lib/mock-data';
import { useState } from 'react';
import { CheckCircle, AlertTriangle, Clock, ChevronDown, ChevronUp, Send } from 'lucide-react';

const STATUS_CONFIG = {
  on_track: { icon: CheckCircle, color: 'var(--green)', bg: 'var(--green-dim)', label: 'On Track' },
  at_risk:  { icon: AlertTriangle, color: 'var(--yellow)', bg: 'var(--yellow-dim)', label: 'At Risk' },
  delayed:  { icon: Clock, color: 'var(--red-err)', bg: 'var(--red-err-dim)', label: 'Terlambat' },
};

export default function PMClientReport() {
  const [expanded, setExpanded] = useState<string | null>('cr1');

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Laporan Progress Klien</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Update proyek berdasarkan laporan team lead · Mei 2024</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3">
          <Send size={13} /> Kirim Semua Laporan
        </button>
      </div>

      {clientReports.map(report => {
        const cfg = STATUS_CONFIG[report.status];
        const StatusIcon = cfg.icon;
        const isOpen = expanded === report.id;

        return (
          <div key={report.id} className="card overflow-hidden">
            {/* Card header */}
            <button className="w-full p-5 flex items-start gap-4 text-left" onClick={() => setExpanded(isOpen ? null : report.id)}>
              {/* Progress ring (simple) */}
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border)" strokeWidth="5" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke={cfg.color} strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - report.progressPercent / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: cfg.color }}>
                  {report.progressPercent}%
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{report.projectName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{report.clientName} · {report.period}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
                      <StatusIcon size={11} className="mr-1" />{cfg.label}
                    </span>
                    {isOpen ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>
                <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{report.pmNote}</p>
              </div>
            </button>

            {/* Expanded */}
            {isOpen && (
              <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="pt-4 space-y-4">
                  {/* PM Note */}
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>📝 Catatan PM</p>
                    <div className="p-3 rounded-xl text-sm leading-relaxed" style={{ background: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
                      {report.pmNote}
                    </div>
                  </div>

                  {/* Team updates */}
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>📊 Update Tim</p>
                    <div className="space-y-2">
                      {report.teamUpdates.map((u, i) => (
                        <div key={i} className="p-3 rounded-xl flex gap-3" style={{ background: 'var(--bg-page)' }}>
                          <span className="badge badge-red-brand shrink-0">{u.subTeam}</span>
                          <div>
                            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{u.lead}</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{u.update}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next milestone */}
                  <div className="p-3 rounded-xl flex items-center gap-3"
                    style={{ background: 'var(--red-dim)', border: '1px solid var(--red-dim2)' }}>
                    <Clock size={15} style={{ color: 'var(--red)', flexShrink: 0 }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Milestone Berikutnya</p>
                      <p className="text-xs font-semibold" style={{ color: 'var(--red)' }}>{report.nextMilestone}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>Terakhir diupdate: {report.lastUpdated}</span>
                    <button className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                      <Send size={11} /> Kirim ke Klien
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
