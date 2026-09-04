'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePMStore } from '@/lib/store/pmStore';
import { useUserStore } from '@/lib/store/userStore';
import { Project, Task, TaskStatus, SubTeam } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Clock, MessageSquare, Plus, CheckCircle, ExternalLink, UserCircle2, X } from 'lucide-react';

export function ProjectKanbanBoard({ projectId }: { projectId: string }) {
  const { projects, tasks, addTask, updateTaskStatus } = usePMStore();
  const { users: employees } = useUserStore();
  const project = projects.find(p => p.id === projectId);

  
  // Create Task Modal States
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assigneeId, setAssigneeId] = useState(employees[0]?.id || 'u1');
  const [subTeam, setSubTeam] = useState<SubTeam>('Design');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!project) return <div className="p-6 text-center text-gray-500">Proyek tidak ditemukan.</div>;

  const projectTasks = tasks.filter(t => t.projectId === projectId);

  const columns: { id: TaskStatus, title: string, color: string, bg: string }[] = [
    { id: 'todo', title: 'To Do', color: 'text-gray-600', bg: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { id: 'review', title: 'In Review (Validasi)', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
    { id: 'done', title: 'Done', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' }
  ];

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const selectedEmployee = employees.find(emp => emp.id === assigneeId);

    const newTask: Task = {
      id: `task_${Date.now()}`,
      projectId: projectId,
      title: taskTitle,
      description: taskDesc,
      assigneeId: assigneeId,
      assigneeName: selectedEmployee?.name || 'Unassigned',
      subTeam: subTeam,
      status: 'todo',
      priority: priority,
      dueDate: dueDate,
      estimatedHours: 8,
      loggedHours: 0,
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    setIsModalOpen(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col fade-in">
      {/* Board Header */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
          <p className="text-sm text-gray-500">Klien: {project.clientName} &nbsp;|&nbsp; Deadline: {formatDate(project.endDate)}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary py-2 px-4 flex items-center gap-2 text-sm cursor-pointer shadow-md hover:scale-[1.02] transition-transform"
        >
          <Plus size={16}/> Buat Tugas Baru
        </button>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max items-start">
          {columns.map(col => {
            const colTasks = projectTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className={`w-80 rounded-xl flex flex-col max-h-full border ${col.bg}`}>
                <div className="p-3 font-bold border-b border-black/5 flex justify-between items-center shrink-0">
                  <span className={col.color}>{col.title}</span>
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs text-gray-600 shadow-sm">{colTasks.length}</span>
                </div>
                
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {colTasks.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {task.priority} Priority
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-sm text-gray-800 leading-tight mb-2">{task.title}</h4>
                      
                      {task.evidenceLink && (
                        <a href={task.evidenceLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded mb-3 hover:underline w-fit">
                          <ExternalLink size={12}/> Bukti Kerja
                        </a>
                      )}

                      <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs text-gray-500">
                        <div className="flex items-center gap-1.5" title={task.assigneeName}>
                          <UserCircle2 size={16}/> <span className="truncate max-w-[80px]">{task.assigneeName.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12}/> {new Date(task.dueDate).toLocaleDateString('id-ID', {month:'short', day:'numeric'})}
                        </div>
                      </div>

                      {/* Action buttons (Simulated Drag/Drop via Click for MVP) */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {col.id === 'review' && (
                          <button onClick={() => handleStatusChange(task.id, 'done')} className="p-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200" title="Approve ke Done">
                            <CheckCircle size={14}/>
                          </button>
                        )}
                        {col.id !== 'done' && col.id !== 'review' && (
                          <button onClick={() => handleStatusChange(task.id, 'review')} className="p-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200" title="Pindah ke Review">
                            &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="p-4 text-center text-xs text-gray-400 font-medium border-2 border-dashed border-gray-300 rounded-lg">
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Buat Tugas Baru */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-100 text-gray-800">
            <div className="flex justify-between items-center border-b pb-3 border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus size={18} className="text-red-500" /> Buat Tugas Baru ({project.name})
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Judul Tugas</label>
                <input
                  type="text"
                  placeholder="Contoh: Desain Banner Launching Q3"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 font-medium focus:outline-none focus:border-red-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Tugas</label>
                <textarea
                  rows={2}
                  placeholder="Instruksi pengerjaan & detail tugas..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 font-medium focus:outline-none focus:border-red-500 resize-none text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pelaksana / Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 font-semibold focus:outline-none focus:border-red-500 text-gray-800"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sub-Tim Divisi</label>
                  <select
                    value={subTeam}
                    onChange={(e) => setSubTeam(e.target.value as SubTeam)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 font-semibold focus:outline-none focus:border-red-500 text-gray-800"
                  >
                    <option value="Design">Design</option>
                    <option value="Video">Video</option>
                    <option value="Sosmed">Sosmed</option>
                    <option value="Web">Web</option>
                    <option value="Copywriting">Copywriting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 font-semibold focus:outline-none focus:border-red-500 text-gray-800"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Deadline / Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 font-semibold focus:outline-none focus:border-red-500 text-gray-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary px-4 py-2 text-xs font-bold shadow-md cursor-pointer">
                  Buat Tugas Baru
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
