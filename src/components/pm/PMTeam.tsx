import { usePMStore } from '@/lib/store/pmStore';
import { useUserStore } from '@/lib/store/userStore';
import { formatCurrency } from '@/lib/utils';
import { UserCheck, AlertTriangle } from 'lucide-react';

const SUBTEAM_COLORS: Record<string, string> = {
  'Brand': 'var(--red)', 'Sosmed/CC': 'var(--blue)',
  'Design': 'var(--violet)', 'Performance': 'var(--green)', 'Produksi': 'var(--orange)',
};

export default function PMTeam() {
  const { tasks, projects } = usePMStore();
  const { users: employees } = useUserStore();

  const teamWorkload = employees.map(emp => {
    const memberTasks = tasks.filter(t => t.assigneeId === emp.id || t.assigneeName === emp.name);
    const hoursAllocated = memberTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
    const hoursLogged = memberTasks.reduce((s, t) => s + (t.loggedHours || 0), 0);
    const utilizationPercent = Math.min(100, Math.round((hoursAllocated / 40) * 100));
    return {
      employeeId: emp.id,
      name: emp.name,
      position: emp.position || emp.roles.join(', '),
      subTeam: emp.department || 'Brand',
      weeklyHoursAllocated: hoursAllocated,
      hoursLogged: hoursLogged,
      hoursAvailable: Math.max(0, 40 - hoursAllocated),
      utilizationPercent: utilizationPercent,
      activeTasksCount: memberTasks.filter(t => t.status !== 'done').length,
      completedTasks: memberTasks.filter(t => t.status === 'done').length,
      pendingTasks: memberTasks.filter(t => t.status !== 'done').length,
      currentFocus: memberTasks.find(t => t.status === 'in_progress')?.title || 'Fokus eksekusi proyek',
    };
  });


  return (
    <div className="space-y-5 fade-in">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Workload dan distribusi tugas anggota tim minggu ini</p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {teamWorkload.map(member => {
          const memberTasks = tasks.filter(t => t.assigneeId === member.employeeId);
          const memberProjects = [...new Set(memberTasks.map(t => t.projectId))];
          const accentColor = SUBTEAM_COLORS[member.subTeam] || 'var(--red)';
          const isOverloaded = member.utilizationPercent > 90;

          return (
            <div key={member.employeeId} className="card p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold"
                    style={{ background: `${accentColor}15`, color: accentColor }}>
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                      {isOverloaded && <AlertTriangle size={13} style={{ color: 'var(--yellow)' }} />}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.position}</p>
                    <span className="badge mt-1" style={{ background: `${accentColor}15`, color: accentColor }}>{member.subTeam}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: isOverloaded ? 'var(--yellow)' : 'var(--text-primary)' }}>{member.utilizationPercent}%</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>utilisasi</p>
                </div>
              </div>

              {/* Utilization bar */}
              <div className="mb-4">
                <div className="progress-track h-2">
                  <div className="progress-fill" style={{ width: `${member.utilizationPercent}%`, background: isOverloaded ? 'var(--yellow)' : accentColor }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.hoursLogged}j tercatat</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.hoursAvailable}j tersedia</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Proyek', value: memberProjects.length },
                  { label: 'Selesai', value: member.completedTasks, color: 'var(--green)' },
                  { label: 'Pending', value: member.pendingTasks, color: member.pendingTasks > 2 ? 'var(--yellow)' : 'var(--text-primary)' },
                ].map(s => (
                  <div key={s.label} className="p-2 rounded-lg text-center" style={{ background: 'var(--bg-page)' }}>
                    <p className="text-lg font-bold" style={{ color: s.color || 'var(--text-primary)' }}>{s.value}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Current focus */}
              <div className="p-3 rounded-lg" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Fokus sekarang</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{member.currentFocus}</p>
              </div>

              {/* Task list */}
              {memberTasks.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {memberTasks.slice(0, 3).map(t => (
                    <div key={t.id} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: t.status === 'done' ? 'var(--green)' : t.status === 'in_progress' ? 'var(--blue)' : 'var(--border)' }} />
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{t.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Distribution table */}
      <div className="card p-5">
        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Distribusi Tim ke Proyek</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left pb-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Anggota</th>
                {projects.map(p => (
                  <th key={p.id} className="text-center pb-3 text-xs font-semibold px-2" style={{ color: 'var(--text-muted)' }}>{p.name.split(' ').slice(0, 2).join(' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamWorkload.map(member => (
                <tr key={member.employeeId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: `${SUBTEAM_COLORS[member.subTeam] || 'var(--red)'}20`, color: SUBTEAM_COLORS[member.subTeam] || 'var(--red)' }}>
                        {member.name[0]}
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{member.name.split(' ')[0]}</span>
                    </div>
                  </td>
                  {projects.map(p => {
                    const hasTask = tasks.some(t => t.projectId === p.id && t.assigneeId === member.employeeId);
                    return (
                      <td key={p.id} className="text-center py-2.5 px-2">
                        {hasTask
                          ? <div className="w-5 h-5 rounded-full mx-auto flex items-center justify-center" style={{ background: 'var(--red)' }}><UserCheck size={11} color="white" /></div>
                          : <div className="w-5 h-5 rounded-full mx-auto" style={{ background: 'var(--border)' }} />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
