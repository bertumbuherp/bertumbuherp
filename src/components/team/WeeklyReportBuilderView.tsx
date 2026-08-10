'use client';
import React, { useState, useMemo } from 'react';
import { usePMStore } from '@/lib/store/pmStore';
import { formatCurrency } from '@/lib/utils';
import { teamWorkload, clientReports } from '@/backend/repositories/mockRepository';
import { FileText, Download, Printer, CheckCircle, ChevronDown, ChevronUp, Calendar, BarChart2, Users, AlertTriangle, TrendingUp } from 'lucide-react';

type ReportWeek = 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4';
type ReportDivision = 'Brand' | 'Sosmed/CC' | 'Produksi' | 'Design' | 'Performance' | 'Semua Divisi';

interface WeeklyReportConfig {
  week: ReportWeek;
  division: ReportDivision;
  startDate: string;
  endDate: string;
  pmNote: string;
  highlights: string[];
  challenges: string[];
}

const WEEK_RANGES: Record<ReportWeek, { label: string }> = {
  'Week 1': { label: '1–7' },
  'Week 2': { label: '8–14' },
  'Week 3': { label: '15–21' },
  'Week 4': { label: '22–31' },
};

const DIVISION_COLORS: Record<string, string> = {
  'Brand': 'var(--red)',
  'Sosmed/CC': 'var(--blue)',
  'Produksi': 'var(--violet)',
  'Design': 'var(--yellow)',
  'Performance': 'var(--green)',
  'Semua Divisi': 'var(--accent)',
};

