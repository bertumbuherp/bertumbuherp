import { useState } from 'react';
import { usePMStore } from '@/lib/store/pmStore';
import { formatDate } from '@/lib/utils';
import { CheckSquare, Square, AlertTriangle, Filter } from 'lucide-react';

const PRIORITY_COLOR: Record<string, string> = { high: 'var(--red-err)', medium: 'var(--yellow)', low: 'var(--green)' };
const STATUS_OPTIONS = ['all', 'todo', 'in_progress', 'review', 'done'] as const;
const STATUS_LABELS_MAP: Record<string, string> = { all: 'Semua', todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Selesai' };

export default function PMTodoList() {
  const { tasks, projects } = usePMStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const filtered = tasks.filter(t =>
    (statusFilter === 'all' || t.status === statusFilter) &&
    (projectFilter === 'all' || t.projectId === projectFilter)
  );


  const grouped = filtered.reduce((acc, t) => {
    const proj = projects.find(p => p.id === t.projectId);
    const key = proj?.name || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, typeof tasks>);

  return (
    <div className="space-y-5 fade-in">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Tugas', value: tasks.length, color: 'var(--text-primary)' },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: 'var(--blue)' },
          { label: 'Review', value: tasks.filter(t => t.status === 'review').length, color: 'var(--yellow)' },
          { label: 'Selesai', value: tasks.filter(t => t.status === 'done').length, color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{ background: statusFilter === s ? 'var(--red)' : 'transparent', color: statusFilter === s ? 'white' : 'var(--text-muted)' }}>
              {STATUS_LABELS_MAP[s]}
            </button>
          ))}
        </div>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
          className="input text-xs px-3 py-2" style={{ cursor: 'pointer' }}>
          <option value="all">Semua Proyek</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Grouped tasks */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([projectName, projectTasks]: [string, any[]]) => (
          <div key={projectName} className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{projectName}</p>
              <span className="badge badge-red-brand">{projectTasks.length} tugas</span>
            </div>
            <div className="space-y-2">
              {projectTasks.map(task => {
                const isDone = task.status === 'done';
                const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000);
                const isOverdue = daysLeft < 0 && !isDone;
                return (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                    style={{ background: isOverdue ? 'var(--red-err-dim)' : 'var(--bg-page)', border: '1px solid var(--border)' }}>
                    {isDone
                      ? <CheckSquare size={16} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
                      : <Square size={16} style={{ color: 'var(--border)', flexShrink: 0, marginTop: 1 }} />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium" style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>{task.title}</p>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY_COLOR[task.priority] }} />
                        {isOverdue && <span className="badge badge-red" style={{ fontSize: 10 }}><AlertTriangle size={10} className="mr-1" />Terlambat</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>👤 {task.assigneeName}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>🏷️ {task.subTeam}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>⏱ {task.loggedHours}/{task.estimatedHours}j</span>
                        <span className="text-xs" style={{ color: isOverdue ? 'var(--red-err)' : 'var(--text-muted)' }}>📅 {formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full shrink-0"
                      style={{ background: task.status === 'done' ? 'var(--green-dim)' : task.status === 'in_progress' ? 'var(--blue-dim)' : task.status === 'review' ? 'var(--yellow-dim)' : '#F3F4F6', color: task.status === 'done' ? 'var(--green)' : task.status === 'in_progress' ? 'var(--blue)' : task.status === 'review' ? 'var(--yellow)' : '#9CA3AF' }}>
                      {STATUS_LABELS_MAP[task.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <CheckSquare size={32} className="mx-auto mb-3" style={{ color: 'var(--border)' }} />
            <p style={{ color: 'var(--text-muted)' }}>Tidak ada tugas ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
