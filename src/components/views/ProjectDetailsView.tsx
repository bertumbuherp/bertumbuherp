'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePMStore } from '@/lib/store/pmStore';
import { useUserStore } from '@/lib/store/userStore';
import { useCrmStore } from '@/lib/store/crmStore';
import { STATUS_LABELS, formatDate, formatCurrency } from '@/lib/utils';
import { Task, ProjectActivity, TaskStatus } from '@/lib/types';
import { ArrowLeft, Clock, CheckCircle2, Circle, AlertCircle, LayoutGrid, Calendar as CalendarIcon, Users, X, Link as LinkIcon, Plus, MessageCircle, RefreshCw, Edit3, Trash2, Package } from 'lucide-react';
import { useState, DragEvent, useEffect, useMemo } from 'react';


const STATUS_COLORS: Record<string, string> = {
  on_track: 'var(--green)', at_risk: 'var(--yellow)', delayed: 'var(--red-err)',
  planning: 'var(--blue)', completed: 'var(--violet)',
};
const STATUS_BG: Record<string, string> = {
  on_track: 'var(--green-dim)', at_risk: 'var(--yellow-dim)', delayed: 'var(--red-err-dim)',
  planning: 'var(--blue-dim)', completed: 'var(--violet-dim)',
};

const KANBAN_COLS = [
  { id: 'todo', label: 'To Do', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  { id: 'in_progress', label: 'On Going', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  { id: 'review', label: 'Review', color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  { id: 'done', label: 'Done', color: 'green', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
] as const;

export default function ProjectDetailsView({ projectId }: { projectId: string }) {
  const now = useMemo(() => Date.now(), []);
  const router = useRouter();
  const { session } = useAuth();
  const { projects, tasks: globalTasks, updateTaskStatus, addTask, updateTask, deleteTask } = usePMStore();
  const { users: employees } = useUserStore();
  const { clients } = useCrmStore();

  const project = projects.find(p => p.id === projectId);
  const client = clients.find(c => c.id === project?.clientId);


  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'addons' | 'gantt' | 'team'>('overview');
  
  const localTasks = globalTasks.filter(t => t.projectId === projectId);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [localActivities, setLocalActivities] = useState<ProjectActivity[]>(project?.activities || []);

  const doneTasks = localTasks.filter(t => t.status === 'done');
  const progress = localTasks.length > 0 ? (doneTasks.length / localTasks.length) * 100 : 0;

  // Utilities for Role-based Permissions
  const isAllowedToEdit = (task: Task | null) => {
    if (!task) return false;
    if (session?.roles.includes('pm') || session?.roles.includes('super_admin')) return true;
    return session?.userId === task.assigneeId;
  };

  const generateInitialReport = () => {
    if (!client || !project) return '';
    const onGoingCount = localTasks.filter(t => t.status === 'in_progress').length;
    const doneCount = localTasks.filter(t => t.status === 'done').length;
    const totalCount = localTasks.length;
    const sisaWaktu = Math.max(0, Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    
    return `*LAPORAN PROGRESS PROYEK*\n*${project.name}* (${client.name})\n\n- Progress Total: ${((doneCount / (totalCount || 1)) * 100).toFixed(0)}%\n- Tugas Selesai: ${doneCount}/${totalCount}\n- Sedang Berjalan: ${onGoingCount} tugas\n- Sisa Waktu Kontak: ${sisaWaktu} hari\n\nTerima kasih atas kerja samanya!`;
  };

  const [reportText, setReportText] = useState<string>('');
  
  // Set initial report text only once when client/project is loaded
  useEffect(() => {
    if (project && client) {
      setReportText(generateInitialReport());
    }
  }, [project, client]);

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Proyek tidak ditemukan.</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 font-semibold text-sm">Kembali</button>
      </div>
    );
  }

  const budgetUsed = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addActivity = (action: string, target: string) => {
    const newAct: ProjectActivity = {
      id: `act_${crypto.randomUUID()}`,
      projectId: project.id,
      userName: session?.name || 'Tim Member',
      action,
      target,
      timestamp: new Date().toISOString()
    };
    setLocalActivities(prev => [newAct, ...prev]);
  };

  const handleSaveTask = () => {
    if (!selectedTask) return;
    
    if (isCreatingTask) {
      const newTask = {
        ...selectedTask,
        id: `t_${crypto.randomUUID()}`,
        projectId: project!.id,
      };
      addTask(newTask as Task);
      addActivity('membuat tugas baru', newTask.title);
      showToast(`Tugas baru "${newTask.title}" berhasil ditambahkan.`);
      
      // Emit Notification if assigned to someone else
      if (newTask.assigneeId && newTask.assigneeId !== session?.userId) {
        window.dispatchEvent(new CustomEvent('new-notification', { 
          detail: { 
            targetUserId: newTask.assigneeId,
            message: `PM memberikan tugas baru kepada Anda: "${newTask.title}"`,
            severity: 'high'
          }
        }));
      }

    } else {
      // Find original task to check if assignee changed
      const originalTask = localTasks.find(t => t.id === selectedTask.id);
      
      updateTask(selectedTask as Task);
      addActivity('mengubah detail tugas', selectedTask.title);
      
      if (session?.roles.includes('team_member')) {
        showToast(`Notifikasi status update terkirim ke PM!`);
      } else {
        showToast(`Perubahan tugas berhasil disimpan.`);
      }

      // If assignee changed, notify the new assignee
      if (originalTask?.assigneeId !== selectedTask.assigneeId && selectedTask.assigneeId !== session?.userId) {
        window.dispatchEvent(new CustomEvent('new-notification', { 
          detail: { 
            targetUserId: selectedTask.assigneeId,
            message: `Tugas "${selectedTask.title}" telah dialihkan kepada Anda.`,
            severity: 'high'
          }
        }));
      }
    }
    
    setSelectedTask(null);
    setIsCreatingTask(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Yakin ingin menghapus tugas ini?')) {
      const task = localTasks.find(t => t.id === taskId);
      deleteTask(taskId);
      addActivity('menghapus tugas', task?.title || 'Unknown');
      showToast('Tugas berhasil dihapus.');
      setSelectedTask(null);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, task: Task) => {
    if (!isAllowedToEdit(task)) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('taskId', task.id);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, statusId: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    
    const t = localTasks.find(task => task.id === taskId);
    if (t && t.status !== statusId) {
      if (!isAllowedToEdit(t)) return;
      
      updateTaskStatus(taskId, statusId);
      addActivity('menggeser status tugas', t.title);
      
      if (session?.roles.includes('team_member') && !session.roles.includes('pm')) {
        showToast(`Notifikasi perubahan status terkirim ke PM!`);
        window.dispatchEvent(new CustomEvent('new-notification', {
          detail: {
            targetUserId: project!.pmId,
            message: `${session?.name} mengubah status tugas "${t.title}" menjadi ${STATUS_LABELS[statusId] || statusId}.`,
            severity: 'medium'
          }
        }));
      }
    }
  };

  const waUrl = client?.contacts[0]?.phone ? `https://wa.me/${client.contacts[0].phone.replace(/\D/g, '')}?text=${encodeURIComponent(reportText)}` : null;

  // Gantt Chart Calculations
  const projectStartDate = new Date(project.startDate).getTime();
  const projectEndDate = new Date(project.endDate).getTime();
  const totalWeeks = Math.max(4, Math.ceil((projectEndDate - projectStartDate) / (7 * 24 * 60 * 60 * 1000)));
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  const getWeekIndex = (dateString: string | undefined, fallback: number = 0) => {
    if (!dateString) return fallback;
    const d = new Date(dateString).getTime();
    if (d < projectStartDate) return 0;
    return Math.floor((d - projectStartDate) / (7 * 24 * 60 * 60 * 1000));
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 fade-in">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center gap-4 shadow-sm">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{project.name}</h1>
          <p className="text-xs text-gray-500 font-medium">{project.clientName}</p>
        </div>
        <span className="ml-auto px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full" 
              style={{ background: STATUS_BG[project.status], color: STATUS_COLORS[project.status] }}>
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white rounded-lg border w-fit shadow-sm overflow-x-auto">
          {[
            { id: 'overview', label: 'Ringkasan', icon: LayoutGrid },
            { id: 'tasks', label: 'Tugas & To-Do', icon: CheckCircle2 },
            { id: 'addons', label: 'Add-On Klien', icon: Package },
            { id: 'gantt', label: 'Gantt Chart', icon: CalendarIcon },
            { id: 'team', label: 'Tim Proyek', icon: Users }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as 'overview' | 'tasks' | 'addons' | 'gantt' | 'team')}
              className={`flex items-center whitespace-nowrap gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                activeTab === t.id ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in">
            <div className="md:col-span-2 space-y-6">
              
              <div className="grid grid-cols-3 gap-4">
                <div className="card p-5 border-t-4 border-blue-500">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Tugas</p>
                  <p className="text-3xl font-bold text-gray-800">{localTasks.length}</p>
                </div>
                <div className="card p-5 border-t-4 border-yellow-500">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Sisa Waktu</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {Math.max(0, Math.ceil((new Date(project.endDate).getTime() - now) / (1000 * 60 * 60 * 24)))} Hari
                  </p>
                </div>
                <div className="card p-5 border-t-4 border-green-500">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Progres</p>
                  <p className="text-3xl font-bold text-gray-800">{progress.toFixed(0)}%</p>
                </div>
              </div>

              {/* Progress Report Card */}
              <div className="card p-6 border-l-4 border-green-500 bg-green-50/30">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-green-800 flex items-center gap-2 text-lg">
                      Laporan Progress Klien
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 max-w-sm leading-relaxed">
                      Laporan auto-generated berdasarkan data Kanban & Gantt. Bisa Anda edit secara manual sebelum dikirim.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button 
                      onClick={() => setReportText(generateInitialReport())}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg shadow-sm transition-colors">
                      <RefreshCw size={15} /> Regenerate
                    </button>
                    {waUrl ? (
                      <a href={waUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                        <MessageCircle size={16} /> Kirim via WhatsApp
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500 italic">No. WhatsApp klien tidak tersedia</span>
                    )}
                  </div>
                </div>
                <div className="relative mt-2">
                  <textarea 
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    className="w-full bg-white p-4 rounded-xl border-2 border-green-200 text-sm text-gray-800 font-mono focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none resize-y min-h-[220px] shadow-inner"
                  />
                  <div className="absolute top-4 right-4 text-gray-300 pointer-events-none">
                    <Edit3 size={18} />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Detail Keuangan Proyek</h3>
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nilai Kontrak</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(project.contractValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Budget Internal (Cost)</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(project.budget)}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-gray-600">Pengeluaran Aktual ({formatCurrency(project.actualCost)})</span>
                    <span style={{ color: budgetUsed > 100 ? 'var(--red-err)' : budgetUsed > 80 ? 'var(--yellow)' : 'var(--green)' }}>
                      {budgetUsed.toFixed(1)}% Terpakai
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ 
                      width: `${Math.min(budgetUsed, 100)}%`,
                      background: budgetUsed > 100 ? 'var(--red-err)' : budgetUsed > 80 ? 'var(--yellow)' : 'var(--green)'
                    }}></div>
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Informasi Umum</h3>
                <ul className="space-y-4">
                  <li>
                    <p className="text-xs text-gray-500">Project Manager</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5">{project.pmName}</p>
                  </li>
                  <li>
                    <p className="text-xs text-gray-500">Tanggal Mulai</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5">{formatDate(project.startDate)}</p>
                  </li>
                  <li>
                    <p className="text-xs text-gray-500">Tenggat Waktu</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5 flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-red-500"/>
                      {formatDate(project.endDate)}
                    </p>
                  </li>
                  <li>
                    <p className="text-xs text-gray-500">Tim Terlibat</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {project.subTeams.map(st => (
                        <span key={st} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wide border">{st}</span>
                      ))}
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Last Update Status Card */}
              <div className="card p-6 border-l-4 border-blue-500">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                  <Clock size={16} className="text-blue-500"/> 
                  Last Update Status
                </h3>
                <div className="space-y-4">
                  {localActivities.slice(0, 5).map(act => (
                    <div key={act.id} className="flex gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 flex items-center justify-center font-bold text-[10px] uppercase">
                        {act.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-gray-800 leading-tight">
                          <span className="font-semibold">{act.userName}</span> {act.action} <span className="font-medium italic">"{act.target}"</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(act.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                  ))}
                  {localActivities.length === 0 && (
                    <p className="text-xs text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg">Belum ada aktivitas di proyek ini.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="fade-in">
            {session?.roles.includes('pm') && (
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => {
                    setIsCreatingTask(true);
                    setSelectedTask({
                      id: '', projectId: project.id, title: '', assigneeId: '', assigneeName: '',
                      status: 'todo', dueDate: new Date().toISOString().split('T')[0], startDate: new Date().toISOString().split('T')[0], phase: 'ongoing', estimatedHours: 0, loggedHours: 0, priority: 'medium', subTeam: 'Design', createdAt: new Date().toISOString()
                    } as Task);
                  }}
                  className="flex items-center gap-2 btn-primary px-4 py-2 text-sm">
                  <Plus size={16} /> Tambah Tugas Baru
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full min-h-[500px] items-start">
              {KANBAN_COLS.map(col => {
                const colTasks = localTasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id} 
                       className={`flex flex-col bg-gray-50 rounded-xl p-3 border shadow-sm transition-colors hover:bg-gray-100`}
                       onDragOver={handleDragOver}
                       onDrop={(e) => handleDrop(e, col.id)}>
                    <div className="flex justify-between items-center mb-3 px-1">
                      <h3 className={`text-sm font-bold ${col.text}`}>{col.label}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.bg} ${col.text} border ${col.border}`}>
                        {colTasks.length}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-3 min-h-[150px]">
                      {colTasks.map(task => {
                        const assignee = employees.find(e => e.id === task.assigneeId);
                        const canEdit = isAllowedToEdit(task);
                        return (
                          <div key={task.id} 
                               draggable={canEdit}
                               onDragStart={(e) => handleDragStart(e, task)}
                               onClick={() => {
                                 setIsCreatingTask(false);
                                 setSelectedTask(task);
                               }}
                               className={`bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all
                                ${canEdit ? 'hover:shadow-md cursor-grab active:cursor-grabbing hover:border-red-300' : 'cursor-pointer hover:border-gray-400 opacity-90'}`}>
                            
                            {!canEdit && (
                              <div className="absolute top-2 right-2 text-gray-300" title="View Only (Assigned to someone else)">
                                <AlertCircle size={14} />
                              </div>
                            )}

                            <p className="text-sm font-semibold text-gray-800 leading-tight mb-2 pr-4">{task.title}</p>
                            {task.phase && (
                              <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-wider rounded mb-3">
                                {task.phase} Phase
                              </span>
                            )}
                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-1.5" title={assignee?.name || 'Unassigned'}>
                                <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[9px] font-bold">
                                  {assignee?.name.charAt(0) || '?'}
                                </div>
                                <span className="text-[10px] font-medium text-gray-500 truncate max-w-[60px]">
                                  {assignee?.name.split(' ')[0] || 'Unknown'}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <CalendarIcon size={10}/> {new Date(task.dueDate).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}
                              </span>
                            </div>
                            {task.evidenceLink && (
                              <div className="mt-2 text-[10px] text-blue-600 flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded w-fit">
                                <LinkIcon size={10}/> Evidence Attached
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {colTasks.length === 0 && (
                        <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs py-8 pointer-events-none">
                          Tarik tugas ke sini
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'gantt' && (
          <div className="card bg-white overflow-hidden fade-in shadow-sm border border-gray-200">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><CalendarIcon size={18} className="text-red-500"/> Gantt Chart Timeline</h3>
                <p className="text-xs text-gray-500 mt-0.5">Membandingkan jadwal dengan status pengerjaan secara real-time.</p>
              </div>
              {session?.roles.includes('pm') && (
                <button 
                  onClick={() => {
                    setIsCreatingTask(true);
                    setSelectedTask({
                      id: '', projectId: project.id, title: '', assigneeId: '', assigneeName: '',
                      status: 'todo', dueDate: new Date().toISOString().split('T')[0], startDate: new Date().toISOString().split('T')[0], phase: 'ongoing', estimatedHours: 0, loggedHours: 0, priority: 'medium', subTeam: 'Design', createdAt: new Date().toISOString()
                    } as Task);
                  }}
                  className="flex items-center gap-2 btn-primary px-4 py-2 text-sm shadow-sm">
                  <Plus size={16} /> Tambah Tugas Baru
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header Row (Weeks) */}
                <div className="flex border-b bg-gray-100/50">
                  <div className="w-64 shrink-0 p-4 font-bold text-[11px] text-gray-500 uppercase tracking-widest border-r">Daftar Tugas & Fase</div>
                  <div className="flex-1 flex">
                    {weeks.map(w => (
                      <div key={w} className="flex-1 min-w-[60px] py-3 text-center border-r border-gray-200 text-xs font-bold text-gray-600 bg-gray-50/50">
                        W{w}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Rows */}
                <div className="divide-y divide-gray-100 pb-10">
                  {localTasks.map(task => {
                    const startW = getWeekIndex(task.startDate || task.createdAt, 0);
                    const endW = getWeekIndex(task.dueDate, startW);
                    const span = Math.max(1, endW - startW + 1);
                    
                    // Constrain startW to fit within grid
                    const safeStartW = Math.max(0, Math.min(startW, weeks.length - 1));
                    const safeSpan = Math.min(span, weeks.length - safeStartW);

                    const assignee = employees.find(e => e.id === task.assigneeId);
                    
                    // Color mapping based on status
                    let barColor = 'bg-gray-200 border-gray-300 text-gray-600';
                    if (task.status === 'done') barColor = 'bg-green-500 border-green-600 text-white shadow-sm';
                    if (task.status === 'in_progress') barColor = 'bg-blue-500 border-blue-600 text-white shadow-sm';
                    if (task.status === 'review') barColor = 'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-sm';

                    return (
                      <div key={task.id} className="flex hover:bg-gray-50 transition-colors group relative cursor-pointer" onClick={() => { setIsCreatingTask(false); setSelectedTask(task); }}>
                        <div className="w-64 shrink-0 p-3 border-r flex flex-col justify-center bg-white z-20 group-hover:bg-gray-50 transition-colors">
                          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-red-600 transition-colors" title={task.title}>{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-gray-500 font-bold px-1.5 py-0.5 bg-gray-100 rounded uppercase tracking-wider">{task.phase || 'ongoing'}</span>
                            <span className="text-[10px] text-gray-400 truncate">{assignee?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                        <div className="flex-1 flex relative items-center py-2 min-h-[50px]">
                          {/* Grid background lines */}
                          {weeks.map(w => (
                            <div key={w} className="flex-1 border-r border-dashed border-gray-200 h-full absolute inset-y-0" style={{ left: `${((w-1)/weeks.length)*100}%`, width: `${(1/weeks.length)*100}%` }}></div>
                          ))}
                          
                          {/* Gantt Bar */}
                          <div className={`relative h-7 rounded-md border transition-all z-10 flex items-center px-3 overflow-hidden ${barColor}`}
                               style={{ 
                                 marginLeft: `${(safeStartW / weeks.length) * 100}%`, 
                                 width: `${(safeSpan / weeks.length) * 100}%`,
                               }}>
                             <span className="text-[10px] font-bold truncate drop-shadow-sm uppercase tracking-wider">{STATUS_LABELS[task.status]}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {localTasks.length === 0 && (
                    <div className="p-12 text-center text-gray-400 text-sm">
                      <CalendarIcon size={32} className="mx-auto text-gray-200 mb-3" />
                      Belum ada tugas di timeline proyek ini. <br/> Silakan tambah tugas baru.
                    </div>
                  )}
                </div>
                
                {/* Status Legend */}
                <div className="p-4 bg-gray-50 border-t flex items-center gap-4 text-xs font-medium text-gray-500 justify-end">
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-300"></div> To Do</span>
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500 border border-blue-600"></div> On Going</span>
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-yellow-400 border border-yellow-500"></div> Review</span>
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500 border border-green-600"></div> Done</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'addons' && (
          <div className="space-y-6 fade-in">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Package size={20} className="text-red-500" /> Add-On Klien ({project.name})
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Seluruh biaya add-on (KOL Talent, Cetak, Venue, Media) otomatis terintegrasi ke pembuatan Invoice Finance.
                  </p>
                </div>
              </div>

              {project.addOns.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-gray-50">
                  <Package size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Belum ada add-on yang ditambahkan pada proyek ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs font-semibold text-gray-500">
                        <th className="text-left pb-3">Item Add-On</th>
                        <th className="text-left pb-3">Kategori</th>
                        <th className="text-left pb-3">Biaya Modal Pengadaan</th>
                        <th className="text-left pb-3">Harga Tagih Klien</th>
                        <th className="text-left pb-3">Profit Markup</th>
                        <th className="text-left pb-3">Status Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {project.addOns.map((ao) => {
                        const markup = ao.billingPrice - ao.procurementCost;
                        return (
                          <tr key={ao.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 font-semibold text-gray-800 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-md bg-red-100 text-red-600 flex items-center justify-center">
                                <Package size={14} />
                              </div>
                              {ao.name}
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-medium">{ao.category}</span>
                            </td>
                            <td className="py-3 text-gray-600 font-medium">{formatCurrency(ao.procurementCost)}</td>
                            <td className="py-3 font-bold text-gray-800">{formatCurrency(ao.billingPrice)}</td>
                            <td className="py-3 text-emerald-600 font-bold">+{formatCurrency(markup)}</td>
                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                ao.invoiced ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {ao.invoiced ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                {ao.invoiced ? 'Sudah Di-Invoice' : 'Belum Di-Invoice'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 fade-in">
            {project.members.map(member => {
              const emp = employees.find(e => e.id === member.userId);
              if (!emp) return null;
              return (
                <div key={emp.id} className="card p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.department}</p>
                  </div>
                </div>
              );
            })}
            {project.members.length === 0 && (
              <div className="col-span-full card p-10 text-center text-gray-500">Belum ada anggota tim yang di-assign ke proyek ini.</div>
            )}
          </div>
        )}

      </div>

      {/* Task Pop-Up Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  {isCreatingTask ? 'Tambah Tugas Baru' : (isAllowedToEdit(selectedTask) ? 'Detail Tugas' : 'Detail Tugas (View Only)')}
                </p>
                {isCreatingTask ? (
                  <input 
                    type="text" 
                    placeholder="Judul Tugas..."
                    value={selectedTask.title} 
                    onChange={e => setSelectedTask({...selectedTask, title: e.target.value})}
                    className="text-lg font-bold text-gray-800 bg-transparent border-b-2 border-gray-300 focus:border-red-500 outline-none w-full pb-1"
                    autoFocus
                  />
                ) : (
                  <h2 className="text-lg font-bold text-gray-800 leading-tight">{selectedTask.title}</h2>
                )}
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              
              {!isAllowedToEdit(selectedTask) && !isCreatingTask && (
                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex items-start gap-2 mb-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <p>Anda tidak memiliki akses untuk mengubah tugas ini karena tugas ini ditugaskan kepada anggota tim lain.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Assignee</label>
                  <select 
                    value={selectedTask.assigneeId} 
                    onChange={e => setSelectedTask({...selectedTask, assigneeId: e.target.value})}
                    disabled={!isAllowedToEdit(selectedTask)}
                    className="input w-full px-3 py-2 text-sm bg-gray-50 border-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>Pilih Tim...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Start Date</label>
                  <input 
                    type="date" 
                    value={selectedTask.startDate ? selectedTask.startDate.split('T')[0] : selectedTask.createdAt ? selectedTask.createdAt.split('T')[0] : ''} 
                    onChange={e => setSelectedTask({...selectedTask, startDate: e.target.value})}
                    disabled={!isAllowedToEdit(selectedTask)}
                    className="input w-full px-3 py-2 text-sm bg-gray-50 border-gray-200 focus:bg-white disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Deadline</label>
                  <input 
                    type="date" 
                    value={selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : ''} 
                    onChange={e => setSelectedTask({...selectedTask, dueDate: e.target.value})}
                    disabled={!isAllowedToEdit(selectedTask)}
                    className="input w-full px-3 py-2 text-sm bg-gray-50 border-gray-200 focus:bg-white disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Fase Gantt</label>
                  <select 
                    value={selectedTask.phase || 'ongoing'} 
                    onChange={e => setSelectedTask({...selectedTask!, phase: e.target.value as 'pra' | 'ongoing' | 'post'})}
                    disabled={!isAllowedToEdit(selectedTask)}
                    className="input w-full px-3 py-2 text-sm bg-gray-50 border-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="pra">Pra-Production</option>
                    <option value="ongoing">On Going</option>
                    <option value="post">Post-Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Status Kanban</label>
                  <select 
                    value={selectedTask.status} 
                    onChange={e => setSelectedTask({...selectedTask!, status: e.target.value as TaskStatus})}
                    disabled={!isAllowedToEdit(selectedTask)}
                    className="input w-full px-3 py-2 text-sm font-bold bg-white border-2 border-gray-200 focus:border-red-500 disabled:opacity-70 disabled:bg-gray-100 disabled:border-gray-200 disabled:cursor-not-allowed"
                  >
                    {KANBAN_COLS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                  <LinkIcon size={12}/> Link Bukti Pengerjaan (Evidence)
                </label>
                <input 
                  type="url" 
                  placeholder="https://figma.com/... atau https://docs.google.com/..."
                  value={selectedTask.evidenceLink || ''}
                  onChange={e => setSelectedTask({...selectedTask, evidenceLink: e.target.value})}
                  disabled={!isAllowedToEdit(selectedTask)}
                  className="input w-full px-3 py-2.5 text-sm bg-gray-50 border-gray-200 text-blue-600 focus:bg-white disabled:opacity-70 disabled:cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                  Semua perubahan (status, assignee, evidence) akan langsung meng-update Gantt Chart & mencetak skor performa ke laporan secara *real-time*.
                </p>
              </div>

            </div>

            <div className="p-5 border-t bg-gray-50 flex items-center justify-between gap-3">
              {(!isCreatingTask && session?.roles.includes('pm')) ? (
                <button onClick={() => handleDeleteTask(selectedTask.id)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
                  <Trash2 size={16} /> Hapus Tugas
                </button>
              ) : (
                <div /> /* Empty spacer for flex alignment */
              )}
              
              <div className="flex gap-2">
                <button onClick={() => setSelectedTask(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                  {isAllowedToEdit(selectedTask) ? 'Batal' : 'Tutup'}
                </button>
                {isAllowedToEdit(selectedTask) && (
                  <button onClick={handleSaveTask} disabled={!selectedTask.title && isCreatingTask} className="btn-primary px-6 py-2 text-sm shadow-md disabled:opacity-50">
                    {isCreatingTask ? 'Buat Tugas' : 'Simpan Perubahan'}
                  </button>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