export function WeeklyReportBuilderView() {
  const { projects, tasks } = usePMStore();
  const [config, setConfig] = useState<WeeklyReportConfig>({
    week: 'Week 4',
    division: 'Semua Divisi',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    pmNote: '',
    highlights: ['Desain logo fase 2 telah disetujui klien PT Maju Bersama', 'ROAS kampanye Edu Academy mencapai 4.1x melampaui target 3x'],
    challenges: ['Video Production Series masih delay 5 hari karena revisi naskah'],
  });
  const [newHighlight, setNewHighlight] = useState('');
  const [newChallenge, setNewChallenge] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('projects');
  const [reportGenerated, setReportGenerated] = useState(false);

  // ─── Computed Data ────────────────────────────────────────────────
  const reportTasks = useMemo(() => {
    return tasks.filter(t => {
      if (config.division !== 'Semua Divisi' && t.subTeam !== config.division) return false;
      return true;
    });
  }, [tasks, config.division]);

  const taskStats = useMemo(() => {
    const done = reportTasks.filter(t => t.status === 'done').length;
    const inProgress = reportTasks.filter(t => t.status === 'in_progress').length;
    const review = reportTasks.filter(t => t.status === 'review').length;
    const todo = reportTasks.filter(t => t.status === 'todo').length;
    const totalHours = reportTasks.reduce((s, t) => s + t.loggedHours, 0);
    const completionRate = reportTasks.length > 0 ? Math.round((done / reportTasks.length) * 100) : 0;
    return { done, inProgress, review, todo, total: reportTasks.length, totalHours, completionRate };
  }, [reportTasks]);

  const teamSection = useMemo(() => {
    return config.division === 'Semua Divisi'
      ? teamWorkload
      : teamWorkload.filter(m => m.subTeam === config.division);
  }, [config.division]);

  const projectsForReport = useMemo(() => {
    return projects.filter(p => {
      if (config.division === 'Semua Divisi') return true;
      return p.subTeams?.includes(config.division as any);
    });
  }, [projects, config.division]);

  const overloadMembers = teamSection.filter(m => m.hoursLogged > 40);

  const handlePrint = () => {
    setReportGenerated(true);
    setTimeout(() => window.print(), 300);
  };

  const toggle = (section: string) => setExpandedSection(expandedSection === section ? null : section);

  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 space-y-6 fade-in">

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 landscape; margin: 12mm 15mm; }
        @media print {
          aside, nav, header, button, .no-print { display: none !important; }
          body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
          .print-only { display: block !important; }
          .card { border: 1px solid #e5e7eb !important; box-shadow: none !important; }
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Divisional Weekly Report Builder
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Generate laporan mingguan per divisi · Ekspor PDF / Cetak
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm font-bold shadow-md"
          >
            <Printer size={16} /> Cetak / Export PDF
          </button>
        </div>
      </div>

      {/* Config Panel */}
      <div className="card p-5 no-print">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FileText size={16} style={{ color: 'var(--accent)' }} /> Konfigurasi Laporan
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Periode Minggu</label>
            <select
              value={config.week}
              onChange={e => setConfig(c => ({ ...c, week: e.target.value as ReportWeek }))}
              className="w-full border border-gray-200 rounded-xl p-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-red-400"
            >
              {(['Week 1', 'Week 2', 'Week 3', 'Week 4'] as ReportWeek[]).map(w => (
                <option key={w} value={w}>{w} ({WEEK_RANGES[w].label} {currentMonth})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Divisi</label>
            <select
              value={config.division}
              onChange={e => setConfig(c => ({ ...c, division: e.target.value as ReportDivision }))}
              className="w-full border border-gray-200 rounded-xl p-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-red-400"
            >
              {(['Semua Divisi', 'Brand', 'Sosmed/CC', 'Produksi', 'Design', 'Performance'] as ReportDivision[]).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={config.startDate}
              onChange={e => setConfig(c => ({ ...c, startDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl p-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-red-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={config.endDate}
              onChange={e => setConfig(c => ({ ...c, endDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl p-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-red-400"
            />
          </div>
        </div>

        {/* PM Notes */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-gray-500 mb-1">Catatan PM / Ringkasan Eksekutif</label>
          <textarea
            rows={2}
            placeholder="Tulis ringkasan singkat situasi tim minggu ini..."
            value={config.pmNote}
            onChange={e => setConfig(c => ({ ...c, pmNote: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-700 focus:outline-none focus:border-red-400 resize-none"
          />
        </div>

        {/* Highlights & Challenges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">✅ Highlight Minggu Ini</label>
            <div className="space-y-1 mb-2">
              {config.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 bg-emerald-50 rounded-lg px-3 py-1.5">
                  <CheckCircle size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 flex-1">{h}</span>
                  <button onClick={() => setConfig(c => ({ ...c, highlights: c.highlights.filter((_, j) => j !== i) }))} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah highlight..."
                value={newHighlight}
                onChange={e => setNewHighlight(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newHighlight.trim()) { setConfig(c => ({ ...c, highlights: [...c.highlights, newHighlight.trim()] })); setNewHighlight(''); }}}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={() => { if (newHighlight.trim()) { setConfig(c => ({ ...c, highlights: [...c.highlights, newHighlight.trim()] })); setNewHighlight(''); }}}
                className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600"
              >+</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">⚠️ Tantangan / Hambatan</label>
            <div className="space-y-1 mb-2">
              {config.challenges.map((c, i) => (
                <div key={i} className="flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-1.5">
                  <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 flex-1">{c}</span>
                  <button onClick={() => setConfig(cfg => ({ ...cfg, challenges: cfg.challenges.filter((_, j) => j !== i) }))} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah hambatan..."
                value={newChallenge}
                onChange={e => setNewChallenge(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newChallenge.trim()) { setConfig(c => ({ ...c, challenges: [...c.challenges, newChallenge.trim()] })); setNewChallenge(''); }}}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => { if (newChallenge.trim()) { setConfig(c => ({ ...c, challenges: [...c.challenges, newChallenge.trim()] })); setNewChallenge(''); }}}
                className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600"
              >+</button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* REPORT PREVIEW (print-ready)                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="card p-6 space-y-6">
        {/* Report Header */}
        <div className="flex items-start justify-between border-b pb-4 border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ background: DIVISION_COLORS[config.division] || 'var(--accent)' }}>B</div>
              <span className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>Bertumbuh Agency</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mt-2">
              Laporan Mingguan — {config.division}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {config.week} · {config.startDate} s/d {config.endDate} · Digenerate {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: DIVISION_COLORS[config.division] || 'var(--accent)' }}>
              {config.division}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        {config.pmNote && (
          <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-gray-400">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">📝 Catatan PM / Ringkasan Eksekutif</p>
            <p className="text-sm text-gray-700">{config.pmNote}</p>
          </div>
        )}

        {/* KPI Summary */}
        <div>
          <button
            className="w-full flex items-center justify-between text-sm font-bold text-gray-700 hover:text-gray-900 no-print"
            onClick={() => toggle('kpi')}
          >
            <span className="flex items-center gap-2"><BarChart2 size={16} /> Ringkasan KPI Minggu Ini</span>
            {expandedSection === 'kpi' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={expandedSection === 'kpi' || reportGenerated ? 'block' : 'hidden'}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
              {[
                { label: 'Total Task', value: taskStats.total, color: 'var(--accent)' },
                { label: 'Selesai', value: taskStats.done, color: 'var(--green)' },
                { label: 'On Progress', value: taskStats.inProgress, color: 'var(--blue)' },
                { label: 'Review', value: taskStats.review, color: 'var(--yellow)' },
                { label: 'Jam Dilog', value: `${taskStats.totalHours}h`, color: 'var(--violet)' },
              ].map(stat => (
                <div key={stat.label} className="card p-3 text-center border">
                  <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            {/* Completion Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Tingkat Penyelesaian Task</span>
                <span className="font-bold">{taskStats.completionRate}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${taskStats.completionRate}%`, background: 'var(--green)' }} />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Highlights & Challenges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" /> Highlight Minggu Ini
            </h3>
            {config.highlights.length === 0 ? (
              <p className="text-xs text-gray-400">Belum ada highlight ditambahkan.</p>
            ) : (
              <ul className="space-y-2">
                {config.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Tantangan / Hambatan
            </h3>
            {config.challenges.length === 0 ? (
              <p className="text-xs text-gray-400">Tidak ada hambatan minggu ini.</p>
            ) : (
              <ul className="space-y-2">
                {config.challenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="text-amber-500 font-bold shrink-0">!</span>
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Projects Section */}
        <div>
          <button
            className="w-full flex items-center justify-between text-sm font-bold text-gray-700 hover:text-gray-900 no-print"
            onClick={() => toggle('projects')}
          >
            <span className="flex items-center gap-2"><Calendar size={16} /> Status Proyek ({projectsForReport.length})</span>
            {expandedSection === 'projects' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={expandedSection === 'projects' || reportGenerated ? 'block' : 'hidden'}>
            <div className="mt-3 space-y-3">
              {projectsForReport.map(p => {
                const pTasks = tasks.filter(t => t.projectId === p.id);
                const pDone = pTasks.filter(t => t.status === 'done').length;
                const pPct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
                const statusColor = p.status === 'on_track' ? 'var(--green)' : p.status === 'at_risk' ? 'var(--yellow)' : p.status === 'delayed' ? 'var(--red-err)' : 'var(--accent)';
                return (
                  <div key={p.id} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold text-white shrink-0" style={{ background: statusColor, fontSize: '10px' }}>
                          {p.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{p.clientName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-gray-800">{pDone}/{pTasks.length} task</p>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div className="h-full rounded-full" style={{ width: `${pPct}%`, background: statusColor }} />
                      </div>
                      <p className="text-xs text-gray-400">{pPct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Team Section */}
        <div>
          <button
            className="w-full flex items-center justify-between text-sm font-bold text-gray-700 hover:text-gray-900 no-print"
            onClick={() => toggle('team')}
          >
            <span className="flex items-center gap-2"><Users size={16} /> Tim ({teamSection.length} anggota)</span>
            {expandedSection === 'team' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={expandedSection === 'team' || reportGenerated ? 'block' : 'hidden'}>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 font-bold text-gray-500">Nama</th>
                    <th className="text-left py-2 px-3 font-bold text-gray-500">Divisi</th>
                    <th className="text-center py-2 px-3 font-bold text-gray-500">Task Aktif</th>
                    <th className="text-center py-2 px-3 font-bold text-gray-500">Task Selesai</th>
                    <th className="text-right py-2 px-3 font-bold text-gray-500">Jam</th>
                    <th className="text-center py-2 px-3 font-bold text-gray-500">Utilisasi</th>
                  </tr>
                </thead>
                <tbody>
                  {teamSection.map(m => (
                    <tr key={m.employeeId} className={`border-b border-gray-50 ${m.hoursLogged > 40 ? 'bg-red-50' : ''}`}>
                      <td className="py-2 px-3 font-semibold text-gray-800">{m.name}</td>
                      <td className="py-2 px-3 text-gray-500">{m.subTeam}</td>
                      <td className="py-2 px-3 text-center">{m.pendingTasks}</td>
                      <td className="py-2 px-3 text-center text-emerald-600 font-bold">{m.completedTasks}</td>
                      <td className="py-2 px-3 text-right">
                        <span className={m.hoursLogged > 40 ? 'text-red-600 font-bold' : 'text-gray-700'}>{m.hoursLogged}h</span>
                        {m.hoursLogged > 40 && <span className="ml-1 text-red-500">⚠️</span>}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(m.utilizationPercent, 100)}%`, background: m.utilizationPercent > 100 ? 'var(--red-err)' : 'var(--green)' }} />
                          </div>
                          <span className={`font-bold ${m.utilizationPercent > 100 ? 'text-red-600' : 'text-gray-700'}`}>{m.utilizationPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {overloadMembers.length > 0 && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> {overloadMembers.length} anggota melebihi kapasitas 40 jam/minggu
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 border-gray-100 flex justify-between items-center text-xs text-gray-400">
          <span>Bertumbuh Agency ERP · Laporan otomatis {config.week} {currentMonth}</span>
          <span>Digenerate: {new Date().toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
}
